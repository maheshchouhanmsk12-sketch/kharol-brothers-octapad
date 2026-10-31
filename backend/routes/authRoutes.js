import { Router } from 'express'
import { AuthController } from '../controllers/authController.js'
import { validateAuthBody, verifyToken } from '../middleware/authMiddleware.js'

const router = Router()

// Register new user (one account per mobile number, no OTP)
router.post('/signup', validateAuthBody, AuthController.signup)

// Login with mobile number & password
router.post('/login', validateAuthBody, AuthController.login)

// Reset password (no OTP)
router.post('/forgot-password', AuthController.forgotPassword)

// Get current logged-in user profile
router.get('/me', verifyToken, AuthController.getMe)

// Logout
router.post('/logout', AuthController.logout)

export default router

