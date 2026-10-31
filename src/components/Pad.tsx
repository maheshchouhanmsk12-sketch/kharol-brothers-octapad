import React, { useRef, useState, useEffect } from 'react'
import { PadConfig, PadState, InstrumentId } from '../types/octapad'
import { Sliders, Volume2, VolumeX } from 'lucide-react'
import confetti from 'canvas-confetti'

interface PadProps {
  config: PadConfig
  state: PadState
  index: number
  masterVolume?: number
  isMasterMuted?: boolean
  isTrack?: boolean
  isPlayingTrack?: boolean
  onHit: (id: InstrumentId, velocity?: number) => void
  onVolumeChange: (id: InstrumentId, volume: number) => void
  onPitchChange: (id: InstrumentId, pitch: number) => void
  onMuteToggle: (id: InstrumentId) => void
}

interface StrikeFeedback {
  level: 'soft' | 'med' | 'hard'
  label: string
  percentage: number
  velocity: number
}

export const Pad: React.FC<PadProps> = ({
  config,
  state,
  index,
  masterVolume = 0.85,
  isMasterMuted = false,
  isTrack = false,
  isPlayingTrack = false,
  onHit,
  onVolumeChange,
  onPitchChange,
  onMuteToggle
}) => {
  const [isPressed, setIsPressed] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [strikeFeedback, setStrikeFeedback] = useState<StrikeFeedback | null>(null)
  const [ripplePoint, setRipplePoint] = useState<{ x: number; y: number } | null>(null)

  const pressTimeoutRef = useRef<number | null>(null)
  const feedbackTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (state.isStruck) {
      triggerVisualAnimation(state.lastStruckVelocity || 0.85)
    }
  }, [state.isStruck, state.lastStruckTime, state.lastStruckVelocity])

  const triggerVisualAnimation = (vel = 0.95, coords?: { x: number; y: number }) => {
    setIsPressed(true)
    if (coords) {
      setRipplePoint(coords)
    }

    const percentage = Math.round((vel / 1.0) * 100)
    let level: 'soft' | 'med' | 'hard' = 'med'
    let label = 'MED'
    if (vel < 0.48) {
      level = 'soft'
      label = 'SOFT'
    } else if (vel >= 0.98) {
      level = 'hard'
      label = 'HARD'
    }

    setStrikeFeedback({ level, label, percentage, velocity: vel })

    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current)
    }
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current)
    }

    if (config.id === 'sam_accent' && !isPlayingTrack && vel > 0.8) {
      try {
        confetti({
          particleCount: vel > 1.1 ? 30 : 15,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#38bdf8', '#fbbf24', '#ffffff', '#ec4899'],
          disableForReducedMotion: true
        })
      } catch {
        // Confetti optional
      }
    }

    pressTimeoutRef.current = window.setTimeout(() => {
      setIsPressed(false)
    }, 110)

    feedbackTimeoutRef.current = window.setTimeout(() => {
      setStrikeFeedback(null)
      setRipplePoint(null)
    }, 450)
  }

  /**
   * Roland Dynamic Strike Sensor Calculation
   * Detects strike momentum via Hardware Pressure, Touch Contact Area,
   * or Roland SPD-20 Rubber Pad Strike Zones (Rim tap = Soft, Center = Mid, Bottom = Hard).
   */
  const calculateSensorVelocity = (
    e: React.PointerEvent<HTMLDivElement>
  ): { velocity: number; level: 'soft' | 'med' | 'hard'; label: string; percentage: number } => {
    const rect = e.currentTarget.getBoundingClientRect()
    const relY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const distFromCenterX = Math.abs(relX - 0.5) * 2 // 0 at center, 1 at side edges

    let computedVel = 0.85

    // 1. Hardware Pressure Sensor (Stylus, Apple Pencil, S-Pen, Force Touch screens)
    if (e.pressure && e.pressure > 0.02 && e.pointerType !== 'mouse') {
      if (e.pressure < 0.20) {
        computedVel = 0.18 + (e.pressure / 0.20) * 0.22 // 0.18 - 0.40 (Soft)
      } else if (e.pressure < 0.65) {
        computedVel = 0.40 + ((e.pressure - 0.20) / 0.45) * 0.55 // 0.40 - 0.95 (Medium)
      } else {
        computedVel = 0.95 + ((e.pressure - 0.65) / 0.35) * 0.50 // 0.95 - 1.45 (Hard)
      }
    }
    // 2. Capacitive Touch Contact Area (Fingertip tip touch vs flat slap)
    else if (e.pointerType === 'touch' && (e.width > 0 || e.height > 0)) {
      const touchDim = Math.max(e.width, e.height)
      if (touchDim < 14 && touchDim > 0) {
        // Light fingertip touch
        computedVel = 0.22 + (touchDim / 14) * 0.24 // 0.22 - 0.46
      } else if (touchDim > 32) {
        // Full flat slap
        computedVel = 1.05 + Math.min(0.40, ((touchDim - 32) / 30) * 0.40) // 1.05 - 1.45
      } else {
        // Blend touch area with vertical zone
        const areaVel = 0.46 + ((touchDim - 14) / 18) * 0.50
        const zoneVel = calculateZoneVelocity(relY, distFromCenterX)
        computedVel = areaVel * 0.4 + zoneVel * 0.6
      }
    }
    // 3. Roland Rubber Pad Strike Zone Sensor (Mouse, Touchpad, and Standard Mobile Touch)
    else {
      computedVel = calculateZoneVelocity(relY, distFromCenterX)
    }

    // Clamped strictly between 0.15 (whisper soft) and 1.45 (heavy punchy strike)
    const finalVel = Math.max(0.15, Math.min(1.45, computedVel))
    const percentage = Math.round((finalVel / 1.0) * 100)

    let level: 'soft' | 'med' | 'hard' = 'med'
    let label = 'MED'
    if (finalVel < 0.48) {
      level = 'soft'
      label = 'SOFT'
    } else if (finalVel >= 0.98) {
      level = 'hard'
      label = 'HARD'
    }

    return {
      velocity: finalVel,
      level,
      label,
      percentage
    }
  }

  const calculateZoneVelocity = (relY: number, distFromCenterX: number): number => {
    if (relY < 0.25) {
      // Top Rim: Ghost note / gentle tap (0.20 to 0.45)
      return 0.20 + (relY / 0.25) * 0.25
    } else if (relY < 0.55) {
      // Upper-mid: Moderate hit (0.45 to 0.80)
      const t = (relY - 0.25) / 0.30
      return 0.45 + t * 0.35
    } else if (relY < 0.85) {
      // Center Sweet-Spot: Body drum strike (0.80 to 1.18)
      const centerFactor = 1.0 - (distFromCenterX * 0.20)
      const t = (relY - 0.55) / 0.30
      return (0.80 + t * 0.38) * centerFactor
    } else {
      // Bottom Rim: Heavy down-stroke accent (1.18 to 1.45)
      const t = (relY - 0.85) / 0.15
      return 1.18 + t * 0.27
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.preventDefault()

    const rect = e.currentTarget.getBoundingClientRect()
    const coords = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    const sensor = calculateSensorVelocity(e)

    triggerVisualAnimation(sensor.velocity, coords)
    onHit(config.id, sensor.velocity)
  }

  return (
    <div className="relative flex flex-col h-full">
      {/* Kharol Brothers Octapad Performance Rubber Pad */}
      <div
        id={`pad-${config.id}`}
        onPointerDown={handlePointerDown}
        role="button"
        tabIndex={0}
        aria-label={`Play Pad ${index + 1}: ${config.name} - Key ${config.key}`}
        className={`
          relative w-full h-44 sm:h-48 md:h-52 min-h-[176px] sm:min-h-[192px] md:min-h-[208px] max-h-[176px] sm:max-h-[192px] md:max-h-[208px]
          rounded-xl p-3 cursor-pointer select-none
          flex flex-col justify-between overflow-hidden border-2 roland-pad transition-all
          ${isPlayingTrack 
            ? 'border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/50 bg-[#16171b]' 
            : isPressed
              ? strikeFeedback?.level === 'soft'
                ? 'border-cyan-400/70 shadow-[0_0_14px_rgba(56,189,248,0.45)] ring-1 ring-cyan-400/30'
                : strikeFeedback?.level === 'hard'
                  ? 'border-orange-500 shadow-[0_0_35px_rgba(249,115,22,0.85),0_0_50px_rgba(236,72,153,0.5)] ring-2 ring-orange-400/60'
                  : 'border-cyan-400 shadow-[0_0_22px_rgba(56,189,248,0.7)] ring-1 ring-cyan-400/50'
              : 'border-[#151619]'}
          ${isPressed ? 'roland-pad-active' : ''}
          ${state.isMuted ? 'opacity-35 grayscale' : 'opacity-100'}
        `}
      >
        {/* Subtle Rubber Texture Grid */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '12px 12px'
          }}
        />

        {/* Dynamic Strike Expanding Ripple Effect */}
        {ripplePoint && (
          <span
            className={`absolute pointer-events-none rounded-full animate-ping-once transition-all duration-300 ${
              strikeFeedback?.level === 'soft'
                ? 'bg-cyan-400/25 border border-cyan-400/50'
                : strikeFeedback?.level === 'hard'
                  ? 'bg-orange-500/35 border-2 border-orange-400 shadow-[0_0_25px_rgba(249,115,22,0.9)]'
                  : 'bg-cyan-400/30 border border-cyan-300'
            }`}
            style={{
              left: `${ripplePoint.x}px`,
              top: `${ripplePoint.y}px`,
              width: strikeFeedback?.level === 'hard' ? '90px' : strikeFeedback?.level === 'soft' ? '40px' : '65px',
              height: strikeFeedback?.level === 'hard' ? '90px' : strikeFeedback?.level === 'soft' ? '40px' : '65px',
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}

        {/* Top: Pad Number, Hit LED & Shortcut Badge */}
        <div className="relative z-10 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-400 font-bold tracking-tight">
              PAD {index + 1}
            </span>
            {isTrack && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                TRACK
              </span>
            )}
            {/* Strike / Playing LED indicator */}
            <span 
              className={`w-2 h-2 rounded-full border transition-all duration-75 ${
                isPlayingTrack
                  ? 'bg-amber-400 border-white shadow-[0_0_10px_#f59e0b] animate-pulse'
                  : isPressed 
                    ? strikeFeedback?.level === 'soft'
                      ? 'bg-cyan-300 border-white shadow-[0_0_6px_#38bdf8]'
                      : strikeFeedback?.level === 'hard'
                        ? 'bg-orange-400 border-white shadow-[0_0_12px_#f97316]'
                        : 'bg-cyan-400 border-white shadow-[0_0_8px_#38bdf8]' 
                    : 'bg-zinc-800 border-zinc-700'
              }`}
            />
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Settings & Mute mini-buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowSettings(!showSettings)
              }}
              title="Pad Settings"
              className={`p-1 rounded text-zinc-400 hover:text-white transition-colors ${
                showSettings ? 'bg-zinc-700 text-white' : 'hover:bg-zinc-800'
              }`}
            >
              <Sliders className="w-3 h-3" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onMuteToggle(config.id)
              }}
              title={state.isMuted ? 'Unmute' : 'Mute'}
              className="p-1 rounded text-zinc-400 hover:text-white transition-colors hover:bg-zinc-800"
            >
              {state.isMuted ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3" />}
            </button>

            {/* Keyboard Key Silkscreen Badge */}
            <div 
              className={`
                px-2 py-0.5 rounded font-mono font-bold text-xs tracking-wider transition-all
                ${isPressed 
                  ? strikeFeedback?.level === 'hard'
                    ? 'bg-orange-500 text-white shadow-[0_0_12px_#f97316]'
                    : strikeFeedback?.level === 'soft'
                      ? 'bg-cyan-600 text-white shadow-[0_0_6px_#0284c7]'
                      : 'bg-cyan-400 text-black shadow-[0_0_10px_#38bdf8]' 
                  : isPlayingTrack
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-400/50'
                    : 'bg-zinc-800/90 text-zinc-300 border border-zinc-700'
                }
              `}
            >
              {config.key}
            </div>
          </div>
        </div>

        {/* Roland Silkscreen Strike Sensor Markings & Pad Center */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-between text-center pointer-events-none px-2 my-auto py-1">
          {/* Top Rim Indicator */}
          <div className="text-[8px] font-mono font-semibold tracking-wider text-zinc-600/70 uppercase">
            ▲ SOFT RIM
          </div>

          {/* Dynamic Strike Sensor HUD Pill (Flashes on Strike) */}
          {strikeFeedback ? (
            <div 
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase border tracking-wider transition-all duration-150 ${
                strikeFeedback.level === 'soft'
                  ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-200 shadow-[0_0_10px_rgba(56,189,248,0.4)]'
                  : strikeFeedback.level === 'hard'
                    ? 'bg-orange-950/90 border-orange-400 text-orange-200 shadow-[0_0_20px_rgba(249,115,22,0.8)] scale-105'
                    : 'bg-zinc-900/90 border-amber-500/60 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
              }`}
            >
              ⚡ {strikeFeedback.label} • {strikeFeedback.percentage}%
            </div>
          ) : (
            <div className="text-xs sm:text-sm font-bold tracking-wider text-zinc-300 font-sans uppercase line-clamp-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              {config.name}
            </div>
          )}

          {isPlayingTrack && !strikeFeedback && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[9px] font-bold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>PLAYING</span>
            </div>
          )}

          {/* Bottom Hard Strike Indicator */}
          <div className="text-[8px] font-mono font-semibold tracking-wider text-zinc-600/70 uppercase">
            ▼ HARD STRIKE
          </div>
        </div>

        {/* Bottom: Category & Volume % scaled in real time with Master Volume Dial */}
        <div className="relative z-10 flex items-center justify-between text-[10px] font-mono pointer-events-auto">
          <span className="uppercase tracking-widest text-zinc-500 pointer-events-none">{config.category}</span>
          
          {/* Active Pad Output Volume showing live level scaled with Master Dial */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setShowSettings(prev => !prev)
            }}
            title={`Pad ${index + 1} Output Volume: ${
              isMasterMuted || state.isMuted ? 'MUTE' : `${Math.round(state.volume * masterVolume * 100)}%`
            } (Click to open pad trimmer)`}
            className={`font-bold font-mono px-1.5 py-0.5 rounded transition-all cursor-pointer flex items-center gap-1 ${
              isMasterMuted || state.isMuted || masterVolume === 0
                ? 'text-red-400 bg-red-950/40 border border-red-800/40'
                : masterVolume < 0.35
                  ? 'text-cyan-300 bg-zinc-900/80 border border-cyan-800/40'
                  : 'text-cyan-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <span>VOL</span>
            <span>
              {isMasterMuted || state.isMuted || masterVolume === 0
                ? '0%'
                : `${Math.round(state.volume * masterVolume * 100)}%`}
            </span>
          </button>
        </div>
      </div>

      {/* Floating Settings Drawer */}
      {showSettings && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute top-12 left-2 right-2 z-30 p-3 bg-zinc-950/95 border border-zinc-700 rounded-xl shadow-2xl backdrop-blur-md text-xs text-zinc-200"
        >
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-zinc-800">
            <span className="font-bold text-zinc-100">{config.name} ({config.hindiName})</span>
            <button onClick={() => setShowSettings(false)} className="text-zinc-400 hover:text-white">✕</button>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-zinc-400 mb-0.5 text-[11px]">
                <span>Volume</span>
                <span className="font-mono text-cyan-400">{Math.round(state.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.05"
                value={state.volume}
                onChange={(e) => onVolumeChange(config.id, parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <div className="flex justify-between text-zinc-400 mb-0.5 text-[11px]">
                <span>Tuning</span>
                <span className="font-mono text-cyan-400">
                  {state.pitch === 1.0 ? '0' : `${state.pitch > 1 ? '+' : ''}${Math.round((state.pitch - 1) * 100)}%`}
                </span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.3"
                step="0.01"
                value={state.pitch}
                onChange={(e) => onPitchChange(config.id, parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
