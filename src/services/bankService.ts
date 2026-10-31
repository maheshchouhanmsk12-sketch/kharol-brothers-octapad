import { PadConfig, UserBank } from '../types/octapad'
import { authService } from './authService'

const LOCAL_STORAGE_BANKS_KEY = 'kb_octapad_my_banks'
const LOCAL_STORAGE_ACTIVE_BANK_KEY = 'kb_octapad_active_bank_id'

// Standard pad key shortcuts
export const DEFAULT_BANK_KEYS = [
  { key: 'A', keyCode: 'KeyA' },
  { key: 'S', keyCode: 'KeyS' },
  { key: 'D', keyCode: 'KeyD' },
  { key: 'F', keyCode: 'KeyF' },
  { key: 'J', keyCode: 'KeyJ' },
  { key: 'K', keyCode: 'KeyK' },
  { key: 'L', keyCode: 'KeyL' },
  { key: 'Space', keyCode: 'Space' }
]

// Default starter bank for immediate enjoyment
const DEFAULT_INITIAL_BANK: UserBank = {
  id: 'bank_starter_dj',
  name: 'MY DJ BANK',
  description: 'Punchy electro-devotional fusion kit with 808 bass, clap, tasha and garba loop',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  pads: [
    {
      id: 'bank_dj_p1',
      name: 'Desi Dhol Bass',
      hindiName: 'देसी ढोलक बास',
      key: 'A',
      keyCode: 'KeyA',
      description: 'Heavy bass punch',
      icon: '🥁',
      color: '#9a3412',
      accentColor: '#fb923c',
      defaultVolume: 1.0,
      defaultPitch: 1.0,
      category: 'membranophone',
      soundUrl: '/sounds/dholak.wav',
      synthType: 'dholak'
    },
    {
      id: 'bank_dj_p2',
      name: 'Tasha Snare',
      hindiName: 'ताशा नगाड़ा',
      key: 'S',
      keyCode: 'KeyS',
      description: 'Snappy metallic tasha',
      icon: '🥁',
      color: '#0284c7',
      accentColor: '#38bdf8',
      defaultVolume: 1.0,
      defaultPitch: 1.0,
      category: 'membranophone',
      synthType: 'tasha'
    },
    {
      id: 'bank_dj_p3',
      name: '808 Sub Bass',
      hindiName: '808 सब बास',
      key: 'D',
      keyCode: 'KeyD',
      description: 'Deep 808 club drop',
      icon: '🔊',
      color: '#7c3aed',
      accentColor: '#c084fc',
      defaultVolume: 1.1,
      defaultPitch: 1.0,
      category: 'electronic',
      synthType: 'bass_808'
    },
    {
      id: 'bank_dj_p4',
      name: 'Royal Nagada',
      hindiName: 'शाही नगाड़ा',
      key: 'F',
      keyCode: 'KeyF',
      description: 'Massive ceremonial kettle drum',
      icon: '🥁',
      color: '#ea580c',
      accentColor: '#fdba74',
      defaultVolume: 1.05,
      defaultPitch: 1.0,
      category: 'membranophone',
      synthType: 'nagada'
    },
    {
      id: 'bank_dj_p5',
      name: 'Studio Hand Clap',
      hindiName: 'स्टूडियो क्लैप',
      key: 'J',
      keyCode: 'KeyJ',
      description: 'Multi-layer stereo handclap',
      icon: '👏',
      color: '#16a34a',
      accentColor: '#4ade80',
      defaultVolume: 0.95,
      defaultPitch: 1.0,
      category: 'electronic',
      synthType: 'clap'
    },
    {
      id: 'bank_dj_p6',
      name: 'DJ Air Horn',
      hindiName: 'डीजे एयर हॉर्न',
      key: 'K',
      keyCode: 'KeyK',
      description: 'Club airhorn siren drop',
      icon: '🚨',
      color: '#e11d48',
      accentColor: '#fb7185',
      defaultVolume: 1.0,
      defaultPitch: 1.0,
      category: 'electronic',
      synthType: 'dj_effect'
    },
    {
      id: 'bank_dj_p7',
      name: 'Matka Dholak Track',
      hindiName: 'मटका ढोलक ट्रैक',
      key: 'L',
      keyCode: 'KeyL',
      description: 'Acoustic Bollywood groove',
      icon: '🪘',
      color: '#d97706',
      accentColor: '#fde68a',
      defaultVolume: 0.95,
      defaultPitch: 1.0,
      category: 'track',
      soundUrl: '/sounds/dholak_matka.m4a',
      isTrack: true
    },
    {
      id: 'bank_dj_p8',
      name: 'Garba Loop 101 BPM',
      hindiName: 'गरबा लूप',
      key: 'Space',
      keyCode: 'Space',
      description: 'Gujarati Desi 101 BPM nonstop live loop',
      icon: '🔥',
      color: '#059669',
      accentColor: '#6ee7b7',
      defaultVolume: 1.0,
      defaultPitch: 1.0,
      category: 'track',
      soundUrl: '/sounds/garba_loop.mp3',
      isTrack: true
    }
  ]
}

class BankService {
  private banks: UserBank[] = []
  private activeBankId: string | null = null

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_BANKS_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.banks = parsed
        } else {
          this.banks = [DEFAULT_INITIAL_BANK]
        }
      } else {
        this.banks = [DEFAULT_INITIAL_BANK]
        this.saveToStorage()
      }

      this.activeBankId = localStorage.getItem(LOCAL_STORAGE_ACTIVE_BANK_KEY) || null
    } catch {
      this.banks = [DEFAULT_INITIAL_BANK]
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(LOCAL_STORAGE_BANKS_KEY, JSON.stringify(this.banks))
      if (this.activeBankId) {
        localStorage.setItem(LOCAL_STORAGE_ACTIVE_BANK_KEY, this.activeBankId)
      } else {
        localStorage.removeItem(LOCAL_STORAGE_ACTIVE_BANK_KEY)
      }
    } catch (e) {
      console.warn('Failed to save banks to localStorage:', e)
    }

    // Attempt background sync to backend / MongoDB Atlas
    this.syncToBackend().catch(() => {})
  }

  private async syncToBackend() {
    try {
      const token = authService.getToken()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      await fetch('/api/banks/sync', {
        method: 'POST',
        headers,
        body: JSON.stringify({ banks: this.banks })
      })
    } catch {}
  }

  getBanks(): UserBank[] {
    return [...this.banks]
  }

  getBankById(id: string): UserBank | null {
    return this.banks.find(b => b.id === id) || null
  }

  getActiveBankId(): string | null {
    return this.activeBankId
  }

  setActiveBankId(id: string | null) {
    this.activeBankId = id
    this.saveToStorage()
  }

  getActiveBank(): UserBank | null {
    if (!this.activeBankId) return null
    return this.getBankById(this.activeBankId)
  }

  createBank(name: string, templatePads?: PadConfig[], description = ''): UserBank {
    const timestamp = new Date().toISOString()
    const id = `bank_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`

    let pads: PadConfig[]
    if (templatePads && templatePads.length === 8) {
      pads = templatePads.map((p, idx) => ({
        ...p,
        id: `${id}_pad_${idx + 1}`,
        key: DEFAULT_BANK_KEYS[idx].key,
        keyCode: DEFAULT_BANK_KEYS[idx].keyCode
      }))
    } else {
      // Create empty/clean slate pads
      pads = DEFAULT_BANK_KEYS.map((k, idx) => ({
        id: `${id}_pad_${idx + 1}`,
        name: `Pad ${idx + 1}`,
        hindiName: `पैड ${idx + 1}`,
        key: k.key,
        keyCode: k.keyCode,
        description: `Custom Sound ${idx + 1}`,
        icon: '🥁',
        color: '#1e293b',
        accentColor: '#06b6d4',
        defaultVolume: 1.0,
        defaultPitch: 1.0,
        category: 'membranophone' as const,
        synthType: 'dholak',
        soundUrl: '/sounds/dholak.wav'
      }))
    }

    const newBank: UserBank = {
      id,
      name: name.trim() || 'NEW BANK',
      description,
      createdAt: timestamp,
      updatedAt: timestamp,
      pads
    }

    this.banks.push(newBank)
    this.saveToStorage()
    return newBank
  }

  updateBank(updatedBank: UserBank): boolean {
    const index = this.banks.findIndex(b => b.id === updatedBank.id)
    if (index === -1) return false

    this.banks[index] = {
      ...updatedBank,
      updatedAt: new Date().toISOString()
    }
    this.saveToStorage()
    return true
  }

  renameBank(bankId: string, newName: string): boolean {
    const bank = this.banks.find(b => b.id === bankId)
    if (!bank) return false

    bank.name = newName.trim()
    bank.updatedAt = new Date().toISOString()
    this.saveToStorage()
    return true
  }

  duplicateBank(bankId: string): UserBank | null {
    const source = this.banks.find(b => b.id === bankId)
    if (!source) return null

    const timestamp = new Date().toISOString()
    const newId = `bank_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`

    const clonedPads = source.pads.map((p, idx) => ({
      ...p,
      id: `${newId}_p${idx + 1}`
    }))

    const duplicated: UserBank = {
      id: newId,
      name: `${source.name} (Copy)`,
      description: source.description,
      createdAt: timestamp,
      updatedAt: timestamp,
      pads: clonedPads
    }

    this.banks.push(duplicated)
    this.saveToStorage()
    return duplicated
  }

  deleteBank(bankId: string): boolean {
    const initialLen = this.banks.length
    this.banks = this.banks.filter(b => b.id !== bankId)
    if (this.banks.length === initialLen) return false

    if (this.activeBankId === bankId) {
      this.activeBankId = null
    }

    this.saveToStorage()
    return true
  }
}

export const bankService = new BankService()

