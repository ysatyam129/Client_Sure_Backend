import Feedback from '../../models/Feedback.js';
import User from '../../models/User.js';

// Get all posts for admin moderation
export const getAllPostsAdmin = async (req, res) => {
  try {
    const posts = await Feedback.find()
      .populate('user_id', 'name email avatar')
      .populate('comments.user_id', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ posts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
};

// Admin delete any post
export const deletePostAdmin = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Feedback.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const postOwnerId = post.user_id;

    // Delete the post
    await Feedback.findByIdAndDelete(postId);

    // Deduct points from post owner
    await User.findByIdAndUpdate(postOwnerId, {
      $inc: { 
        points: -5,
        'communityActivity.postsCreated': -1
      }
    });

    res.json({ message: 'Post deleted successfully by admin' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
};

// Admin delete any comment
export const deleteCommentAdmin = async (req, res) => {
  try {
    const { commentId } = req.params;

    const post = await Feedback.findOne({ 'comments._id': commentId });
    if (!post) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const comment = post.comments.id(commentId);
    const commentOwnerId = comment.user_id;

    // Remove comment
    post.comments.pull(commentId);
    await post.save();

    // Deduct points from comment owner
    await User.findByIdAndUpdate(commentOwnerId, {
      $inc: { 
        points: -2,
        'communityActivity.commentsMade': -1
      }
    });

    res.json({ message: 'Comment deleted successfully by admin' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
};