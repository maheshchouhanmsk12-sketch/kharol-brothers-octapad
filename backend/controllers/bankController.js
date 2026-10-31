import { BankModel } from '../models/BankSchema.js'
import { isMongoConnected } from '../config/mongodb.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const BANKS_FILE = path.resolve(__dirname, '../data/banks.json')

function getLocalBanks() {
  try {
    if (fs.existsSync(BANKS_FILE)) {
      const data = fs.readFileSync(BANKS_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch {}
  return []
}

function saveLocalBanks(banks) {
  try {
    const dir = path.dirname(BANKS_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(BANKS_FILE, JSON.stringify(banks, null, 2), 'utf-8')
  } catch (e) {
    console.warn('[BankController] Could not write local banks.json:', e)
  }
}

export const BankController = {
  async getBanks(req, res) {
    const userId = req.user ? req.user.mobileNumber || req.user.id : 'default'

    try {
      if (isMongoConnected()) {
        const banks = await BankModel.find({ userId }).sort({ createdAt: -1 }).lean()
        if (banks && banks.length > 0) {
          const formatted = banks.map(b => ({
            id: b.bankId,
            name: b.name,
            description: b.description,
            createdAt: b.createdAt,
            updatedAt: b.updatedAt,
            pads: b.pads
          }))
          return res.json({ success: true, source: 'mongodb_atlas', banks: formatted })
        }
      }
    } catch (err) {
      console.warn('[BankController] Atlas fetch error:', err.message)
    }

    // Local JSON fallback
    const all = getLocalBanks()
    const userBanks = all.filter(b => b.userId === userId)
    res.json({ success: true, source: 'local_json', banks: userBanks.map(b => b.bank) })
  },

  async saveBank(req, res) {
    const userId = req.user ? req.user.mobileNumber || req.user.id : 'default'
    const bank = req.body

    if (!bank || !bank.id || !bank.name || !Array.isArray(bank.pads) || bank.pads.length !== 8) {
      return res.status(400).json({ success: false, error: 'Invalid bank format. Exactly 8 pads required.' })
    }

    try {
      if (isMongoConnected()) {
        await BankModel.findOneAndUpdate(
          { userId, bankId: bank.id },
          {
            userId,
            bankId: bank.id,
            name: bank.name,
            description: bank.description || '',
            pads: bank.pads
          },
          { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        )
        return res.json({ success: true, message: 'Bank saved to MongoDB Atlas', bank })
      }
    } catch (err) {
      console.warn('[BankController] Atlas save error:', err.message)
    }

    // Local JSON fallback
    const all = getLocalBanks()
    const idx = all.findIndex(b => b.userId === userId && b.bank.id === bank.id)
    if (idx >= 0) {
      all[idx].bank = bank
    } else {
      all.push({ userId, bank })
    }
    saveLocalBanks(all)

    res.json({ success: true, message: 'Bank saved locally', bank })
  },

  async deleteBank(req, res) {
    const userId = req.user ? req.user.mobileNumber || req.user.id : 'default'
    const { id } = req.params

    try {
      if (isMongoConnected()) {
        await BankModel.deleteOne({ userId, bankId: id })
      }
    } catch (err) {
      console.warn('[BankController] Atlas delete error:', err.message)
    }

    const all = getLocalBanks()
    const filtered = all.filter(b => !(b.userId === userId && b.bank.id === id))
    saveLocalBanks(filtered)

    res.json({ success: true, message: `Bank ${id} deleted successfully` })
  },

  async syncBanks(req, res) {
    const userId = req.user ? req.user.mobileNumber || req.user.id : 'default'
    const { banks } = req.body

    if (!Array.isArray(banks)) {
      return res.status(400).json({ success: false, error: 'Expected array of banks' })
    }

    try {
      if (isMongoConnected()) {
        for (const b of banks) {
          if (b.id && b.name && Array.isArray(b.pads) && b.pads.length === 8) {
            await BankModel.findOneAndUpdate(
              { userId, bankId: b.id },
              {
                userId,
                bankId: b.id,
                name: b.name,
                description: b.description || '',
                pads: b.pads
              },
              { upsert: true, returnDocument: 'after' }
            )
          }
        }
      }
    } catch (err) {
      console.warn('[BankController] Atlas sync error:', err.message)
    }

    // Local file fallback
    const all = getLocalBanks().filter(b => b.userId !== userId)
    banks.forEach(b => {
      all.push({ userId, bank: b })
    })
    saveLocalBanks(all)

    res.json({ success: true, count: banks.length, message: 'Banks synced successfully' })
  }
}

