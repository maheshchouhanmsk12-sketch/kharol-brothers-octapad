import { UserModel, generateToken } from '../models/userModel.js'

export const AuthController = {
  /**
   * POST /api/auth/signup
   * Register new user
   */
  async signup(req, res) {
    try {
      const { password, confirmPassword } = req.body
      const cleanMobile = req.cleanMobile

      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'Passwords do not match. Please re-enter carefully.'
        })
      }

      // Check if mobile number already exists (One account per mobile number)
      const existingUser = await UserModel.findByMobile(cleanMobile)
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: `An account with mobile number +91 ${cleanMobile} already exists. Please login.`
        })
      }

      // Create new user
      const user = await UserModel.create({
        mobileNumber: cleanMobile,
        password
      })

      const token = generateToken(user.id)

      return res.status(201).json({
        success: true,
        message: 'Account created successfully! Welcome to Kharol Brothers Octapad.',
        user,
        token
      })
    } catch (err) {
      console.error('[AuthController.signup Error]', err)
      return res.status(500).json({
        success: false,
        error: err.message || 'Internal server error processing signup.'
      })
    }
  },

  /**
   * POST /api/auth/login
   * Authenticate user with mobile & password
   */
  async login(req, res) {
    try {
      const { password, rememberMe } = req.body
      const cleanMobile = req.cleanMobile

      const user = await UserModel.findByMobile(cleanMobile)
      if (!user) {
        return res.status(404).json({
          success: false,
          error: `No account found for mobile number +91 ${cleanMobile}. Please sign up.`
        })
      }

      const isValid = UserModel.validatePassword(user, password)
      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: 'Incorrect password. Please verify and try again.'
        })
      }

      const token = generateToken(user.id)

      return res.status(200).json({
        success: true,
        message: 'Welcome back to Kharol Brothers Octapad!',
        user: {
          id: user.id,
          mobileNumber: user.mobileNumber,
          createdAt: user.createdAt,
          rememberMe: !!rememberMe
        },
        token
      })
    } catch (err) {
      console.error('[AuthController.login Error]', err)
      return res.status(500).json({
        success: false,
        error: 'Internal server error processing login.'
      })
    }
  },

  /**
   * POST /api/auth/forgot-password
   * Reset password without OTP verification
   */
  async forgotPassword(req, res) {
    try {
      const { mobileNumber, newPassword, confirmPassword } = req.body
      const cleanMobile = String(mobileNumber || '').trim().replace(/\D/g, '')

      if (!cleanMobile || cleanMobile.length !== 10) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid 10-digit mobile number.'
        })
      }

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'New password must be at least 6 characters long.'
        })
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'Passwords do not match.'
        })
      }

      const user = await UserModel.findByMobile(cleanMobile)
      if (!user) {
        return res.status(404).json({
          success: false,
          error: `No account found with mobile number +91 ${cleanMobile}. Please sign up first.`
        })
      }

      await UserModel.updatePassword(cleanMobile, newPassword)

      return res.status(200).json({
        success: true,
        message: 'Password reset successful! You can now login with your new password.'
      })
    } catch (err) {
      console.error('[AuthController.forgotPassword Error]', err)
      return res.status(500).json({
        success: false,
        error: err.message || 'Internal server error resetting password.'
      })
    }
  },

  /**
   * GET /api/auth/me
   */
  async getMe(req, res) {
    return res.status(200).json({
      success: true,
      user: req.user
    })
  },

  /**
   * POST /api/auth/logout
   */
  async logout(req, res) {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    })
  }
}

