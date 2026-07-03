import mongoose from 'mongoose';

const GoalContributionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  goal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please provide a contribution amount'],
  },
  note: {
    type: String,
    maxlength: [100, 'Note cannot exceed 100 characters'],
  },
}, { timestamps: true });

export default mongoose.models.GoalContribution || mongoose.model('GoalContribution', GoalContributionSchema);
