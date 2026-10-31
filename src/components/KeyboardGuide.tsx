import React from 'react'
import { PAD_CONFIGS } from '../data/padConfigs'
import { Keyboard, X } from 'lucide-react'

interface KeyboardGuideProps {
  isOpen: boolean
  onClose: () => void
  activeKeys: Set<string>
}

export const KeyboardGuide: React.FC<KeyboardGuideProps> = ({
  isOpen,
  onClose,
  activeKeys
}) => {
  if (!isOpen) return null

  const keysRow1 = [
    { key: 'A', id: 'dholak', name: 'Dholak', hindi: 'ढोलक' },
    { key: 'S', id: 'tabla_na', name: 'Tabla Na', hindi: 'तबला ना' },
    { key: 'D', id: 'tabla_ge', name: 'Tabla Ge', hindi: 'तबला घे' },
    { key: 'F', id: 'manjira', name: 'Garba Loop', hindi: 'गरबा लूप' },
  ]

  const keysRow2 = [
    { key: 'J', id: 'kartal', name: 'Kartal', hindi: 'करताल' },
    { key: 'K', id: 'khanjari', name: 'Khanjari', hindi: 'खंजरी' },
    { key: 'L', id: 'temple_ghanti', name: 'Dholak Matka', hindi: 'मटका ढोलक' },
  ]

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-stone-950 border border-amber-600/50 rounded-2xl w-full max-w-xl p-5 shadow-2xl space-y-4 text-stone-200"
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-amber-400" />
            <h3 className="font-ornate text-lg text-amber-200">
              Devotional Keyboard Performance Guide
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed">
          Play with both hands effortlessly like a real concert octapad! 
          Left hand controls the rhythmic drums and manjira, while right hand controls clappers, khanjari, temple bells, and thumb anchors the climax <strong>Sam</strong>.
        </p>

        {/* Keyboard layout visual map */}
        <div className="space-y-3 bg-stone-900/60 p-4 rounded-xl border border-stone-800">
          
          {/* Left Hand Cluster & Right Hand Cluster */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Left Hand: A, S, D, F */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                Left Hand (Bayaan / Bass & Ring)
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {keysRow1.map((k) => {
                  const isStruck = activeKeys.has(k.key.toLowerCase()) || activeKeys.has(k.key)
                  return (
                    <div
                      key={k.key}
                      className={`
                        flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all
                        ${isStruck 
                          ? 'bg-amber-400 text-stone-950 border-amber-300 scale-105 shadow-glow-gold font-bold' 
                          : 'bg-stone-950 text-amber-200 border-amber-500/30'
                        }
                      `}
                    >
                      <span className="font-mono text-base font-black">{k.key}</span>
                      <span className="text-[9px] font-ornate truncate mt-0.5">{k.hindi}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right Hand: J, K, L */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                Right Hand (Accents & Chimes)
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {keysRow2.map((k) => {
                  const isStruck = activeKeys.has(k.key.toLowerCase()) || activeKeys.has(k.key)
                  return (
                    <div
                      key={k.key}
                      className={`
                        flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all
                        ${isStruck 
                          ? 'bg-amber-400 text-stone-950 border-amber-300 scale-105 shadow-glow-gold font-bold' 
                          : 'bg-stone-950 text-amber-200 border-amber-500/30'
                        }
                      `}
                    >
                      <span className="font-mono text-base font-black">{k.key}</span>
                      <span className="text-[9px] font-ornate truncate mt-0.5">{k.hindi}</span>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>

          {/* Space Bar: Sam Accent */}
          <div className="pt-2">
            <div
              className={`
                w-full py-2.5 px-4 rounded-xl border text-center transition-all flex items-center justify-center gap-3
                ${activeKeys.has(' ') || activeKeys.has('space')
                  ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 border-white scale-[1.02] shadow-glow-gold font-bold' 
                  : 'bg-stone-950 text-amber-200 border-amber-500/40'
                }
              `}
            >
              <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-stone-900/40 border border-amber-500/30">
                SPACEBAR
              </span>
              <span className="font-ornate text-sm font-bold">ढोल-थाली ट्रेक (Dhol-Thali Track)</span>
              <span className="text-[11px] opacity-75 hidden sm:inline">• Thumb Trigger</span>
            </div>
          </div>

        </div>

        <div className="bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-orange-500/10 p-3 rounded-xl border border-cyan-500/30 text-[11px] space-y-1.5">
          <div className="font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
            <span>⚡</span> Dynamic Velocity Strike Sensor (गति व प्रहार सेंसर)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
            <div className="bg-black/40 p-2 rounded border border-cyan-500/30">
              <span className="text-cyan-300 font-bold block mb-0.5">🟢 SOFT TAP (धीमी आवाज़)</span>
              <span><strong>Alt / Ctrl + Key</strong> or tap <strong>Top Rim</strong> of pad</span>
            </div>
            <div className="bg-black/40 p-2 rounded border border-amber-500/30">
              <span className="text-amber-300 font-bold block mb-0.5">🟡 MEDIUM HIT (सामान्य)</span>
              <span><strong>Key Press</strong> or tap <strong>Center Sweet Spot</strong></span>
            </div>
            <div className="bg-black/40 p-2 rounded border border-orange-500/40">
              <span className="text-orange-300 font-bold block mb-0.5">🔴 HARD STRIKE (तेज़ आवाज़)</span>
              <span><strong>Shift + Key</strong> or strike <strong>Bottom Accent</strong></span>
            </div>
          </div>
        </div>

        <div className="text-stone-400 text-[11px] space-y-1">
          <p>• Rapid consecutive strikes, pressure touches, and drum rolls are fully supported.</p>
          <p>• Spacebar scrolling is disabled while playing percussion so your viewport stays locked.</p>
          <p>• Shortcuts automatically bypass when typing in search or name inputs.</p>
        </div>

        <div className="text-right pt-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  )
}
