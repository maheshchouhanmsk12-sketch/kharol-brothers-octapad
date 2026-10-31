import React from 'react'
import { KitNumber, PresetDetails, PresetMode, TuneSetNumber } from '../types/octapad'
import { Volume2, VolumeX, Circle, Play, Square, Clock, HelpCircle, Cpu, Settings } from 'lucide-react'

interface RolandHeaderProps {
  currentPreset: PresetMode
  presets: Record<PresetMode, PresetDetails>
  onSelectPreset: (mode: PresetMode) => void
  currentKit: KitNumber
  currentTuneSet: TuneSetNumber
  tuneSetName: string
  tuneSetHindiName: string
  onSelectKit: (kit: KitNumber) => void
  onPrevTuneSet: () => void
  onNextTuneSet: () => void
  bpm: number
  onBpmChange: (bpm: number) => void
  isMetronomeOn: boolean
  onToggleMetronome: () => void
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  isPlayingBack: boolean
  onStartPlayback: () => void
  onStopPlayback: () => void
  masterVolume: number
  isMuted: boolean
  onToggleMute: () => void
  onMasterVolumeChange: (vol: number) => void
  onOpenEngineInfo: () => void
  onToggleKeyboardGuide: () => void
  recordedHitsCount: number
  activeTrackName?: string
  onStopAllTracks?: () => void
  currentUser?: { mobileNumber: string } | null
  onLogout?: () => void
  onOpenAuth?: () => void
  onOpenSettings?: () => void
  activeBankName?: string
}

export const RolandHeader: React.FC<RolandHeaderProps> = ({
  bpm,
  isMetronomeOn,
  onToggleMetronome,
  isRecording,
  onStartRecording,
  onStopRecording,
  isPlayingBack,
  onStartPlayback,
  onStopPlayback,
  masterVolume,
  isMuted,
  onToggleMute,
  onMasterVolumeChange,
  onOpenEngineInfo,
  onToggleKeyboardGuide,
  recordedHitsCount,
  activeTrackName,
  onStopAllTracks,
  currentUser,
  onLogout,
  onOpenAuth,
  onOpenSettings,
  activeBankName,
  currentKit,
  currentTuneSet,
  tuneSetName,
  tuneSetHindiName,
  onSelectKit,
  onPrevTuneSet,
  onNextTuneSet
}) => {
  return (
    <div className="w-full bg-[#111215] rounded-t-2xl px-4 sm:px-6 py-3 border-b-2 border-[#202126] text-zinc-300 shadow-inner">
      <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-4">
        
        {/* Left: Kharol Brothers Octapad Branding */}
        <div className="flex flex-col select-none">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 text-xs">👑</span>
            <span className="text-xs font-bold tracking-wider text-zinc-300 uppercase font-sans">
              Kharol Brothers
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-cyan-400 font-sans">
              OCTAPAD
            </span>
            <span className="text-[10px] font-mono text-cyan-400 font-bold border border-cyan-700/60 px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(0,229,255,0.25)]">
              PRO EDITION
            </span>
          </div>
        </div>

        {/* Center: Blue Backlit LCD Screen & [-] [+] Navigation */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* LCD Screen: Fixed dimensions to prevent any screen jump */}
          <div className="roland-lcd rounded-lg px-4 py-2 border border-blue-900/60 w-[240px] sm:w-[270px] h-[76px] flex flex-col justify-between select-none shrink-0">
            <div className="flex items-center justify-between text-[11px] border-b border-blue-800/40 pb-1">
              <span className="font-bold text-cyan-300 font-mono tracking-wider truncate max-w-[150px]">
                {activeBankName ? `BANK: ${activeBankName}` : `KIT ${currentKit} | TUNE SET ${currentTuneSet}`}
              </span>
              <span className="text-[10px] tracking-wider text-cyan-200">
                {activeTrackName ? `♫ ${activeTrackName}` : isRecording ? '● REC' : isPlayingBack ? '▶ PLAY' : isMetronomeOn ? '♪ TICK' : 'READY'}
              </span>
            </div>
            <div className="text-xs sm:text-sm font-bold tracking-wider uppercase truncate text-white">
              {activeBankName ? 'Custom 8-Pad Bank' : `${tuneSetHindiName} (${tuneSetName})`}
            </div>
            <div className="text-[10px] text-cyan-300 flex items-center justify-between font-mono">
              <span>BPM: {bpm}</span>
              <span>VOL: {isMuted ? '0%' : `${Math.round(masterVolume * 100)}%`}</span>
              <span>HITS: {recordedHitsCount}</span>
            </div>
          </div>

          {/* Red Bordered [-] and [+] Buttons (reused without changing size, position or appearance) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onPrevTuneSet}
              disabled={currentTuneSet <= 1}
              title={currentTuneSet <= 1 ? "At Tune Set 1 (Minimum)" : `Previous Tune Set (Tune Set ${currentTuneSet - 1})`}
              className="w-8 h-8 rounded bg-zinc-900 text-white font-mono font-bold roland-red-btn flex items-center justify-center transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              -
            </button>
            <button
              onClick={onNextTuneSet}
              disabled={currentTuneSet >= 4}
              title={currentTuneSet >= 4 ? "At Tune Set 4 (Maximum)" : `Next Tune Set (Tune Set ${currentTuneSet + 1})`}
              className="w-8 h-8 rounded bg-zinc-900 text-white font-mono font-bold roland-red-btn flex items-center justify-center transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Right Matrix: Hardware Buttons for Kit Selection & Performance Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Kit Mode Selectors (Reusing existing buttons, 1, 2, 3) */}
          <div className="grid grid-cols-3 gap-1">
            {([1, 2, 3] as const).map((kNum) => {
              const isActive = currentKit === kNum
              return (
                <button
                  key={kNum}
                  onClick={() => onSelectKit(kNum)}
                  className={`
                    px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer
                    ${isActive
                      ? 'bg-cyan-500 text-black shadow-[0_0_8px_#38bdf8]'
                      : 'roland-btn hover:bg-zinc-200'
                    }
                  `}
                >
                  KIT {kNum}
                </button>
              )
            })}
          </div>

          <div className="h-6 w-px bg-zinc-800 hidden sm:block" />

          {/* Stop Active Backing Track Button (if playing) */}
          {activeTrackName && (
            <button
              onClick={onStopAllTracks}
              className="px-2.5 py-1.5 rounded text-[10px] font-bold tracking-wider bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_12px_#f59e0b] flex items-center gap-1 animate-pulse transition-transform active:scale-95 cursor-pointer"
              title="Stop playing music track"
            >
              <Square className="w-2.5 h-2.5 fill-current" />
              <span>STOP TRACK</span>
            </button>
          )}

          {/* Metronome Button */}
          <button
            onClick={onToggleMetronome}
            className={`
              px-2.5 py-1.5 rounded text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 transition-all cursor-pointer
              ${isMetronomeOn 
                ? 'bg-amber-400 text-black shadow-[0_0_8px_#fbbf24]' 
                : 'roland-btn'
              }
            `}
            title="Toggle Metronome Tick"
          >
            <Clock className="w-3 h-3" />
            <span>TICK</span>
          </button>

          {/* Recorder Controls */}
          <div className="flex items-center gap-1">
            {!isRecording ? (
              <button
                onClick={onStartRecording}
                className="px-2 py-1.5 rounded text-[10px] font-bold tracking-wider roland-btn hover:bg-red-100 flex items-center gap-1 cursor-pointer"
                title="Record manual hits"
              >
                <Circle className="w-2.5 h-2.5 text-red-500 fill-red-500" />
                <span>REC</span>
              </button>
            ) : (
              <button
                onClick={onStopRecording}
                className="px-2 py-1.5 rounded text-[10px] font-bold tracking-wider bg-red-600 text-white animate-pulse flex items-center gap-1 cursor-pointer"
                title="Stop Recording"
              >
                <Square className="w-2.5 h-2.5 fill-current" />
                <span>STOP</span>
              </button>
            )}

            {!isPlayingBack ? (
              <button
                onClick={onStartPlayback}
                disabled={recordedHitsCount === 0 || isRecording}
                className="px-2 py-1.5 rounded text-[10px] font-bold tracking-wider roland-btn disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                title="Play recorded hits"
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>PLAY</span>
              </button>
            ) : (
              <button
                onClick={onStopPlayback}
                className="px-2 py-1.5 rounded text-[10px] font-bold tracking-wider bg-amber-500 text-black flex items-center gap-1 cursor-pointer"
                title="Stop playback"
              >
                <Square className="w-2.5 h-2.5 fill-current" />
                <span>STOP</span>
              </button>
            )}
          </div>

          <div className="h-6 w-px bg-zinc-800 hidden sm:block" />

          {/* Master Mute & Volume */}
          <div className="flex items-center gap-1.5 bg-zinc-900/90 px-2 py-1 rounded border border-zinc-800">
            <button
              onClick={onToggleMute}
              className="text-zinc-400 hover:text-white cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.05"
              value={isMuted ? 0 : masterVolume}
              onChange={(e) => onMasterVolumeChange(parseFloat(e.target.value))}
              className="w-16 accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Engine & Keyboard Shortcuts */}
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenEngineInfo}
              className="p-1.5 rounded roland-btn text-[10px] cursor-pointer"
              title="Audio Engine & Samples"
            >
              <Cpu className="w-3 h-3" />
            </button>
            <button
              onClick={onToggleKeyboardGuide}
              className="p-1.5 rounded roland-btn text-[10px] cursor-pointer"
              title="Keyboard Shortcuts Guide"
            >
              <HelpCircle className="w-3 h-3" />
            </button>
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-1.5 rounded roland-btn text-[10px] text-cyan-400 hover:text-cyan-300 border border-cyan-500/40 cursor-pointer shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                title="Octapad Sound Settings & My Bank"
              >
                <Settings className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="h-6 w-px bg-zinc-800 hidden sm:block" />

          {/* User Profile / Auth State Pill */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-[#090d1f] px-2.5 py-1 rounded-lg border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
              <span className="text-[11px] font-mono text-cyan-300 font-bold">
                📱 {currentUser.mobileNumber}
              </span>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="text-[10px] font-bold tracking-wider text-red-400 hover:text-red-300 px-1.5 py-0.5 rounded bg-red-950/50 hover:bg-red-900/60 border border-red-700/50 transition-colors cursor-pointer"
                  title="Sign out from your account"
                >
                  LOGOUT
                </button>
              )}
            </div>
          ) : (
            onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 hover:brightness-110 shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
                title="Go to Login & Signup"
              >
                LOGIN / SIGNUP
              </button>
            )
          )}

        </div>

      </div>
    </div>
  )
}
