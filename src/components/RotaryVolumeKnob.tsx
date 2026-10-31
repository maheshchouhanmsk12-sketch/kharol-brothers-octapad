import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

interface RotaryVolumeKnobProps {
  volume: number // 0.0 to 1.0 (or up to 1.0 maximum safe output)
  isMuted?: boolean
  onVolumeChange: (volume: number) => void
  onToggleMute?: () => void
  size?: number // diameter in pixels (default: 48)
  label?: string
}

export const RotaryVolumeKnob: React.FC<RotaryVolumeKnobProps> = ({
  volume,
  isMuted = false,
  onVolumeChange,
  onToggleMute,
  size = 48,
  label = 'MASTER'
}) => {
  const knobRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isActive, setIsActive] = useState(false)

  // Tracking refs for hybrid circular angle + vertical drag
  const lastAngleRef = useRef<number | null>(null)
  const lastYRef = useRef<number>(0)
  const dragDistanceRef = useRef<number>(0)

  // Clamp volume between 0.0 and 1.0
  const effectiveVolume = isMuted ? 0 : Math.max(0, Math.min(1.0, volume))
  const displayPercentage = Math.round(effectiveVolume * 100)

  // Rotation angles: 270 degree sweep
  // 0% = -135deg (7 o'clock)
  // 50% = 0deg (12 o'clock)
  // 100% = +135deg (5 o'clock)
  const rotationAngle = -135 + effectiveVolume * 270

  // SVG Gauge calculations
  const strokeWidth = 3.5
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const totalArcLength = (circumference * 270) / 360
  const activeDashOffset = totalArcLength * (1 - effectiveVolume)

  // Calculate angle relative to center of knob
  const getAngleFromEvent = (e: React.PointerEvent | PointerEvent): number => {
    if (!knobRef.current) return 0
    const rect = knobRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const rad = Math.atan2(e.clientY - cy, e.clientX - cx)
    return (rad * 180) / Math.PI
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()

    isDraggingRef.current = true
    setIsActive(true)
    dragDistanceRef.current = 0

    const currentAngle = getAngleFromEvent(e)
    lastAngleRef.current = currentAngle
    lastYRef.current = e.clientY

    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {}
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return
    e.preventDefault()

    const currentAngle = getAngleFromEvent(e)
    const currentY = e.clientY

    if (lastAngleRef.current !== null) {
      // Angular circular delta
      let deltaAngle = currentAngle - lastAngleRef.current
      if (deltaAngle > 180) deltaAngle -= 360
      if (deltaAngle < -180) deltaAngle += 360

      // Vertical drag delta (upwards = positive)
      const deltaY = lastYRef.current - currentY
      dragDistanceRef.current += Math.abs(deltaY) + Math.abs(deltaAngle)

      // Use circular angle if user is circling around dial, or vertical drag if swiping vertically
      let volDelta = 0
      if (Math.abs(deltaAngle) > 1.2) {
        volDelta = deltaAngle / 270
      } else if (Math.abs(deltaY) > 1) {
        volDelta = deltaY / 140
      }

      if (volDelta !== 0) {
        const nextVol = Math.max(0, Math.min(1.0, volume + volDelta))
        onVolumeChange(nextVol)
      }
    }

    lastAngleRef.current = currentAngle
    lastYRef.current = currentY
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    setIsActive(false)
    lastAngleRef.current = null

    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}

    // If tapped without dragging, toggle mute
    if (dragDistanceRef.current < 4 && onToggleMute) {
      onToggleMute()
    }
  }

  // Mouse wheel scroll support
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const step = e.deltaY < 0 ? 0.04 : -0.04
    const nextVol = Math.max(0, Math.min(1.0, volume + step))
    onVolumeChange(nextVol)
  }

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault()
      onVolumeChange(Math.min(1.0, volume + 0.05))
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault()
      onVolumeChange(Math.max(0, volume - 0.05))
    } else if (e.key === 'Home') {
      e.preventDefault()
      onVolumeChange(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      onVolumeChange(1.0)
    } else if (e.key === 'm' || e.key === 'M') {
      e.preventDefault()
      if (onToggleMute) onToggleMute()
    }
  }

  return (
    <div 
      className="flex items-center gap-2 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Rotary Dial Container */}
      <div className="flex flex-col items-center">
        <div
          ref={knobRef}
          role="slider"
          tabIndex={0}
          aria-label="Master Volume Knob"
          aria-valuenow={displayPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
          onKeyDown={handleKeyDown}
          title={`Master Volume: ${displayPercentage}% (Drag circular or up/down, Click to mute)`}
          style={{ width: `${size}px`, height: `${size}px`, touchAction: 'none' }}
          className={`
            relative rounded-full cursor-grab active:cursor-grabbing select-none transition-shadow duration-150 outline-none
            ${isActive 
              ? 'shadow-[0_0_20px_rgba(0,229,255,0.7),0_0_35px_rgba(255,122,0,0.4)] ring-1 ring-cyan-400' 
              : isHovered 
                ? 'shadow-[0_0_15px_rgba(0,229,255,0.4)]' 
                : 'shadow-[0_4px_10px_rgba(0,0,0,0.8)]'
            }
          `}
        >
          {/* SVG LED Arc Gauge */}
          <svg
            className="absolute inset-0 pointer-events-none transform rotate-[135deg]"
            width={size}
            height={size}
          >
            {/* Background Gauge Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#1e2230"
              strokeWidth={strokeWidth}
              strokeDasharray={`${totalArcLength} ${circumference}`}
              strokeLinecap="round"
            />
            {/* Active Glowing LED Arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="url(#knobElectricGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={`${totalArcLength} ${circumference}`}
              strokeDashoffset={activeDashOffset}
              strokeLinecap="round"
              className="transition-[stroke-dashoffset] duration-75 ease-out"
              style={{
                filter: isMuted 
                  ? 'none' 
                  : 'drop-shadow(0 0 4px rgba(0,229,255,0.8)) drop-shadow(0 0 8px rgba(255,122,0,0.5))'
              }}
            />
            {/* SVG Gradient Definition */}
            <defs>
              <linearGradient id="knobElectricGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00e5ff" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#ff7a00" />
              </linearGradient>
            </defs>
          </svg>

          {/* Rotary Knob Machined Center Cap */}
          <div
            className={`
              absolute inset-[4.5px] rounded-full border border-zinc-700/80 flex items-center justify-center transition-transform duration-75 ease-out
              ${isMuted 
                ? 'bg-gradient-to-b from-zinc-800 to-zinc-950 opacity-60' 
                : 'bg-gradient-to-b from-[#2a2c35] via-[#1b1c22] to-[#101115]'
              }
            `}
            style={{
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.8)'
            }}
          >
            {/* Rotating Core with Pointer Line */}
            <div
              className="w-full h-full rounded-full relative flex items-center justify-center transition-transform duration-75 ease-out"
              style={{ transform: `rotate(${rotationAngle}deg)` }}
            >
              {/* Glowing Pointer Indicator Notch */}
              <div
                className={`
                  absolute top-1 w-[3px] h-[9px] rounded-full transition-all
                  ${isMuted 
                    ? 'bg-zinc-500 shadow-none' 
                    : effectiveVolume > 0.8
                      ? 'bg-orange-400 shadow-[0_0_8px_#ff7a00]'
                      : 'bg-cyan-300 shadow-[0_0_8px_#00e5ff]'
                  }
                `}
              />
              {/* Subtle Machined Center Rivet */}
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-600/50 shadow-inner" />
            </div>
          </div>
        </div>

        {/* Small Label Below Knob */}
        <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-400 uppercase mt-0.5">
          {label}
        </span>
      </div>

      {/* Volume Readout & Mute Toggle Pill */}
      <div className="flex flex-col items-start gap-0.5 min-w-[50px]">
        {/* Numeric Percentage / MUTE */}
        <div className="flex items-center gap-1 font-mono">
          <span 
            className={`text-xs font-black tracking-tight ${
              isMuted 
                ? 'text-red-400 font-bold' 
                : effectiveVolume > 0.8
                  ? 'text-orange-400'
                  : 'text-cyan-300'
            }`}
          >
            {isMuted ? 'MUTE' : `${displayPercentage}%`}
          </span>
        </div>

        {/* Quick Mute / Unmute Button */}
        {onToggleMute && (
          <button
            type="button"
            onClick={onToggleMute}
            className={`
              flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider transition-colors cursor-pointer border
              ${isMuted
                ? 'bg-red-950/80 text-red-300 border-red-700/60 shadow-[0_0_6px_rgba(239,68,68,0.4)]'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800'
              }
            `}
            title={isMuted ? 'Unmute Master Output' : 'Mute Master Output'}
          >
            {isMuted ? <VolumeX className="w-2.5 h-2.5 text-red-400" /> : <Volume2 className="w-2.5 h-2.5" />}
            <span>{isMuted ? 'OFF' : 'ON'}</span>
          </button>
        )}
      </div>
    </div>
  )
}
