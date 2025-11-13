import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getResources, accessResource, getUserStats, getAccessedResources, getResourceById } from '../controller/resourceController.js';

const router = express.Router();

// GET /api/resources - Get all available resources
router.get('/', authenticateToken, getResources);

// POST /api/resources/:id/access - Access a resource with token deduction
router.post('/:id/access', authenticateToken, accessResource);

// GET /api/resources/user/stats - Get user token stats
router.get('/user/stats', authenticateToken, getUserStats);

// GET /api/resources/user/accessed - Get user's accessed resources
router.get('/user/accessed', authenticateToken, getAccessedResources);

// GET /api/resources/:id - Get a specific resource by ID
router.get('/:id', authenticateToken, getResourceById);

export default router;