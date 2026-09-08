import { v2 as cloudinary } from "cloudinary";

import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET,
    cloud_name:process.env.CLOUD_NAME,
});

export const uploadMedia =async(file)=>{
    try {
        const uploadResponse =await cloudinary.uploader.upload(file, {
            resource_type:"auto",
        });
        return uploadResponse;
    } catch (error) {
        console.error(error);
    }
}

// Upload raw files (PDF, DOCX, etc.) to Cloudinary
export const uploadRaw = async (file, originalname) => {
    try {
        const uploadResponse = await cloudinary.uploader.upload(file, {
            resource_type: "raw",
            folder: "notes_pdfs",
            use_filename: true,
            unique_filename: true,
            public_id: originalname ? `${Date.now()}_${originalname.replace(/\s+/g, '_')}` : undefined,
        });
        return uploadResponse;
    } catch (error) {
        console.error('PDF upload error:', error);
        throw error;
    }
};

export const extractPublicIdFromUrl = (url, resourceType = 'image') => {
    if (!url || typeof url !== 'string') return null;
    try {
        const uploadIdx = url.indexOf('/upload/');
        if (uploadIdx === -1) return null;

        let pathAfterUpload = url.substring(uploadIdx + '/upload/'.length);
        pathAfterUpload = pathAfterUpload.split('?')[0].split('#')[0];

        // Strip version prefix if present, e.g. v1725654321/
        const versionMatch = pathAfterUpload.match(/^v\d+\/(.+)$/);
        const relativePath = versionMatch ? versionMatch[1] : pathAfterUpload;

        const decoded = decodeURIComponent(relativePath);

        if (resourceType === 'raw') {
            return decoded;
        } else {
            const lastDotIndex = decoded.lastIndexOf('.');
            return lastDotIndex > -1 ? decoded.substring(0, lastDotIndex) : decoded;
        }
    } catch (e) {
        console.error('Error extracting public ID from URL:', e);
        return null;
    }
};

export const deleteMediaFromCloudinary = async (publicIdOrUrl, resourceType = "image") => {
    try {
        if (!publicIdOrUrl) return;
        let publicId = publicIdOrUrl;
        if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
            publicId = extractPublicIdFromUrl(publicIdOrUrl, resourceType);
        }
        if (publicId) {
            await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        }
    } catch (error) {
        console.error('Cloudinary media deletion error:', error);
    }
};

export const deleteRawFromCloudinary = async (publicIdOrUrl) => {
    if (!publicIdOrUrl) return;
    try {
        let publicId = publicIdOrUrl;
        if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
            publicId = extractPublicIdFromUrl(publicIdOrUrl, 'raw');
        }
        if (!publicId) return;

        // Try destroying with the publicId
        const res = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });

        // If Cloudinary returned 'not found', attempt alternative extension formats
        if (res?.result === 'not found') {
            if (publicId.includes('.')) {
                const noExt = publicId.substring(0, publicId.lastIndexOf('.'));
                await cloudinary.uploader.destroy(noExt, { resource_type: 'raw' });
            } else {
                await cloudinary.uploader.destroy(`${publicId}.pdf`, { resource_type: 'raw' });
            }
        }
    } catch (error) {
        console.error('Cloudinary raw deletion error:', error);
    }
};

export const deleteVideoFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
    } catch (error) {
        console.log(error);
        throw error;
    }
};