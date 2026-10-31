export interface UserProfile {
  id: string
  mobileNumber: string
  createdAt: string
  rememberMe?: boolean
}

export interface AuthResponse {
  success: boolean
  message?: string
  error?: string
  user?: UserProfile
  token?: string
}

const LOCAL_STORAGE_USERS_KEY = 'kb_octapad_users'
const LOCAL_STORAGE_SESSION_KEY = 'kb_octapad_auth_session'
const SESSION_STORAGE_KEY = 'kb_octapad_auth_session_temp'

/**
 * Validates standard 10-digit Indian mobile number
 */
export function validateMobileNumber(mobile: string): { isValid: boolean; error?: string } {
  const cleaned = mobile.trim().replace(/\D/g, '')
  if (!cleaned) {
    return { isValid: false, error: 'Mobile number is required' }
  }
  if (cleaned.length !== 10) {
    return { isValid: false, error: 'Mobile number must be exactly 10 digits' }
  }
  if (!/^[6-9]\d{9}$/.test(cleaned)) {
    return { isValid: false, error: 'Mobile number must start with 6, 7, 8, or 9' }
  }
  return { isValid: true }
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (!password) {
    return { isValid: false, error: 'Password is required' }
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long' }
  }
  return { isValid: true }
}

class AuthService {
  private currentUser: UserProfile | null = null
  private token: string | null = null

  constructor() {
    this.restoreSession()
  }

  private restoreSession() {
    try {
      // Check localStorage first (remember me)
      const stored = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        this.currentUser = parsed.user
        this.token = parsed.token
        return
      }

      // Check sessionStorage (temporary)
      const tempStored = sessionStorage.getItem(SESSION_STORAGE_KEY)
      if (tempStored) {
        const parsed = JSON.parse(tempStored)
        this.currentUser = parsed.user
        this.token = parsed.token
      }
    } catch (e) {
      console.warn('Failed to restore session:', e)
    }
  }

  private saveSession(user: UserProfile, token: string, rememberMe = true) {
    this.currentUser = user
    this.token = token
    const payload = JSON.stringify({ user, token })
    if (rememberMe) {
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, payload)
      sessionStorage.removeItem(SESSION_STORAGE_KEY)
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY, payload)
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY)
    }
  }

  // Local storage mock DB fallback if network/backend is unreachable
  private getLocalUsers(): Array<{ id: string; mobileNumber: string; passwordHash: string; createdAt: string }> {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_USERS_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  private saveLocalUsers(users: Array<{ id: string; mobileNumber: string; passwordHash: string; createdAt: string }>) {
    try {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users))
    } catch (e) {
      console.warn('Failed to save local users fallback:', e)
    }
  }

  /**
   * Register a new user with Mobile Number & Password
   * Enforces: One account per mobile number
   */
  async signup(
    mobileNumber: string,
    password: string,
    confirmPassword: string
  ): Promise<AuthResponse> {
    const cleanMobile = mobileNumber.trim().replace(/\D/g, '')

    // Frontend Validations
    const mobVal = validateMobileNumber(cleanMobile)
    if (!mobVal.isValid) {
      return { success: false, error: mobVal.error }
    }

    const passVal = validatePassword(password)
    if (!passVal.isValid) {
      return { success: false, error: passVal.error }
    }

    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match. Please re-enter carefully.' }
    }

    // Try Backend API First
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobileNumber: cleanMobile,
          password,
          confirmPassword
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success && data.user && data.token) {
          this.saveSession(data.user, data.token, true)
          // Keep local fallback in sync
          const localUsers = this.getLocalUsers()
          if (!localUsers.some(u => u.mobileNumber === cleanMobile)) {
            localUsers.push({
              id: data.user.id,
              mobileNumber: cleanMobile,
              passwordHash: btoa(password),
              createdAt: data.user.createdAt
            })
            this.saveLocalUsers(localUsers)
          }
          return {
            success: true,
            message: 'Account created successfully! Welcome to Kharol Brothers Octapad.',
            user: data.user,
            token: data.token
          }
        } else {
          return { success: false, error: data.error || 'Signup failed' }
        }
      } else {
        const errData = await res.json().catch(() => ({}))
        if (errData.error) {
          return { success: false, error: errData.error }
        }
      }
    } catch {
      // Backend request failed, use persistent local DB fallback
    }

    // Local DB Fallback (ensures 100% offline & local testing reliability)
    const localUsers = this.getLocalUsers()
    const existing = localUsers.find(u => u.mobileNumber === cleanMobile)
    if (existing) {
      return {
        success: false,
        error: `An account with mobile number +91 ${cleanMobile} already exists. Please login instead.`
      }
    }

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      mobileNumber: cleanMobile,
      passwordHash: btoa(password), // Base64 encoding for fallback
      createdAt: new Date().toISOString()
    }

    localUsers.push(newUser)
    this.saveLocalUsers(localUsers)

    const userProfile: UserProfile = {
      id: newUser.id,
      mobileNumber: newUser.mobileNumber,
      createdAt: newUser.createdAt
    }
    const token = `kb_token_${newUser.id}_${Date.now()}`
    this.saveSession(userProfile, token, true)

    return {
      success: true,
      message: 'Account created successfully! Welcome to Kharol Brothers Octapad.',
      user: userProfile,
      token
    }
  }

  /**
   * Login with Mobile Number & Password
   */
  async login(
    mobileNumber: string,
    password: string,
    rememberMe = true
  ): Promise<AuthResponse> {
    const cleanMobile = mobileNumber.trim().replace(/\D/g, '')

    const mobVal = validateMobileNumber(cleanMobile)
    if (!mobVal.isValid) {
      return { success: false, error: mobVal.error }
    }

    if (!password) {
      return { success: false, error: 'Password is required' }
    }

    // Try Backend API First
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobileNumber: cleanMobile,
          password,
          rememberMe
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success && data.user && data.token) {
          this.saveSession(data.user, data.token, rememberMe)
          return {
            success: true,
            message: 'Welcome back to Kharol Brothers Octapad!',
            user: data.user,
            token: data.token
          }
        } else {
          return { success: false, error: data.error || 'Login failed' }
        }
      } else {
        const errData = await res.json().catch(() => ({}))
        if (errData.error) {
          return { success: false, error: errData.error }
        }
      }
    } catch {
      // Backend request failed, use local DB fallback
    }

    // Local DB Fallback
    const localUsers = this.getLocalUsers()
    const user = localUsers.find(u => u.mobileNumber === cleanMobile)

    if (!user) {
      return {
        success: false,
        error: `No account found for mobile number +91 ${cleanMobile}. Please sign up first.`
      }
    }

    if (user.passwordHash !== btoa(password)) {
      return {
        success: false,
        error: 'Incorrect password. Please verify and try again.'
      }
    }

    const userProfile: UserProfile = {
      id: user.id,
      mobileNumber: user.mobileNumber,
      createdAt: user.createdAt,
      rememberMe
    }
    const token = `kb_token_${user.id}_${Date.now()}`
    this.saveSession(userProfile, token, rememberMe)

    return {
      success: true,
      message: 'Welcome back to Kharol Brothers Octapad!',
      user: userProfile,
      token
    }
  }

  /**
   * Reset password without OTP per user instructions
   */
  async forgotPassword(
    mobileNumber: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<AuthResponse> {
    const cleanMobile = mobileNumber.trim().replace(/\D/g, '')

    const mobVal = validateMobileNumber(cleanMobile)
    if (!mobVal.isValid) {
      return { success: false, error: mobVal.error }
    }

    const passVal = validatePassword(newPassword)
    if (!passVal.isValid) {
      return { success: false, error: passVal.error }
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: 'Passwords do not match' }
    }

    // Try backend
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobileNumber: cleanMobile,
          newPassword,
          confirmPassword
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          return {
            success: true,
            message: 'Password reset successful! Please login with your new password.'
          }
        }
      }
    } catch {
      // fallback
    }

    // Local DB fallback
    const localUsers = this.getLocalUsers()
    const userIdx = localUsers.findIndex(u => u.mobileNumber === cleanMobile)
    if (userIdx === -1) {
      return {
        success: false,
        error: `No account found with mobile number +91 ${cleanMobile}. Please sign up first.`
      }
    }

    localUsers[userIdx].passwordHash = btoa(newPassword)
    this.saveLocalUsers(localUsers)

    return {
      success: true,
      message: 'Password reset successful! Please login with your new password.'
    }
  }

  logout() {
    this.currentUser = null
    this.token = null
    localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY)
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
    try {
      fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    } catch {}
  }

  getCurrentUser(): UserProfile | null {
    if (!this.currentUser) {
      this.restoreSession()
    }
    return this.currentUser
  }

  getToken(): string | null {
    if (!this.token) {
      this.restoreSession()
    }
    return this.token
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }
}

export const authService = new AuthService()

