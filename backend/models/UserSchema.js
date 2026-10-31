import mongoose from 'mongoose'

const SubscriptionSchema = new mongoose.Schema({
  plan: {
    type: String,
    enum: ['free', 'pro', 'premium', 'devotional'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'trial', 'inactive'],
    default: 'active'
  },
  activatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year default
  },
  paymentId: {
    type: String,
    default: null
  }
}, { _id: false })

const UserSchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^\d{10}$/, 'Mobile number must be exactly 10 digits']
  },
  passwordHash: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  subscription: {
    type: SubscriptionSchema,
    default: () => ({})
  },
  settings: {
    masterVolume: { type: Number, default: 0.85 },
    reverbAmount: { type: Number, default: 0.35 },
    bpm: { type: Number, default: 90 },
    activeKit: { type: Number, default: 1 },
    activeTuneSet: { type: Number, default: 1 }
  }
}, {
  timestamps: true
})

export const User = mongoose.models.User || mongoose.model('User', UserSchema)

