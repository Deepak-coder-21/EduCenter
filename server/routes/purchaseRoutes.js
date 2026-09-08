import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import {
  createCheckoutOrder,
  verifyPayment,
  getCoursePurchaseStatus,
  getMyEnrolledCourses,
  getMyPurchases,
} from '../controllers/purchase.controller.js';

const router = express.Router();

router.route('/checkout').post(isAuthenticated, createCheckoutOrder);
router.route('/verify').post(isAuthenticated, verifyPayment);
router.route('/status/:courseId').get(isAuthenticated, getCoursePurchaseStatus);
router.route('/my-courses').get(isAuthenticated, getMyEnrolledCourses);
router.route('/my-orders').get(isAuthenticated, getMyPurchases);

export default router;

