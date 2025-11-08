import mongoose from 'mongoose';

const linkRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', default: undefined },
  requestedHierarchy: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  adminHierarchy: String, // the hierarchy that was granted when approved
}, { timestamps: true });

const LinkRequest = mongoose.model('LinkRequest', linkRequestSchema);
export default LinkRequest;
