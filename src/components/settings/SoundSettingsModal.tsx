import React, { useState, useRef } from 'react'
import {
  X,
  Settings,
  Layers,
  Sliders,
  FolderOpen,
  Play,
  Square,
  Upload,
  Plus,
  Copy,
  Trash2,
  Edit3,
  Check,
  RotateCcw,
  Volume2,
  Sparkles,
  Music,
  AlertTriangle
} from 'lucide-react'
import { KitConfig, KitNumber, PadConfig, TuneSetConfig, TuneSetNumber, UserBank } from '../../types/octapad'
import { SOUND_LIBRARY } from '../../data/soundLibrary'
import { DEFAULT_KITS } from '../../data/kitConfigurations'
import { audioEngine } from '../../audio/audioEngine'
import { bankService } from '../../services/bankService'
import { subscriptionService } from '../../services/subscriptionService'

interface SoundSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  kitsData: KitConfig[]
  currentKit: KitNumber
  currentTuneSet: TuneSetNumber
  activeBank: UserBank | null
  userBanks: UserBank[]
  onSelectTuneSet: (kit: KitNumber, ts: TuneSetNumber) => void
  onSelectBank: (bankId: string) => void
  onUpdateBank: (bank: UserBank) => void
  onRefreshBanks: () => void
  onSaveKitsData: (updatedKits: KitConfig[]) => void
  onRestoreDefaultTuneSet: (kit: KitNumber, ts: TuneSetNumber) => void
}

type TabType = 'sound_designer' | 'tune_library' | 'my_bank'
type EditTargetType = 'kit' | 'bank'

export const SoundSettingsModal: React.FC<SoundSettingsModalProps> = ({
  isOpen,
  onClose,
  kitsData,
  currentKit,
  currentTuneSet,
  activeBank,
  userBanks,
  onSelectTuneSet,
  onSelectBank,
  onUpdateBank,
  onRefreshBanks,
  onSaveKitsData,
  onRestoreDefaultTuneSet
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('sound_designer')

  // --- Sound Designer Target Selection ---
  const [editTargetType, setEditTargetType] = useState<EditTargetType>(activeBank ? 'bank' : 'kit')
  const [editingKit, setEditingKit] = useState<KitNumber>(currentKit)
  const [editingTuneSet, setEditingTuneSet] = useState<TuneSetNumber>(currentTuneSet)
  const [editingBankId, setEditingBankId] = useState<string>(activeBank?.id || userBanks[0]?.id || '')

  const [selectedPadIndex, setSelectedPadIndex] = useState<number>(0)
  const [soundCategoryFilter, setSoundCategoryFilter] = useState<string>('all')
  const [previewingSoundId, setPreviewingSoundId] = useState<string | null>(null)
  const [actionNotice, setActionNotice] = useState<string | null>(null)
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false)

  // --- Tune Set Library Browsing State ---
  const [browsingKit, setBrowsingKit] = useState<KitNumber>(currentKit)
  const [browsingTuneSet, setBrowsingTuneSet] = useState<TuneSetNumber>(currentTuneSet)

  // --- My Bank Management State ---
  const [isCreatingBank, setIsCreatingBank] = useState(false)
  const [newBankName, setNewBankName] = useState('')
  const [newBankTemplate, setNewBankTemplate] = useState<'starter' | 'current' | 'empty'>('starter')
  const [renamingBankId, setRenamingBankId] = useState<string | null>(null)
  const [renamingText, setRenamingText] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  // Resolve currently edited 8 pads and metadata
  let activeEditingPads: PadConfig[] = []
  let activeEditingTitle = ''
  const currentEditingBank = userBanks.find(b => b.id === editingBankId) || userBanks[0]

  if (editTargetType === 'bank' && currentEditingBank) {
    activeEditingPads = currentEditingBank.pads
    activeEditingTitle = `My Bank: ${currentEditingBank.name}`
  } else {
    const kitObj = kitsData.find(k => k.kitNumber === editingKit) || kitsData[0]
    const tsObj = kitObj.tuneSets.find(ts => ts.tuneSetNumber === editingTuneSet) || kitObj.tuneSets[0]
    activeEditingPads = tsObj.pads
    activeEditingTitle = `Kit ${editingKit} • Set ${editingTuneSet}: ${tsObj.name}`
  }

  const currentEditingPad = activeEditingPads[selectedPadIndex] || activeEditingPads[0]

  // Browsing Tune Set in Library Tab
  const browsingKitObj = kitsData.find(k => k.kitNumber === browsingKit) || kitsData[0]
  const browsingTuneSetObj = browsingKitObj.tuneSets.find(ts => ts.tuneSetNumber === browsingTuneSet) || browsingKitObj.tuneSets[0]

  // Audio preview helper
  const handlePreview = async (soundId: string, soundUrl?: string, synthType?: string, isTrack?: boolean) => {
    try {
      setPreviewingSoundId(soundId)
      await audioEngine.previewSound({
        soundUrl,
        synthType,
        isTrack,
        volume: 0.95
      })
      setTimeout(() => {
        setPreviewingSoundId(null)
      }, isTrack ? 3500 : 800)
    } catch {
      setPreviewingSoundId(null)
    }
  }

  const showNotification = (msg: string) => {
    setActionNotice(msg)
    setTimeout(() => setActionNotice(null), 3000)
  }

  // --- Sound Designer Mutators ---
  const handleUpdateCurrentPads = (newPads: PadConfig[]) => {
    if (editTargetType === 'bank' && currentEditingBank) {
      const updatedBank: UserBank = {
        ...currentEditingBank,
        pads: newPads
      }
      onUpdateBank(updatedBank)
    } else {
      const updatedKits = kitsData.map(k => {
        if (k.kitNumber !== editingKit) return k
        const updatedTS = k.tuneSets.map(ts => {
          if (ts.tuneSetNumber !== editingTuneSet) return ts
          return { ...ts, pads: newPads }
        }) as [TuneSetConfig, TuneSetConfig, TuneSetConfig, TuneSetConfig]
        return { ...k, tuneSets: updatedTS }
      })
      onSaveKitsData(updatedKits)
    }
  }

  const handlePadNameChange = (name: string) => {
    if (!currentEditingPad) return
    const updated = [...activeEditingPads]
    updated[selectedPadIndex] = {
      ...updated[selectedPadIndex],
      name
    }
    handleUpdateCurrentPads(updated)
  }

  const handlePadVolumeChange = (vol: number) => {
    if (!currentEditingPad) return
    const updated = [...activeEditingPads]
    updated[selectedPadIndex] = {
      ...updated[selectedPadIndex],
      defaultVolume: vol
    }
    audioEngine.setPadVolume(currentEditingPad.id, vol)
    handleUpdateCurrentPads(updated)
  }

  const handlePadPitchChange = (pitch: number) => {
    if (!currentEditingPad) return
    const updated = [...activeEditingPads]
    updated[selectedPadIndex] = {
      ...updated[selectedPadIndex],
      defaultPitch: pitch
    }
    audioEngine.setPadPitch(currentEditingPad.id, pitch)
    handleUpdateCurrentPads(updated)
  }

  const handleAssignLibrarySound = (item: typeof SOUND_LIBRARY[0]) => {
    if (!currentEditingPad) return
    const updated = [...activeEditingPads]
    updated[selectedPadIndex] = {
      ...updated[selectedPadIndex],
      name: item.name,
      hindiName: item.hindiName || item.name,
      description: item.description,
      category: item.category,
      soundUrl: item.soundUrl,
      synthType: item.synthType,
      isTrack: item.isTrack || false,
      defaultVolume: item.defaultVolume || 1.0,
      defaultPitch: item.defaultPitch || 1.0
    }
    handleUpdateCurrentPads(updated)
    showNotification(`Assigned "${item.name}" to Pad ${selectedPadIndex + 1}!`)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentEditingPad) return

    try {
      const ok = await audioEngine.loadCustomSample(currentEditingPad.id, file)
      if (ok) {
        const reader = new FileReader()
        reader.onload = () => {
          const dataUrl = reader.result as string
          const cleanName = file.name.replace(/\.[^/.]+$/, '').slice(0, 24)
          const updated = [...activeEditingPads]
          updated[selectedPadIndex] = {
            ...updated[selectedPadIndex],
            name: cleanName,
            hindiName: cleanName,
            description: `Custom uploaded audio (${file.name})`,
            category: 'resonant',
            soundUrl: dataUrl,
            customAudioName: file.name,
            isTrack: file.size > 2 * 1024 * 1024
          }
          handleUpdateCurrentPads(updated)
          showNotification(`Audio file "${file.name}" assigned to Pad ${selectedPadIndex + 1}!`)
        }
        reader.readAsDataURL(file)
      } else {
        alert('Could not decode audio. Please provide a valid MP3, WAV, or M4A.')
      }
    } catch (err) {
      console.error('File upload error:', err)
    }
  }

  const handleRemoveSound = () => {
    if (!currentEditingPad) return
    audioEngine.removePadSound(currentEditingPad.id)
    const updated = [...activeEditingPads]
    updated[selectedPadIndex] = {
      ...updated[selectedPadIndex],
      name: `Pad ${selectedPadIndex + 1} (Empty)`,
      soundUrl: '',
      synthType: '',
      isTrack: false
    }
    handleUpdateCurrentPads(updated)
    showNotification(`Sound cleared on Pad ${selectedPadIndex + 1}`)
  }

  const handleConfirmRestoreDefaults = () => {
    if (editTargetType === 'kit') {
      onRestoreDefaultTuneSet(editingKit, editingTuneSet)
      setShowRestoreConfirm(false)
      showNotification(`Kit ${editingKit} - Tune Set ${editingTuneSet} restored to defaults!`)
    }
  }

  // --- Bank Actions ---
  const handleCreateBankSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBankName.trim()) return

    let templatePads: PadConfig[] | undefined
    if (newBankTemplate === 'current') {
      templatePads = activeEditingPads
    }

    const created = bankService.createBank(newBankName.trim(), templatePads)
    setIsCreatingBank(false)
    setNewBankName('')
    onRefreshBanks()
    setEditingBankId(created.id)
    setEditTargetType('bank')
    onSelectBank(created.id)
    showNotification(`New Bank "${created.name}" created!`)
  }

  const handleDuplicate = (bankId: string) => {
    const dup = bankService.duplicateBank(bankId)
    if (dup) {
      onRefreshBanks()
      setEditingBankId(dup.id)
      showNotification(`Duplicated bank "${dup.name}"!`)
    }
  }

  const handleDelete = (bankId: string) => {
    bankService.deleteBank(bankId)
    setDeleteConfirmId(null)
    onRefreshBanks()
    const remaining = bankService.getBanks()
    if (remaining.length > 0) {
      setEditingBankId(remaining[0].id)
    }
    showNotification('Bank deleted.')
  }

  const handleSaveRename = (bankId: string) => {
    if (renamingText.trim()) {
      bankService.renameBank(bankId, renamingText.trim())
      onRefreshBanks()
      showNotification('Bank renamed.')
    }
    setRenamingBankId(null)
  }

  const filteredLibrary = SOUND_LIBRARY.filter(item => {
    if (soundCategoryFilter === 'all') return true
    if (soundCategoryFilter === 'devotional') return item.category === 'membranophone' || item.category === 'idiophone' || item.category === 'resonant'
    if (soundCategoryFilter === 'electronic') return item.category === 'electronic'
    if (soundCategoryFilter === 'tracks') return item.category === 'track'
    return true
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-5xl h-[92vh] max-h-[840px] bg-[#090b14] border-2 border-cyan-500/40 rounded-3xl shadow-[0_0_40px_rgba(6,182,212,0.3)] flex flex-col overflow-hidden text-white font-sans">
        
        {/* --- Top Header Strip --- */}
        <div className="px-5 py-4 border-b border-zinc-800 bg-[#0d1020]/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sliders className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-cyan-400 uppercase">
                Kharol Brothers Octapad
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>Sound Designer & Kit Manager</span>
                <span className="hidden sm:inline text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                  {activeBank ? `Live: ${activeBank.name}` : `Live: Kit ${currentKit} • Set ${currentTuneSet}`}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {actionNotice && (
              <span className="text-xs font-semibold text-emerald-400 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 animate-fadeIn">
                ✓ {actionNotice}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700/60 transition-colors cursor-pointer"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- Main Navigation Tabs --- */}
        <div className="flex border-b border-zinc-800 bg-slate-950/80 px-4 pt-2 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('sound_designer')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'sound_designer'
                ? 'bg-[#12162a] text-cyan-300 border-t-2 border-x border-cyan-500/60 shadow-[0_-4px_12px_rgba(6,182,212,0.2)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>🎛️ SOUND DESIGNER</span>
          </button>

          <button
            onClick={() => setActiveTab('tune_library')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'tune_library'
                ? 'bg-[#12162a] text-cyan-300 border-t-2 border-x border-cyan-500/60 shadow-[0_-4px_12px_rgba(6,182,212,0.2)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>TUNE SET LIBRARY (12 Sets)</span>
          </button>

          <button
            onClick={() => setActiveTab('my_bank')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'my_bank'
                ? 'bg-[#12162a] text-cyan-300 border-t-2 border-x border-cyan-500/60 shadow-[0_-4px_12px_rgba(6,182,212,0.2)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-cyan-400" />
            <span>MY BANK (Custom Kits)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 font-bold">
              {userBanks.length}
            </span>
          </button>
        </div>

        {/* --- Content Area --- */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#090b14]">
          
          {/* ========================================================= */}
          {/* TAB 1: SOUND DESIGNER (Select Kit/TuneSet & Edit Pads)     */}
          {/* ========================================================= */}
          {activeTab === 'sound_designer' && (
            <div className="space-y-5">
              
              {/* Target Selector: Switch between Kits 1, 2, 3 (Sets 1-4) or My Bank */}
              <div className="p-4 rounded-2xl bg-[#0c1022] border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-black/60 border border-zinc-800 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setEditTargetType('kit')}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        editTargetType === 'kit'
                          ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Factory Kits (12 Sets)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditTargetType('bank')}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        editTargetType === 'bank'
                          ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      My Bank Kits
                    </button>
                  </div>

                  {editTargetType === 'kit' ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1">
                        {([1, 2, 3] as KitNumber[]).map(kNum => (
                          <button
                            key={kNum}
                            type="button"
                            onClick={() => setEditingKit(kNum)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              editingKit === kNum
                                ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                            }`}
                          >
                            KIT {kNum}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1">
                        {([1, 2, 3, 4] as TuneSetNumber[]).map(tsNum => (
                          <button
                            key={tsNum}
                            type="button"
                            onClick={() => setEditingTuneSet(tsNum)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              editingTuneSet === tsNum
                                ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                            }`}
                          >
                            SET {tsNum}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <select
                        value={editingBankId}
                        onChange={(e) => setEditingBankId(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-black border border-cyan-500/40 text-cyan-300 font-bold text-xs sm:text-sm focus:outline-none"
                      >
                        {userBanks.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Right Action: Restore Defaults (for Kits) or Load onto Octapad */}
                <div className="flex items-center gap-2 self-end md:self-auto">
                  {editTargetType === 'kit' && (
                    <button
                      type="button"
                      onClick={() => setShowRestoreConfirm(true)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-red-950 text-zinc-300 hover:text-red-300 border border-zinc-700/80 hover:border-red-600/50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Restore factory default sounds for this Tune Set"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Default Set</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (editTargetType === 'kit') {
                        onSelectTuneSet(editingKit, editingTuneSet)
                      } else if (currentEditingBank) {
                        onSelectBank(currentEditingBank.id)
                      }
                      onClose()
                    }}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play This on Octapad</span>
                  </button>
                </div>

              </div>

              {/* Restore Defaults Confirmation Banner */}
              {showRestoreConfirm && (
                <div className="p-3.5 rounded-2xl bg-amber-950/80 border-2 border-amber-500/80 flex items-center justify-between gap-3 text-xs text-amber-200 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Reset <strong>KIT {editingKit} – TUNE SET {editingTuneSet}</strong> back to factory defaults? Your custom changes on this set will be replaced.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleConfirmRestoreDefaults}
                      className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold"
                    >
                      Confirm Reset
                    </button>
                    <button
                      onClick={() => setShowRestoreConfirm(false)}
                      className="px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* 8 Pads Interactive Strip */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                    Select Pad to Edit (P1 to P8) • Currently: <span className="text-cyan-300">{activeEditingTitle}</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Keys: A, S, D, F, J, K, L, Space
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {activeEditingPads.map((pad, idx) => {
                    const isSelected = selectedPadIndex === idx
                    return (
                      <button
                        key={pad.id || idx}
                        type="button"
                        onClick={() => setSelectedPadIndex(idx)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-between text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-b from-cyan-950/90 to-purple-950/90 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-102'
                            : 'bg-[#0d1020] hover:bg-zinc-800/80 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-cyan-300' : 'text-zinc-500'}`}>
                          PAD {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-white truncate max-w-full my-1">
                          {pad.name}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/60 text-zinc-400">
                          {pad.key}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Pad Details & Assignment Grid */}
              {currentEditingPad && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 p-5 rounded-2xl bg-[#0c1022] border border-cyan-500/30">
                  
                  {/* Left Column: Rename, Volume, Pitch, Clear, Upload */}
                  <div className="space-y-4 lg:border-r border-zinc-800 lg:pr-5">
                    <div>
                      <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider block mb-1">
                        Editing Pad {selectedPadIndex + 1} ({currentEditingPad.key} Key)
                      </span>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                        Pad Name / Label
                      </label>
                      <input
                        type="text"
                        value={currentEditingPad.name}
                        onChange={(e) => handlePadNameChange(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#070914] border border-zinc-700 text-white font-bold text-sm focus:border-cyan-400 focus:outline-none"
                        placeholder="e.g. Dhol, Tasha, Bass, Nagada..."
                      />
                    </div>

                    {/* Volume Slider */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 mb-1">
                        <span>Pad Volume</span>
                        <span className="text-cyan-300 font-mono font-bold">
                          {Math.round((currentEditingPad.defaultVolume ?? 1.0) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1.5"
                        step="0.05"
                        value={currentEditingPad.defaultVolume ?? 1.0}
                        onChange={(e) => handlePadVolumeChange(parseFloat(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    {/* Pitch Slider */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 mb-1">
                        <span>Pitch Tuning</span>
                        <span className="text-cyan-300 font-mono font-bold">
                          {(currentEditingPad.defaultPitch ?? 1.0).toFixed(2)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.05"
                        value={currentEditingPad.defaultPitch ?? 1.0}
                        onChange={(e) => handlePadPitchChange(parseFloat(e.target.value))}
                        className="w-full accent-purple-400 cursor-pointer"
                      />
                    </div>

                    {/* Assigned Sound Audio Info */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-zinc-800 text-xs space-y-1">
                      <div className="text-zinc-500 font-mono text-[10px]">CURRENT ASSIGNED SOUND:</div>
                      <div className="text-white font-bold truncate">
                        {currentEditingPad.soundUrl || currentEditingPad.synthType || 'Default Sound'}
                      </div>
                      <div className="text-zinc-400 text-[11px]">
                        Category: <span className="text-cyan-400 font-mono uppercase">{currentEditingPad.category}</span>
                      </div>
                    </div>

                    {/* Preview / Clear Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          handlePreview(
                            currentEditingPad.id,
                            currentEditingPad.soundUrl,
                            currentEditingPad.synthType,
                            currentEditingPad.isTrack
                          )
                        }
                        className="flex-1 px-3 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Preview Pad Sound</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRemoveSound}
                        className="px-3 py-2 rounded-xl bg-red-950/50 hover:bg-red-900/60 border border-red-700/50 text-red-400 font-bold text-xs transition-colors cursor-pointer"
                        title="Remove sound / mute pad"
                      >
                        Clear
                      </button>
                    </div>

                    {/* Audio Upload Dropzone */}
                    <div className="pt-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="audio/*,.wav,.mp3,.m4a,.ogg,.aac"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-950/80 to-slate-900 border border-purple-500/50 hover:border-purple-400 text-purple-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-purple-400" />
                        <span>Upload Your Audio File</span>
                      </button>
                      <p className="text-[10px] text-zinc-500 text-center mt-1">
                        Supports MP3, WAV, M4A, OGG up to 25MB
                      </p>
                    </div>

                  </div>

                  {/* Middle & Right: Sound Library Browser (2 Columns) */}
                  <div className="lg:col-span-2 space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                          <Music className="w-4 h-4 text-cyan-400" />
                          <span>Sound Library</span>
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          Click preview to listen, or assign to Pad {selectedPadIndex + 1}.
                        </p>
                      </div>

                      {/* Category Filters */}
                      <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-zinc-800 text-[10px] font-bold">
                        {[
                          { id: 'all', label: 'All' },
                          { id: 'devotional', label: 'Devotional' },
                          { id: 'electronic', label: 'DJ / Modern' },
                          { id: 'tracks', label: 'Backing Tracks' }
                        ].map(cat => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSoundCategoryFilter(cat.id)}
                            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                              soundCategoryFilter === cat.id
                                ? 'bg-cyan-500 text-black shadow-sm font-bold'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sound Library Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
                      {filteredLibrary.map(item => {
                        const isPreviewing = previewingSoundId === item.id

                        return (
                          <div
                            key={item.id}
                            className="p-3 rounded-xl bg-[#080b18]/90 border border-zinc-800/90 hover:border-cyan-500/40 flex items-center justify-between gap-2 transition-all group"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <span className="text-lg select-none shrink-0">{item.icon || '🥁'}</span>
                              <div className="truncate">
                                <div className="text-xs font-bold text-white truncate group-hover:text-cyan-300">
                                  {item.name}
                                </div>
                                <div className="text-[10px] text-zinc-500 truncate">
                                  {item.description}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handlePreview(item.id, item.soundUrl, item.synthType, item.isTrack)}
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                  isPreviewing
                                    ? 'bg-amber-500 text-black border-amber-400 animate-pulse'
                                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
                                }`}
                                title="Preview this sound"
                              >
                                {isPreviewing ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleAssignLibrarySound(item)}
                                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:brightness-110 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                                title={`Assign to Pad ${selectedPadIndex + 1}`}
                              >
                                <Check className="w-3 h-3" />
                                <span>Assign</span>
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                  </div>

                </div>
              )}

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: TUNE SET LIBRARY (3 Kits × 4 Tune Sets = 12 Sets)  */}
          {/* ========================================================= */}
          {activeTab === 'tune_library' && (
            <div className="space-y-6">
              
              {/* Kit & Tune Set Selectors (Kit 1, 2, 3 and Sets 1, 2, 3, 4) */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    Select Kit:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {([1, 2, 3] as KitNumber[]).map(kNum => {
                      const kitObj = kitsData.find(k => k.kitNumber === kNum)
                      const isSel = browsingKit === kNum
                      return (
                        <button
                          key={kNum}
                          type="button"
                          onClick={() => setBrowsingKit(kNum)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSel
                              ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                          }`}
                        >
                          KIT {kNum}: {kitObj?.name || `Kit ${kNum}`}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    Tune Set:
                  </span>
                  {([1, 2, 3, 4] as TuneSetNumber[]).map(tsNum => {
                    const isSel = browsingTuneSet === tsNum
                    return (
                      <button
                        key={tsNum}
                        type="button"
                        onClick={() => setBrowsingTuneSet(tsNum)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSel
                            ? 'bg-cyan-400 text-black shadow-sm font-black'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                        }`}
                      >
                        SET {tsNum}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Selected Tune Set Details Header */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0d142b] via-[#101938] to-[#0d142b] border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                    KIT {browsingKit} • TUNE SET {browsingTuneSet} OF 4
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                    <span>{browsingTuneSetObj.name}</span>
                    <span className="text-zinc-400 text-xs font-normal">({browsingTuneSetObj.hindiName})</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {browsingTuneSetObj.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingKit(browsingKit)
                      setEditingTuneSet(browsingTuneSet)
                      setEditTargetType('kit')
                      setActiveTab('sound_designer')
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Edit these 8 pads in Sound Designer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Edit in Designer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectTuneSet(browsingKit, browsingTuneSet)
                      onClose()
                    }}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Load onto Octapad</span>
                  </button>
                </div>
              </div>

              {/* 8 Pads Grid for Browsed Tune Set */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {browsingTuneSetObj.pads.map((pad, idx) => {
                  const isPreviewing = previewingSoundId === pad.id

                  return (
                    <div
                      key={pad.id || idx}
                      className="p-3.5 rounded-xl bg-[#0c1022] border border-zinc-800/90 hover:border-cyan-500/40 flex flex-col justify-between gap-2.5 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 font-bold mb-1">
                          <span>PAD {idx + 1} ({pad.key})</span>
                          <span className="text-cyan-400 uppercase">{pad.category}</span>
                        </div>
                        <div className="text-sm font-extrabold text-white truncate" title={pad.name}>
                          {pad.name}
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate mt-0.5" title={pad.description}>
                          {pad.description}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-500">
                          Vol: {Math.round((pad.defaultVolume ?? 1.0) * 100)}%
                        </span>

                        <button
                          type="button"
                          onClick={() => handlePreview(pad.id, pad.soundUrl, pad.synthType, pad.isTrack)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                            isPreviewing
                              ? 'bg-amber-500 text-black animate-pulse'
                              : 'bg-zinc-900 hover:bg-zinc-800 text-cyan-300 border border-cyan-500/30'
                          }`}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Preview</span>
                        </button>
                      </div>

                    </div>
                  )
                })}
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: MY BANK (Custom Kits Management)                    */}
          {/* ========================================================= */}
          {activeTab === 'my_bank' && (
            <div className="space-y-6">
              
              {/* Action Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#0d142b] via-[#101938] to-[#0d142b] border border-cyan-500/30">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>My Bank Kits</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Create multiple custom kits with independent 8 pad sounds. Save, rename, duplicate and play instantly.
                  </p>
                </div>

                <button
                  onClick={() => setIsCreatingBank(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:brightness-110 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Bank</span>
                </button>
              </div>

              {/* Create Bank Inline Modal */}
              {isCreatingBank && (
                <form
                  onSubmit={handleCreateBankSubmit}
                  className="p-5 rounded-2xl bg-slate-950/90 border-2 border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.3)] space-y-4 animate-fadeIn"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest">
                      Create New Bank
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingBank(false)}
                      className="text-zinc-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Bank Name (e.g. MY DJ BANK, BHAJAN BANK, LIVE SHOW BANK)
                      </label>
                      <input
                        type="text"
                        value={newBankName}
                        onChange={(e) => setNewBankName(e.target.value)}
                        placeholder="Enter bank name..."
                        className="w-full px-3.5 py-2 rounded-xl bg-[#080a14] border border-cyan-500/40 text-white text-sm focus:outline-none focus:border-cyan-400"
                        autoFocus
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Starting Sounds Template
                      </label>
                      <select
                        value={newBankTemplate}
                        onChange={(e) => setNewBankTemplate(e.target.value as 'starter' | 'current' | 'empty')}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#080a14] border border-cyan-500/40 text-white text-sm focus:outline-none"
                      >
                        <option value="starter">Starter DJ & Fusion (808 Bass, Tasha, Clap, Dhol)</option>
                        <option value="current">Clone from Active Octapad Pads</option>
                        <option value="empty">Empty Slate (Assign all 8 from scratch)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingBank(false)}
                      className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs font-bold shadow-md hover:brightness-110"
                    >
                      Create & Open Bank
                    </button>
                  </div>
                </form>
              )}

              {/* Banks List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {userBanks.map((bank) => {
                  const isActive = activeBank?.id === bank.id
                  const isRenaming = renamingBankId === bank.id

                  return (
                    <div
                      key={bank.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                        isActive
                          ? 'bg-gradient-to-br from-[#0c1836] via-[#101b40] to-[#0c1836] border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                          : 'bg-[#0d1020]/80 hover:bg-[#12162d]/90 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {isRenaming ? (
                            <div className="flex items-center gap-1.5 flex-1">
                              <input
                                type="text"
                                value={renamingText}
                                onChange={(e) => setRenamingText(e.target.value)}
                                className="px-2.5 py-1 rounded bg-[#070914] border border-cyan-400 text-white text-sm font-bold w-full"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveRename(bank.id)}
                                className="p-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setRenamingBankId(null)}
                                className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <h4 className="text-base sm:text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
                                <span>{bank.name}</span>
                              </h4>
                              {isActive && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                                  LIVE ACTIVE
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setRenamingBankId(bank.id)
                                setRenamingText(bank.name)
                              }}
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                              title="Rename Bank"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(bank.id)}
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                              title="Duplicate Bank"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(bank.id)}
                              disabled={userBanks.length <= 1}
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400 disabled:opacity-30 transition-colors"
                              title="Delete Bank"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* 8 Pads Sound Summary Grid */}
                        <div className="grid grid-cols-4 gap-1.5 mt-3">
                          {bank.pads.map((p, idx) => (
                            <div
                              key={p.id || idx}
                              className="p-1.5 rounded-lg bg-[#070914]/80 border border-zinc-800/80 text-[10px] flex flex-col truncate"
                            >
                              <span className="font-mono text-zinc-500 text-[9px] font-bold">
                                P{idx + 1} ({p.key})
                              </span>
                              <span className="font-semibold text-zinc-300 truncate" title={p.name}>
                                {p.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delete Confirmation Banner */}
                      {deleteConfirmId === bank.id && (
                        <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/60 flex items-center justify-between gap-2 animate-fadeIn text-xs text-red-200">
                          <span>Delete "{bank.name}"? This cannot be undone.</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDelete(bank.id)}
                              className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Card Action Buttons */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
                        <button
                          onClick={() => {
                            setEditingBankId(bank.id)
                            setEditTargetType('bank')
                            setActiveTab('sound_designer')
                          }}
                          className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-semibold text-cyan-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Customize in Designer</span>
                        </button>

                        <button
                          onClick={() => {
                            onSelectBank(bank.id)
                            onClose()
                          }}
                          className={`px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            isActive
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/30'
                              : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:brightness-110 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{isActive ? 'Loaded on Octapad' : 'Play This Bank'}</span>
                        </button>
                      </div>

                    </div>
                  )
                })}
              </div>

            </div>
          )}

        </div>

        {/* --- Bottom Footer Status --- */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-[#070914] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-400 font-mono shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>KHAROL BROTHERS OCTAPAD ENGINE • 96 TUNE SOUNDS (3 KITS × 4 TUNE SETS) + UNLIMITED BANKS</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-colors cursor-pointer"
          >
            Close Designer
          </button>
        </div>

      </div>
    </div>
  )
}
