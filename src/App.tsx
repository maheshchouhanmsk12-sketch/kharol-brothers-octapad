import React, { useState, useEffect, useCallback, useRef } from 'react'
import { DEFAULT_KITS, getTuneSetDetails } from './data/kitConfigurations'
import { PRESETS } from './audio/presets'
import { audioEngine } from './audio/audioEngine'
import { KitConfig, KitNumber, PadConfig, PadState, PresetMode, RecordingSession, TuneSetConfig, TuneSetNumber, UserBank } from './types/octapad'
import { RolandHeader } from './components/RolandHeader'
import { Pad } from './components/Pad'
import { Controls } from './components/Controls'
import { AudioEngineDisclosure } from './components/AudioEngineDisclosure'
import { KeyboardGuide } from './components/KeyboardGuide'
import { SlidersHorizontal, LogIn, LogOut, Settings } from 'lucide-react'
import { AuthPage } from './components/auth/AuthPage'
import { authService, UserProfile } from './services/authService'
import { SoundSettingsModal } from './components/settings/SoundSettingsModal'
import { bankService } from './services/bankService'

export const App: React.FC = () => {
  // Active Kit (1, 2, 3) and Tune Set (1, 2, 3)
  const [currentKit, setCurrentKit] = useState<KitNumber>(() => {
    try {
      const saved = localStorage.getItem('octapad_active_kit')
      if (saved && (saved === '1' || saved === '2' || saved === '3')) {
        return parseInt(saved, 10) as KitNumber
      }
    } catch {}
    return 1
  })

  const [currentTuneSet, setCurrentTuneSet] = useState<TuneSetNumber>(() => {
    try {
      const saved = localStorage.getItem('octapad_active_tune_set')
      if (saved && (saved === '1' || saved === '2' || saved === '3' || saved === '4')) {
        return parseInt(saved, 10) as TuneSetNumber
      }
    } catch {}
    return 1
  })

  // Full 3 Kits x 4 Tune Sets x 8 Pads = 96 assignments
  const [kitsData, setKitsData] = useState<KitConfig[]>(() => {
    try {
      const saved = localStorage.getItem('octapad_all_kits_v3')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length === 3 && parsed[0]?.tuneSets?.length === 4) {
          return parsed
        }
      }
    } catch {}
    return DEFAULT_KITS
  })

  // User Custom Banks (My Bank)
  const [userBanks, setUserBanks] = useState<UserBank[]>(() => bankService.getBanks())
  const [activeBankId, setActiveBankId] = useState<string | null>(() => bankService.getActiveBankId())
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  // Compute active 8 pads (Either from active User Bank or from currently selected Kit and Tune Set)
  const activeBank = activeBankId ? userBanks.find(b => b.id === activeBankId) || null : null
  const currentKitObj = kitsData.find(k => k.kitNumber === currentKit) || kitsData[0]
  const currentTuneSetObj = currentKitObj.tuneSets.find(ts => ts.tuneSetNumber === currentTuneSet) || currentKitObj.tuneSets[0]
  const activePads = activeBank ? activeBank.pads : currentTuneSetObj.pads

  // Pad states (volume, pitch, mute, visual strike indicator)
  const [padStates, setPadStates] = useState<Record<string, PadState>>(() => {
    const initial: Record<string, PadState> = {}
    DEFAULT_KITS.forEach(kit => {
      kit.tuneSets.forEach(ts => {
        ts.pads.forEach(p => {
          initial[p.id] = {
            volume: p.defaultVolume,
            pitch: p.defaultPitch,
            isMuted: false,
            isStruck: false,
            lastStruckTime: 0
          }
        })
      })
    })

    // Also initialize state for user banks
    const initialBanks = bankService.getBanks()
    initialBanks.forEach(b => {
      b.pads.forEach(p => {
        if (!initial[p.id]) {
          initial[p.id] = {
            volume: p.defaultVolume,
            pitch: p.defaultPitch,
            isMuted: false,
            isStruck: false,
            lastStruckTime: 0
          }
        }
      })
    })

    return initial
  })

  const [currentPreset, setCurrentPreset] = useState<PresetMode>('bhajan')
  const [masterVolume, setMasterVolume] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('octapad_user_settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (typeof parsed.masterVolume === 'number') {
          return Math.max(0, Math.min(1.0, parsed.masterVolume))
        }
      }
    } catch {}
    return 0.85
  })
  const [isMuted, setIsMuted] = useState(false)
  const [reverbAmount, setReverbAmount] = useState(0.35)

  const [bpm, setBpm] = useState(90)
  const [isMetronomeOn, setIsMetronomeOn] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [metronomeVolume, setMetronomeVolume] = useState(0.65)

  const [isRecording, setIsRecording] = useState(false)
  const [isPlayingBack, setIsPlayingBack] = useState(false)
  const [recordedHits, setRecordedHits] = useState(audioEngine.getRecordedHits())
  const [savedSessions, setSavedSessions] = useState<RecordingSession[]>([])

  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set())
  const [showEngineInfo, setShowEngineInfo] = useState(false)
  const [showKeyboardGuide, setShowKeyboardGuide] = useState(false)
  const [showExpandedControls, setShowExpandedControls] = useState(false)
  const [sampleStatus, setSampleStatus] = useState(audioEngine.getSampleStatus())
  const [playingTracks, setPlayingTracks] = useState<Record<string, boolean>>({})

  // Auth state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => authService.getCurrentUser())
  const [authView, setAuthView] = useState<'auth' | 'octapad'>(() => {
    return authService.isAuthenticated() ? 'octapad' : 'auth'
  })

  const keyPressTimestamps = useRef<Map<string, number>>(new Map())

  // Keep a ref to active pads so keyboard listener always accesses latest active Tune Set
  const activePadsRef = useRef<PadConfig[]>(activePads)
  useEffect(() => {
    activePadsRef.current = activePads
  }, [activePads])

  // Try fetching kits from backend if connected
  useEffect(() => {
    async function syncKits() {
      try {
        const token = authService.getToken()
        const headers: Record<string, string> = {}
        if (token) headers['Authorization'] = `Bearer ${token}`

        const res = await fetch('/api/kits', { headers })
        if (res.ok) {
          const data = await res.json()
          if (data.success && Array.isArray(data.kits) && data.kits.length === 3 && data.kits[0]?.tuneSets?.length === 4) {
            setKitsData(data.kits)
            try {
              localStorage.setItem('octapad_all_kits_v3', JSON.stringify(data.kits))
            } catch {}
          }
        }
      } catch (err) {
        // Backend offline or running standalone, fallback to local storage & defaults
      }
    }
    syncKits()
  }, [currentUser])

  // Set up audio engine callbacks
  useEffect(() => {
    audioEngine.setCallbacks({
      onPadTriggerVisual: (padId: string) => {
        setPadStates(prev => ({
          ...prev,
          [padId]: {
            ...(prev[padId] || { volume: 1.0, pitch: 1.0, isMuted: false }),
            isStruck: true,
            lastStruckTime: performance.now()
          }
        }))
        setTimeout(() => {
          setPadStates(prev => ({
            ...prev,
            [padId]: {
              ...(prev[padId] || { volume: 1.0, pitch: 1.0, isMuted: false }),
              isStruck: false
            }
          }))
        }, 110)
      },
      onMetronomeTick: (beat: number) => {
        setCurrentBeat(beat)
      },
      onRecordingPlaybackComplete: () => {
        setIsPlayingBack(false)
      },
      onTrackStateChange: (padId: string, isPlaying: boolean) => {
        setPlayingTracks(prev => ({
          ...prev,
          [padId]: isPlaying
        }))
      }
    })

    setSavedSessions(audioEngine.loadSavedSessions())

    try {
      const savedSettings = localStorage.getItem('octapad_user_settings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        if (parsed.masterVolume !== undefined) {
          setMasterVolume(parsed.masterVolume)
          audioEngine.setMasterVolume(parsed.masterVolume)
        }
        if (parsed.reverbAmount !== undefined) {
          setReverbAmount(parsed.reverbAmount)
          audioEngine.setReverbAmount(parsed.reverbAmount)
        }
        if (parsed.bpm !== undefined) {
          setBpm(parsed.bpm)
          audioEngine.setBpm(parsed.bpm)
        }
      }
    } catch (e) {
      console.warn('Could not read user settings:', e)
    }
  }, [])

  // Save settings changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('octapad_user_settings', JSON.stringify({
        masterVolume,
        reverbAmount,
        bpm,
        currentPreset,
        currentKit,
        currentTuneSet
      }))
    } catch {}
  }, [masterVolume, reverbAmount, bpm, currentPreset, currentKit, currentTuneSet])

  // Trigger a pad strike (immediate zero latency audio + visual)
  const triggerPad = useCallback((padConfig: PadConfig, velocity = 0.95) => {
    const state = padStates[padConfig.id]
    if (state?.isMuted) return

    setPadStates(prev => ({
      ...prev,
      [padConfig.id]: {
        ...(prev[padConfig.id] || {
          volume: padConfig.defaultVolume,
          pitch: padConfig.defaultPitch,
          isMuted: false,
          isStruck: false,
          lastStruckTime: 0
        }),
        isStruck: true,
        lastStruckTime: performance.now(),
        lastStruckVelocity: velocity
      }
    }))

    audioEngine.playPad(padConfig.id, {
      velocity,
      pitchMultiplier: state?.pitch || 1.0,
      isManualTrigger: true,
      soundUrl: padConfig.soundUrl,
      isTrack: padConfig.isTrack,
      synthType: padConfig.synthType
    })

    if (audioEngine.getIsRecording()) {
      setRecordedHits(audioEngine.getRecordedHits())
    }
  }, [padStates])

  // Keyboard shortcut listener for active Tune Set
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      const key = e.key.toLowerCase()

      if (e.code === 'Space' || key === ' ') {
        e.preventDefault()
      }

      const keyIndexMap: Record<string, number> = {
        'a': 0,
        's': 1,
        'd': 2,
        'f': 3,
        'j': 4,
        'k': 5,
        'l': 6,
        ' ': 7
      }

      const padIndex = keyIndexMap[key]
      if (padIndex === undefined) return

      const padConfig = activePadsRef.current[padIndex]
      if (!padConfig) return

      // Don't auto-repeat toggle for backing tracks
      if (e.repeat && padConfig.isTrack) {
        return
      }

      const now = performance.now()
      const lastPress = keyPressTimestamps.current.get(key) || 0
      if (e.repeat && now - lastPress < 90) {
        return
      }
      keyPressTimestamps.current.set(key, now)

      // Dynamic Strike Sensor for Keyboard Players:
      // Shift + Key: Heavy Strike / Accent (velocity 1.35)
      // Alt or Ctrl + Key: Soft Tap / Ghost Note (velocity 0.30)
      // Normal Key: Balanced Standard Hit (velocity 0.85)
      let keyVelocity = 0.85
      if (e.shiftKey) {
        keyVelocity = 1.35
      } else if (e.altKey || e.ctrlKey) {
        keyVelocity = 0.30
      }

      setActiveKeys(prev => new Set(prev).add(key))
      triggerPad(padConfig, keyVelocity)
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      setActiveKeys(prev => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }

    window.addEventListener('keydown', handleKeyDown, { passive: false })
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [triggerPad])

  // Switch Kit: Automatically loads Tune Set 1 as required, resets active Bank
  const handleSelectKit = (kitNum: KitNumber) => {
    setActiveBankId(null)
    bankService.setActiveBankId(null)
    audioEngine.stopAllTracks()
    setCurrentKit(kitNum)
    setCurrentTuneSet(1) // Always load Tune Set 1 when switching kit
    try {
      localStorage.setItem('octapad_active_kit', String(kitNum))
      localStorage.setItem('octapad_active_tune_set', '1')
    } catch {}
  }

  // MINUS (-): Tune Set 3 -> 2 -> 1 (Stops at 1, never switches kit)
  const handlePrevTuneSet = () => {
    setActiveBankId(null)
    bankService.setActiveBankId(null)
    if (currentTuneSet > 1) {
      audioEngine.stopAllTracks()
      const nextTuneSet = (currentTuneSet - 1) as TuneSetNumber
      setCurrentTuneSet(nextTuneSet)
      try {
        localStorage.setItem('octapad_active_tune_set', String(nextTuneSet))
      } catch {}
    }
  }

  // PLUS (+): Tune Set 1 -> 2 -> 3 -> 4 (Stops at 4, never switches kit)
  const handleNextTuneSet = () => {
    setActiveBankId(null)
    bankService.setActiveBankId(null)
    if (currentTuneSet < 4) {
      audioEngine.stopAllTracks()
      const nextTuneSet = (currentTuneSet + 1) as TuneSetNumber
      setCurrentTuneSet(nextTuneSet)
      try {
        localStorage.setItem('octapad_active_tune_set', String(nextTuneSet))
      } catch {}
    }
  }

  // Select Tune Set directly from Tune Set Library
  const handleSelectTuneSet = (kitNum: KitNumber, tsNum: TuneSetNumber) => {
    setActiveBankId(null)
    bankService.setActiveBankId(null)
    audioEngine.stopAllTracks()
    setCurrentKit(kitNum)
    setCurrentTuneSet(tsNum)
    try {
      localStorage.setItem('octapad_active_kit', String(kitNum))
      localStorage.setItem('octapad_active_tune_set', String(tsNum))
    } catch {}
  }

  // Select User Bank directly from My Bank
  const handleSelectBank = (bankId: string) => {
    audioEngine.stopAllTracks()
    setActiveBankId(bankId)
    bankService.setActiveBankId(bankId)
  }

  const handleUpdateBank = (updatedBank: UserBank) => {
    bankService.updateBank(updatedBank)
    setUserBanks(bankService.getBanks())
  }

  const handleRefreshBanks = () => {
    setUserBanks(bankService.getBanks())
    setActiveBankId(bankService.getActiveBankId())
  }

  // Save modified Kit configurations (Sound Designer)
  const handleSaveKitsData = (updatedKits: KitConfig[]) => {
    setKitsData(updatedKits)
    try {
      localStorage.setItem('octapad_all_kits_v3', JSON.stringify(updatedKits))
    } catch {}

    const token = authService.getToken()
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    fetch('/api/kits', {
      method: 'POST',
      headers,
      body: JSON.stringify(updatedKits)
    }).catch(() => {})
  }

  // Restore factory default sounds for a Tune Set
  const handleRestoreDefaultTuneSet = (kitNum: KitNumber, tsNum: TuneSetNumber) => {
    const defaultKit = DEFAULT_KITS.find(k => k.kitNumber === kitNum)
    const defaultTS = defaultKit?.tuneSets.find(ts => ts.tuneSetNumber === tsNum)
    if (!defaultTS) return

    const updatedKits = kitsData.map(k => {
      if (k.kitNumber !== kitNum) return k
      const updatedTuneSets = k.tuneSets.map(ts => {
        if (ts.tuneSetNumber !== tsNum) return ts
        return defaultTS
      }) as [TuneSetConfig, TuneSetConfig, TuneSetConfig, TuneSetConfig]
      return { ...k, tuneSets: updatedTuneSets }
    })

    handleSaveKitsData(updatedKits)
  }

  const handleSelectPreset = (mode: PresetMode) => {
    setCurrentPreset(mode)
    const preset = PRESETS[mode]
    if (!preset) return

    setBpm(preset.suggestedBpm)
    audioEngine.setBpm(preset.suggestedBpm)

    setReverbAmount(preset.reverbAmount)
    audioEngine.setReverbAmount(preset.reverbAmount)
  }

  const handleMasterVolumeChange = (vol: number) => {
    const clamped = Math.max(0, Math.min(1.0, vol))
    setMasterVolume(clamped)
    audioEngine.setMasterVolume(clamped)
    if (isMuted && clamped > 0) {
      setIsMuted(false)
      audioEngine.setMuted(false)
    }
  }

  const handleToggleMute = () => {
    const next = !isMuted
    setIsMuted(next)
    audioEngine.setMuted(next)
  }

  const handlePadVolumeChange = (padId: string, vol: number) => {
    setPadStates(prev => ({
      ...prev,
      [padId]: { ...(prev[padId] || { volume: 1.0, pitch: 1.0, isMuted: false }), volume: vol }
    }))
    audioEngine.setPadVolume(padId, vol)
  }

  const handlePadPitchChange = (padId: string, pitch: number) => {
    setPadStates(prev => ({
      ...prev,
      [padId]: { ...(prev[padId] || { volume: 1.0, pitch: 1.0, isMuted: false }), pitch }
    }))
    audioEngine.setPadPitch(padId, pitch)
  }

  const handlePadMuteToggle = (padId: string) => {
    setPadStates(prev => {
      const current = prev[padId] || { volume: 1.0, pitch: 1.0, isMuted: false }
      const nextMute = !current.isMuted
      audioEngine.setPadVolume(padId, nextMute ? 0 : current.volume)
      return {
        ...prev,
        [padId]: { ...current, isMuted: nextMute }
      }
    })
  }

  const handleReverbChange = (val: number) => {
    setReverbAmount(val)
    audioEngine.setReverbAmount(val)
  }

  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm)
    audioEngine.setBpm(newBpm)
  }

  const handleToggleMetronome = () => {
    const isPlaying = audioEngine.toggleMetronome()
    setIsMetronomeOn(isPlaying)
  }

  const handleStartRecording = async () => {
    await audioEngine.ensureAudioContext()
    audioEngine.startRecording()
    setIsRecording(true)
    setRecordedHits([])
  }

  const handleStopRecording = () => {
    const hits = audioEngine.stopRecording()
    setIsRecording(false)
    setRecordedHits(hits)
  }

  const handleStartPlayback = () => {
    if (recordedHits.length === 0) return
    setIsPlayingBack(true)
    audioEngine.startPlayback(recordedHits, () => {
      setIsPlayingBack(false)
    })
  }

  const handleStopPlayback = () => {
    audioEngine.stopPlayback()
    setIsPlayingBack(false)
  }

  const handleClearRecording = () => {
    audioEngine.clearRecording()
    setRecordedHits([])
    setIsRecording(false)
    setIsPlayingBack(false)
  }

  const handleSaveSession = (name: string) => {
    const session = audioEngine.saveSessionToLocal(name)
    if (session) {
      setSavedSessions(audioEngine.loadSavedSessions())
    }
  }

  const handleLoadSession = (session: RecordingSession) => {
    audioEngine.loadSession(session)
    setRecordedHits([...session.hits])
  }

  const handleUploadCustomSample = async (padId: string, file: File): Promise<boolean> => {
    const ok = await audioEngine.loadCustomSample(padId, file)
    if (ok) {
      setSampleStatus(audioEngine.getSampleStatus())
    }
    return ok
  }

  const handleAuthSuccess = () => {
    setCurrentUser(authService.getCurrentUser())
    setAuthView('octapad')
  }

  const handleLogout = () => {
    try {
      audioEngine.stopAllTracks()
    } catch {}
    authService.logout()
    setCurrentUser(null)
    setAuthView('auth')
  }

  // Find currently active playing track name if any
  const activePlayingTrack = activePads.find(p => p.isTrack && playingTracks[p.id])

  // STRICT AUTHENTICATION GATE:
  // Koi bhi user bina login kiye dashboard / octapad screen par nahi ja sakta!
  // Jab tak user mobile number aur password bana kar account create ya login nahi karega, tab tak sirf AuthPage (Signup/Login) hi dikhega.
  if (!currentUser || !authService.isAuthenticated() || authView === 'auth') {
    return (
      <AuthPage
        initialMode="signup"
        onAuthSuccess={handleAuthSuccess}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-6 sm:pt-10 pb-12 sm:pb-16 px-3 sm:px-6 lg:px-8 bg-[#101114] relative">
      
      {/* Floating Header: Authenticated User Status & Logout */}
      <div className="fixed top-3 right-3 z-50 flex items-center gap-2">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-cyan-500/40 shadow-[0_0_18px_rgba(0,229,255,0.25)] backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="text-[11px] sm:text-xs font-mono font-bold text-cyan-300 tracking-wider">
            +91 {currentUser.mobileNumber}
          </span>
          <button
            onClick={handleLogout}
            className="ml-1 px-2.5 py-1 rounded-full bg-red-950/70 hover:bg-red-900/80 text-red-300 hover:text-white border border-red-700/60 text-[10px] font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer"
            title="Log out and lock Octapad"
          >
            <LogOut className="w-3 h-3 text-red-400" />
            <span>LOGOUT</span>
          </button>
        </div>
      </div>
      
      {/* 
        KHAROL BROTHERS OCTAPAD CHASSIS 
        White molded body, top black control strip & 8 black rubber pads
      */}
      <div className="w-full max-w-5xl roland-chassis p-4 sm:p-6 lg:p-7 flex flex-col gap-4 border border-[#cfcfd6] relative">
        
        {/* Top Control Panel (Roland LCD Screen, Kit Selectors, [-] [+] Buttons) */}
        <RolandHeader
          currentPreset={currentPreset}
          presets={PRESETS}
          onSelectPreset={handleSelectPreset}
          currentKit={currentKit}
          currentTuneSet={currentTuneSet}
          tuneSetName={currentTuneSetObj.name}
          tuneSetHindiName={currentTuneSetObj.hindiName}
          onSelectKit={handleSelectKit}
          onPrevTuneSet={handlePrevTuneSet}
          onNextTuneSet={handleNextTuneSet}
          bpm={bpm}
          onBpmChange={handleBpmChange}
          isMetronomeOn={isMetronomeOn}
          onToggleMetronome={handleToggleMetronome}
          isRecording={isRecording}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          isPlayingBack={isPlayingBack}
          onStartPlayback={handleStartPlayback}
          onStopPlayback={handleStopPlayback}
          masterVolume={masterVolume}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onMasterVolumeChange={handleMasterVolumeChange}
          onOpenEngineInfo={() => setShowEngineInfo(true)}
          onToggleKeyboardGuide={() => setShowKeyboardGuide(!showKeyboardGuide)}
          recordedHitsCount={recordedHits.length}
          activeTrackName={activePlayingTrack ? activePlayingTrack.name : undefined}
          onStopAllTracks={() => audioEngine.stopAllTracks()}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenAuth={() => setAuthView('auth')}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          activeBankName={activeBank ? activeBank.name : undefined}
        />

        {/* 
          RECESSED PAD TRAY: 8 LARGE BLACK RUBBER PADS IN 2x4 GRID
          Always displays the 8 pads belonging to the currently selected Kit, Tune Set, or My Bank
        */}
        <div className="bg-[#0f1013] rounded-2xl p-3 sm:p-4 border-2 border-[#1c1d22] shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)] relative">
          
          {/* Subtle Pad Settings & Active Bank Header strip beside the 8 pads */}
          <div className="flex items-center justify-between pb-2 px-1 mb-2.5 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <span className="text-[11px] font-mono tracking-wider font-bold text-zinc-300 uppercase">
                {activeBank ? `ACTIVE BANK: ${activeBank.name}` : `KIT ${currentKit} • TUNE SET ${currentTuneSet}: ${currentTuneSetObj.name}`}
              </span>
            </div>

            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)] flex items-center gap-1.5 text-[11px] font-bold tracking-wider transition-all cursor-pointer"
              title="Open Sound Settings, Tune Set Library & My Bank"
            >
              <Settings className="w-3.5 h-3.5 text-cyan-400" />
              <span>PAD SETTINGS & MY BANK</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
            {activePads.map((config, index) => {
              const state = padStates[config.id] || {
                volume: config.defaultVolume,
                pitch: config.defaultPitch,
                isMuted: false,
                isStruck: false,
                lastStruckTime: 0
              }

              return (
                <Pad
                  key={config.id}
                  config={config}
                  state={state}
                  index={index}
                  isTrack={config.isTrack}
                  isPlayingTrack={!!playingTracks[config.id]}
                  onHit={(_id, vel) => triggerPad(config, vel)}
                  onVolumeChange={(padId, vol) => handlePadVolumeChange(padId, vol)}
                  onPitchChange={(padId, pitch) => handlePadPitchChange(padId, pitch)}
                  onMuteToggle={(padId) => handlePadMuteToggle(padId)}
                />
              )
            })}
          </div>
        </div>

        {/* Subtle Bottom Bevel & Controls Toggle */}
        <div className="flex items-center justify-between px-2 text-xs text-zinc-500 font-mono">
          <div className="flex items-center gap-3">
            <span className="font-bold text-zinc-400">KHAROL BROTHERS OCTAPAD • PRO DEVOTIONAL EDITION</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">KEYS: A, S, D, F, J, K, L, SPACE</span>
          </div>

          <button
            onClick={() => setShowExpandedControls(!showExpandedControls)}
            className="flex items-center gap-1.5 px-3 py-1 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-lg font-sans font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showExpandedControls ? 'Hide Mixer & Tape' : 'Mixer & Tap Tempo'}</span>
          </button>
        </div>

      </div>

      {/* Optional Expanded Console: Metronome Tap, Tape Recorder, Sessions & Reverb */}
      {showExpandedControls && (
        <div className="w-full max-w-5xl mt-4 animate-fadeIn">
          <Controls
            bpm={bpm}
            onBpmChange={handleBpmChange}
            isMetronomeOn={isMetronomeOn}
            onToggleMetronome={handleToggleMetronome}
            currentBeat={currentBeat}
            metronomeVolume={metronomeVolume}
            onMetronomeVolumeChange={setMetronomeVolume}
            reverbAmount={reverbAmount}
            onReverbChange={handleReverbChange}
            isRecording={isRecording}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            isPlayingBack={isPlayingBack}
            onStartPlayback={handleStartPlayback}
            onStopPlayback={handleStopPlayback}
            onClearRecording={handleClearRecording}
            recordedHits={recordedHits}
            savedSessions={savedSessions}
            onSaveSession={handleSaveSession}
            onLoadSession={handleLoadSession}
          />
        </div>
      )}

      {/* Sound Engine Disclosure & Custom Audio Uploader Modal */}
      <AudioEngineDisclosure
        isOpen={showEngineInfo}
        onClose={() => setShowEngineInfo(false)}
        sampleStatus={sampleStatus}
        onUploadSample={handleUploadCustomSample}
      />

      {/* Keyboard Shortcuts Visual Guide Modal */}
      <KeyboardGuide
        isOpen={showKeyboardGuide}
        onClose={() => setShowKeyboardGuide(false)}
        activeKeys={activeKeys}
      />

      {/* Professional Sound Designer, Tune Set Library & My Bank Modal */}
      <SoundSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        kitsData={kitsData}
        currentKit={currentKit}
        currentTuneSet={currentTuneSet}
        activeBank={activeBank}
        userBanks={userBanks}
        onSelectTuneSet={handleSelectTuneSet}
        onSelectBank={handleSelectBank}
        onUpdateBank={handleUpdateBank}
        onRefreshBanks={handleRefreshBanks}
        onSaveKitsData={handleSaveKitsData}
        onRestoreDefaultTuneSet={handleRestoreDefaultTuneSet}
      />

    </div>
  )
}

export default App
