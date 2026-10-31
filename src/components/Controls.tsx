import React, { useState, useRef, useEffect } from 'react'
import { 
  Play, 
  Square, 
  Circle, 
  Trash2, 
  Save, 
  Clock, 
  Volume2, 
  RotateCcw,
  Sparkles,
  Music,
  FolderOpen
} from 'lucide-react'
import { RecordingSession, RecordedHit } from '../types/octapad'

interface ControlsProps {
  bpm: number
  onBpmChange: (bpm: number) => void
  isMetronomeOn: boolean
  onToggleMetronome: () => void
  currentBeat: number
  metronomeVolume: number
  onMetronomeVolumeChange: (vol: number) => void
  reverbAmount: number
  onReverbChange: (reverb: number) => void
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  isPlayingBack: boolean
  onStartPlayback: () => void
  onStopPlayback: () => void
  onClearRecording: () => void
  recordedHits: RecordedHit[]
  savedSessions: RecordingSession[]
  onSaveSession: (name: string) => void
  onLoadSession: (session: RecordingSession) => void
}

export const Controls: React.FC<ControlsProps> = ({
  bpm,
  onBpmChange,
  isMetronomeOn,
  onToggleMetronome,
  currentBeat,
  metronomeVolume,
  onMetronomeVolumeChange,
  reverbAmount,
  onReverbChange,
  isRecording,
  onStartRecording,
  onStopRecording,
  isPlayingBack,
  onStartPlayback,
  onStopPlayback,
  onClearRecording,
  recordedHits,
  savedSessions,
  onSaveSession,
  onLoadSession,
}) => {
  // Tap tempo logic
  const tapTimesRef = useRef<number[]>([])
  const [tapActive, setTapActive] = useState(false)
  const [showSavedModal, setShowSavedModal] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const [recordingDuration, setRecordingDuration] = useState(0)

  // Track recording duration timer
  useEffect(() => {
    let interval: number | null = null
    if (isRecording) {
      setRecordingDuration(0)
      const start = performance.now()
      interval = window.setInterval(() => {
        setRecordingDuration(Math.round((performance.now() - start) / 1000))
      }, 500)
    } else {
      if (interval) clearInterval(interval)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRecording])

  const handleTapTempo = () => {
    const now = performance.now()
    setTapActive(true)
    setTimeout(() => setTapActive(false), 150)

    const taps = tapTimesRef.current
    if (taps.length > 0 && now - taps[taps.length - 1] > 2500) {
      // Reset if paused longer than 2.5s
      tapTimesRef.current = [now]
      return
    }

    taps.push(now)
    if (taps.length > 5) taps.shift()

    if (taps.length >= 2) {
      const intervals: number[] = []
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1])
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
      const calculatedBpm = Math.round(60000 / avgInterval)
      if (calculatedBpm >= 40 && calculatedBpm <= 240) {
        onBpmChange(calculatedBpm)
      }
    }
  }

  const handleSaveClick = () => {
    const name = sessionName.trim() || `Devotional Keertan (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
    onSaveSession(name)
    setSessionName('')
    setShowSavedModal(false)
  }

  const formatDuration = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="w-full bg-stone-950/85 border border-amber-600/30 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Metronome & Tempo Controls (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-3 bg-stone-900/60 p-3.5 rounded-xl border border-stone-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-xs text-amber-200 uppercase tracking-wider">
                Devotional Metronome
              </span>
            </div>

            {/* Tap Tempo Button */}
            <button
              onClick={handleTapTempo}
              className={`
                px-3 py-1 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-transform
                border ${
                  tapActive 
                    ? 'bg-amber-400 text-stone-950 border-amber-300 scale-95 shadow-glow-gold' 
                    : 'bg-stone-800 text-amber-300 border-amber-500/30 hover:border-amber-400'
                }
              `}
              title="Tap rhythmically to calculate BPM automatically"
            >
              Tap Tempo
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMetronome}
              className={`
                px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md
                ${isMetronomeOn
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-glow-gold'
                  : 'bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-700'
                }
              `}
              title="Toggle Devotional Temple Tick / Keharwa Metronome"
            >
              {isMetronomeOn ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isMetronomeOn ? 'Stop Tick' : 'Start Tick'}</span>
            </button>

            {/* BPM Controls */}
            <div className="flex items-center gap-2 flex-1">
              <button
                onClick={() => onBpmChange(Math.max(40, bpm - 1))}
                className="w-7 h-7 rounded-lg bg-stone-800 text-amber-300 font-bold hover:bg-stone-700 text-xs flex items-center justify-center border border-stone-700"
                title="Decrease BPM"
              >
                -
              </button>
              
              <div className="flex-1 flex flex-col items-center">
                <input
                  type="range"
                  min="40"
                  max="240"
                  value={bpm}
                  onChange={(e) => onBpmChange(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <button
                onClick={() => onBpmChange(Math.min(240, bpm + 1))}
                className="w-7 h-7 rounded-lg bg-stone-800 text-amber-300 font-bold hover:bg-stone-700 text-xs flex items-center justify-center border border-stone-700"
                title="Increase BPM"
              >
                +
              </button>

              <div className="min-w-[62px] text-right font-mono">
                <span className="text-base font-bold text-amber-300">{bpm}</span>
                <span className="text-[10px] text-stone-400 ml-1">BPM</span>
              </div>
            </div>
          </div>

          {/* 8-Matra Devotional Cycle Indicator (Keharwa / Bhajan Taal) */}
          <div className="flex items-center justify-between pt-1 border-t border-stone-800/80">
            <span className="text-[10px] text-amber-400/80 font-mono">
              8-Matra Cycle (Sam Highlight):
            </span>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((b) => {
                const isActive = isMetronomeOn && currentBeat === b
                const isSam = b === 0
                return (
                  <div
                    key={b}
                    className={`
                      transition-all duration-75 rounded-full flex items-center justify-center font-mono
                      ${isSam ? 'w-4 h-4 text-[9px]' : 'w-3 h-3 text-[8px]'}
                      ${isActive
                        ? isSam
                          ? 'bg-amber-300 text-stone-950 shadow-[0_0_10px_#f59e0b] scale-125 font-bold'
                          : 'bg-amber-400 text-stone-950 scale-110'
                        : isSam
                          ? 'bg-amber-950/80 border border-amber-600/70 text-amber-300'
                          : 'bg-stone-800 text-stone-500'
                      }
                    `}
                    title={isSam ? 'Sam (First beat of cycle)' : `Beat ${b + 1}`}
                  >
                    {isSam ? 'S' : ''}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Manual Performance Recorder (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-3 bg-stone-900/60 p-3.5 rounded-xl border border-stone-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Circle className={`w-3.5 h-3.5 ${isRecording ? 'text-red-500 fill-red-500 animate-pulse' : 'text-stone-400'}`} />
              <span className="font-semibold text-xs text-amber-200 uppercase tracking-wider">
                Performance Recorder
              </span>
            </div>

            {/* Recording Hit Count / Status */}
            <div className="font-mono text-xs flex items-center gap-2">
              {isRecording ? (
                <span className="text-red-400 font-bold animate-pulse flex items-center gap-1">
                  ● REC {formatDuration(recordingDuration)} ({recordedHits.length} hits)
                </span>
              ) : recordedHits.length > 0 ? (
                <span className="text-amber-400/90">
                  {recordedHits.length} hits recorded
                </span>
              ) : (
                <span className="text-stone-500">Ready to play</span>
              )}
            </div>
          </div>

          {/* Recorder Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Record Button */}
            {!isRecording ? (
              <button
                onClick={onStartRecording}
                className="px-3.5 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Record manual pad strikes with exact timing"
              >
                <Circle className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                <span>Record</span>
              </button>
            ) : (
              <button
                onClick={onStopRecording}
                className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-stone-600 animate-pulse"
                title="Stop Recording"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Rec</span>
              </button>
            )}

            {/* Playback Button */}
            {!isPlayingBack ? (
              <button
                onClick={onStartPlayback}
                disabled={recordedHits.length === 0 || isRecording}
                className="px-3.5 py-1.5 bg-emerald-950/70 hover:bg-emerald-900 disabled:opacity-40 disabled:pointer-events-none text-emerald-200 border border-emerald-700/50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Play back manual performance preserving hit timing"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Rec</span>
              </button>
            ) : (
              <button
                onClick={onStopPlayback}
                className="px-3.5 py-1.5 bg-amber-900/60 hover:bg-amber-800 text-amber-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-amber-600"
                title="Stop Playback"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            )}

            {/* Clear Button */}
            <button
              onClick={onClearRecording}
              disabled={recordedHits.length === 0 || isRecording}
              className="p-2 bg-stone-800 hover:bg-stone-750 disabled:opacity-30 disabled:pointer-events-none text-stone-300 hover:text-red-400 rounded-xl border border-stone-700 text-xs transition-colors"
              title="Clear current recording"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Save / Sessions Modal Trigger */}
            <button
              onClick={() => setShowSavedModal(true)}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-750 text-amber-300 rounded-xl border border-amber-600/30 text-xs flex items-center gap-1.5 transition-colors ml-auto"
              title="Save or Load Recorded Sessions"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Sessions ({savedSessions.length})</span>
            </button>
          </div>

          <div className="text-[11px] text-stone-400 flex items-center justify-between pt-1 border-t border-stone-800/80">
            <span>Preserves exact human feel & velocity</span>
            {recordedHits.length > 0 && (
              <span className="font-mono text-amber-500">
                Duration: {formatDuration(Math.round(Math.max(...recordedHits.map(h => h.timeMs)) / 1000))}
              </span>
            )}
          </div>
        </div>

        {/* Temple Hall Reverb Acoustics (2 Columns) */}
        <div className="lg:col-span-2 flex flex-col gap-2 bg-stone-900/60 p-3.5 rounded-xl border border-stone-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-amber-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Temple Reverb</span>
            </span>
            <span className="font-mono text-amber-400 text-[11px]">
              {Math.round(reverbAmount * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="0.8"
            step="0.05"
            value={reverbAmount}
            onChange={(e) => onReverbChange(parseFloat(e.target.value))}
            className="w-full accent-amber-500"
            title="Acoustic Stone Temple Hall reverberation depth"
          />
          <span className="text-[10px] text-stone-400 truncate">
            Sacred Mandir Sanctum
          </span>
        </div>

      </div>

      {/* Saved Sessions Modal */}
      {showSavedModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowSavedModal(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-stone-950 border border-amber-600/50 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-ornate text-xl text-amber-200 flex items-center gap-2">
                <span>🪘</span>
                <span>Devotional Keertan Sessions</span>
              </h3>
              <button 
                onClick={() => setShowSavedModal(false)}
                className="text-stone-400 hover:text-white px-2 py-1 text-sm rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Save Current Session Form */}
            {recordedHits.length > 0 && (
              <div className="p-3 bg-stone-900/80 rounded-xl border border-amber-500/30 space-y-2">
                <span className="text-xs font-semibold text-amber-300 block">
                  Save Current Performance ({recordedHits.length} hits):
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="e.g. Sundarkand Doha Sangat, Shree Ram Kirtan"
                    className="flex-1 bg-stone-950 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-amber-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleSaveClick}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow-md"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            )}

            {/* List of Saved Sessions */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {savedSessions.length === 0 ? (
                <div className="text-center py-8 text-stone-500 text-xs">
                  No sessions saved locally yet. Record a groove and save it here!
                </div>
              ) : (
                savedSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 bg-stone-900/60 hover:bg-stone-900 rounded-xl border border-stone-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-amber-200">{session.name}</div>
                      <div className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5">
                        <span>{session.date}</span>
                        <span>•</span>
                        <span>{session.hits.length} hits</span>
                        <span>•</span>
                        <span>{formatDuration(Math.round(session.durationMs / 1000))}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onLoadSession(session)
                        setShowSavedModal(false)
                      }}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Load</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 text-[11px] text-stone-500 text-right">
              Saved locally in browser storage
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
