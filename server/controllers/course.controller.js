import Course from '../models/course.js';
import User from '../models/user.js';
import Blog from '../models/blog.js';
import Lecture from '../models/lecture.js';
import { uploadMedia, deleteMediaFromCloudinary, deleteVideoFromCloudinary } from '../utils/cloudinary.js';


// Get all courses (supports query parameters for admin / public)
export const getAllCourses = async (req, res) => {
    try {
        const { search, category, level, isPublished } = req.query;
        let query = {};

        if (isPublished !== undefined) {
            query.isPublished = isPublished === 'true';
        }
        if (search) {
            query.$or = [
                { courseTitle: { $regex: search, $options: 'i' } },
                { subTitle: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (category && category !== 'All') {
            query.category = category;
        }
        if (level && level !== 'All') {
            query.courseLevel = level;
        }

        const courses = await Course.find(query)
            .populate('creator', 'name email photoUrl')
            .populate('lectures', 'lectureTitle isPreviewFree duration order')
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, courses });
    } catch (error) {
        console.error('Error fetching courses:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch courses' });
    }
};

// Get single course by ID
export const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id)
            .populate('creator', 'name email photoUrl')
            .populate({
                path: 'lectures',
                options: { sort: { order: 1, createdAt: 1 } },
            });
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        return res.status(200).json({ success: true, course });

    } catch (error) {
        console.error('Error fetching course:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch course details' });
    }
};

// Create a new course
export const createCourse = async (req, res) => {
    try {
        const { courseTitle, subTitle, description, category, courseLevel, coursePrice, isPublished } = req.body;
        const thumbnailFile = req.file;

        if (!courseTitle || !category) {
            return res.status(400).json({ success: false, message: 'Course Title and Category are required.' });
        }

        let courseThumbnail = '';
        if (thumbnailFile) {
            try {
                const cloudResponse = await uploadMedia(thumbnailFile.path || thumbnailFile.buffer);
                if (cloudResponse && cloudResponse.secure_url) {
                    courseThumbnail = cloudResponse.secure_url;
                }
            } catch (uploadErr) {
                console.error('Cloudinary upload error, using local fallback:', uploadErr);
                courseThumbnail = thumbnailFile.path || '';
            }
        }

        const course = await Course.create({
            courseTitle,
            subTitle: subTitle || '',
            description: description || '',
            category,
            courseLevel: courseLevel || 'Beginner',
            coursePrice: coursePrice ? Number(coursePrice) : 0,
            courseThumbnail,
            creator: req.id,
            isPublished: isPublished === 'true' || isPublished === true
        });

        return res.status(201).json({ success: true, message: 'Course created successfully', course });
    } catch (error) {
        console.error('Error creating course:', error);
        return res.status(500).json({ success: false, message: 'Failed to create course' });
    }
};

// Update existing course
export const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { courseTitle, subTitle, description, category, courseLevel, coursePrice, isPublished } = req.body;
        const thumbnailFile = req.file;

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const updateData = {};
        if (courseTitle !== undefined) updateData.courseTitle = courseTitle;
        if (subTitle !== undefined) updateData.subTitle = subTitle;
        if (description !== undefined) updateData.description = description;
        if (category !== undefined) updateData.category = category;
        if (courseLevel !== undefined) updateData.courseLevel = courseLevel;
        if (coursePrice !== undefined) updateData.coursePrice = Number(coursePrice);
        if (isPublished !== undefined) updateData.isPublished = isPublished === 'true' || isPublished === true;

        if (thumbnailFile) {
            try {
                if (course.courseThumbnail && course.courseThumbnail.includes('cloudinary')) {
                    const publicId = course.courseThumbnail.split('/').pop().split('.')[0];
                    await deleteMediaFromCloudinary(publicId);
                }
                const cloudResponse = await uploadMedia(thumbnailFile.path || thumbnailFile.buffer);
                if (cloudResponse && cloudResponse.secure_url) {
                    updateData.courseThumbnail = cloudResponse.secure_url;
                }
            } catch (err) {
                console.error('Thumbnail upload error:', err);
                if (thumbnailFile.path) updateData.courseThumbnail = thumbnailFile.path;
            }
        }

        const updatedCourse = await Course.findByIdAndUpdate(id, updateData, { new: true });
        return res.status(200).json({ success: true, message: 'Course updated successfully', course: updatedCourse });
    } catch (error) {
        console.error('Error updating course:', error);
        return res.status(500).json({ success: false, message: 'Failed to update course' });
    }
};

// Delete course
export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        if (course.courseThumbnail && course.courseThumbnail.includes('cloudinary')) {
            try {
                const publicId = course.courseThumbnail.split('/').pop().split('.')[0];
                await deleteMediaFromCloudinary(publicId);
            } catch (err) {
                console.warn('Failed to delete thumbnail from Cloudinary:', err);
            }
        }

        // Clean up all associated lectures and their videos
        const lectures = await Lecture.find({ course: id });
        for (const lec of lectures) {
            if (lec.publicId) {
                try {
                    await deleteVideoFromCloudinary(lec.publicId);
                } catch (vErr) {
                    console.warn('Failed to delete lecture video:', vErr);
                }
            }
        }
        await Lecture.deleteMany({ course: id });

        await Course.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: 'Course and curriculum deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete course' });
    }
};

// Toggle course publish status
export const togglePublishCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        course.isPublished = !course.isPublished;
        await course.save();

        return res.status(200).json({
            success: true,
            message: `Course ${course.isPublished ? 'published' : 'unpublished'} successfully`,
            isPublished: course.isPublished,
            course
        });
    } catch (error) {
        console.error('Error toggling publish status:', error);
        return res.status(500).json({ success: false, message: 'Failed to toggle publish status' });
    }
};

// Get Admin platform statistics
export const getAdminStats = async (req, res) => {
    try {
        const totalCourses = await Course.countDocuments();
        const publishedCourses = await Course.countDocuments({ isPublished: true });
        // Count ONLY students (excluding Admin and Instructor)
        const totalStudents = await User.countDocuments({
            $or: [
                { role: { $regex: /^student$/i } },
                { role: { $exists: false } },
                { role: null },
                { role: '' }
            ]
        });
        const totalInstructors = await User.countDocuments({ role: { $regex: /^instructor$/i } });
        const totalAdmins = await User.countDocuments({ role: { $regex: /^admin$/i } });
        const totalUsers = await User.countDocuments();
        const totalBlogs = await Blog.countDocuments();

        const recentCourses = await Course.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('creator', 'name email');

        const recentUsers = await User.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(5);

        return res.status(200).json({
            success: true,
            stats: {
                totalCourses,
                publishedCourses,
                totalStudents,
                totalInstructors,
                totalAdmins,
                totalBlogs,
                totalUsers,
            },
            recentCourses,
            recentUsers
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
    }
};