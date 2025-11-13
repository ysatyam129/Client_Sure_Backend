import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['pdf', 'video', 'image', 'document'],
    required: true
  },
  tokenCost: {
    type: Number,
    required: true,
    min: 1,
    default: 5
  },
  url: {
    type: String,
    required: true
  },
  content: {
    type: String
  },
  thumbnailUrl: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  allowedPlans: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan'
  }],
  accessedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

export default mongoose.model('Resource', resourceSchema);