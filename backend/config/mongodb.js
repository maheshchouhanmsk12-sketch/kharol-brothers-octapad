
import mongoose from 'mongoose'

let isConnected = false
let connectionError = null
let clusterHost = null

/**
 * Connect to MongoDB Atlas if URI is provided in environment variables
 */
export async function connectMongoDB() {
  const uri = process.env.MONGODB_URI

  if (!uri || uri.trim() === '' || uri.includes('<password>') || uri.includes('YOUR_MONGODB_URI')) {
    isConnected = false
    connectionError = 'MONGODB_URI is not configured in backend/.env'
    console.log('[MongoDB] MONGODB_URI not set. Running in local JSON storage mode.')
    return {
      connected: false,
      mode: 'local_json',
      message: 'MongoDB Atlas is not configured yet. Using local JSON storage.'
    }
  }

  try {
    console.log('[MongoDB] Attempting connection to MongoDB Atlas...')
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    })

    isConnected = true
    connectionError = null
    clusterHost = conn.connection.host

    console.log(`[MongoDB] Successfully connected to MongoDB Atlas! Host: ${clusterHost}`)

    // Auto-seed default 3 Kits, 9 Tune Sets & 72 Pad assignments into MongoDB Atlas
    try {
      const { KitConfigModel } = await import('../models/KitConfigSchema.js')
      const { DEFAULT_KITS } = await import('../data/defaultKits.js')
      const { User } = await import('../models/UserSchema.js')
      const { readUsers } = await import('./db.js')

      const existingKits = await KitConfigModel.findOne({ userId: 'default' })
      if (!existingKits || (existingKits.kits && existingKits.kits[0]?.tuneSets?.length < 4)) {
        await KitConfigModel.findOneAndUpdate(
          { userId: 'default' },
          { userId: 'default', kits: DEFAULT_KITS },
          { upsert: true, returnDocument: 'after' }
        )
        console.log('[MongoDB] ✅ Seeded/Updated 3 Kits & 12 Tune Sets (96 pads) in MongoDB Atlas!')
      } else {
        console.log('[MongoDB] ✅ KitConfig collection is ready in MongoDB Atlas (4 Tune Sets per Kit)')
      }

      // Migrate existing local users to MongoDB Atlas
      const localUsers = readUsers()
      if (Array.isArray(localUsers) && localUsers.length > 0) {
        for (const u of localUsers) {
          const exists = await User.findOne({ mobileNumber: u.mobileNumber })
          if (!exists) {
            await User.create({
              mobileNumber: u.mobileNumber,
              passwordHash: u.passwordHash,
              salt: u.salt,
              createdAt: u.createdAt || new Date()
            })
            console.log(`[MongoDB] ✅ Migrated user +91 ${u.mobileNumber} to MongoDB Atlas`)
          }
        }
      }
    } catch (seedErr) {
      console.warn('[MongoDB] Seeding info:', seedErr.message)
    }

    mongoose.connection.on('disconnected', () => {
      isConnected = false
      console.warn('[MongoDB] MongoDB Atlas disconnected.')
    })

    mongoose.connection.on('reconnected', () => {
      isConnected = true
      connectionError = null
      console.log('[MongoDB] MongoDB Atlas reconnected.')
    })

    mongoose.connection.on('error', (err) => {
      connectionError = err.message
      console.error('[MongoDB] Connection error:', err.message)
    })

    return {
      connected: true,
      mode: 'mongodb_atlas',
      host: clusterHost
    }
  } catch (err) {
    isConnected = false
    connectionError = err.message
    console.warn(`[MongoDB] Atlas connection failed (${err.message}). Gracefully falling back to local JSON storage.`)
    return {
      connected: false,
      mode: 'local_json',
      error: err.message
    }
  }
}

/**
 * Returns whether MongoDB Atlas is currently connected
 */
export function isMongoConnected() {
  return isConnected
}

/**
 * Returns current database status
 */
export function getDbStatus() {
  return {
    isAtlasConnected: isConnected,
    storageMode: isConnected ? 'mongodb_atlas' : 'local_json',
    clusterHost: clusterHost || null,
    error: connectionError,
    uriConfigured: Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim() !== '')
  }
}

