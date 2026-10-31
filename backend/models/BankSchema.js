import mongoose from 'mongoose'

const BankPadSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  hindiName: { type: String, default: '' },
  key: { type: String, required: true },
  keyCode: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: '🥁' },
  color: { type: String, default: '#1e293b' },
  accentColor: { type: String, default: '#06b6d4' },
  defaultVolume: { type: Number, default: 1.0 },
  defaultPitch: { type: Number, default: 1.0 },
  category: { type: String, default: 'membranophone' },
  soundUrl: { type: String, default: '' },
  synthType: { type: String, default: '' },
  isTrack: { type: Boolean, default: false }
}, { _id: false })

const BankDocumentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  bankId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  pads: {
    type: [BankPadSchema],
    validate: [val => val.length === 8, 'Each Bank must have exactly 8 pads']
  }
}, {
  timestamps: true
})

// Compound index so a user cannot have duplicate bankId records
BankDocumentSchema.index({ userId: 1, bankId: 1 }, { unique: true })

export const BankModel = mongoose.models.Bank || mongoose.model('Bank', BankDocumentSchema)

