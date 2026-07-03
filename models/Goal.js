import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide a goal name'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  targetAmount: {
    type: Number,
    required: [true, 'Please provide a target amount'],
    min: [0, 'Target amount must be a positive number'],
  },
  savedAmount: {
    type: Number,
    default: 0,
    min: [0, 'Saved amount must be positive'],
  },
  manualContributions: {
    type: Number,
    default: 0,
    min: [0, 'Manual contributions must be positive'],
  },
  targetDate: {
    type: Date,
    required: [true, 'Please provide a target date'],
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  }
}, { timestamps: true });

export default mongoose.models.Goal || mongoose.model('Goal', GoalSchema);
