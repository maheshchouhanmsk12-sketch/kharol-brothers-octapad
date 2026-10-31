import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { initDatabase } from './config/db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env if present
try {
  const envPath = path.resolve(__dirname, '.env')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    envContent.split('\n').forEach(line => {
      const parts = line.split('=')
      if (parts.length >= 2) {
        const key = parts[0].trim()
        const val = parts.slice(1).join('=').trim()
        if (key && !process.env[key]) {
          process.env[key] = val
        }
      }
    })
  }
} catch {}

const PORT = process.env.PORT || 5000

// Initialize JSON database
initDatabase()

// Dynamically try to use Express, with graceful fallback to native Node http
async function startServer() {
  // Connect MongoDB if URI is configured
  try {
    const { connectMongoDB } = await import('./config/mongodb.js')
    await connectMongoDB()
  } catch (err) {
    console.warn('[MongoDB] Initialization warning:', err.message)
  }

  try {
    const expressModule = await import('express')
    const corsModule = await import('cors')
    const authRoutesModule = await import('./routes/authRoutes.js')
    const kitRoutesModule = await import('./routes/kitRoutes.js')
    const bankRoutesModule = await import('./routes/bankRoutes.js')
    const { KitController } = await import('./controllers/kitController.js')

    const express = expressModule.default
    const cors = corsModule.default
    const authRoutes = authRoutesModule.default
    const kitRoutes = kitRoutesModule.default
    const bankRoutes = bankRoutesModule.default

    const app = express()

    // CORS Production Security Configuration
    const configuredOrigins = (process.env.CORS_ORIGIN || '')
      .split(',')
      .map(o => o.trim().replace(/\/$/, ''))
      .filter(Boolean)

    const devOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000'
    ]

    const isProduction = process.env.NODE_ENV === 'production'

    app.use(cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true)

        const normalizedOrigin = origin.replace(/\/$/, '')

        // In production, strictly allow explicitly configured domains
        if (isProduction) {
          if (configuredOrigins.includes(normalizedOrigin)) {
            return callback(null, true)
          }
          return callback(new Error(`CORS blocked: Origin ${origin} not permitted in production.`))
        }

        // In development, allow localhost, local LAN IPs, or configured origins
        if (
          devOrigins.includes(normalizedOrigin) ||
          configuredOrigins.includes(normalizedOrigin) ||
          /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(normalizedOrigin)
        ) {
          return callback(null, true)
        }

        return callback(null, true)
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }))
    app.use(express.json({ limit: '50mb' }))
    app.use(express.urlencoded({ extended: true, limit: '50mb' }))

    // Request Logger
    app.use((req, res, next) => {
      console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`)
      next()
    })

    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        service: 'Kharol Brothers Octapad Backend API',
        timestamp: new Date().toISOString(),
        engine: 'Express Node.js'
      })
    })

    // Database status endpoint
    app.get('/api/db/status', KitController.getDatabaseStatus)

    // Mount Auth, Kit & Bank Routes
    app.use('/api/auth', authRoutes)
    app.use('/api/kits', kitRoutes)
    app.use('/api/banks', bankRoutes)

    // 404 Handler
    app.use((req, res) => {
      res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.url}` })
    })

    // Start listening
    const server = app.listen(PORT, () => {
      console.log(`\n=================================================`)
      console.log(`🚀 KHAROL BROTHERS OCTAPAD BACKEND (EXPRESS)`)
      console.log(`📡 URL: http://localhost:${PORT}`)
      console.log(`⚡ Health: http://localhost:${PORT}/api/health`)
      console.log(`📊 DB Status: http://localhost:${PORT}/api/db/status`)
      console.log(`🥁 Kits API: http://localhost:${PORT}/api/kits`)
      console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`)
      console.log(`=================================================\n`)
    })

    return server
  } catch (expressErr) {
    console.warn('[Server] Express not loaded, running with Native Node.js HTTP server:', expressErr.message)

    // Fallback native Node HTTP Server
    const { AuthController } = await import('./controllers/authController.js')

    const server = http.createServer(async (req, res) => {
      // Dynamic CORS headers matching origin
      const reqOrigin = req.headers.origin || '*'
      res.setHeader('Access-Control-Allow-Origin', reqOrigin)
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
      res.setHeader('Access-Control-Allow-Credentials', 'true')

      if (req.method === 'OPTIONS') {
        res.statusCode = 204
        return res.end()
      }

      console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`)

      const readJson = () => new Promise((resolve) => {
        let data = ''
        req.on('data', chunk => { data += chunk })
        req.on('end', () => {
          try { resolve(data ? JSON.parse(data) : {}) }
          catch { resolve({}) }
        })
      })

      const sendJson = (status, obj) => {
        res.statusCode = status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(obj))
      }

      const url = req.url.split('?')[0]

      if (url === '/api/health') {
        return sendJson(200, {
          status: 'ok',
          service: 'Kharol Brothers Octapad Backend API',
          timestamp: new Date().toISOString(),
          engine: 'Native Node.js HTTP'
        })
      }

      if (url === '/api/db/status') {
        const { getDbStatus } = await import('./config/mongodb.js')
        const status = getDbStatus()
        return sendJson(200, {
          success: true,
          database: status,
          guide: status.isAtlasConnected ? 'MongoDB Atlas is active and connected.' : 'To connect MongoDB Atlas, paste your cluster connection string into backend/.env as MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/kharol_octapad'
        })
      }

      if (url === '/api/kits') {
        const { KitController } = await import('./controllers/kitController.js')
        if (req.method === 'GET') {
          return KitController.getKits(req, {
            status: (code) => ({ json: (data) => sendJson(code, data) }),
            json: (data) => sendJson(200, data)
          })
        }
        if (req.method === 'POST') {
          req.body = await readJson()
          return KitController.saveKits(req, {
            status: (code) => ({ json: (data) => sendJson(code, data) }),
            json: (data) => sendJson(200, data)
          })
        }
      }

      if (req.method === 'POST' && url === '/api/auth/signup') {
        req.body = await readJson()
        const { mobileNumber, password, confirmPassword } = req.body
        const cleanMobile = String(mobileNumber || '').trim().replace(/\D/g, '')

        if (!cleanMobile || cleanMobile.length !== 10) {
          return sendJson(400, { success: false, error: 'Mobile number must be exactly 10 digits.' })
        }
        if (!password || password.length < 6) {
          return sendJson(400, { success: false, error: 'Password must be at least 6 characters long.' })
        }

        req.cleanMobile = cleanMobile
        return AuthController.signup(req, {
          status: (code) => ({
            json: (data) => sendJson(code, data)
          })
        })
      }

      if (req.method === 'POST' && url === '/api/auth/login') {
        req.body = await readJson()
        const cleanMobile = String(req.body.mobileNumber || '').trim().replace(/\D/g, '')

        if (!cleanMobile || cleanMobile.length !== 10) {
          return sendJson(400, { success: false, error: 'Mobile number must be exactly 10 digits.' })
        }
        if (!req.body.password) {
          return sendJson(400, { success: false, error: 'Password is required.' })
        }

        req.cleanMobile = cleanMobile
        return AuthController.login(req, {
          status: (code) => ({
            json: (data) => sendJson(code, data)
          })
        })
      }

      if (req.method === 'POST' && url === '/api/auth/forgot-password') {
        req.body = await readJson()
        return AuthController.forgotPassword(req, {
          status: (code) => ({
            json: (data) => sendJson(code, data)
          })
        })
      }

      if (req.method === 'POST' && url === '/api/auth/logout') {
        return sendJson(200, { success: true, message: 'Logged out successfully.' })
      }

      sendJson(404, { success: false, error: 'Route not found' })
    })

    server.listen(PORT, () => {
      console.log(`\n=================================================`)
      console.log(`🚀 KHAROL BROTHERS OCTAPAD BACKEND (NATIVE NODE)`)
      console.log(`📡 URL: http://localhost:${PORT}`)
      console.log(`⚡ Health: http://localhost:${PORT}/api/health`)
      console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`)
      console.log(`=================================================\n`)
    })

    return server
  }
}

startServer()

