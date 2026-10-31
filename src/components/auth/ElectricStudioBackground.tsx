import React, { useEffect, useState } from 'react'

export const ElectricStudioBackground: React.FC = () => {
  // Staggered equalizer bars state for realistic studio audio reaction
  const [eqHeights, setEqHeights] = useState<number[]>([45, 75, 30, 90, 60, 85, 40, 70, 95, 50, 80, 35])

  useEffect(() => {
    const interval = setInterval(() => {
      setEqHeights(prev =>
        prev.map(() => Math.floor(Math.random() * 75) + 20)
      )
    }, 180)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Deep Midnight Navy / Studio Gradient Canvas */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 90% 60% at 50% 25%, #0f1533 0%, #080b1c 45%, #04050b 100%)'
        }}
      />

      {/* 2. Studio Acoustic Grid & Ceiling Racks */}
      <div 
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* 3. Ambient Neon Glow Orbs (Cyan on Left, Magenta & Orange on Right) */}
      <div className="absolute top-1/4 -left-24 w-96 h-96 rounded-full bg-cyan-500/15 blur-[120px]" />
      <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-pink-500/15 blur-[120px]" />
      <div className="absolute bottom-10 left-1/4 w-[500px] h-48 bg-orange-500/15 blur-[100px]" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-64 bg-blue-600/10 blur-[130px]" />

      {/* 4. Left Studio Monitor with Animated Audio Waveform & Equalizer */}
      <div className="hidden lg:block absolute left-3 top-32 w-72 h-44 rounded-xl bg-[#090c1a]/90 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,229,255,0.25)] p-3 overflow-hidden backdrop-blur-sm -rotate-3">
        <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 pb-1.5 border-b border-cyan-500/20">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            STUDIO MONITOR L
          </span>
          <span>96 kHz / 24-bit</span>
        </div>

        {/* Dynamic Sine Waveform SVG */}
        <div className="h-20 flex items-center justify-center my-1 relative">
          <svg viewBox="0 0 300 60" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="waveGradL" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#00e5ff" stopOpacity="1" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            {/* Center glow line */}
            <path
              d="M 0,30 Q 30,5 60,30 T 120,30 T 180,30 T 240,30 T 300,30"
              fill="none"
              stroke="url(#waveGradL)"
              strokeWidth="3"
              className="animate-pulse"
            />
            {/* High frequency audio peaks */}
            <path
              d="M 0,30 Q 15,10 30,30 T 60,15 T 90,45 T 120,5 T 150,55 T 180,10 T 210,50 T 240,20 T 270,40 T 300,30"
              fill="none"
              stroke="#00e5ff"
              strokeWidth="1.5"
              strokeOpacity="0.9"
            />
          </svg>
        </div>

        {/* Mini Equalizer Bars */}
        <div className="flex items-end justify-between gap-1 h-6 px-1">
          {eqHeights.slice(0, 10).map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-cyan-600 via-cyan-400 to-pink-500 rounded-t-sm transition-all duration-150"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* 5. Right Studio Monitor with Equalizer Spectrum */}
      <div className="hidden lg:block absolute right-3 top-32 w-72 h-44 rounded-xl bg-[#090c1a]/90 border border-pink-500/30 shadow-[0_0_30px_rgba(236,72,153,0.25)] p-3 overflow-hidden backdrop-blur-sm rotate-3">
        <div className="flex items-center justify-between text-[10px] font-mono text-pink-300 pb-1.5 border-b border-pink-500/20">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
            STUDIO MONITOR R
          </span>
          <span>BPM: 128 &bull; SYNC</span>
        </div>

        {/* Dynamic Waveform SVG */}
        <div className="h-20 flex items-center justify-center my-1 relative">
          <svg viewBox="0 0 300 60" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="waveGradR" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#ec4899" stopOpacity="1" />
                <stop offset="100%" stopColor="#ff7a00" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <path
              d="M 0,30 Q 25,48 50,30 T 100,10 T 150,50 T 200,12 T 250,45 T 300,30"
              fill="none"
              stroke="url(#waveGradR)"
              strokeWidth="2.5"
            />
            <path
              d="M 0,30 Q 30,55 60,30 T 120,30 T 180,30 T 240,30 T 300,30"
              fill="none"
              stroke="#ec4899"
              strokeWidth="1.5"
              strokeOpacity="0.75"
            />
          </svg>
        </div>

        {/* Equalizer Spectrum */}
        <div className="flex items-end justify-between gap-1 h-6 px-1">
          {eqHeights.slice(2, 12).map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-pink-600 via-purple-400 to-cyan-400 rounded-t-sm transition-all duration-150"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* 6. Realistic 3D Electronic Octapad Machine on Studio Desk */}
      <div className="hidden md:block absolute left-4 lg:left-12 bottom-12 w-[340px] lg:w-[400px] h-[260px] lg:h-[300px] pointer-events-none transform -rotate-6 perspective-[1000px] opacity-85 hover:opacity-100 transition-opacity">
        {/* Octapad Outer Molded Black Hardware Chassis */}
        <div className="w-full h-full rounded-2xl bg-gradient-to-b from-[#1e2230] via-[#11131c] to-[#0a0c14] p-3 border-2 border-zinc-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(0,229,255,0.25)] flex flex-col justify-between relative">
          
          {/* Hardware Header Strip: Display + Volume knobs + LEDs */}
          <div className="h-9 bg-[#0b0d18] rounded-lg border border-zinc-800 flex items-center justify-between px-3">
            {/* Small hardware knobs */}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-600 shadow-inner flex items-center justify-center">
                <div className="w-1 h-1.5 bg-cyan-400 rounded-full" />
              </div>
              <div className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-600 shadow-inner flex items-center justify-center">
                <div className="w-1 h-1.5 bg-pink-400 rounded-full" />
              </div>
            </div>

            {/* Cyan LCD screen */}
            <div className="px-3 py-0.5 rounded bg-[#031526] border border-cyan-500/50 text-[9px] font-mono text-cyan-300 font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]">
              KHAROL &bull; KIT 01
            </div>

            {/* LED meters */}
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_6px_#ef4444]" />
            </div>
          </div>

          {/* 8 Glowing Rubber Pads Grid (2 Rows x 4 Columns) */}
          <div className="grid grid-cols-4 gap-2 my-2 flex-1">
            {/* Pad 1: Vibrant Orange */}
            <div className="rounded-lg bg-[#181a24] border-2 border-orange-500/70 p-1 flex flex-col justify-between shadow-[0_0_18px_rgba(255,107,0,0.5),inset_0_0_12px_rgba(255,107,0,0.3)] animate-pulse">
              <span className="text-[7px] font-mono text-orange-300 font-bold">PAD 1</span>
              <div className="w-2 h-2 rounded-full bg-orange-400 self-end shadow-[0_0_6px_#ff6b00]" />
            </div>

            {/* Pad 2: Neon Magenta */}
            <div className="rounded-lg bg-[#181a24] border-2 border-pink-500/70 p-1 flex flex-col justify-between shadow-[0_0_18px_rgba(236,72,153,0.5),inset_0_0_12px_rgba(236,72,153,0.3)]">
              <span className="text-[7px] font-mono text-pink-300 font-bold">PAD 2</span>
              <div className="w-2 h-2 rounded-full bg-pink-400 self-end shadow-[0_0_6px_#ec4899]" />
            </div>

            {/* Pad 3: Electric Purple */}
            <div className="rounded-lg bg-[#181a24] border-2 border-purple-500/70 p-1 flex flex-col justify-between shadow-[0_0_18px_rgba(168,85,247,0.5),inset_0_0_12px_rgba(168,85,247,0.3)]">
              <span className="text-[7px] font-mono text-purple-300 font-bold">PAD 3</span>
              <div className="w-2 h-2 rounded-full bg-purple-400 self-end shadow-[0_0_6px_#a855f7]" />
            </div>

            {/* Pad 4: Electric Cyan */}
            <div className="rounded-lg bg-[#181a24] border-2 border-cyan-500/80 p-1 flex flex-col justify-between shadow-[0_0_22px_rgba(0,229,255,0.6),inset_0_0_12px_rgba(0,229,255,0.35)] animate-pulse">
              <span className="text-[7px] font-mono text-cyan-300 font-bold">PAD 4</span>
              <div className="w-2 h-2 rounded-full bg-cyan-400 self-end shadow-[0_0_8px_#00e5ff]" />
            </div>

            {/* Pad 5: Deep Blue */}
            <div className="rounded-lg bg-[#181a24] border-2 border-blue-500/70 p-1 flex flex-col justify-between shadow-[0_0_18px_rgba(59,130,246,0.5),inset_0_0_12px_rgba(59,130,246,0.3)]">
              <span className="text-[7px] font-mono text-blue-300 font-bold">PAD 5</span>
              <div className="w-2 h-2 rounded-full bg-blue-400 self-end shadow-[0_0_6px_#3b82f6]" />
            </div>

            {/* Pad 6: Hot Pink */}
            <div className="rounded-lg bg-[#181a24] border-2 border-rose-500/70 p-1 flex flex-col justify-between shadow-[0_0_18px_rgba(244,63,94,0.5),inset_0_0_12px_rgba(244,63,94,0.3)]">
              <span className="text-[7px] font-mono text-rose-300 font-bold">PAD 6</span>
              <div className="w-2 h-2 rounded-full bg-rose-400 self-end shadow-[0_0_6px_#f43f5e]" />
            </div>

            {/* Pad 7: Warm Amber */}
            <div className="rounded-lg bg-[#181a24] border-2 border-amber-500/70 p-1 flex flex-col justify-between shadow-[0_0_18px_rgba(245,158,11,0.5),inset_0_0_12px_rgba(245,158,11,0.3)]">
              <span className="text-[7px] font-mono text-amber-300 font-bold">PAD 7</span>
              <div className="w-2 h-2 rounded-full bg-amber-400 self-end shadow-[0_0_6px_#f59e0b]" />
            </div>

            {/* Pad 8: Electric Aqua */}
            <div className="rounded-lg bg-[#181a24] border-2 border-cyan-400/80 p-1 flex flex-col justify-between shadow-[0_0_20px_rgba(6,182,212,0.6),inset_0_0_12px_rgba(6,182,212,0.35)] animate-pulse">
              <span className="text-[7px] font-mono text-cyan-200 font-bold">PAD 8</span>
              <div className="w-2 h-2 rounded-full bg-cyan-300 self-end shadow-[0_0_8px_#06b6d4]" />
            </div>
          </div>

          {/* Lower Hardware Bevel with Silkscreened "OCTAPAD" Logo */}
          <div className="flex items-center justify-between pt-1 border-t border-zinc-800 text-[10px] font-mono font-bold">
            <span className="text-zinc-500 tracking-wider">ELECTRONIC PERCUSSION</span>
            <span className="text-zinc-300 tracking-[0.2em] font-orbitron font-extrabold text-xs text-white">
              OCTAPAD
            </span>
          </div>
        </div>

        {/* Desk Under-Reflection */}
        <div className="w-full h-8 bg-gradient-to-b from-cyan-500/20 to-transparent blur-md -mt-2 rounded-full" />
      </div>

      {/* 7. Polished Studio Desk Surface & Laser Orange Reflection */}
      <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-black via-[#060812] to-transparent pointer-events-none">
        {/* Laser Orange Streak from Reference Image */}
        <div className="absolute bottom-16 left-0 w-2/3 h-1.5 neon-orange-streak" />
        <div className="absolute bottom-14 left-1/4 w-1/3 h-1 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent blur-sm" />
      </div>

      {/* 8. Tropical Studio Palm Leaves Silhouettes (Corners) with Neon Rim Light */}
      <div className="absolute -left-10 top-20 w-44 h-80 opacity-40 pointer-events-none filter drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]">
        <svg viewBox="0 0 100 200" fill="none" className="w-full h-full text-emerald-950">
          <path
            d="M10 180 C 30 140, 50 100, 20 40 C 60 70, 80 120, 90 190 Z"
            fill="currentColor"
            stroke="#00e5ff"
            strokeWidth="0.8"
            strokeOpacity="0.6"
          />
          <path
            d="M5 190 C 40 160, 70 110, 45 20 C 75 60, 95 130, 85 200 Z"
            fill="currentColor"
            stroke="#a855f7"
            strokeWidth="0.8"
            strokeOpacity="0.5"
          />
        </svg>
      </div>

      {/* 9. Top-Right Callout Script: "Music Connects Us" */}
      <div className="hidden sm:block absolute right-6 sm:right-12 top-6 sm:top-10 text-right z-10 rotate-6">
        <div 
          className="text-2xl sm:text-3xl md:text-4xl neon-script-pink font-bold drop-shadow-[0_0_15px_rgba(255,51,153,0.85)]"
          style={{ fontFamily: "'Kaushan Script', 'Caveat', cursive" }}
        >
          Music
        </div>
        <div 
          className="text-xl sm:text-2xl md:text-3xl neon-script-orange font-bold -mt-1 drop-shadow-[0_0_15px_rgba(255,153,51,0.85)]"
          style={{ fontFamily: "'Kaushan Script', 'Caveat', cursive" }}
        >
          Connects Us
        </div>
      </div>

      {/* 10. Bottom-Left Callout Script: "Beats Make Life Better" */}
      <div className="hidden sm:block absolute left-6 sm:left-10 bottom-6 sm:bottom-8 z-10 -rotate-3">
        <div 
          className="text-2xl sm:text-3xl md:text-4xl text-white font-bold drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]"
          style={{ fontFamily: "'Permanent Marker', 'Kaushan Script', cursive" }}
        >
          Beats
        </div>
        <div 
          className="text-xl sm:text-2xl md:text-3xl text-zinc-100 font-bold -mt-1"
          style={{ fontFamily: "'Permanent Marker', 'Kaushan Script', cursive" }}
        >
          Make Life
        </div>
        <div 
          className="text-2xl sm:text-3xl md:text-4xl text-amber-400 font-bold -mt-1 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] relative inline-block"
          style={{ fontFamily: "'Permanent Marker', 'Kaushan Script', cursive" }}
        >
          Better
          {/* Orange brush underline */}
          <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-amber-400 to-transparent rounded-full mt-0.5" />
        </div>
      </div>

    </div>
  )
}

