import express from 'express';
import { login, register, requestReset, resetPassword, logout, accessResource, getAccessedResources, getUserProfile } from '../controller/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/logout
router.post('/logout', logout);

// POST /api/auth/request-reset
router.post('/request-reset', requestReset);

// POST /api/auth/reset/:token
router.post('/reset/:token', resetPassword);

// POST /api/auth/access/:id - Access resource (reduces tokens)
router.post('/access/:id', authenticateToken, accessResource);

// GET /api/auth/accessed-resources - Get user's accessed resources
router.get('/accessed-resources', authenticateToken, getAccessedResources);

// GET /api/auth/profile - Get user profile data
router.get('/profile', authenticateToken, getUserProfile);

export default router;