import mongoose from 'mongoose'

const institutionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    normalizedName: { type: String, required: true, unique: true },
    type: { type: String, enum: ['institute', 'corporate', 'school'], required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

// Ensure normalizedName is created from name (trim + lowercase)
institutionSchema.pre('validate', function (next) {
  if (this.name) {
    this.normalizedName = this.name.trim().toLowerCase()
  }
  next()
})

const Institution = mongoose.model('Institution', institutionSchema)

export default Institution
