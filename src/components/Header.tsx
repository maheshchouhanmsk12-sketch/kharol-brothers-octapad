import React from 'react'
import { PresetMode, PresetDetails } from '../types/octapad'
import { Volume2, VolumeX, Sparkles, HelpCircle, Music2, Cpu } from 'lucide-react'
import { RotaryVolumeKnob } from './RotaryVolumeKnob'

interface HeaderProps {
  currentPreset: PresetMode
  presets: Record<PresetMode, PresetDetails>
  onSelectPreset: (mode: PresetMode) => void
  masterVolume: number
  isMuted: boolean
  onMasterVolumeChange: (vol: number) => void
  onToggleMute: () => void
  onOpenEngineInfo: () => void
  onToggleKeyboardGuide: () => void
  showKeyboardGuide: boolean
}

export const Header: React.FC<HeaderProps> = ({
  currentPreset,
  presets,
  onSelectPreset,
  masterVolume,
  isMuted,
  onMasterVolumeChange,
  onToggleMute,
  onOpenEngineInfo,
  onToggleKeyboardGuide,
  showKeyboardGuide
}) => {
  return (
    <header className="w-full bg-stone-950/80 border-b border-amber-600/30 backdrop-blur-md px-4 sm:px-6 py-3 sticky top-0 z-40 shadow-temple">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Title and Devotional Brand */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-800 p-0.5 shadow-glow-gold flex items-center justify-center">
            <div className="w-full h-full bg-stone-950 rounded-[14px] flex items-center justify-center text-amber-300 font-ornate text-2xl">
              🕉️
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-ornate text-xl sm:text-2xl text-amber-200 tracking-wide drop-shadow-md">
                भजन & सुन्दरकाण्ड
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                Octapad
              </span>
            </div>
            <p className="text-xs text-stone-400 font-sans tracking-wide">
              Authentic Devotional Percussion • 8-Pad Sacred Instrument
            </p>
          </div>
        </div>

        {/* Mode Presets: Bhajan, Sundarkand, Aarti */}
        <div className="flex flex-wrap items-center justify-center gap-2 bg-stone-900/90 p-1.5 rounded-xl border border-amber-500/20 shadow-inner">
          <span className="text-[11px] font-mono text-amber-400/80 uppercase px-2 font-semibold hidden sm:inline">
            Sangat Modes:
          </span>
          {(['bhajan', 'sundarkand', 'aarti'] as PresetMode[]).map((mode) => {
            const p = presets[mode]
            const isActive = currentPreset === mode
            return (
              <button
                key={mode}
                onClick={() => onSelectPreset(mode)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5
                  ${isActive
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold shadow-md shadow-amber-900/40 border border-amber-400'
                    : 'bg-stone-950/60 text-stone-300 hover:text-amber-200 hover:bg-stone-800/80 border border-stone-800'
                  }
                `}
                title={`${p.name} - ${p.tagline} (Sets suggested balance & tempo, no auto backing beats)`}
              >
                <Sparkles className={`w-3 h-3 ${isActive ? 'text-amber-200 animate-spin' : 'text-amber-500'}`} />
                <span className="font-ornate text-sm">{p.hindiName}</span>
                <span className="hidden lg:inline text-[11px] opacity-80">({p.name})</span>
              </button>
            )
          })}
        </div>

        {/* Right Controls: Master Volume, Engine Info, Key Guide */}
        <div className="flex items-center gap-3">
          
          {/* Rotary Master Volume Knob */}
          <div className="flex items-center px-2 py-1 rounded-xl bg-stone-900/80 border border-stone-800">
            <RotaryVolumeKnob
              volume={masterVolume}
              isMuted={isMuted}
              onVolumeChange={onMasterVolumeChange}
              onToggleMute={onToggleMute}
              size={46}
              label="MASTER"
            />
          </div>

          {/* Sound Engine Status Button */}
          <button
            onClick={onOpenEngineInfo}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 rounded-xl border border-amber-600/40 text-xs transition-colors"
            title="Audio Engine & Sample Status (Authentic Physical Synthesis + Custom Sample Loader)"
          >
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Engine</span>
          </button>

          {/* Keyboard Layout Guide Toggle */}
          <button
            onClick={onToggleKeyboardGuide}
            className={`p-2 rounded-xl border transition-colors ${
              showKeyboardGuide
                ? 'bg-amber-500 text-stone-950 border-amber-400'
                : 'bg-stone-900/80 text-stone-300 border-stone-800 hover:text-amber-200 hover:border-amber-500/40'
            }`}
            title="Show Keyboard Playing Shortcuts"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  )
}
