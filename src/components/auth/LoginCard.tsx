import React, { useState } from 'react'
import { Phone, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { authService, validateMobileNumber } from '../../services/authService'

interface LoginCardProps {
  onSwitchToSignup: () => void
  onOpenForgotPassword: () => void
  onAuthSuccess: () => void
}

export const LoginCard: React.FC<LoginCardProps> = ({
  onSwitchToSignup,
  onOpenForgotPassword,
  onAuthSuccess
}) => {
  const [mobileNumber, setMobileNumber] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
    setMobileNumber(val)
    if (errorMessage) setErrorMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    const mobCheck = validateMobileNumber(mobileNumber)
    if (!mobCheck.isValid) {
      setErrorMessage(mobCheck.error || 'Please enter a valid 10-digit mobile number')
      return
    }

    if (!password) {
      setErrorMessage('Please enter your password')
      return
    }

    setIsLoading(true)
    try {
      const res = await authService.login(mobileNumber, password, rememberMe)
      if (res.success) {
        setSuccessMessage(res.message || 'Login successful! Entering Octapad...')
        setTimeout(() => {
          onAuthSuccess()
        }, 600)
      } else {
        setErrorMessage(res.error || 'Login failed. Please verify credentials.')
      }
    } catch {
      setErrorMessage('Network error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[440px] sm:max-w-[460px] mx-auto neon-glass-card p-6 sm:p-8 z-20 relative animate-fadeIn">
      {/* Top Header Kicker */}
      <div className="text-[10px] sm:text-[11px] font-mono tracking-[0.25em] uppercase text-cyan-400 font-bold mb-1">
        WELCOME BACK
      </div>

      {/* Main Heading */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
        <span>Login to</span>
        <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
          Your Account
        </span>
      </h2>

      {/* Subtitle */}
      <p className="text-xs sm:text-[13px] text-zinc-300/90 font-sans mt-1.5 mb-5 leading-relaxed">
        Continue your musical journey with Kharol Brothers Octapad.
      </p>

      {/* Alert Banners */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-500/50 flex items-start gap-2.5 text-xs text-red-200 animate-shake">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 flex items-start gap-2.5 text-xs text-emerald-200 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        
        {/* Field 1: Mobile Number */}
        <div className="space-y-1">
          <div className="bg-[#080b18]/90 border border-zinc-700/70 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,229,255,0.3)] rounded-2xl px-4 py-2 transition-all">
            <span className="block text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
              Mobile Number
            </span>
            <div className="flex items-center gap-2.5 mt-0.5">
              <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-xs font-mono text-zinc-400 select-none">+91</span>
              <input
                type="tel"
                value={mobileNumber}
                onChange={handleMobileChange}
                placeholder="Enter your 10 digit mobile number"
                className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none font-sans"
                autoComplete="tel"
                required
              />
              {mobileNumber.length === 10 && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
            </div>
          </div>
        </div>

        {/* Field 2: Password */}
        <div className="space-y-1">
          <div className="bg-[#080b18]/90 border border-zinc-700/70 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,229,255,0.3)] rounded-2xl px-4 py-2 transition-all">
            <span className="block text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
              Password
            </span>
            <div className="flex items-center gap-2.5 mt-0.5">
              <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errorMessage) setErrorMessage(null)
                }}
                placeholder="Enter your password"
                className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none font-sans"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-zinc-400 hover:text-cyan-300 transition-colors p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Remember Me & Forgot Password Row */}
        <div className="flex items-center justify-between text-xs pt-1 px-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-300 hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-[#080b18] cursor-pointer accent-cyan-400"
            />
            <span className="text-[12px] font-medium">Remember Me</span>
          </label>

          <button
            type="button"
            onClick={onOpenForgotPassword}
            className="text-cyan-400 hover:text-cyan-300 text-[12px] font-medium hover:underline transition-colors cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm tracking-wide text-white uppercase neon-gradient-btn flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Login</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

      </form>

      {/* Switch to Signup Link */}
      <div className="mt-5 text-center text-xs text-zinc-400">
        <span>Don't have an account? </span>
        <button
          onClick={onSwitchToSignup}
          type="button"
          className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline transition-colors cursor-pointer"
        >
          Create Account
        </button>
      </div>
    </div>
  )
}

