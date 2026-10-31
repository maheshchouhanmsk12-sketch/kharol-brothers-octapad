import { UserModel } from '../models/userModel.js'

/**
 * Validates signup and login request body
 */
export function validateAuthBody(req, res, next) {
  const { mobileNumber, password } = req.body || {}
  const cleanMobile = String(mobileNumber || '').trim().replace(/\D/g, '')

  if (!cleanMobile) {
    return res.status(400).json({ success: false, error: 'Mobile number is required.' })
  }

  if (cleanMobile.length !== 10) {
    return res.status(400).json({ success: false, error: 'Mobile number must be exactly 10 digits.' })
  }

  if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
    return res.status(400).json({ success: false, error: 'Mobile number must start with 6, 7, 8, or 9.' })
  }

  if (!password) {
    return res.status(400).json({ success: false, error: 'Password is required.' })
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' })
  }

  req.cleanMobile = cleanMobile
  next()
}

/**
 * Verify Bearer token
 */
export async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authorization token required.' })
  }

  const token = authHeader.split(' ')[1]
  const match = token.match(/^kb_token_(.+)_(\d+)_([a-f0-9]+)$/)
  if (match) {
    const userId = match[1]
    const tokenTimestamp = parseInt(match[2], 10)

    // Token maximum lifespan: 30 days
    const MAX_SESSION_AGE_MS = 30 * 24 * 60 * 60 * 1000
    if (isNaN(tokenTimestamp) || Date.now() - tokenTimestamp > MAX_SESSION_AGE_MS) {
      return res.status(401).json({ success: false, error: 'Session token expired. Please login again.' })
    }

    try {
      const user = await UserModel.findById(userId)
      if (user) {
        req.user = { id: user.id, mobileNumber: user.mobileNumber, createdAt: user.createdAt }
        return next()
      }
    } catch {}
  }

  return res.status(401).json({ success: false, error: 'Invalid or expired session token.' })
}

/**
 * Optional token verification: if valid token present, attaches req.user; otherwise proceeds
 */
export async function authenticateOptionalToken(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null
    return next()
  }

  const token = authHeader.split(' ')[1]
  const match = token.match(/^kb_token_(.+)_(\d+)_([a-f0-9]+)$/)
  if (match) {
    const userId = match[1]
    try {
      const user = await UserModel.findById(userId)
      if (user) {
        req.user = { id: user.id, mobileNumber: user.mobileNumber }
      }
    } catch {}
  }
  next()
}


