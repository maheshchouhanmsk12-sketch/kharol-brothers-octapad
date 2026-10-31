import crypto from 'crypto'
import { readUsers, writeUsers } from '../config/db.js'
import { User } from './UserSchema.js'
import { getDbStatus } from '../config/mongodb.js'

/**
 * Hash password with salt using PBKDF2 with SHA-512
 */
export function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
}

/**
 * Generate secure session token
 */
export function generateToken(userId) {
  const random = crypto.randomBytes(24).toString('hex')
  return `kb_token_${userId}_${Date.now()}_${random}`
}

export const UserModel = {
  /**
   * Find user by 10-digit mobile number (Checks Atlas first, falls back to JSON)
   */
  async findByMobile(mobileNumber) {
    const cleanMobile = String(mobileNumber).trim().replace(/\D/g, '')
    const dbStatus = getDbStatus()

    if (dbStatus.isAtlasConnected) {
      try {
        const doc = await User.findOne({ mobileNumber: cleanMobile })
        if (doc) {
          return {
            id: String(doc._id),
            mobileNumber: doc.mobileNumber,
            passwordHash: doc.passwordHash,
            salt: doc.salt,
            subscription: doc.subscription,
            settings: doc.settings,
            createdAt: doc.createdAt
          }
        }
      } catch (err) {
        console.warn('[UserModel.findByMobile] Atlas query error, checking local backup:', err.message)
      }
    }

    const users = readUsers()
    return users.find(u => u.mobileNumber === cleanMobile) || null
  },

  /**
   * Find user by ID
   */
  async findById(id) {
    const dbStatus = getDbStatus()
    if (dbStatus.isAtlasConnected) {
      try {
        const doc = await User.findById(id)
        if (doc) {
          return {
            id: String(doc._id),
            mobileNumber: doc.mobileNumber,
            passwordHash: doc.passwordHash,
            salt: doc.salt,
            createdAt: doc.createdAt
          }
        }
      } catch (err) {
        // Fall back to local check
      }
    }

    const users = readUsers()
    return users.find(u => u.id === id) || null
  },

  /**
   * Create a new user record in MongoDB Atlas & local backup
   * Enforces: One account per mobile number
   */
  async create({ mobileNumber, password }) {
    const cleanMobile = String(mobileNumber).trim().replace(/\D/g, '')
    const dbStatus = getDbStatus()

    // 1. Check duplicate
    const existing = await this.findByMobile(cleanMobile)
    if (existing) {
      throw new Error(`An account with mobile number +91 ${cleanMobile} already exists.`)
    }

    const salt = crypto.randomBytes(16).toString('hex')
    const passwordHash = hashPassword(password, salt)

    let createdId = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
    let createdAt = new Date().toISOString()

    // 2. Save to MongoDB Atlas if connected
    if (dbStatus.isAtlasConnected) {
      try {
        const doc = await User.create({
          mobileNumber: cleanMobile,
          passwordHash,
          salt,
          subscription: {
            plan: 'free',
            status: 'active'
          }
        })
        createdId = String(doc._id)
        createdAt = doc.createdAt.toISOString()
        console.log(`[UserModel] ✅ Saved new user +91 ${cleanMobile} to MongoDB Atlas!`)
      } catch (err) {
        console.error('[UserModel] Atlas save error:', err.message)
      }
    }

    // 3. Mirror to local JSON for backup resilience
    try {
      const users = readUsers()
      if (!users.some(u => u.mobileNumber === cleanMobile)) {
        users.push({
          id: createdId,
          mobileNumber: cleanMobile,
          passwordHash,
          salt,
          createdAt,
          updatedAt: createdAt
        })
        writeUsers(users)
      }
    } catch {}

    return {
      id: createdId,
      mobileNumber: cleanMobile,
      createdAt
    }
  },

  /**
   * Update user password without OTP
   */
  async updatePassword(mobileNumber, newPassword) {
    const cleanMobile = String(mobileNumber).trim().replace(/\D/g, '')
    const dbStatus = getDbStatus()

    const salt = crypto.randomBytes(16).toString('hex')
    const passwordHash = hashPassword(newPassword, salt)

    let updated = false

    // Update in MongoDB Atlas
    if (dbStatus.isAtlasConnected) {
      try {
        const doc = await User.findOneAndUpdate(
          { mobileNumber: cleanMobile },
          { passwordHash, salt },
          { returnDocument: 'after' }
        )
        if (doc) {
          updated = true
          console.log(`[UserModel] ✅ Password updated in MongoDB Atlas for +91 ${cleanMobile}`)
        }
      } catch (err) {
        console.error('[UserModel] Atlas update error:', err.message)
      }
    }

    // Update in local JSON backup
    const users = readUsers()
    const index = users.findIndex(u => u.mobileNumber === cleanMobile)
    if (index !== -1) {
      users[index].passwordHash = passwordHash
      users[index].salt = salt
      users[index].updatedAt = new Date().toISOString()
      writeUsers(users)
      updated = true
    }

    if (!updated) {
      throw new Error(`No account found with mobile number +91 ${cleanMobile}.`)
    }

    return true
  },

  /**
   * Validate login credentials
   */
  validatePassword(user, password) {
    if (!user || !user.salt || !user.passwordHash) return false
    const computedHash = hashPassword(password, user.salt)
    return computedHash === user.passwordHash
  }
}
