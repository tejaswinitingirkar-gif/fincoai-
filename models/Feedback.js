import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5,
  },
  category: {
    type: String,
    enum: ['Bug Report', 'Feature Request', 'UI Improvement', 'AI Prediction Issue', 'General Feedback'],
    required: [true, 'Please provide a category'],
  },
  message: {
    type: String,
    required: [true, 'Please provide feedback message'],
    trim: true,
  },
}, { timestamps: true });

// Add index for performance
FeedbackSchema.index({ category: 1, createdAt: -1 });
FeedbackSchema.index({ user: 1 });

export default mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
