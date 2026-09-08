import fs from 'fs';
import Lecture from '../models/lecture.js';
import Course from '../models/course.js';
import { uploadMedia, deleteVideoFromCloudinary } from '../utils/cloudinary.js';

// Create a new lecture for a course (upload video one by one)
export const createLecture = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lectureTitle, isPreviewFree, description, duration, videoUrl: directUrl } = req.body;
    const videoFile = req.file;

    if (!lectureTitle) {
      return res.status(400).json({ success: false, message: 'Lecture title is required.' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    let finalVideoUrl = directUrl || '';
    let publicId = '';

    // Handle video file upload to Cloudinary
    if (videoFile) {
      try {
        const filePath = videoFile.path || videoFile.buffer;
        const cloudResponse = await uploadMedia(filePath);
        if (cloudResponse && cloudResponse.secure_url) {
          finalVideoUrl = cloudResponse.secure_url;
          publicId = cloudResponse.public_id || '';
        }

        // Clean up temporary local file
        if (videoFile.path && fs.existsSync(videoFile.path)) {
          fs.unlinkSync(videoFile.path);
        }
      } catch (uploadErr) {
        console.error('Video upload error:', uploadErr);
        if (videoFile.path && fs.existsSync(videoFile.path)) {
          fs.unlinkSync(videoFile.path);
        }
        return res.status(500).json({
          success: false,
          message: 'Failed to upload video to Cloudinary. Please try again or provide a direct video URL.'
        });
      }
    }

    if (!finalVideoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a video file or a direct video URL.'
      });
    }

    const orderNumber = (course.lectures?.length || 0) + 1;
    const isFree = isPreviewFree === 'true' || isPreviewFree === true;

    const lecture = await Lecture.create({
      lectureTitle,
      videoUrl: finalVideoUrl,
      publicId,
      isPreviewFree: isFree,
      description: description || '',
      duration: duration || '',
      order: orderNumber,
      course: courseId,
    });

    course.lectures.push(lecture._id);
    await course.save();

    return res.status(201).json({
      success: true,
      message: 'Lecture uploaded successfully.',
      lecture,
    });
  } catch (error) {
    console.error('Error creating lecture:', error);
    return res.status(500).json({ success: false, message: 'Failed to create lecture.' });
  }
};

// Get all lectures for a specific course
export const getCourseLectures = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lectures = await Lecture.find({ course: courseId }).sort({ order: 1, createdAt: 1 });

    return res.status(200).json({
      success: true,
      lectures,
    });
  } catch (error) {
    console.error('Error fetching course lectures:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch course lectures.' });
  }
};

// Update existing lecture (edit title, isPreviewFree, description, or replace video)
export const updateLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { lectureTitle, isPreviewFree, description, duration, videoUrl: directUrl, order } = req.body;
    const videoFile = req.file;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ success: false, message: 'Lecture not found.' });
    }

    if (lectureTitle !== undefined) lecture.lectureTitle = lectureTitle;
    if (isPreviewFree !== undefined) {
      lecture.isPreviewFree = isPreviewFree === 'true' || isPreviewFree === true;
    }
    if (description !== undefined) lecture.description = description;
    if (duration !== undefined) lecture.duration = duration;
    if (order !== undefined) lecture.order = Number(order);

    if (videoFile) {
      try {
        if (lecture.publicId) {
          try {
            await deleteVideoFromCloudinary(lecture.publicId);
          } catch (delErr) {
            console.warn('Failed to delete old video from Cloudinary:', delErr);
          }
        }

        const filePath = videoFile.path || videoFile.buffer;
        const cloudResponse = await uploadMedia(filePath);
        if (cloudResponse && cloudResponse.secure_url) {
          lecture.videoUrl = cloudResponse.secure_url;
          lecture.publicId = cloudResponse.public_id || '';
        }

        if (videoFile.path && fs.existsSync(videoFile.path)) {
          fs.unlinkSync(videoFile.path);
        }
      } catch (uploadErr) {
        console.error('Video replacement upload error:', uploadErr);
        if (videoFile.path && fs.existsSync(videoFile.path)) {
          fs.unlinkSync(videoFile.path);
        }
        return res.status(500).json({
          success: false,
          message: 'Failed to upload replacement video.',
        });
      }
    } else if (directUrl) {
      lecture.videoUrl = directUrl;
    }

    await lecture.save();

    return res.status(200).json({
      success: true,
      message: 'Lecture updated successfully.',
      lecture,
    });
  } catch (error) {
    console.error('Error updating lecture:', error);
    return res.status(500).json({ success: false, message: 'Failed to update lecture.' });
  }
};

// Delete lecture
export const deleteLecture = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ success: false, message: 'Lecture not found.' });
    }

    // Delete video from Cloudinary if stored there
    if (lecture.publicId) {
      try {
        await deleteVideoFromCloudinary(lecture.publicId);
      } catch (cloudErr) {
        console.warn('Failed to remove video from Cloudinary:', cloudErr);
      }
    }

    await Lecture.findByIdAndDelete(lectureId);

    // Remove from Course
    await Course.findByIdAndUpdate(courseId, {
      $pull: { lectures: lectureId },
    });

    return res.status(200).json({
      success: true,
      message: 'Lecture removed successfully.',
    });
  } catch (error) {
    console.error('Error deleting lecture:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete lecture.' });
  }
};
