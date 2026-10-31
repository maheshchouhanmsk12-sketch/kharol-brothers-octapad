import React, { useState } from 'react'
import { Phone, Lock, Eye, EyeOff, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { authService, validateMobileNumber, validatePassword } from '../../services/authService'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [mobileNumber, setMobileNumber] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  if (!isOpen) return null

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

    const passCheck = validatePassword(newPassword)
    if (!passCheck.isValid) {
      setErrorMessage(passCheck.error || 'Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      const res = await authService.forgotPassword(mobileNumber, newPassword, confirmPassword)
      if (res.success) {
        setSuccessMessage(res.message || 'Password reset successful!')
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1200)
      } else {
        setErrorMessage(res.error || 'Failed to reset password. Please check your mobile number.')
      }
    } catch {
      setErrorMessage('Network error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md neon-glass-card p-6 sm:p-7 relative border border-cyan-500/40 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Reset</span>
              <span className="text-cyan-400">Password</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Enter your registered mobile number & set a new password.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="my-3 p-3 rounded-xl bg-red-950/70 border border-red-500/50 flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="my-3 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 flex items-start gap-2.5 text-xs text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 mt-4">
          
          {/* Mobile */}
          <div className="bg-[#080b18]/90 border border-zinc-700/70 focus-within:border-cyan-400 rounded-2xl px-4 py-2">
            <span className="block text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
              Registered Mobile Number
            </span>
            <div className="flex items-center gap-2.5 mt-0.5">
              <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-xs font-mono text-zinc-400 select-none">+91</span>
              <input
                type="tel"
                value={mobileNumber}
                onChange={handleMobileChange}
                placeholder="Enter 10 digit mobile number"
                className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none font-sans"
                required
              />
            </div>
          </div>

          {/* New Password */}
          <div className="bg-[#080b18]/90 border border-zinc-700/70 focus-within:border-cyan-400 rounded-2xl px-4 py-2">
            <span className="block text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
              New Password
            </span>
            <div className="flex items-center gap-2.5 mt-0.5">
              <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none font-sans"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-zinc-400 hover:text-cyan-300 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="bg-[#080b18]/90 border border-zinc-700/70 focus-within:border-cyan-400 rounded-2xl px-4 py-2">
            <span className="block text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
              Confirm New Password
            </span>
            <div className="flex items-center gap-2.5 mt-0.5">
              <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none font-sans"
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase text-white neon-gradient-btn disabled:opacity-50"
            >
              {isLoading ? 'Resetting...' : 'Save New Password'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

