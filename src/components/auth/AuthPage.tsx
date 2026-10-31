import React, { useState } from 'react'
import { ElectricStudioBackground } from './ElectricStudioBackground'
import { BrandHeader } from './BrandHeader'
import { SignupCard } from './SignupCard'
import { LoginCard } from './LoginCard'
import { FeaturePills } from './FeaturePills'
import { ForgotPasswordModal } from './ForgotPasswordModal'

interface AuthPageProps {
  initialMode?: 'login' | 'signup'
  onAuthSuccess: () => void
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'signup',
  onAuthSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false)

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden text-white font-sans selection:bg-cyan-500 selection:text-black">
      {/* Dynamic Electric Music Studio Atmosphere Background */}
      <ElectricStudioBackground />

      {/* Main Content Area */}
      <div className="w-full flex-1 flex flex-col items-center justify-center px-4 py-6 z-10">
        
        {/* Top Branding Section */}
        <BrandHeader />

        {/* View Mode Toggle Switch (Create Account or Login) */}
        <div className="flex items-center gap-2 my-3 p-1 rounded-full bg-slate-950/80 border border-zinc-800 backdrop-blur-md shadow-lg z-20">
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Login
          </button>
        </div>

        {/* Floating Glassmorphism Auth Card */}
        <div className="w-full my-1">
          {mode === 'signup' ? (
            <SignupCard
              onSwitchToLogin={() => setMode('login')}
              onAuthSuccess={onAuthSuccess}
            />
          ) : (
            <LoginCard
              onSwitchToSignup={() => setMode('signup')}
              onOpenForgotPassword={() => setIsForgotModalOpen(true)}
              onAuthSuccess={onAuthSuccess}
            />
          )}
        </div>

      </div>

      {/* 4 Bottom Features matching Reference Image */}
      <FeaturePills />

      {/* Forgot Password Modal (No OTP) */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        onSuccess={() => setMode('login')}
      />
    </div>
  )
}

