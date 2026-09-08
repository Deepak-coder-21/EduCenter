import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { authorizeRoles } from '../middlewares/authorizeRole.js';
import {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    togglePublishCourse,
    getAdminStats
} from '../controllers/course.controller.js';
import {
    createLecture,
    getCourseLectures,
    updateLecture,
    deleteLecture
} from '../controllers/lecture.controller.js';
import upload from '../utils/multer.js';

const router = express.Router();

// Public course listing & details
router.route("/").get(getAllCourses);
router.route("/stats").get(isAuthenticated, authorizeRoles('Admin'), getAdminStats);
router.route("/:id").get(getCourseById);

// Course Management (Admin and Instructor both have access)
router.route("/").post(isAuthenticated, authorizeRoles('Admin', 'Instructor'), upload.single("thumbnail"), createCourse);
router.route("/:id").put(isAuthenticated, authorizeRoles('Admin', 'Instructor'), upload.single("thumbnail"), updateCourse);
router.route("/:id").delete(isAuthenticated, authorizeRoles('Admin', 'Instructor'), deleteCourse);
router.route("/:id/publish").patch(isAuthenticated, authorizeRoles('Admin', 'Instructor'), togglePublishCourse);

// Course Lectures / Video Management (Admin and Instructor both have access)
router.route("/:courseId/lectures")
    .get(getCourseLectures)
    .post(isAuthenticated, authorizeRoles('Admin', 'Instructor'), upload.single("video"), createLecture);

router.route("/:courseId/lectures/:lectureId")
    .put(isAuthenticated, authorizeRoles('Admin', 'Instructor'), upload.single("video"), updateLecture)
    .delete(isAuthenticated, authorizeRoles('Admin', 'Instructor'), deleteLecture);

export default router;