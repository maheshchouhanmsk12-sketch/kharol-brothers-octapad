import { PresetDetails, PresetMode } from '../types/octapad'

export const PRESETS: Record<PresetMode, PresetDetails> = {
  bhajan: {
    id: 'bhajan',
    name: 'Bhajan Sangat',
    hindiName: 'भजन संगत',
    tagline: 'Ideal for melodic Ram & Krishna Bhajans, Kirtans, and Bhakti Geet (Dadra & Keharwa tempo)',
    suggestedBpm: 90,
    reverbAmount: 0.35,
    padVolumes: {
      dholak: 1.0,
      tabla_na: 0.95,
      tabla_ge: 0.9,
      manjira: 0.8,
      kartal: 0.75,
      khanjari: 0.7,
      temple_ghanti: 0.85,
      sam_accent: 1.0
    },
    padPitches: {
      dholak: 1.0,
      tabla_na: 1.0, // Tuned to D4 (294 Hz)
      tabla_ge: 1.0,
      manjira: 1.0,
      kartal: 1.0,
      khanjari: 1.0,
      temple_ghanti: 1.0,
      sam_accent: 1.0
    },
    accentDescription: 'Gentle, melodic balance highlighting Dholak, singing Tabla Na, and Manjira'
  },
  sundarkand: {
    id: 'sundarkand',
    name: 'Sundarkand Sangat',
    hindiName: 'सुन्दरकाण्ड संगत',
    tagline: 'Configured for high-energy Chaupai recitation, Doha accents, and Akhand Ramayan path',
    suggestedBpm: 112,
    reverbAmount: 0.25,
    padVolumes: {
      dholak: 1.1,
      tabla_na: 0.9,
      tabla_ge: 1.0,
      manjira: 0.85,
      kartal: 1.1, // Prominent clapper for chaupai groove
      khanjari: 1.05, // Snappy frame drum
      temple_ghanti: 0.8,
      sam_accent: 1.15
    },
    padPitches: {
      dholak: 1.05,
      tabla_na: 1.03,
      tabla_ge: 0.98,
      manjira: 1.0,
      kartal: 1.02,
      khanjari: 1.0,
      temple_ghanti: 1.0,
      sam_accent: 1.05
    },
    accentDescription: 'Crisp, driving transient response emphasizing Kartal, Khanjari, and punchy Dholak'
  },
  aarti: {
    id: 'aarti',
    name: 'Aarti Sangat',
    hindiName: 'आरती भाव संगत',
    tagline: 'Spiritual crescendo for Mandir Aarti (Om Jai Jagdish Hare, Hanuman Aarti, Mangal Aarti)',
    suggestedBpm: 128,
    reverbAmount: 0.50,
    padVolumes: {
      dholak: 0.95,
      tabla_na: 0.85,
      tabla_ge: 0.85,
      manjira: 1.15, // Golden ringing cymbals
      kartal: 0.9,
      khanjari: 0.8,
      temple_ghanti: 1.25, // Resonant brass mandir bell dominates
      sam_accent: 1.25 // Majestic sam crescendo
    },
    padPitches: {
      dholak: 0.98,
      tabla_na: 1.0,
      tabla_ge: 1.0,
      manjira: 1.02,
      kartal: 1.0,
      khanjari: 0.95,
      temple_ghanti: 1.0,
      sam_accent: 1.0
    },
    accentDescription: 'Expansive temple acoustics with triumphant Temple Ghanti, Manjira, and Sam Accents'
  },
  custom: {
    id: 'custom',
    name: 'Custom User Setup',
    hindiName: 'कस्टम व्यवस्था',
    tagline: 'Your personalized pad tunings, volume mix, and acoustic chamber settings',
    suggestedBpm: 100,
    reverbAmount: 0.30,
    padVolumes: {
      dholak: 1.0,
      tabla_na: 1.0,
      tabla_ge: 1.0,
      manjira: 1.0,
      kartal: 1.0,
      khanjari: 1.0,
      temple_ghanti: 1.0,
      sam_accent: 1.0
    },
    padPitches: {
      dholak: 1.0,
      tabla_na: 1.0,
      tabla_ge: 1.0,
      manjira: 1.0,
      kartal: 1.0,
      khanjari: 1.0,
      temple_ghanti: 1.0,
      sam_accent: 1.0
    },
    accentDescription: 'Custom settings tailored to your playing style'
  }
}
