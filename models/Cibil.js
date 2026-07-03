import mongoose from 'mongoose';

const CibilSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  score: {
    type: Number,
    min: 300,
    max: 900,
    default: 700
  },
  creditLimit: {
    type: Number,
    default: 100000,
  },
  creditUsed: {
    type: Number,
    default: 0,
  },
  paymentHistory: {
    type: Number,
    min: 0,
    max: 100,
    default: 100, // percentage of on-time payments
  },
  inquiries: {
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

export default mongoose.models.Cibil || mongoose.model('Cibil', CibilSchema);
