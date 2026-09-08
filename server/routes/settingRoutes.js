import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { authorizeRoles } from '../middlewares/authorizeRole.js';
import { getSettings, updateSettings } from '../controllers/setting.controller.js';

const router = express.Router();

// Public route to view settings
router.route('/').get(getSettings);

// Admin-only route to update settings
router.route('/').put(isAuthenticated, authorizeRoles('Admin'), updateSettings);

export default router;
