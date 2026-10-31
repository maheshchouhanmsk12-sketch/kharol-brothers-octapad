import mongoose from 'mongoose'

const PadSchema = new mongoose.Schema({
  padIndex: { type: Number, required: true }, // 0 to 7
  id: { type: String, required: true },
  name: { type: String, required: true },
  hindiName: { type: String, required: true },
  key: { type: String, required: true }, // A, S, D, F, J, K, L, Space
  keyCode: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: '🥁' },
  color: { type: String, default: '#9a3412' },
  accentColor: { type: String, default: '#fb923c' },
  category: {
    type: String,
    enum: ['membranophone', 'idiophone', 'resonant'],
    default: 'membranophone'
  },
  isTrack: { type: Boolean, default: false },
  soundUrl: { type: String, required: true }, // Audio file reference, e.g. /sounds/dholak.wav
  defaultVolume: { type: Number, default: 1.0 },
  defaultPitch: { type: Number, default: 1.0 }
}, { _id: false })

const TuneSetSchema = new mongoose.Schema({
  tuneSetNumber: { type: Number, required: true, min: 1, max: 4 },
  name: { type: String, required: true },
  hindiName: { type: String, required: true },
  description: { type: String, default: '' },
  pads: {
    type: [PadSchema],
    validate: [val => val.length === 8, 'Each Tune Set must have exactly 8 pads']
  }
}, { _id: false })

const KitSchema = new mongoose.Schema({
  kitNumber: { type: Number, required: true, min: 1, max: 3 },
  name: { type: String, required: true },
  hindiName: { type: String, required: true },
  tuneSets: {
    type: [TuneSetSchema],
    validate: [val => val.length === 4, 'Each Kit must have exactly 4 Tune Sets']
  }
}, { _id: false })

const KitConfigDocumentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    default: 'default' // 'default' for global/unauthenticated, or userId / mobileNumber
  },
  kits: {
    type: [KitSchema],
    validate: [val => val.length === 3, 'Config must contain exactly 3 Kits']
  }
}, {
  timestamps: true
})

export const KitConfigModel = mongoose.models.KitConfig || mongoose.model('KitConfig', KitConfigDocumentSchema)

