import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import Resource from '../models/Resource.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Plan from '../models/Plan.js';

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Admin login
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Received credentials:', { username, password });

    if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin logout
export const adminLogout = (req, res) => {
  res.clearCookie('adminToken');
  res.json({ message: 'Logout successful' });
};

// Create resource
export const createResource = async (req, res) => {
  try {
    const { title, description, type, tokenCost } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'File is required' });
    }

    // Upload to Cloudinary from buffer
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'resources'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(file.buffer);
    });

    const resource = new Resource({
      title,
      description,
      type,
      tokenCost: tokenCost || 5,
      url: result.secure_url,
      thumbnailUrl: result.secure_url
    });

    await resource.save();
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all resources
export const getResources = async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get resource by ID
export const getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update resource
export const updateResource = async (req, res) => {
  try {
    const { title, description, type, tokenCost, isActive } = req.body;
    const file = req.file;

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Update fields
    if (title) resource.title = title;
    if (description) resource.description = description;
    if (type) resource.type = type;
    if (tokenCost) resource.tokenCost = tokenCost;
    if (isActive !== undefined) resource.isActive = isActive;

    // Upload new file if provided
    if (file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto',
            folder: 'resources'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(file.buffer);
      });
      resource.url = result.secure_url;
      resource.thumbnailUrl = result.secure_url;
    }

    await resource.save();
    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete resource
export const deleteResource = async (req, res) => {
  try {
    console.log('Deleting resource with ID:', req.params.id);
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('subscription.planId')
      .select('-passwordHash -resetTokenHash')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user by ID
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('subscription.planId')
      .select('-passwordHash -resetTokenHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user tokens
export const updateUserTokens = async (req, res) => {
  try {
    const { tokens } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.tokens = tokens;
    await user.save();
    res.json({ message: 'User tokens updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Analytics Dashboard
export const getAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // User Analytics
    const totalUsers = await User.countDocuments();
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: startOfDay } });
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: startOfWeek } });
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });
    const activeSubscriptions = await User.countDocuments({ 'subscription.planId': { $exists: true } });

    // Order Analytics
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const failedOrders = await Order.countDocuments({ status: 'failed' });
    const ordersToday = await Order.countDocuments({ createdAt: { $gte: startOfDay } });
    const ordersThisMonth = await Order.countDocuments({ createdAt: { $gte: startOfMonth } });

    // Revenue Analytics
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthlyRevenue = await Order.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Token Analytics
    const totalTokensDistributed = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$tokens' } } }
    ]);
    const totalTokensUsed = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$tokensUsedTotal' } } }
    ]);

    // Resource Analytics
    const totalResources = await Resource.countDocuments();
    const activeResources = await Resource.countDocuments({ isActive: true });
    const resourcesByType = await Resource.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Plan Analytics
    const planStats = await Plan.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'subscription.planId',
          as: 'subscribers'
        }
      },
      {
        $project: {
          name: 1,
          price: 1,
          subscriberCount: { $size: '$subscribers' }
        }
      }
    ]);

    // Recent Activity
    const recentUsers = await User.find()
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    
    const recentOrders = await Order.find()
      .populate('planId', 'name price')
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly Growth Data (last 6 months)
    const monthlyGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const users = await User.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });
      const orders = await Order.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd },
        status: 'completed'
      });
      const revenue = await Order.aggregate([
        { $match: { createdAt: { $gte: monthStart, $lte: monthEnd }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      monthlyGrowth.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        users,
        orders,
        revenue: revenue[0]?.total || 0
      });
    }

    res.json({
      overview: {
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalResources,
        activeSubscriptions
      },
      userStats: {
        total: totalUsers,
        newToday: newUsersToday,
        newThisWeek: newUsersThisWeek,
        newThisMonth: newUsersThisMonth,
        activeSubscriptions
      },
      orderStats: {
        total: totalOrders,
        completed: completedOrders,
        pending: pendingOrders,
        failed: failedOrders,
        today: ordersToday,
        thisMonth: ordersThisMonth
      },
      revenueStats: {
        total: totalRevenue[0]?.total || 0,
        thisMonth: monthlyRevenue[0]?.total || 0,
        conversionRate: totalUsers > 0 ? ((completedOrders / totalUsers) * 100).toFixed(2) : 0
      },
      tokenStats: {
        totalDistributed: totalTokensDistributed[0]?.total || 0,
        totalUsed: totalTokensUsed[0]?.total || 0,
        utilizationRate: totalTokensDistributed[0]?.total > 0 ? 
          ((totalTokensUsed[0]?.total / totalTokensDistributed[0]?.total) * 100).toFixed(2) : 0
      },
      resourceStats: {
        total: totalResources,
        active: activeResources,
        byType: resourcesByType
      },
      planStats,
      recentActivity: {
        users: recentUsers,
        orders: recentOrders
      },
      monthlyGrowth
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user growth chart data
export const getUserGrowthData = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const growthData = [];
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await User.countDocuments({
        createdAt: { $gte: date, $lt: nextDate }
      });

      growthData.push({
        date: date.toISOString().split('T')[0],
        users: count
      });
    }

    res.json(growthData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get revenue chart data
export const getRevenueData = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    
    const revenueData = [];
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const revenue = await Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: date, $lt: nextDate },
            status: 'completed'
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      revenueData.push({
        date: date.toISOString().split('T')[0],
        revenue: revenue[0]?.total || 0
      });
    }

    res.json(revenueData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};