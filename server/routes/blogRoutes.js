import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { authorizeRoles } from '../middlewares/authorizeRole.js';
import {
    getAllBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog
} from '../controllers/blog.controller.js';
import upload from '../utils/multer.js';

const router = express.Router();

// Blog upload handler: supports thumbnail (image) + multiple notesPdf (PDFs)
const blogUpload = upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'notesPdf', maxCount: 20 },
    { name: 'notesPdfs', maxCount: 20 },
]);

// Public blog routes
router.route("/").get(getAllBlogs);
router.route("/:id").get(getBlogById);

// Blog & Content Manager actions (Admin and Instructor both have access)
router.route("/").post(isAuthenticated, authorizeRoles('Admin', 'Instructor'), blogUpload, createBlog);
router.route("/:id").put(isAuthenticated, authorizeRoles('Admin', 'Instructor'), blogUpload, updateBlog);
router.route("/:id").delete(isAuthenticated, authorizeRoles('Admin', 'Instructor'), deleteBlog);

export default router;