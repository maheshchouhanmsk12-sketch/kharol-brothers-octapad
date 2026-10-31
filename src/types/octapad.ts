export type InstrumentId = 
  | 'dholak'
  | 'tabla_na'
  | 'tabla_ge'
  | 'manjira'
  | 'kartal'
  | 'khanjari'
  | 'temple_ghanti'
  | 'sam_accent'
  | string

export type KitNumber = 1 | 2 | 3
export type TuneSetNumber = 1 | 2 | 3 | 4

export type SubscriptionTier = 'free' | 'premium'

export interface SubscriptionStatus {
  tier: SubscriptionTier
  isLocked?: boolean
  reason?: string
}

export type PadCategory = 'membranophone' | 'idiophone' | 'resonant' | 'electronic' | 'track'

export interface PadConfig {
  id: string
  name: string
  hindiName: string
  key: string
  keyCode: string
  description: string
  icon: string
  color: string
  accentColor: string
  defaultVolume: number // 0 to 1.5
  defaultPitch: number // 0.5 to 2.0 (1.0 = normal)
  category: PadCategory
  isTrack?: boolean
  soundUrl?: string
  synthType?: string
  customAudioName?: string
}

export interface UserBank {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  pads: PadConfig[] // Exactly 8 pads
}

export interface SoundLibraryItem {
  id: string
  name: string
  hindiName?: string
  category: PadCategory
  description: string
  soundUrl?: string
  synthType?: string
  isTrack?: boolean
  defaultVolume?: number
  defaultPitch?: number
  icon?: string
}

export interface TuneSetConfig {
  tuneSetNumber: TuneSetNumber
  name: string
  hindiName: string
  description: string
  pads: PadConfig[]
}

export interface KitConfig {
  kitNumber: KitNumber
  name: string
  hindiName: string
  tuneSets: [TuneSetConfig, TuneSetConfig, TuneSetConfig, TuneSetConfig]
}

export interface PadState {
  volume: number
  pitch: number
  isMuted: boolean
  isStruck: boolean
  lastStruckTime: number
  lastStruckVelocity?: number
}

export interface RecordedHit {
  padId: string
  timeMs: number
  velocity: number
}

export interface RecordingSession {
  id: string
  name: string
  date: string
  durationMs: number
  hits: RecordedHit[]
}

export type PresetMode = 'bhajan' | 'sundarkand' | 'aarti' | 'custom'

export interface PresetDetails {
  id: PresetMode
  name: string
  hindiName: string
  tagline: string
  suggestedBpm: number
  reverbAmount: number
  padVolumes: Record<string, number>
  padPitches: Record<string, number>
  accentDescription: string
}
