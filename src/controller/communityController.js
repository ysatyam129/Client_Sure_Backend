import Feedback from '../models/Feedback.js';
import User from '../models/User.js';

// Get trending posts
export const getTrendingPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!checkSubscriptionAccess(user)) {
      return res.status(403).json({ message: 'Subscription expired. Community access denied.' });
    }

    const posts = await Feedback.aggregate([
      {
        $addFields: {
          engagement: {
            $add: [
              { $size: '$likes' },
              { $multiply: [{ $size: '$comments' }, 2] }
            ]
          }
        }
      },
      { $sort: { engagement: -1, createdAt: -1 } },
      { $limit: 10 }
    ]);

    await Feedback.populate(posts, [
      { path: 'user_id', select: 'name avatar' },
      { path: 'comments.user_id', select: 'name avatar' }
    ]);

    res.json({ posts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trending posts', error: error.message });
  }
};

// Helper function to check subscription validity
const checkSubscriptionAccess = (user) => {
  if (!user.subscription.endDate) return false;
  return new Date() <= new Date(user.subscription.endDate);
};

// Create new post with optional image
export const createPost = async (req, res) => {
  try {
    const { post_title, description } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!checkSubscriptionAccess(user)) {
      return res.status(403).json({ message: 'Subscription expired. Community access denied.' });
    }

    const postData = {
      user_id: userId,
      post_title,
      description
    };

    // Add image if uploaded
    if (req.file) {
      postData.image = req.file.path;
    }

    const post = new Feedback(postData);
    await post.save();

    // Update user points and activity
    await User.findByIdAndUpdate(userId, {
      $inc: { 
        points: 5,
        'communityActivity.postsCreated': 1
      }
    });

    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
};

// Delete own post
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Feedback.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user_id.toString() !== userId) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    await Feedback.findByIdAndDelete(postId);

    // Deduct points
    await User.findByIdAndUpdate(userId, {
      $inc: { 
        points: -5,
        'communityActivity.postsCreated': -1
      }
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
};

// Like post
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!checkSubscriptionAccess(user)) {
      return res.status(403).json({ message: 'Subscription expired. Community access denied.' });
    }

    const post = await Feedback.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const alreadyLiked = post.likes.some(like => like.user_id.toString() === userId);
    if (alreadyLiked) {
      return res.status(400).json({ message: 'Post already liked' });
    }

    post.likes.push({ user_id: userId });
    await post.save();

    // Update points
    await User.findByIdAndUpdate(userId, {
      $inc: { 'communityActivity.likesGiven': 1 }
    });

    await User.findByIdAndUpdate(post.user_id, {
      $inc: { 
        points: 1,
        'communityActivity.likesReceived': 1
      }
    });

    res.json({ message: 'Post liked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error liking post', error: error.message });
  }
};

// Unlike post
export const unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!checkSubscriptionAccess(user)) {
      return res.status(403).json({ message: 'Subscription expired. Community access denied.' });
    }

    const post = await Feedback.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.findIndex(like => like.user_id.toString() === userId);
    if (likeIndex === -1) {
      return res.status(400).json({ message: 'You have not liked this post yet' });
    }

    post.likes.splice(likeIndex, 1);
    await post.save();

    // Update points - ensure user exists before updating
    await User.findByIdAndUpdate(userId, {
      $inc: { 'communityActivity.likesGiven': -1 }
    });

    // Only update post owner points if they exist
    if (post.user_id) {
      await User.findByIdAndUpdate(post.user_id, {
        $inc: { 
          points: -1,
          'communityActivity.likesReceived': -1
        }
      });
    }

    res.json({ message: 'Post unliked successfully' });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ message: 'Error unliking post', error: error.message });
  }
};

// Add comment
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!checkSubscriptionAccess(user)) {
      return res.status(403).json({ message: 'Subscription expired. Community access denied.' });
    }

    const post = await Feedback.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      user_id: userId,
      text,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();

    // Update user points
    await User.findByIdAndUpdate(userId, {
      $inc: { 
        points: 2,
        'communityActivity.commentsMade': 1
      }
    });

    res.status(201).json({ message: 'Comment added successfully', comment });
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
};

// Delete own comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const post = await Feedback.findOne({ 'comments._id': commentId });
    if (!post) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const comment = post.comments.id(commentId);
    if (comment.user_id.toString() !== userId) {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }

    post.comments.pull(commentId);
    await post.save();

    // Deduct points
    await User.findByIdAndUpdate(userId, {
      $inc: { 
        points: -2,
        'communityActivity.commentsMade': -1
      }
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
};

// Get all posts with search
export const getAllPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search } = req.query;
    
    const user = await User.findById(userId);
    if (!checkSubscriptionAccess(user)) {
      return res.status(403).json({ message: 'Subscription expired. Community access denied.' });
    }

    let query = {};
    if (search) {
      query = {
        $or: [
          { post_title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const posts = await Feedback.find(query)
      .populate('user_id', 'name avatar')
      .populate('comments.user_id', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ posts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
};

// Get leaderboard with user rank
// Get leaderboard with user rank
export const getLeaderboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!checkSubscriptionAccess(user)) {
      return res.status(403).json({ message: 'Subscription expired. Community access denied.' });
    }

    const leaderboard = await User.find({ points: { $gt: 0 } })
      .select('name avatar points communityActivity')
      .sort({ points: -1 })
      .limit(50);

    // Get current user rank
    const userRank = await User.countDocuments({ 
      points: { $gt: user.points } 
    }) + 1;

    res.json({ leaderboard, userRank, userPoints: user.points });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
  }
};

// Get community stats
export const getCommunityStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!checkSubscriptionAccess(user)) {
      return res.status(403).json({ message: 'Subscription expired. Community access denied.' });
    }

    const stats = await Promise.all([
      Feedback.countDocuments(),
      Feedback.aggregate([{ $unwind: '$comments' }, { $count: 'total' }]),
      Feedback.aggregate([{ $unwind: '$likes' }, { $count: 'total' }]),
      User.countDocuments({ points: { $gt: 0 } })
    ]);

    res.json({
      totalPosts: stats[0],
      totalComments: stats[1][0]?.total || 0,
      totalLikes: stats[2][0]?.total || 0,
      activeMembers: stats[3]
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching community stats', error: error.message });
  }
};es.status(403).json({ message: 'Subscription expired. Community access denied.' });
    }

    const stats = await Promise.all([
      Feedback.countDocuments(),
      Feedback.aggregate([{ $unwind: '$comments' }, { $count: 'total' }]),
      Feedback.aggregate([{ $unwind: '$likes' }, { $count: 'total' }]),
      User.countDocuments({ points: { $gt: 0 } })
    ]);

    res.json({
      totalPosts: stats[0],
      totalComments: stats[1][0]?.total || 0,
      totalLikes: stats[2][0]?.total || 0,
      activeMembers: stats[3]
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching community stats', error: error.message });
  }
};