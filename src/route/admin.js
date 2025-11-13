import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { authenticateAdmin } from '../middleware/adminAuth.js';
import { upload } from '../middleware/upload.js';
import { manualTokenRefresh } from '../services/cronJobs.js';
import {
  adminLogin,
  adminLogout,
  createResource,
  getResources,
  getResource,
  updateResource,
  deleteResource,
  getUsers,
  getUser,
  updateUserTokens,
  getAnalytics,
  getUserGrowthData,
  getRevenueData
} from '../controller/adminController.js';

const router = express.Router();

// Admin authentication
router.post('/login', adminLogin);
router.post('/logout', adminLogout);

// Resource CRUD operations
router.post('/resources', authenticateAdmin, upload.single('file'), createResource);
router.get('/resources', authenticateAdmin, getResources);
router.get('/resources/:id', authenticateAdmin, getResource);
router.put('/resources/:id', authenticateAdmin, upload.single('file'), updateResource);
router.delete('/resources/:id', authenticateAdmin, deleteResource);

// User management operations
router.get('/users', authenticateAdmin, getUsers);
router.get('/users/:id', authenticateAdmin, getUser);
router.put('/users/:id/tokens', authenticateAdmin, updateUserTokens);

// Analytics operations
router.get('/analytics', authenticateAdmin, getAnalytics);
router.get('/analytics/user-growth', authenticateAdmin, getUserGrowthData);
router.get('/analytics/revenue', authenticateAdmin, getRevenueData);

// POST /api/admin/refresh-tokens - Manual token refresh (for testing)
router.post('/refresh-tokens', authenticateToken, async (req, res) => {
  try {
    const result = await manualTokenRefresh();
    
    if (result.success) {
      res.json({
        message: 'Token refresh completed successfully',
        refreshedCount: result.refreshedCount
      });
    } else {
      res.status(500).json({
        error: 'Token refresh failed',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Manual refresh endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;