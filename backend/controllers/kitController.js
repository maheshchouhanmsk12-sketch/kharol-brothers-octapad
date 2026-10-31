import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { DEFAULT_KITS } from '../data/defaultKits.js'
import { KitConfigModel } from '../models/KitConfigSchema.js'
import { getDbStatus } from '../config/mongodb.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const KITS_FILE = path.resolve(__dirname, '..', 'data', 'kits.json')

function readLocalKits() {
  try {
    if (!fs.existsSync(KITS_FILE)) {
      fs.writeFileSync(KITS_FILE, JSON.stringify(DEFAULT_KITS, null, 2), 'utf-8')
      return DEFAULT_KITS
    }
    const raw = fs.readFileSync(KITS_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed[0]?.tuneSets || parsed[0].tuneSets.length < 4) {
      fs.writeFileSync(KITS_FILE, JSON.stringify(DEFAULT_KITS, null, 2), 'utf-8')
      return DEFAULT_KITS
    }
    return parsed
  } catch (err) {
    console.error('[Kits] Error reading local kits file:', err)
    return DEFAULT_KITS
  }
}

function writeLocalKits(kits) {
  try {
    fs.writeFileSync(KITS_FILE, JSON.stringify(kits, null, 2), 'utf-8')
    return true
  } catch (err) {
    console.error('[Kits] Error saving local kits file:', err)
    return false
  }
}

export const KitController = {
  /**
   * GET /api/kits
   * Fetch 3 Kits, 9 Tune Sets & 72 Pad sound assignments
   */
  async getKits(req, res) {
    try {
      const dbStatus = getDbStatus()
      const userId = req.user ? req.user.mobileNumber : 'default'

      if (dbStatus.isAtlasConnected) {
        // Query MongoDB Atlas
        let doc = await KitConfigModel.findOne({ userId })
        if (!doc) {
          // If no custom config for this user, return default or create it
          doc = await KitConfigModel.findOne({ userId: 'default' })
        }
        if (doc && doc.kits && doc.kits[0]?.tuneSets?.length < 4) {
          doc.kits = DEFAULT_KITS
          await doc.save()
        }
        if (!doc) {
          doc = await KitConfigModel.create({
            userId: 'default',
            kits: DEFAULT_KITS
          })
        }
        return res.json({
          success: true,
          source: 'mongodb_atlas',
          kits: doc.kits
        })
      }

      // Local JSON file fallback
      const kits = readLocalKits()
      return res.json({
        success: true,
        source: 'local_json',
        kits
      })
    } catch (err) {
      console.error('[Kits] getKits error:', err)
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve Kit configurations',
        details: err.message
      })
    }
  },

  /**
   * POST /api/kits
   * Save / update Kit configurations
   */
  async saveKits(req, res) {
    try {
      const { kits } = req.body
      if (!Array.isArray(kits) || kits.length !== 3) {
        return res.status(400).json({
          success: false,
          error: 'Invalid kits payload: exactly 3 kits required'
        })
      }

      const dbStatus = getDbStatus()
      const userId = req.user ? req.user.mobileNumber : 'default'

      if (dbStatus.isAtlasConnected) {
        const updated = await KitConfigModel.findOneAndUpdate(
          { userId },
          { userId, kits },
          { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        )
        return res.json({
          success: true,
          message: 'Kits saved successfully to MongoDB Atlas',
          source: 'mongodb_atlas',
          kits: updated.kits
        })
      }

      // Local JSON fallback
      writeLocalKits(kits)
      return res.json({
        success: true,
        message: 'Kits saved successfully to local storage',
        source: 'local_json',
        kits
      })
    } catch (err) {
      console.error('[Kits] saveKits error:', err)
      return res.status(500).json({
        success: false,
        error: 'Failed to save kit configurations',
        details: err.message
      })
    }
  },

  /**
   * GET /api/db/status
   * Reports live MongoDB Atlas status and connection guidelines
   */
  getDatabaseStatus(req, res) {
    const status = getDbStatus()
    return res.json({
      success: true,
      database: {
        isAtlasConnected: status.isAtlasConnected,
        storageMode: status.storageMode,
        clusterHost: status.clusterHost,
        error: status.error,
        uriConfigured: status.uriConfigured
      },
      guide: status.isAtlasConnected ? 'MongoDB Atlas is active and connected.' : 'To connect MongoDB Atlas, paste your cluster connection string into backend/.env as MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/kharol_octapad'
    })
  }
}

