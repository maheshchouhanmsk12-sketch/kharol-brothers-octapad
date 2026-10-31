import { KitConfig, KitNumber, PadConfig, TuneSetNumber } from '../types/octapad'
import { PAD_CONFIGS } from './padConfigs'

/**
 * EXACT WORKING CONFIGURATION PRESERVED AS KIT 1 – TUNE SET 1
 * Includes original audio paths, keys, labels and track behavior.
 */
const KIT_1_TUNE_SET_1_PADS: PadConfig[] = PAD_CONFIGS.map(pad => ({
  ...pad,
  soundUrl: pad.id === 'dholak' ? '/sounds/dholak.wav' :
            pad.id === 'tabla_na' ? '/sounds/tabla_na.wav' :
            pad.id === 'tabla_ge' ? '/sounds/tabla_ge.wav' :
            pad.id === 'manjira' ? '/sounds/garba_loop.mp3' :
            pad.id === 'kartal' ? '/sounds/kartal.wav' :
            pad.id === 'khanjari' ? '/sounds/khanjari.wav' :
            pad.id === 'temple_ghanti' ? '/sounds/dholak_matka.m4a' :
            '/sounds/dhol_thali.m4a'
}))

export const DEFAULT_KITS: KitConfig[] = [
  // ==========================================
  // KIT 1: DEVOTIONAL & TRADITIONAL SANGAT
  // ==========================================
  {
    kitNumber: 1,
    name: 'Devotional & Garba',
    hindiName: 'भजन व गरबा',
    tuneSets: [
      // Tune Set 1: EXACT CURRENT CONFIGURATION PRESERVED
      {
        tuneSetNumber: 1,
        name: 'Desi Bhajan & Garba',
        hindiName: 'गुजराती गरबा व भजन',
        description: 'Original Kharol Brothers Devotional Octapad setup with authentic Garba loop and Dholak tracks',
        pads: KIT_1_TUNE_SET_1_PADS
      },
      // Tune Set 2: Temple Aarti & Ghanti
      {
        tuneSetNumber: 2,
        name: 'Temple Aarti & Shankh',
        hindiName: 'मंदिर आरती व शंख नाद',
        description: 'Serene temple bells, ghanti, ringing manjira with deep resonant tabla groove',
        pads: [
          {
            id: 'k1_ts2_p1',
            name: 'Temple Ghanti',
            hindiName: 'मंदिर घंटी',
            key: 'A',
            keyCode: 'KeyA',
            description: 'Acoustic brass temple bell with lingering resonance',
            icon: '🔔',
            color: '#ca8a04',
            accentColor: '#fde047',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'resonant',
            soundUrl: '/sounds/temple_ghanti.wav'
          },
          {
            id: 'k1_ts2_p2',
            name: 'Tabla Na',
            hindiName: 'तबला ना',
            key: 'S',
            keyCode: 'KeyS',
            description: 'High ringing Dayan rim strike',
            icon: '🪘',
            color: '#854d0e',
            accentColor: '#facc15',
            defaultVolume: 0.95,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/tabla_na.wav'
          },
          {
            id: 'k1_ts2_p3',
            name: 'Tabla Ge',
            hindiName: 'तबला घे',
            key: 'D',
            keyCode: 'KeyD',
            description: 'Deep modulating Bayan bass with wrist glide',
            icon: '🥣',
            color: '#713f12',
            accentColor: '#eab308',
            defaultVolume: 0.95,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/tabla_ge.wav'
          },
          {
            id: 'k1_ts2_p4',
            name: 'Manjira Chime',
            hindiName: 'मंजीरा छन',
            key: 'F',
            keyCode: 'KeyF',
            description: 'Sweet ringing bronze devotional manjira cymbal',
            icon: '🪙',
            color: '#a16207',
            accentColor: '#fef08a',
            defaultVolume: 0.9,
            defaultPitch: 1.0,
            category: 'resonant',
            soundUrl: '/sounds/manjira.wav'
          },
          {
            id: 'k1_ts2_p5',
            name: 'Kartal Clapper',
            hindiName: 'करताल',
            key: 'J',
            keyCode: 'KeyJ',
            description: 'Hardwood clappers with jangling brass discs',
            icon: '🪵',
            color: '#78350f',
            accentColor: '#fdba74',
            defaultVolume: 0.9,
            defaultPitch: 1.0,
            category: 'idiophone',
            soundUrl: '/sounds/kartal.wav'
          },
          {
            id: 'k1_ts2_p6',
            name: 'Dholak Dhamaka',
            hindiName: 'ढोलक धमाका',
            key: 'K',
            keyCode: 'KeyK',
            description: 'Punchy bass slap for aarti tempo builds',
            icon: '🥁',
            color: '#9a3412',
            accentColor: '#fb923c',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/dholak.wav'
          },
          {
            id: 'k1_ts2_p7',
            name: 'Sam Accent',
            hindiName: 'सम एक्सेंट',
            key: 'L',
            keyCode: 'KeyL',
            description: 'Triumphant bronze accent strike for beat resolution',
            icon: '✨',
            color: '#c2410c',
            accentColor: '#f97316',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'resonant',
            soundUrl: '/sounds/sam_accent.wav'
          },
          {
            id: 'k1_ts2_p8',
            name: 'Garba Beat Loop',
            hindiName: 'गरबा लूप',
            key: 'Space',
            keyCode: 'Space',
            description: 'Continuous Garba dholak rhythm track',
            icon: '💃',
            color: '#e11d48',
            accentColor: '#fb7185',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'resonant',
            isTrack: true,
            soundUrl: '/sounds/garba_loop.mp3'
          }
        ]
      },
      // Tune Set 3: Sundarkand Keertan
      {
        tuneSetNumber: 3,
        name: 'Sundarkand Keertan',
        hindiName: 'सुंदरकांड कीर्तन व ढोलक',
        description: 'Vigorous devotional rhythm with fast kartal, khanjari and energetic dholak accents',
        pads: [
          {
            id: 'k1_ts3_p1',
            name: 'Dholak Thaap',
            hindiName: 'ढोलक थाप',
            key: 'A',
            keyCode: 'KeyA',
            description: 'Crisp open hand dholak slap for chaupai recitation',
            icon: '🥁',
            color: '#9a3412',
            accentColor: '#fb923c',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/dholak.wav'
          },
          {
            id: 'k1_ts3_p2',
            name: 'Devi Khanjari',
            hindiName: 'खंजरी खनक',
            key: 'S',
            keyCode: 'KeyS',
            description: 'Fast jangling leather frame drum with brass bells',
            icon: '🪘',
            color: '#b45309',
            accentColor: '#fde047',
            defaultVolume: 0.9,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/khanjari.wav'
          },
          {
            id: 'k1_ts3_p3',
            name: 'Tabla Ge Bass',
            hindiName: 'गूंजती घे',
            key: 'D',
            keyCode: 'KeyD',
            description: 'Heavy bottom-end Bayan glide for Doha transitions',
            icon: '🥣',
            color: '#713f12',
            accentColor: '#eab308',
            defaultVolume: 0.95,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/tabla_ge.wav'
          },
          {
            id: 'k1_ts3_p4',
            name: 'Ram Dhun Track',
            hindiName: 'राम धुन लूप',
            key: 'F',
            keyCode: 'KeyF',
            description: 'Bollywood Duff & Matka Dholak rhythm track',
            icon: '🎶',
            color: '#d97706',
            accentColor: '#fcd34d',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'resonant',
            isTrack: true,
            soundUrl: '/sounds/dholak_matka.m4a'
          },
          {
            id: 'k1_ts3_p5',
            name: 'Kartal Jhanjh',
            hindiName: 'करताल झांझ',
            key: 'J',
            keyCode: 'KeyJ',
            description: 'Sheesham wood clapper with sharp metallic cut',
            icon: '🪵',
            color: '#78350f',
            accentColor: '#fdba74',
            defaultVolume: 0.9,
            defaultPitch: 1.0,
            category: 'idiophone',
            soundUrl: '/sounds/kartal.wav'
          },
          {
            id: 'k1_ts3_p6',
            name: 'Tabla Dayan Na',
            hindiName: 'दायां ना',
            key: 'K',
            keyCode: 'KeyK',
            description: 'Precise tuned tabla syahi rim pitch',
            icon: '🪘',
            color: '#854d0e',
            accentColor: '#facc15',
            defaultVolume: 0.95,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/tabla_na.wav'
          },
          {
            id: 'k1_ts3_p7',
            name: 'Mandir Ghanti',
            hindiName: 'मंदिर घंटी',
            key: 'L',
            keyCode: 'KeyL',
            description: 'Pure resonant chime marking verses',
            icon: '🔔',
            color: '#ca8a04',
            accentColor: '#fde047',
            defaultVolume: 0.95,
            defaultPitch: 1.0,
            category: 'resonant',
            soundUrl: '/sounds/temple_ghanti.wav'
          },
          {
            id: 'k1_ts3_p8',
            name: 'Keertan Sam',
            hindiName: 'कीर्तन सम',
            key: 'Space',
            keyCode: 'Space',
            description: 'Powerful climactic hit resolving full beat cycles',
            icon: '💥',
            color: '#c2410c',
            accentColor: '#f97316',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'resonant',
            soundUrl: '/sounds/sam_accent.wav'
          }
        ]
      },
      // Tune Set 4: Sankirtan & Jagran Climax
      {
        tuneSetNumber: 4,
        name: 'Sankirtan & Jagran Climax',
        hindiName: 'संकीर्तन व जागरण समापन',
        description: 'High energy devotional climax with nagada, tasha, desi dhol and live thali groove',
        pads: [
          {
            id: 'k1_ts4_p1',
            name: 'Royal Nagada',
            hindiName: 'शाही नगाड़ा',
            key: 'A',
            keyCode: 'KeyA',
            description: 'Deep ceremonial kettle drum with immense acoustic air decay',
            icon: '🥁',
            color: '#c2410c',
            accentColor: '#fb923c',
            defaultVolume: 1.05,
            defaultPitch: 1.0,
            category: 'membranophone',
            synthType: 'nagada'
          },
          {
            id: 'k1_ts4_p2',
            name: 'Tasha Snare',
            hindiName: 'ताशा नगाड़ा',
            key: 'S',
            keyCode: 'KeyS',
            description: 'Crisp marching Tasha with metallic rim bite',
            icon: '🥁',
            color: '#0284c7',
            accentColor: '#38bdf8',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'membranophone',
            synthType: 'tasha'
          },
          {
            id: 'k1_ts4_p3',
            name: 'Desi Dhol Bass',
            hindiName: 'देसी ढोल बास',
            key: 'D',
            keyCode: 'KeyD',
            description: 'Deep resonant barrel dholak bass thud',
            icon: '🪘',
            color: '#9a3412',
            accentColor: '#fb923c',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/dholak.wav'
          },
          {
            id: 'k1_ts4_p4',
            name: 'Devotional Manjira',
            hindiName: 'भजन मंजीरा',
            key: 'F',
            keyCode: 'KeyF',
            description: 'Pure bronze devotional finger cymbal chime',
            icon: '🪙',
            color: '#a16207',
            accentColor: '#fde047',
            defaultVolume: 0.9,
            defaultPitch: 1.0,
            category: 'resonant',
            soundUrl: '/sounds/manjira.wav'
          },
          {
            id: 'k1_ts4_p5',
            name: 'Folk Dafli',
            hindiName: 'लोक डफली',
            key: 'J',
            keyCode: 'KeyJ',
            description: 'Tight skin folk tambourine frame drum',
            icon: '🥁',
            color: '#854d0e',
            accentColor: '#facc15',
            defaultVolume: 0.95,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/khanjari.wav'
          },
          {
            id: 'k1_ts4_p6',
            name: 'Temple Kaansya Gong',
            hindiName: 'कांस्य घंटा',
            key: 'K',
            keyCode: 'KeyK',
            description: 'Heavy bronze gong resonance for divine invocations',
            icon: '🛎️',
            color: '#713f12',
            accentColor: '#eab308',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'resonant',
            synthType: 'temple_gong'
          },
          {
            id: 'k1_ts4_p7',
            name: 'Mela Sam Climax',
            hindiName: 'सम एक्सेंट',
            key: 'L',
            keyCode: 'KeyL',
            description: 'Climax accent marking full rhythmic cadence',
            icon: '⭐',
            color: '#ea580c',
            accentColor: '#fdba74',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'resonant',
            soundUrl: '/sounds/sam_accent.wav'
          },
          {
            id: 'k1_ts4_p8',
            name: 'Dhol Thali Track',
            hindiName: 'ढोल-थाली ट्रैक',
            key: 'Space',
            keyCode: 'Space',
            description: 'Rajasthani live devotional nonstop backing groove',
            icon: '🔥',
            color: '#15803d',
            accentColor: '#4ade80',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'resonant',
            isTrack: true,
            soundUrl: '/sounds/dhol_thali.m4a'
          }
        ]
      }
    ]
  },

  // ==========================================
  // KIT 2: RAJASTHANI & FOLK UTSAV
  // ==========================================
  {
    kitNumber: 2,
    name: 'Rajasthani & Folk Utsav',
    hindiName: 'राजस्थानी लोक उत्सव',
    tuneSets: [
      // Tune Set 1: Marwadi Dhol-Thali
      {
        tuneSetNumber: 1,
        name: 'Marwadi Dhol-Thali',
        hindiName: 'मारवाड़ी ढोल-थाली',
        description: 'Authentic Rajasthani village wedding beat with bronze thali ring and thunderous desi dhol',
        pads: [
          {
            id: 'k2_ts1_p1',
            name: 'Desi Dhol Baas',
            hindiName: 'देसी ढोल बास',
            key: 'A',
            keyCode: 'KeyA',
            description: 'Heavy stick-struck bass side of a large Rajasthani dhol',
            icon: '🥁',
            color: '#b45309',
            accentColor: '#f59e0b',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/dholak.wav'
          },
          {
            id: 'k2_ts1_p2',
            name: 'Dafli Khanjari',
            hindiName: 'डफली खनक',
            key: 'S',
            keyCode: 'KeyS',
            description: 'Festive folk tambourine with bright jingles',
            icon: '🪘',
            color: '#d97706',
            accentColor: '#fcd34d',
            defaultVolume: 0.9,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/khanjari.wav'
          },
          {
            id: 'k2_ts1_p3',
            name: 'Heavy Bayan',
            hindiName: 'गहरा बायां',
            key: 'D',
            keyCode: 'KeyD',
            description: 'Deep vibrating sub-bass kettle hit',
            icon: '🥣',
            color: '#78350f',
            accentColor: '#f97316',
            defaultVolume: 0.95,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/tabla_ge.wav'
          },
          {
            id: 'k2_ts1_p4',
            name: 'Dhol Thali Track',
            hindiName: 'ढोल-थाली ट्रैक',
            key: 'F',
            keyCode: 'KeyF',
            description: 'Full nonstop Rajasthani Desi Dhol-Thali rhythm track',
            icon: '🔥',
            color: '#ea580c',
            accentColor: '#fdba74',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'resonant',
            isTrack: true,
            soundUrl: '/sounds/dhol_thali.m4a'
          },
          {
            id: 'k2_ts1_p5',
            name: 'Folk Khartal',
            hindiName: 'राजस्थानी खड़ताल',
            key: 'J',
            keyCode: 'KeyJ',
            description: 'Fast acoustic Manganiyar style wooden clapper click',
            icon: '🪵',
            color: '#9a3412',
            accentColor: '#fb923c',
            defaultVolume: 0.95,
            defaultPitch: 1.0,
            category: 'idiophone',
            soundUrl: '/sounds/kartal.wav'
          },
          {
            id: 'k2_ts1_p6',
            name: 'Tuned Chanti',
            hindiName: 'चांटी प्रहार',
            key: 'K',
            keyCode: 'KeyK',
            description: 'Sharp treble edge slap for brisk folk roll patterns',
            icon: '🪘',
            color: '#854d0e',
            accentColor: '#facc15',
            defaultVolume: 0.95,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/tabla_na.wav'
          },
          {
            id: 'k2_ts1_p7',
            name: 'Kasauli Ghanti',
            hindiName: 'कांस्य घंटी',
            key: 'L',
            keyCode: 'KeyL',
            description: 'Melodic folk chime accent',
            icon: '🔔',
            color: '#ca8a04',
            accentColor: '#fde047',
            defaultVolume: 0.9,
            defaultPitch: 1.0,
            category: 'resonant',
            soundUrl: '/sounds/temple_ghanti.wav'
          },
          {
            id: 'k2_ts1_p8',
            name: 'Mela Sam Climax',
            hindiName: 'मेला सम',
            key: 'Space',
            keyCode: 'Space',
            description: 'Punchy festival sam resolution hit',
            icon: '⭐',
            color: '#e11d48',
            accentColor: '#fda4af',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'resonant',
            soundUrl: '/sounds/sam_accent.wav'
          }
        ]
      },
      // Tune Set 2: Bollywood Duff & Matka
      {
        tuneSetNumber: 2,
        name: 'Bollywood Duff & Matka',
        hindiName: 'बॉलीवुड डफ व मटका बीट',
        description: 'Bouncing cinematic retro duff beats and earthen pot acoustic thumps',
        pads: [
          {
            id: 'k2_ts2_p1',
            name: 'Matka Bass Glide',
            hindiName: 'मटका घम',
            key: 'A',
            keyCode: 'KeyA',
            description: 'Deep clay vessel air resonance',
            icon: '🥣',
            color: '#713f12',
            accentColor: '#eab308',
            defaultVolume: 0.95,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/tabla_ge.wav'
          },
          {
            id: 'k2_ts2_p2',
            name: 'Duff Rim Strike',
            hindiName: 'डफ किनार',
            key: 'S',
            keyCode: 'KeyS',
            description: 'Ringing treble slap on wide parchment',
            icon: '🪘',
            color: '#854d0e',
            accentColor: '#facc15',
            defaultVolume: 0.95,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/tabla_na.wav'
          },
          {
            id: 'k2_ts2_p3',
            name: 'Dholak Talli',
            hindiName: 'ढोलक तल्ली',
            key: 'D',
            keyCode: 'KeyD',
            description: 'Tight middle-head dholak rim shot',
            icon: '🥁',
            color: '#9a3412',
            accentColor: '#fb923c',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/dholak.wav'
          },
          {
            id: 'k2_ts2_p4',
            name: 'Dholak Matka Track',
            hindiName: 'मटका ढोलक ट्रैक',
            key: 'F',
            keyCode: 'KeyF',
            description: 'Bollywood Duff & Matka full background rhythm loop',
            icon: '💃',
            color: '#c2410c',
            accentColor: '#f97316',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'resonant',
            isTrack: true,
            soundUrl: '/sounds/dholak_matka.m4a'
          },
          {
            id: 'k2_ts2_p5',
            name: 'Chhang Khanjari',
            hindiName: 'छन छन खंजरी',
            key: 'J',
            keyCode: 'KeyJ',
            description: 'Continuous brass jingling accompaniment',
            icon: '🪘',
            color: '#b45309',
            accentColor: '#fde047',
            defaultVolume: 0.9,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/khanjari.wav'
          },
          {
            id: 'k2_ts2_p6',
            name: 'Wood Kartal',
            hindiName: 'काष्ठ करताल',
            key: 'K',
            keyCode: 'KeyK',
            description: 'Acoustic wooden clapper tempo marker',
            icon: '🪵',
            color: '#78350f',
            accentColor: '#fdba74',
            defaultVolume: 0.9,
            defaultPitch: 1.0,
            category: 'idiophone',
            soundUrl: '/sounds/kartal.wav'
          },
          {
            id: 'k2_ts2_p7',
            name: 'Manjira Chime',
            hindiName: 'मंजीरा ताल',
            key: 'L',
            keyCode: 'KeyL',
            description: 'Bright brass cymbal beat accent',
            icon: '🪙',
            color: '#a16207',
            accentColor: '#fef08a',
            defaultVolume: 0.95,
            defaultPitch: 1.0,
            category: 'resonant',
            soundUrl: '/sounds/manjira.wav'
          },
          {
            id: 'k2_ts2_p8',
            name: 'Garba Groove',
            hindiName: 'गरबा ग्रूव लूप',
            key: 'Space',
            keyCode: 'Space',
            description: 'High energy 101 BPM Desi drum groove',
            icon: '🎶',
            color: '#0284c7',
            accentColor: '#38bdf8',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'resonant',
            isTrack: true,
            soundUrl: '/sounds/garba_loop.mp3'
          }
        ]
      },
      // Tune Set 3: Desi Mela Dhamaal
      {
        tuneSetNumber: 3,
        name: 'Desi Mela Dhamaal',
        hindiName: 'देसी मेला धमाल',
        description: 'Festive street procession beats with explosive dhol slaps and energetic clatter',
        pads: [
          {
            id: 'k2_ts3_p1',
            name: 'Dhamaka Dhol',
            hindiName: 'धमाका ढोलक',
            key: 'A',
            keyCode: 'KeyA',
            description: 'Maximum impact acoustic bass drum stroke',
            icon: '🥁',
            color: '#9a3412',
            accentColor: '#fb923c',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/dholak.wav'
          },
          {
            id: 'k2_ts3_p2',
            name: 'Teekhi Chanti',
            hindiName: 'तीखी चांटी',
            key: 'S',
            keyCode: 'KeyS',
            description: 'Piercing high-pitch edge ring',
            icon: '🪘',
            color: '#854d0e',
            accentColor: '#facc15',
            defaultVolume: 0.95,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/tabla_na.wav'
          },
          {
            id: 'k2_ts3_p3',
            name: 'Goonjti Ge',
            hindiName: 'गूंजती घे',
            key: 'D',
            keyCode: 'KeyD',
            description: 'Floor-shaking subterranean bass sweep',
            icon: '🥣',
            color: '#713f12',
            accentColor: '#eab308',
            defaultVolume: 0.95,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/tabla_ge.wav'
          },
          {
            id: 'k2_ts3_p4',
            name: 'Garba Nonstop',
            hindiName: 'गरबा नॉनस्टॉप',
            key: 'F',
            keyCode: 'KeyF',
            description: 'Authentic 101 BPM Desi drum groove',
            icon: '💃',
            color: '#a16207',
            accentColor: '#38bdf8',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'resonant',
            isTrack: true,
            soundUrl: '/sounds/garba_loop.mp3'
          },
          {
            id: 'k2_ts3_p5',
            name: 'Dhamaal Kartal',
            hindiName: 'धमाल करताल',
            key: 'J',
            keyCode: 'KeyJ',
            description: 'Loud double-struck hardwood rattle',
            icon: '🪵',
            color: '#78350f',
            accentColor: '#fdba74',
            defaultVolume: 0.9,
            defaultPitch: 1.0,
            category: 'idiophone',
            soundUrl: '/sounds/kartal.wav'
          },
          {
            id: 'k2_ts3_p6',
            name: 'Jhanjh Khanjari',
            hindiName: 'झांझ खंजरी',
            key: 'K',
            keyCode: 'KeyK',
            description: 'Fast pulsing tambourine shake',
            icon: '🪘',
            color: '#b45309',
            accentColor: '#fde047',
            defaultVolume: 0.9,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/khanjari.wav'
          },
          {
            id: 'k2_ts3_p7',
            name: 'Dhol Thali Loop',
            hindiName: 'ढोल-थाली लूप',
            key: 'L',
            keyCode: 'KeyL',
            description: 'Rajasthani Desi Dhol-Thali full track',
            icon: '🔥',
            color: '#c2410c',
            accentColor: '#f97316',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'resonant',
            isTrack: true,
            soundUrl: '/sounds/dhol_thali.m4a'
          },
          {
            id: 'k2_ts3_p8',
            name: 'Utsav Sam',
            hindiName: 'उत्सव सम',
            key: 'Space',
            keyCode: 'Space',
            description: 'Decisive resonant festival beat resolution',
            icon: '✨',
            color: '#ea580c',
            accentColor: '#f97316',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'resonant',
            soundUrl: '/sounds/sam_accent.wav'
          }
        ]
      },
      // Tune Set 4: Thumri & Ghazal Vilambit
      {
        tuneSetNumber: 4,
        name: 'Thumri & Ghazal Vilambit',
        hindiName: 'ठुमरी व ग़ज़ल विलंबित',
        description: 'Subtle resonant bayan glides, crisp rim strokes, delicate manjira and slow matka groove',
        pads: [
          {
            id: 'k2_ts4_p1',
            name: 'Bayan Meend Ge',
            hindiName: 'बयां मींड',
            key: 'A',
            keyCode: 'KeyA',
            description: 'Deep expressive Bayan glide with modulative wrist pressure',
            icon: '🥣',
            color: '#713f12',
            accentColor: '#facc15',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/tabla_ge.wav'
          },
          {
            id: 'k2_ts4_p2',
            name: 'Dayan Sur Na',
            hindiName: 'दायां सुर',
            key: 'S',
            keyCode: 'KeyS',
            description: 'Crisp tuned metallic rim hit',
            icon: '🪘',
            color: '#854d0e',
            accentColor: '#fde047',
            defaultVolume: 0.95,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/tabla_na.wav'
          },
          {
            id: 'k2_ts4_p3',
            name: 'Soft Dholak Bass',
            hindiName: 'मुलायम ढोलक',
            key: 'D',
            keyCode: 'KeyD',
            description: 'Acoustic Indian wooden barrel bass tone',
            icon: '🥁',
            color: '#9a3412',
            accentColor: '#fb923c',
            defaultVolume: 0.95,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/dholak.wav'
          },
          {
            id: 'k2_ts4_p4',
            name: 'Manjira Chime',
            hindiName: 'मंजीरा छन',
            key: 'F',
            keyCode: 'KeyF',
            description: 'Delicate bronze acoustic overtone chime',
            icon: '🪙',
            color: '#a16207',
            accentColor: '#fef08a',
            defaultVolume: 0.85,
            defaultPitch: 1.0,
            category: 'resonant',
            soundUrl: '/sounds/manjira.wav'
          },
          {
            id: 'k2_ts4_p5',
            name: 'Dafli Shimmer',
            hindiName: 'डफली खनक',
            key: 'J',
            keyCode: 'KeyJ',
            description: 'Acoustic frame drum with metal jingle accent',
            icon: '🪘',
            color: '#78350f',
            accentColor: '#fdba74',
            defaultVolume: 0.9,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/khanjari.wav'
          },
          {
            id: 'k2_ts4_p6',
            name: 'Mandir Ghanti',
            hindiName: 'कांस्य घंटी',
            key: 'K',
            keyCode: 'KeyK',
            description: 'High resonance sustained temple bell',
            icon: '🔔',
            color: '#ca8a04',
            accentColor: '#fde047',
            defaultVolume: 0.9,
            defaultPitch: 1.0,
            category: 'resonant',
            soundUrl: '/sounds/temple_ghanti.wav'
          },
          {
            id: 'k2_ts4_p7',
            name: 'Mela Sam Climax',
            hindiName: 'सम एक्सेंट',
            key: 'L',
            keyCode: 'KeyL',
            description: 'Rich bronze crash marking phrase boundaries',
            icon: '⭐',
            color: '#ea580c',
            accentColor: '#fed7aa',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'resonant',
            soundUrl: '/sounds/sam_accent.wav'
          },
          {
            id: 'k2_ts4_p8',
            name: 'Matka Dholak Track',
            hindiName: 'मटका ढोलक ट्रैक',
            key: 'Space',
            keyCode: 'Space',
            description: 'Bollywood duff and acoustic earthen matka groove',
            icon: '🎵',
            color: '#d97706',
            accentColor: '#fde68a',
            defaultVolume: 0.95,
            defaultPitch: 1.0,
            category: 'resonant',
            isTrack: true,
            soundUrl: '/sounds/dholak_matka.m4a'
          }
        ]
      }
    ]
  },

  // ==========================================
  // KIT 3: CLASSICAL & FUSION GROOVE
  // ==========================================
  {
    kitNumber: 3,
    name: 'Classical & Fusion Groove',
    hindiName: 'शास्त्रीय व फ्यूजन रिदम',
    tuneSets: [
      // Tune Set 1: Pure Shuddh Tabla
      {
        tuneSetNumber: 1,
        name: 'Pure Shuddh Tabla',
        hindiName: 'शुद्ध तबला संगत',
        description: 'Classical concert grade tabla pairing with articulate rim tones and fluid modulations',
        pads: [
          {
            id: 'k3_ts1_p1',
            name: 'Dayan Na Rim',
            hindiName: 'दायां ना',
            key: 'A',
            keyCode: 'KeyA',
            description: 'High ringing Dayan rim strike with perfect overtone ring',
            icon: '🪘',
            color: '#854d0e',
            accentColor: '#facc15',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/tabla_na.wav'
          },
          {
            id: 'k3_ts1_p2',
            name: 'Bayan Ge Glide',
            hindiName: 'बायां घे',
            key: 'S',
            keyCode: 'KeyS',
            description: 'Fluid modulating bass stroke using heel of palm',
            icon: '🥣',
            color: '#713f12',
            accentColor: '#eab308',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/tabla_ge.wav'
          },
          {
            id: 'k3_ts1_p3',
            name: 'Dholak Thaap',
            hindiName: 'ढोलक थाप',
            key: 'D',
            keyCode: 'KeyD',
            description: 'Clean mid-range companion strike',
            icon: '🥁',
            color: '#9a3412',
            accentColor: '#fb923c',
            defaultVolume: 0.95,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/dholak.wav'
          },
          {
            id: 'k3_ts1_p4',
            name: 'Bronze Manjira',
            hindiName: 'कांस्य मंजीरा',
            key: 'F',
            keyCode: 'KeyF',
            description: 'Delicate metallic pulse defining laya and matras',
            icon: '🪙',
            color: '#a16207',
            accentColor: '#fef08a',
            defaultVolume: 0.9,
            defaultPitch: 1.0,
            category: 'resonant',
            soundUrl: '/sounds/manjira.wav'
          },
          {
            id: 'k3_ts1_p5',
            name: 'Sheesham Kartal',
            hindiName: 'शीशम करताल',
            key: 'J',
            keyCode: 'KeyJ',
            description: 'Crisp wooden tihaai punctuation',
            icon: '🪵',
            color: '#78350f',
            accentColor: '#fdba74',
            defaultVolume: 0.9,
            defaultPitch: 1.0,
            category: 'idiophone',
            soundUrl: '/sounds/kartal.wav'
          },
          {
            id: 'k3_ts1_p6',
            name: 'Khol Khanjari',
            hindiName: 'खोल खंजरी',
            key: 'K',
            keyCode: 'KeyK',
            description: 'Light devotional frame drum rhythm accompaniment',
            icon: '🪘',
            color: '#b45309',
            accentColor: '#fde047',
            defaultVolume: 0.9,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/khanjari.wav'
          },
          {
            id: 'k3_ts1_p7',
            name: 'Shankh Ghanti',
            hindiName: 'शंख-घंटी',
            key: 'L',
            keyCode: 'KeyL',
            description: 'Solemn classical temple chime resonance',
            icon: '🔔',
            color: '#ca8a04',
            accentColor: '#fde047',
            defaultVolume: 0.95,
            defaultPitch: 1.0,
            category: 'resonant',
            soundUrl: '/sounds/temple_ghanti.wav'
          },
          {
            id: 'k3_ts1_p8',
            name: 'Taal Sam',
            hindiName: 'ताल सम',
            key: 'Space',
            keyCode: 'Space',
            description: 'Master 1st beat (Sam) resolution accent strike',
            icon: '⚡',
            color: '#c2410c',
            accentColor: '#f97316',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'resonant',
            soundUrl: '/sounds/sam_accent.wav'
          }
        ]
      },
      // Tune Set 2: Sufi & Qawwali Beat
      {
        tuneSetNumber: 2,
        name: 'Sufi & Qawwali Beat',
        hindiName: 'सूफी व कव्वाली रंग',
        description: 'Ecstatic clapping, dynamic frame drums, heavy dholak claps and dholak matka groove',
        pads: [
          {
            id: 'k3_ts2_p1',
            name: 'Qawwali Dholak',
            hindiName: 'कव्वाली ढोलक',
            key: 'A',
            keyCode: 'KeyA',
            description: 'Dynamic slapping dholak played in fast Keharwa theka',
            icon: '🥁',
            color: '#9a3412',
            accentColor: '#fb923c',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/dholak.wav'
          },
          {
            id: 'k3_ts2_p2',
            name: 'Bayan Dhamaal',
            hindiName: 'बायां धमाल',
            key: 'S',
            keyCode: 'KeyS',
            description: 'Deep resonant Bayan bounce',
            icon: '🥣',
            color: '#713f12',
            accentColor: '#eab308',
            defaultVolume: 0.95,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/tabla_ge.wav'
          },
          {
            id: 'k3_ts2_p3',
            name: 'Dayan Tarang',
            hindiName: 'दायां तरंग',
            key: 'D',
            keyCode: 'KeyD',
            description: 'Tuned high frequency pitch strike',
            icon: '🪘',
            color: '#854d0e',
            accentColor: '#facc15',
            defaultVolume: 0.95,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/tabla_na.wav'
          },
          {
            id: 'k3_ts2_p4',
            name: 'Dafli Jhankar',
            hindiName: 'डफली झंकार',
            key: 'F',
            keyCode: 'KeyF',
            description: 'Vigorous Sufi tambourine continuous rattle',
            icon: '🪘',
            color: '#b45309',
            accentColor: '#fde047',
            defaultVolume: 0.9,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/khanjari.wav'
          },
          {
            id: 'k3_ts2_p5',
            name: 'Tali Clapper',
            hindiName: 'ताली करताल',
            key: 'J',
            keyCode: 'KeyJ',
            description: 'Percussive syncopated hand clap wood simulation',
            icon: '🪵',
            color: '#78350f',
            accentColor: '#fdba74',
            defaultVolume: 0.9,
            defaultPitch: 1.0,
            category: 'idiophone',
            soundUrl: '/sounds/kartal.wav'
          },
          {
            id: 'k3_ts2_p6',
            name: 'Bollywood Matka Loop',
            hindiName: 'बॉलीवुड मटका लूप',
            key: 'K',
            keyCode: 'KeyK',
            description: 'Continuous Sufi duff & matka rhythm track',
            icon: '🎶',
            color: '#ea580c',
            accentColor: '#fdba74',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'resonant',
            isTrack: true,
            soundUrl: '/sounds/dholak_matka.m4a'
          },
          {
            id: 'k3_ts2_p7',
            name: 'Devi Ghanti',
            hindiName: 'देवी घंटी',
            key: 'L',
            keyCode: 'KeyL',
            description: 'High spiritual tone mark',
            icon: '🔔',
            color: '#ca8a04',
            accentColor: '#fde047',
            defaultVolume: 0.9,
            defaultPitch: 1.0,
            category: 'resonant',
            soundUrl: '/sounds/temple_ghanti.wav'
          },
          {
            id: 'k3_ts2_p8',
            name: 'Sufi Sam',
            hindiName: 'सूफी सम',
            key: 'Space',
            keyCode: 'Space',
            description: 'Heavy ecstatic cycle-ending strike',
            icon: '✨',
            color: '#c2410c',
            accentColor: '#f97316',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'resonant',
            soundUrl: '/sounds/sam_accent.wav'
          }
        ]
      },
      // Tune Set 3: Mahotsav Grand Finale
      {
        tuneSetNumber: 3,
        name: 'Mahotsav Grand Finale',
        hindiName: 'महा उत्सव समापन',
        description: 'All grand elements combined: massive dhol, rolling tabla, garba groove & thali tracks',
        pads: [
          {
            id: 'k3_ts3_p1',
            name: 'Maha Dhol',
            hindiName: 'महा ढोलक',
            key: 'A',
            keyCode: 'KeyA',
            description: 'Monumental acoustic bass drum hit',
            icon: '🥁',
            color: '#9a3412',
            accentColor: '#fb923c',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/dholak.wav'
          },
          {
            id: 'k3_ts3_p2',
            name: 'Shankh Dayan',
            hindiName: 'शंख दायां',
            key: 'S',
            keyCode: 'KeyS',
            description: 'Tuned high-cut tabla ring',
            icon: '🪘',
            color: '#854d0e',
            accentColor: '#facc15',
            defaultVolume: 0.95,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/tabla_na.wav'
          },
          {
            id: 'k3_ts3_p3',
            name: 'Gambhira Bayan',
            hindiName: 'गंभीर बायां',
            key: 'D',
            keyCode: 'KeyD',
            description: 'Deep resonant modulation bass',
            icon: '🥣',
            color: '#713f12',
            accentColor: '#eab308',
            defaultVolume: 0.95,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/tabla_ge.wav'
          },
          {
            id: 'k3_ts3_p4',
            name: 'Dhol Thali Track',
            hindiName: 'ढोल-थाली ट्रैक',
            key: 'F',
            keyCode: 'KeyF',
            description: 'New Rajasthani Desi Dhol-Thali loop',
            icon: '🔥',
            color: '#c2410c',
            accentColor: '#f97316',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'resonant',
            isTrack: true,
            soundUrl: '/sounds/dhol_thali.m4a'
          },
          {
            id: 'k3_ts3_p5',
            name: 'Garba Desi Loop',
            hindiName: 'गरबा देसी लूप',
            key: 'J',
            keyCode: 'KeyJ',
            description: 'Gujarati Desi 101 BPM full nonstop drum groove',
            icon: '💃',
            color: '#a16207',
            accentColor: '#38bdf8',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'resonant',
            isTrack: true,
            soundUrl: '/sounds/garba_loop.mp3'
          },
          {
            id: 'k3_ts3_p6',
            name: 'Matka Dholak Track',
            hindiName: 'मटका ढोलक लूप',
            key: 'K',
            keyCode: 'KeyK',
            description: 'Bollywood Duff & Matka Dholak rhythm track',
            icon: '🎶',
            color: '#ea580c',
            accentColor: '#fdba74',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'resonant',
            isTrack: true,
            soundUrl: '/sounds/dholak_matka.m4a'
          },
          {
            id: 'k3_ts3_p7',
            name: 'Khas Kartal',
            hindiName: 'खास करताल',
            key: 'L',
            keyCode: 'KeyL',
            description: 'Hardwood clappers with jangling brass discs',
            icon: '🪵',
            color: '#78350f',
            accentColor: '#fdba74',
            defaultVolume: 0.9,
            defaultPitch: 1.0,
            category: 'idiophone',
            soundUrl: '/sounds/kartal.wav'
          },
          {
            id: 'k3_ts3_p8',
            name: 'Grand Sam Accent',
            hindiName: 'महा सम',
            key: 'Space',
            keyCode: 'Space',
            description: 'Final majestic crescendo resolution strike',
            icon: '👑',
            color: '#e11d48',
            accentColor: '#fda4af',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'resonant',
            soundUrl: '/sounds/sam_accent.wav'
          }
        ]
      },
      // Tune Set 4: Vibrant Mela & Dhol Tasha Dhadak
      {
        tuneSetNumber: 4,
        name: 'Vibrant Mela & Dhol Tasha Dhadak',
        hindiName: 'धमाकेदार मेला व ढोल ताशा धड़क',
        description: 'Festival energy setup combining marching tasha, royal nagada, 808 sub bass, clap and dhol punch',
        pads: [
          {
            id: 'k3_ts4_p1',
            name: 'Tasha Marching',
            hindiName: 'ताशा मार्चिंग',
            key: 'A',
            keyCode: 'KeyA',
            description: 'Crisp marching tasha rim shot with rapid bite',
            icon: '🥁',
            color: '#0284c7',
            accentColor: '#38bdf8',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'membranophone',
            synthType: 'tasha'
          },
          {
            id: 'k3_ts4_p2',
            name: 'Royal Nagada',
            hindiName: 'शाही नगाड़ा',
            key: 'S',
            keyCode: 'KeyS',
            description: 'Massive ceremonial kettle drum sub decay',
            icon: '🥁',
            color: '#c2410c',
            accentColor: '#fb923c',
            defaultVolume: 1.05,
            defaultPitch: 1.0,
            category: 'membranophone',
            synthType: 'nagada'
          },
          {
            id: 'k3_ts4_p3',
            name: '808 Sub Bass',
            hindiName: '808 सब बास',
            key: 'D',
            keyCode: 'KeyD',
            description: 'Deep resonant club sub-bass boom',
            icon: '🔊',
            color: '#7c3aed',
            accentColor: '#c084fc',
            defaultVolume: 1.1,
            defaultPitch: 1.0,
            category: 'electronic',
            synthType: 'bass_808'
          },
          {
            id: 'k3_ts4_p4',
            name: 'Studio Hand Clap',
            hindiName: 'स्टूडियो क्लैप',
            key: 'F',
            keyCode: 'KeyF',
            description: 'Stereo acoustic multi-hand clap',
            icon: '👏',
            color: '#16a34a',
            accentColor: '#4ade80',
            defaultVolume: 0.95,
            defaultPitch: 1.0,
            category: 'electronic',
            synthType: 'clap'
          },
          {
            id: 'k3_ts4_p5',
            name: 'Desi Dhol Slap',
            hindiName: 'देसी ढोलक चांटी',
            key: 'J',
            keyCode: 'KeyJ',
            description: 'High treble wooden slap on seasoned goatskin head',
            icon: '🪘',
            color: '#9a3412',
            accentColor: '#fb923c',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'membranophone',
            soundUrl: '/sounds/dholak.wav'
          },
          {
            id: 'k3_ts4_p6',
            name: 'DJ Airhorn Effect',
            hindiName: 'डीजे एयर हॉर्न',
            key: 'K',
            keyCode: 'KeyK',
            description: 'Iconic festival crowd riser air horn effect',
            icon: '🚨',
            color: '#e11d48',
            accentColor: '#fb7185',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'electronic',
            synthType: 'dj_effect'
          },
          {
            id: 'k3_ts4_p7',
            name: 'Matka Rhythm Track',
            hindiName: 'मटका रिदम ट्रैक',
            key: 'L',
            keyCode: 'KeyL',
            description: 'Bollywood duff and earthen matka rhythm bed',
            icon: '🪘',
            color: '#d97706',
            accentColor: '#fde68a',
            defaultVolume: 0.95,
            defaultPitch: 1.0,
            category: 'resonant',
            isTrack: true,
            soundUrl: '/sounds/dholak_matka.m4a'
          },
          {
            id: 'k3_ts4_p8',
            name: 'Garba Loop 101 BPM',
            hindiName: 'गरबा लूप 101 बीपीएम',
            key: 'Space',
            keyCode: 'Space',
            description: 'Energetic Gujarati folk 101 BPM nonstop live loop',
            icon: '🔥',
            color: '#059669',
            accentColor: '#6ee7b7',
            defaultVolume: 1.0,
            defaultPitch: 1.0,
            category: 'resonant',
            isTrack: true,
            soundUrl: '/sounds/garba_loop.mp3'
          }
        ]
      }
    ]
  }
]

/**
 * Retrieves the 8 pad configs for the given Kit and Tune Set
 */
export function getPadConfigs(kitNum: KitNumber, tuneSetNum: TuneSetNumber): PadConfig[] {
  const kit = DEFAULT_KITS.find(k => k.kitNumber === kitNum) || DEFAULT_KITS[0]
  const tuneSet = kit.tuneSets.find(ts => ts.tuneSetNumber === tuneSetNum) || kit.tuneSets[0]
  return tuneSet.pads
}

/**
 * Retrieves the Tune Set details (names and description)
 */
export function getTuneSetDetails(kitNum: KitNumber, tuneSetNum: TuneSetNumber): {
  kitName: string
  kitHindiName: string
  tuneSetName: string
  tuneSetHindiName: string
  description: string
} {
  const kit = DEFAULT_KITS.find(k => k.kitNumber === kitNum) || DEFAULT_KITS[0]
  const tuneSet = kit.tuneSets.find(ts => ts.tuneSetNumber === tuneSetNum) || kit.tuneSets[0]
  return {
    kitName: kit.name,
    kitHindiName: kit.hindiName,
    tuneSetName: tuneSet.name,
    tuneSetHindiName: tuneSet.hindiName,
    description: tuneSet.description
  }
}

