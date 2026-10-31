import { PadConfig } from '../types/octapad'

export const PAD_CONFIGS: PadConfig[] = [
  {
    id: 'dholak',
    name: 'Dholak',
    hindiName: 'ढोलक',
    key: 'A',
    keyCode: 'KeyA',
    description: 'Deep resonant barrel drum (dhamaka & slap)',
    icon: '🥁',
    color: '#9a3412', // Warm terracotta / wood
    accentColor: '#fb923c',
    defaultVolume: 1.0,
    defaultPitch: 1.0,
    category: 'membranophone'
  },
  {
    id: 'tabla_na',
    name: 'Tabla Na',
    hindiName: 'तबला ना',
    key: 'S',
    keyCode: 'KeyS',
    description: 'High ringing Dayan rim strike (Chat/Syahi ring)',
    icon: '🪘',
    color: '#854d0e', // Aged copper/wood
    accentColor: '#facc15',
    defaultVolume: 0.95,
    defaultPitch: 1.0,
    category: 'membranophone'
  },
  {
    id: 'tabla_ge',
    name: 'Tabla Ge',
    hindiName: 'तबला घे',
    key: 'D',
    keyCode: 'KeyD',
    description: 'Deep modulating Bayan bass with wrist glide',
    icon: '🥣',
    color: '#713f12', // Deep clay/copper kettle
    accentColor: '#eab308',
    defaultVolume: 0.95,
    defaultPitch: 1.0,
    category: 'membranophone'
  },
  {
    id: 'manjira',
    name: 'Garba Loop',
    hindiName: 'गुजराती गरबा',
    key: 'F',
    keyCode: 'KeyF',
    description: 'Garba Loop Gujarati Desi Nonstop Drum Dhol (101 BPM)',
    icon: '💃',
    color: '#a16207',
    accentColor: '#38bdf8',
    defaultVolume: 1.0,
    defaultPitch: 1.0,
    category: 'resonant',
    isTrack: true
  },
  {
    id: 'kartal',
    name: 'Kartal',
    hindiName: 'करताल',
    key: 'J',
    keyCode: 'KeyJ',
    description: 'Hardwood clappers with jangling brass discs',
    icon: '🪵',
    color: '#78350f', // Sheesham wood
    accentColor: '#fdba74',
    defaultVolume: 0.9,
    defaultPitch: 1.0,
    category: 'idiophone'
  },
  {
    id: 'khanjari',
    name: 'Khanjari',
    hindiName: 'खंजरी',
    key: 'K',
    keyCode: 'KeyK',
    description: 'Devotional frame drum / dapli with brass bells',
    icon: '🪘',
    color: '#b45309', // Saffron leather
    accentColor: '#fde047',
    defaultVolume: 0.85,
    defaultPitch: 1.0,
    category: 'membranophone'
  },
  {
    id: 'temple_ghanti',
    name: 'Dholak Matka',
    hindiName: 'मटका ढोलक',
    key: 'L',
    keyCode: 'KeyL',
    description: 'Bollywood Duff & Matka Dholak Rhythm Track',
    icon: '🥣',
    color: '#ca8a04',
    accentColor: '#fde047',
    defaultVolume: 1.0,
    defaultPitch: 1.0,
    category: 'resonant',
    isTrack: true
  },
  {
    id: 'sam_accent',
    name: 'Dhol Thali',
    hindiName: 'ढोल-थाली',
    key: 'Space',
    keyCode: 'Space',
    description: 'New Rajasthani Desi Dhol-Thali Track',
    icon: '🥁',
    color: '#c2410c',
    accentColor: '#f97316',
    defaultVolume: 1.0,
    defaultPitch: 1.0,
    category: 'resonant',
    isTrack: true
  }
]
