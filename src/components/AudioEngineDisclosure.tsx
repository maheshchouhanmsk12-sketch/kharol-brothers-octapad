import React, { useRef, useState } from 'react'
import { PAD_CONFIGS } from '../data/padConfigs'
import { InstrumentId } from '../types/octapad'
import { Cpu, CheckCircle2, AlertCircle, Upload, Music, Volume2, ShieldCheck } from 'lucide-react'

interface AudioEngineDisclosureProps {
  isOpen: boolean
  onClose: () => void
  sampleStatus: Record<InstrumentId, { hasCustomSample: boolean }>
  onUploadSample: (padId: InstrumentId, file: File) => Promise<boolean>
}

export const AudioEngineDisclosure: React.FC<AudioEngineDisclosureProps> = ({
  isOpen,
  onClose,
  sampleStatus,
  onUploadSample
}) => {
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedPadForUpload, setSelectedPadForUpload] = useState<InstrumentId | null>(null)

  if (!isOpen) return null

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && selectedPadForUpload) {
      const ok = await onUploadSample(selectedPadForUpload, file)
      if (ok) {
        setUploadMessage(`Successfully loaded custom audio sample for ${selectedPadForUpload}!`)
        setTimeout(() => setUploadMessage(null), 3000)
      } else {
        setUploadMessage(`Failed to decode audio file. Please ensure it is a valid .wav or .mp3.`)
        setTimeout(() => setUploadMessage(null), 3500)
      }
    }
  }

  const triggerUpload = (padId: InstrumentId) => {
    setSelectedPadForUpload(padId)
    fileInputRef.current?.click()
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-stone-950 border border-amber-500/50 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-5 my-8 text-stone-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-ornate text-xl text-amber-200 flex items-center gap-2">
                <span>Audio Engine & Authentic Sample Architecture</span>
              </h2>
              <p className="text-xs text-stone-400">
                Transparent disclosure of acoustics, physical modeling & audio file mapping
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-white px-2.5 py-1 text-sm rounded-lg hover:bg-stone-900"
          >
            ✕
          </button>
        </div>

        {/* Upload feedback banner */}
        {uploadMessage && (
          <div className="p-3 bg-amber-950/80 border border-amber-500 rounded-xl text-xs text-amber-200 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>{uploadMessage}</span>
          </div>
        )}

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="audio/*,.wav,.mp3" 
          className="hidden" 
        />

        {/* Acoustic Synthesis Disclosure */}
        <div className="p-4 bg-stone-900/70 border border-amber-500/30 rounded-xl space-y-2 text-xs leading-relaxed">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Authentic Percussion Guarantee: No Generic Electronic Beeps</span>
          </div>
          <p className="text-stone-300">
            This instrument features a zero-latency dual-layer audio architecture designed specifically for Indian devotional music. When studio audio recordings are placed in <code className="text-amber-300 bg-stone-950 px-1.5 py-0.5 rounded">public/sounds/*.wav</code>, they are automatically decoded into memory.
          </p>
          <p className="text-stone-300">
            In absence of external audio assets, our <strong>Devotional Acoustic Physics Synthesizer</strong> activates:
          </p>
          <ul className="list-disc list-inside space-y-1 text-stone-400 pl-1">
            <li><strong>Dholak:</strong> Coupled dual-membrane physics with low wooden barrel thud + treble skin slap.</li>
            <li><strong>Tabla Na:</strong> Raman circular membrane Bessel-function harmonic modes (1.0x, 2.89x, 4.92x) capturing the singing metallic Syahi edge ring.</li>
            <li><strong>Tabla Ge:</strong> Modulating copper kettle Bayan bass with wrist glide and sub-bass resonance.</li>
            <li><strong>Manjira:</strong> Paired bronze cup-cymbals with acoustic phase beating and 2-second shimmer.</li>
            <li><strong>Kartal:</strong> Hardwood clacker impact transient coupled with rattling brass disc jingles.</li>
            <li><strong>Khanjari:</strong> Goat-skin frame drum slap coupled with snappy rim jingles.</li>
            <li><strong>Temple Ghanti:</strong> 6-tier harmonic series (Hum, Strike, Tierce, Quint, Octave) with sacred mandir sustain.</li>
            <li><strong>Sam Accent:</strong> Resonant bronze gong + devotional drum climax marking the first beat.</li>
          </ul>
        </div>

        {/* Per-Pad Sample Status & Custom Audio File Drop */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
            <span>Sound Source Status & Custom WAV Replacement</span>
            <span className="text-[11px] text-stone-400 font-normal">Drop or upload your own studio files</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {PAD_CONFIGS.map((pad) => {
              const hasCustom = sampleStatus[pad.id]?.hasCustomSample
              return (
                <div 
                  key={pad.id}
                  className="p-2.5 bg-stone-900/50 rounded-xl border border-stone-800 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{pad.icon}</span>
                    <div>
                      <div className="font-bold text-amber-200">
                        {pad.name} <span className="font-ornate text-stone-400">({pad.hindiName})</span>
                      </div>
                      <div className="text-[10px] text-stone-400 font-mono">
                        {pad.id === 'manjira' ? '/sounds/garba_loop.mp3' :
                         pad.id === 'temple_ghanti' ? '/sounds/dholak_matka.m4a' :
                         pad.id === 'sam_accent' ? '/sounds/dhol_thali.m4a' :
                         `/sounds/${pad.id}.wav`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      hasCustom 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50' 
                        : 'bg-amber-950/60 text-amber-300 border border-amber-600/40'
                    }`}>
                      {hasCustom ? 'Studio Sample' : 'Physical Model'}
                    </span>
                    <button
                      onClick={() => triggerUpload(pad.id)}
                      title={`Upload custom studio WAV/MP3 for ${pad.name}`}
                      className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-200 border border-stone-700"
                    >
                      <Upload className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span>Web Audio API • 48kHz / 24-bit dynamic range</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg transition-colors shadow-md"
          >
            Close & Play
          </button>
        </div>

      </div>
    </div>
  )
}
