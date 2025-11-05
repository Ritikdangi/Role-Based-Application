import mongoose from 'mongoose'

const joinRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
    details: {
      enrollmentYear: Number,
      branch: String,
      rollNumber: String,
      course: String,
      collegeEmail: String,
    },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
  },
  { timestamps: true }
)

const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema)

export default JoinRequest
