import React from 'react'

export const BrandHeader: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center select-none pt-4 pb-2 z-20 relative">
      {/* Golden Crown Icon */}
      <div className="relative mb-0.5 animate-bounce-subtle">
        <svg
          viewBox="0 0 48 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-8 sm:w-12 sm:h-9 filter drop-shadow-[0_0_12px_rgba(251,191,36,0.85)]"
        >
          <path
            d="M4 30H44V34H4V30ZM6 26L2 10L14 18L24 4L34 18L46 10L42 26H6Z"
            fill="url(#crownGradient)"
            stroke="#fef3c7"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="2" cy="8" r="2.5" fill="#fef08a" />
          <circle cx="24" cy="3" r="3" fill="#fef08a" />
          <circle cx="46" cy="8" r="2.5" fill="#fef08a" />
          <defs>
            <linearGradient id="crownGradient" x1="2" y1="4" x2="46" y2="34" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fef08a" />
              <stop offset="0.4" stopColor="#f59e0b" />
              <stop offset="1" stopColor="#ea580c" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* "Kharol Brothers" Brushed Script Typography */}
      <h1 
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl kharol-brothers-brand-title font-normal tracking-wider leading-tight -rotate-1 select-none"
      >
        Kharol Brothers
      </h1>

      {/* "OCTAPAD" Giant 3D Beveled Neon Gradient Typography */}
      <div className="relative my-0.5 sm:my-1">
        <h2 
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-wider uppercase font-orbitron octapad-title-gradient leading-none"
          style={{
            fontFamily: "'Orbitron', 'Montserrat', sans-serif",
            letterSpacing: '0.04em'
          }}
        >
          OCTAPAD
        </h2>
      </div>

      {/* Tagline */}
      <p 
        className="text-[10px] sm:text-xs md:text-sm font-bold uppercase text-white/95 tracking-[0.28em] sm:tracking-[0.35em] mt-1 drop-shadow-md font-sans"
      >
        PLAY &bull; CREATE &bull; FEEL THE BEAT
      </p>
    </div>
  )
}

