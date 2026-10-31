import React from 'react'
import { Music, LayoutGrid, Activity, Zap } from 'lucide-react'

interface FeatureItem {
  icon: React.ReactNode
  title: string
  subtitle: string
}

const FEATURES: FeatureItem[] = [
  {
    icon: <Music className="w-4 h-4 text-cyan-300" />,
    title: 'Touch Play',
    subtitle: 'Octapad'
  },
  {
    icon: <LayoutGrid className="w-4 h-4 text-cyan-300" />,
    title: 'Keyboard',
    subtitle: 'Control'
  },
  {
    icon: <Activity className="w-4 h-4 text-cyan-300" />,
    title: 'Realistic',
    subtitle: 'Sounds'
  },
  {
    icon: <Zap className="w-4 h-4 text-cyan-300" />,
    title: 'Fast &',
    subtitle: 'Responsive'
  }
]

export const FeaturePills: React.FC = () => {
  return (
    <div className="w-full max-w-xl mx-auto pt-5 pb-6 px-4 z-20 relative">
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {FEATURES.map((feat, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center text-center group cursor-default transition-transform duration-200 hover:-translate-y-0.5"
          >
            {/* Circle Icon Badge */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#0a0f24]/90 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.25)] group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(0,229,255,0.45)] transition-all">
              {feat.icon}
            </div>
            {/* Title & Subtitle */}
            <div className="mt-1.5 text-[10px] sm:text-[11px] leading-tight font-medium text-zinc-300 group-hover:text-white transition-colors">
              <div>{feat.title}</div>
              <div className="text-zinc-400 text-[9px] sm:text-[10px]">{feat.subtitle}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

