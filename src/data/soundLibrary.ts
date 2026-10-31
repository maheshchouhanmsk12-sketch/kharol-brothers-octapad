import { SoundLibraryItem } from '../types/octapad'

export const SOUND_LIBRARY: SoundLibraryItem[] = [
  // --- Indian Devotional & Traditional ---
  {
    id: 'lib_dholak',
    name: 'Desi Dhol / Bass',
    hindiName: 'देसी ढोलक बास',
    category: 'membranophone',
    description: 'Authentic Indian devotional Dholak wooden bass punch and resonance',
    soundUrl: '/sounds/dholak.wav',
    synthType: 'dholak',
    defaultVolume: 1.0,
    defaultPitch: 1.0,
    icon: '🥁'
  },
  {
    id: 'lib_tabla_na',
    name: 'Tabla Na (Dayan)',
    hindiName: 'तबला ना (दायां)',
    category: 'membranophone',
    description: 'High crisp Dayan rim strike with signature Indian ringing tone',
    soundUrl: '/sounds/tabla_na.wav',
    synthType: 'tabla_na',
    defaultVolume: 0.95,
    defaultPitch: 1.0,
    icon: '🪘'
  },
  {
    id: 'lib_tabla_ge',
    name: 'Tabla Ge (Bayan)',
    hindiName: 'तबला घे (बायां)',
    category: 'membranophone',
    description: 'Deep resonant Bayan bass with signature modulation and wrist glide',
    soundUrl: '/sounds/tabla_ge.wav',
    synthType: 'tabla_ge',
    defaultVolume: 0.95,
    defaultPitch: 1.0,
    icon: '🥣'
  },
  {
    id: 'lib_tasha',
    name: 'Tasha Snare',
    hindiName: 'ताशा नगाड़ा',
    category: 'membranophone',
    description: 'Crisp marching Tasha with metallic rim bite and energetic snap',
    synthType: 'tasha',
    defaultVolume: 1.0,
    defaultPitch: 1.0,
    icon: '🥁'
  },
  {
    id: 'lib_nagada',
    name: 'Royal Nagada',
    hindiName: 'शाही नगाड़ा',
    category: 'membranophone',
    description: 'Thunderous ceremonial Nagada kettle drum with massive sub decay',
    synthType: 'nagada',
    defaultVolume: 1.05,
    defaultPitch: 1.0,
    icon: '🥁'
  },
  {
    id: 'lib_kartal',
    name: 'Rajasthani Khartal',
    hindiName: 'राजस्थानी खड़ताल',
    category: 'idiophone',
    description: 'Traditional teakwood clapper with brass jingles and devotional rhythm',
    soundUrl: '/sounds/kartal.wav',
    synthType: 'kartal',
    defaultVolume: 0.9,
    defaultPitch: 1.0,
    icon: '🪵'
  },
  {
    id: 'lib_khanjari',
    name: 'Dafli / Khanjari',
    hindiName: 'डफली / खंजरी',
    category: 'membranophone',
    description: 'Folk tambourine frame drum with tight skin tone and shimmer jingles',
    soundUrl: '/sounds/khanjari.wav',
    synthType: 'khanjari',
    defaultVolume: 0.9,
    defaultPitch: 1.0,
    icon: '🪘'
  },
  {
    id: 'lib_manjira',
    name: 'Devotional Manjira',
    hindiName: 'भजन मंजीरा',
    category: 'resonant',
    description: 'Sweet ringing bronze finger cymbals for devotional sankirtan',
    soundUrl: '/sounds/manjira.wav',
    synthType: 'manjira',
    defaultVolume: 0.85,
    defaultPitch: 1.0,
    icon: '🪙'
  },
  {
    id: 'lib_temple_ghanti',
    name: 'Mandir Ghanti',
    hindiName: 'मंदिर कांस्य घंटी',
    category: 'resonant',
    description: 'Sacred temple bronze bell with pure lingering harmonic tail',
    soundUrl: '/sounds/temple_ghanti.wav',
    synthType: 'temple_ghanti',
    defaultVolume: 0.95,
    defaultPitch: 1.0,
    icon: '🔔'
  },
  {
    id: 'lib_sam_accent',
    name: 'Mela Sam Climax',
    hindiName: 'मेला सम एक्सेंट',
    category: 'resonant',
    description: 'Pinnacle beat accent combining brass crash and deep drum impact',
    soundUrl: '/sounds/sam_accent.wav',
    synthType: 'sam_accent',
    defaultVolume: 1.0,
    defaultPitch: 1.0,
    icon: '⭐'
  },
  {
    id: 'lib_shankh',
    name: 'Devotional Shankh',
    hindiName: 'दिव्य शंख नाद',
    category: 'resonant',
    description: 'Resonant sacred conch sound with rich soaring overtones',
    synthType: 'shankh',
    defaultVolume: 1.0,
    defaultPitch: 1.0,
    icon: '🐚'
  },
  {
    id: 'lib_temple_gong',
    name: 'Temple Kaansya Gong',
    hindiName: 'मंदिर कांस्य घंटा',
    category: 'resonant',
    description: 'Deep heavy bronze gong with dark celestial reverberation',
    synthType: 'temple_gong',
    defaultVolume: 1.0,
    defaultPitch: 1.0,
    icon: '🛎️'
  },

  // --- Modern & DJ Studio Sounds ---
  {
    id: 'lib_bass_808',
    name: '808 Sub Bass Boom',
    hindiName: '808 सब बास',
    category: 'electronic',
    description: 'Ultra-low 808 sub bass drop with punchy initial transient',
    synthType: 'bass_808',
    defaultVolume: 1.1,
    defaultPitch: 1.0,
    icon: '🔊'
  },
  {
    id: 'lib_clap',
    name: 'Studio Hand Clap',
    hindiName: 'स्टूडियो हैंड क्लैप',
    category: 'electronic',
    description: 'Multi-layered stereo handclap ideal for modern bhajan & DJ sets',
    synthType: 'clap',
    defaultVolume: 0.95,
    defaultPitch: 1.0,
    icon: '👏'
  },
  {
    id: 'lib_dj_airhorn',
    name: 'DJ Airhorn & Siren',
    hindiName: 'डीजे एयर हॉर्न',
    category: 'electronic',
    description: 'Iconic festival & club DJ air horn pitch riser effect',
    synthType: 'dj_effect',
    defaultVolume: 1.0,
    defaultPitch: 1.0,
    icon: '🚨'
  },

  // --- Backing Tracks & Rhythmic Loops ---
  {
    id: 'lib_garba_loop',
    name: 'Garba Loop 101 BPM',
    hindiName: 'गरबा लूप 101 बीपीएम',
    category: 'track',
    description: 'Nonstop Gujarati Desi Garba drum & dhol nonstop live loop',
    soundUrl: '/sounds/garba_loop.mp3',
    isTrack: true,
    defaultVolume: 1.0,
    defaultPitch: 1.0,
    icon: '🔥'
  },
  {
    id: 'lib_dholak_matka',
    name: 'Matka Dholak Track',
    hindiName: 'मटका ढोलक ट्रैक',
    category: 'track',
    description: 'Bollywood Duff & Matka rhythm with deep acoustic pulse',
    soundUrl: '/sounds/dholak_matka.m4a',
    isTrack: true,
    defaultVolume: 0.95,
    defaultPitch: 1.0,
    icon: '🪘'
  },
  {
    id: 'lib_dhol_thali',
    name: 'Dhol Thali Track',
    hindiName: 'ढोल थाली ट्रैक',
    category: 'track',
    description: 'Authentic Rajasthani folk Dhol & Thali live devotional track',
    soundUrl: '/sounds/dhol_thali.m4a',
    isTrack: true,
    defaultVolume: 1.0,
    defaultPitch: 1.0,
    icon: '🎵'
  }
]

