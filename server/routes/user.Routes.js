import express from 'express';
import {
    getUserProfile,
    login,
    register,
    logout,
    updateUserProfile,
    getAllUsers,
    updateUserRole,
    deleteUser,
    sendSignupOtp,
    verifySignupOtp,
    sendResetPasswordOtp,
    resetPasswordWithOtp,
    checkSmtpStatus,
} from '../controllers/user.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { authorizeRoles } from '../middlewares/authorizeRole.js';
import upload from '../utils/multer.js';

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/profile').get(isAuthenticated, getUserProfile);
router.route('/profile/update').put(isAuthenticated, upload.single('profilePhoto'), updateUserProfile);

// OTP Authentication Routes & Diagnostic
router.route('/check-smtp').get(checkSmtpStatus);
router.route('/send-signup-otp').post(sendSignupOtp);
router.route('/verify-signup-otp').post(verifySignupOtp);
router.route('/send-reset-otp').post(sendResetPasswordOtp);
router.route('/reset-password').post(resetPasswordWithOtp);

// Admin-only routes (Full access required)
router.route('/all').get(isAuthenticated, authorizeRoles('Admin'), getAllUsers);
router.route('/:id/role').put(isAuthenticated, authorizeRoles('Admin'), updateUserRole);
router.route('/:id').delete(isAuthenticated, authorizeRoles('Admin'), deleteUser);

export default router;