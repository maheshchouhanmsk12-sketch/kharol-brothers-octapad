import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Database file path
const DATA_DIR = path.resolve(__dirname, '..', 'data')
const DB_FILE = path.join(DATA_DIR, 'users.json')

/**
 * Ensures data directory and users.json file exist
 */
export function initDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }

    if (!fs.existsSync(DB_FILE)) {
      // Check if root data/users.json had existing data to migrate
      const rootDataFile = path.resolve(__dirname, '..', '..', 'data', 'users.json')
      if (fs.existsSync(rootDataFile)) {
        try {
          const rootData = fs.readFileSync(rootDataFile, 'utf-8')
          fs.writeFileSync(DB_FILE, rootData, 'utf-8')
          console.log('[Database] Migrated existing user records from root data folder')
          return
        } catch {}
      }
      fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8')
      console.log('[Database] Initialized empty users database at:', DB_FILE)
    } else {
      console.log('[Database] Connected to users database at:', DB_FILE)
    }
  } catch (err) {
    console.error('[Database] Initialization error:', err)
  }
}

/**
 * Read all users from disk
 */
export function readUsers() {
  try {
    initDatabase()
    const content = fs.readFileSync(DB_FILE, 'utf-8')
    return JSON.parse(content || '[]')
  } catch (err) {
    console.error('[Database] Failed to read users:', err)
    return []
  }
}

/**
 * Write users array to disk
 */
export function writeUsers(users) {
  try {
    initDatabase()
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), 'utf-8')
    return true
  } catch (err) {
    console.error('[Database] Failed to write users:', err)
    return false
  }
}

