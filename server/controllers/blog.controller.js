import fs from 'fs';
import Blog from '../models/blog.js';
import { uploadMedia, uploadRaw, deleteMediaFromCloudinary, deleteRawFromCloudinary } from '../utils/cloudinary.js';
import { escapeRegex } from '../utils/escapeRegex.js';

// Helper to remove temporary files stored on disk by multer
const cleanupTempFile = (file) => {
    if (file?.path && fs.existsSync(file.path)) {
        try {
            fs.unlinkSync(file.path);
        } catch (err) {
            console.warn('Failed to delete temp file:', file.path, err);
        }
    }
};

// Helper to get all PDFs (handles both new pdfFiles array and legacy pdfUrl)
const getBlogPdfList = (blog) => {
    if (blog.pdfFiles && Array.isArray(blog.pdfFiles) && blog.pdfFiles.length > 0) {
        return blog.pdfFiles;
    }
    if (blog.pdfUrl) {
        return [{
            url: blog.pdfUrl,
            name: blog.pdfName || 'notes.pdf',
            publicId: blog.pdfPublicId || '',
            size: 0
        }];
    }
    return [];
};

// Get all blogs
export const getAllBlogs = async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};

        if (typeof search === 'string' && search.trim().length > 0) {
            const safeSearch = escapeRegex(search.trim().slice(0, 100));
            query.$or = [
                { title: { $regex: safeSearch, $options: 'i' } },
                { author: { $regex: safeSearch, $options: 'i' } },
                { content: { $regex: safeSearch, $options: 'i' } }
            ];
        }
        if (typeof category === 'string' && category.trim() !== '' && category !== 'All') {
            query.category = category.trim();
        }

        const blogs = await Blog.find(query).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, blogs });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch blogs' });
    }
};

// Get single blog by ID
export const getBlogById = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }
        return res.status(200).json({ success: true, blog });
    } catch (error) {
        console.error('Error fetching blog:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch blog details' });
    }
};

// Create a new blog
export const createBlog = async (req, res) => {
    try {
        const { title, content, author, category } = req.body;
        const thumbnailFile = req.files?.thumbnail?.[0];
        const pdfFiles = [
            ...(req.files?.notesPdf || []),
            ...(req.files?.notesPdfs || []),
        ];

        if (!title || !content) {
            return res.status(400).json({ success: false, message: 'Title and Content are required.' });
        }

        // Upload thumbnail
        let thumbnail = '';
        if (thumbnailFile) {
            try {
                const cloudResponse = await uploadMedia(thumbnailFile.path || thumbnailFile.buffer);
                if (cloudResponse && cloudResponse.secure_url) {
                    thumbnail = cloudResponse.secure_url;
                }
            } catch (err) {
                console.error('Thumbnail upload error:', err);
                thumbnail = thumbnailFile.path || '';
            } finally {
                cleanupTempFile(thumbnailFile);
            }
        }

        // Upload list of PDF notes
        const uploadedPdfs = [];
        for (const file of pdfFiles) {
            try {
                const pdfResponse = await uploadRaw(file.path || file.buffer, file.originalname);
                if (pdfResponse && pdfResponse.secure_url) {
                    uploadedPdfs.push({
                        url: pdfResponse.secure_url,
                        name: file.originalname || 'notes.pdf',
                        publicId: pdfResponse.public_id || '',
                        size: file.size || 0,
                    });
                }
            } catch (err) {
                console.error('PDF upload error for', file.originalname, err);
            } finally {
                cleanupTempFile(file);
            }
        }

        const blog = await Blog.create({
            title,
            content,
            author: author || 'Admin',
            category: category || 'Education',
            thumbnail,
            pdfFiles: uploadedPdfs,
            pdfUrl: uploadedPdfs[0]?.url || '',
            pdfName: uploadedPdfs[0]?.name || '',
            pdfPublicId: uploadedPdfs[0]?.publicId || '',
        });

        return res.status(201).json({ success: true, message: 'Blog posted successfully', blog });
    } catch (error) {
        console.error('Error creating blog:', error);
        return res.status(500).json({ success: false, message: 'Failed to create blog' });
    }
};

// Update existing blog
export const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, author, category, replaceAllPdfs, retainedPdfs } = req.body;
        const thumbnailFile = req.files?.thumbnail?.[0];
        const newPdfFiles = [
            ...(req.files?.notesPdf || []),
            ...(req.files?.notesPdfs || []),
        ];

        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (author !== undefined) updateData.author = author;
        if (category !== undefined) updateData.category = category;

        // Update thumbnail
        if (thumbnailFile) {
            try {
                if (blog.thumbnail) {
                    await deleteMediaFromCloudinary(blog.thumbnail, 'image');
                }
                const cloudResponse = await uploadMedia(thumbnailFile.path || thumbnailFile.buffer);
                if (cloudResponse && cloudResponse.secure_url) {
                    updateData.thumbnail = cloudResponse.secure_url;
                }
            } catch (err) {
                console.error('Thumbnail upload error:', err);
                if (thumbnailFile.path) updateData.thumbnail = thumbnailFile.path;
            } finally {
                cleanupTempFile(thumbnailFile);
            }
        }

        // Handle PDFs
        const currentPdfs = getBlogPdfList(blog);
        const shouldReplaceAll = replaceAllPdfs === 'true' || replaceAllPdfs === true;

        let parsedRetainedPdfs = [];
        if (retainedPdfs !== undefined) {
            try {
                parsedRetainedPdfs = typeof retainedPdfs === 'string' ? JSON.parse(retainedPdfs) : retainedPdfs;
                if (!Array.isArray(parsedRetainedPdfs)) parsedRetainedPdfs = [];
            } catch (parseErr) {
                console.warn('Failed to parse retainedPdfs:', parseErr);
                parsedRetainedPdfs = [];
            }
        } else if (!shouldReplaceAll && newPdfFiles.length === 0) {
            // Nothing changed regarding PDFs
            parsedRetainedPdfs = currentPdfs;
        } else if (!shouldReplaceAll && newPdfFiles.length > 0) {
            // User re-uploaded new PDFs without specifying retainedPdfs:
            // Per request: "when i re-upload pdf in same article delete previous pdf"
            // If replaceAll wasn't explicitly false, default to deleting previous PDFs on re-upload
            parsedRetainedPdfs = [];
        }

        // Delete removed or replaced PDFs from Cloudinary
        for (const oldPdf of currentPdfs) {
            const isKept = !shouldReplaceAll && parsedRetainedPdfs.some(
                (r) => (r.publicId && r.publicId === oldPdf.publicId) || (r.url && r.url === oldPdf.url)
            );
            if (!isKept) {
                await deleteRawFromCloudinary(oldPdf.publicId || oldPdf.url);
            }
        }

        // Also clean up legacy pdfUrl if not retained
        if (blog.pdfUrl) {
            const isLegacyKept = !shouldReplaceAll && parsedRetainedPdfs.some(r => r.url === blog.pdfUrl);
            if (!isLegacyKept) {
                await deleteRawFromCloudinary(blog.pdfPublicId || blog.pdfUrl);
            }
        }

        // Upload any newly selected PDF files
        const newlyUploadedPdfs = [];
        for (const file of newPdfFiles) {
            try {
                const pdfResponse = await uploadRaw(file.path || file.buffer, file.originalname);
                if (pdfResponse && pdfResponse.secure_url) {
                    newlyUploadedPdfs.push({
                        url: pdfResponse.secure_url,
                        name: file.originalname || 'notes.pdf',
                        publicId: pdfResponse.public_id || '',
                        size: file.size || 0,
                    });
                }
            } catch (err) {
                console.error('PDF upload error:', err);
            } finally {
                cleanupTempFile(file);
            }
        }

        // If either new files were uploaded, retainedPdfs was provided, or replaceAll was triggered:
        if (newPdfFiles.length > 0 || retainedPdfs !== undefined || shouldReplaceAll) {
            const finalPdfs = shouldReplaceAll
                ? newlyUploadedPdfs
                : [...parsedRetainedPdfs, ...newlyUploadedPdfs];

            updateData.pdfFiles = finalPdfs;
            updateData.pdfUrl = finalPdfs[0]?.url || '';
            updateData.pdfName = finalPdfs[0]?.name || '';
            updateData.pdfPublicId = finalPdfs[0]?.publicId || '';
        }

        const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, { new: true });
        return res.status(200).json({ success: true, message: 'Blog updated successfully', blog: updatedBlog });
    } catch (error) {
        console.error('Error updating blog:', error);
        return res.status(500).json({ success: false, message: 'Failed to update blog' });
    }
};

// Delete blog
export const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        // Delete thumbnail
        if (blog.thumbnail) {
            await deleteMediaFromCloudinary(blog.thumbnail, 'image');
        }

        // Delete all attached PDFs from Cloudinary
        const pdfList = getBlogPdfList(blog);
        for (const pdf of pdfList) {
            await deleteRawFromCloudinary(pdf.publicId || pdf.url);
        }

        if (blog.pdfUrl && !pdfList.some(p => p.url === blog.pdfUrl)) {
            await deleteRawFromCloudinary(blog.pdfPublicId || blog.pdfUrl);
        }

        await Blog.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete blog' });
    }
};
