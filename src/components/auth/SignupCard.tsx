import React, { useState } from 'react'
import { Phone, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { authService, validateMobileNumber, validatePassword } from '../../services/authService'

interface SignupCardProps {
  onSwitchToLogin: () => void
  onAuthSuccess: () => void
}

export const SignupCard: React.FC<SignupCardProps> = ({
  onSwitchToLogin,
  onAuthSuccess
}) => {
  const [mobileNumber, setMobileNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only accept numeric digits up to 10
    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
    setMobileNumber(val)
    if (errorMessage) setErrorMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    // 1. Mobile validation
    const mobCheck = validateMobileNumber(mobileNumber)
    if (!mobCheck.isValid) {
      setErrorMessage(mobCheck.error || 'Please enter a valid 10-digit mobile number')
      return
    }

    // 2. Password validation
    const passCheck = validatePassword(password)
    if (!passCheck.isValid) {
      setErrorMessage(passCheck.error || 'Password must be at least 6 characters')
      return
    }

    // 3. Confirm password match
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify and re-type.')
      return
    }

    setIsLoading(true)
    try {
      const res = await authService.signup(mobileNumber, password, confirmPassword)
      if (res.success) {
        setSuccessMessage(res.message || 'Account created successfully! Welcome!')
        setTimeout(() => {
          onAuthSuccess()
        }, 800)
      } else {
        setErrorMessage(res.error || 'Failed to create account. Please try again.')
      }
    } catch {
      setErrorMessage('A network error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[440px] sm:max-w-[460px] mx-auto neon-glass-card p-6 sm:p-8 z-20 relative animate-fadeIn">
      {/* Top Header Kicker */}
      <div className="text-[10px] sm:text-[11px] font-mono tracking-[0.25em] uppercase text-cyan-400 font-bold mb-1">
        JOIN OUR MUSIC COMMUNITY
      </div>

      {/* Main Heading */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
        <span>Create</span>
        <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
          Account
        </span>
      </h2>

      {/* Subtitle */}
      <p className="text-xs sm:text-[13px] text-zinc-300/90 font-sans mt-1.5 mb-5 leading-relaxed">
        Start your musical journey with Kharol Brothers Octapad. Create your account and feel the beat!
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
                placeholder="Create a strong password"
                className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none font-sans"
                autoComplete="new-password"
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

        {/* Field 3: Confirm Password */}
        <div className="space-y-1">
          <div className="bg-[#080b18]/90 border border-zinc-700/70 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,229,255,0.3)] rounded-2xl px-4 py-2 transition-all">
            <span className="block text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
              Confirm Password
            </span>
            <div className="flex items-center gap-2.5 mt-0.5">
              <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (errorMessage) setErrorMessage(null)
                }}
                placeholder="Re-enter your password"
                className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none font-sans"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-zinc-400 hover:text-cyan-300 transition-colors p-1"
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
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
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

      </form>

      {/* Switch to Login Link */}
      <div className="mt-5 text-center text-xs text-zinc-400">
        <span>Already have an account? </span>
        <button
          onClick={onSwitchToLogin}
          type="button"
          className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline transition-colors cursor-pointer"
        >
          Login
        </button>
      </div>
    </div>
  )
}

