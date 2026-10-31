import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

console.log('🚀 Starting Kharol Brothers Octapad Full-Stack Environment...\n')

// 1. Start Node.js Backend Server
const backend = spawn('node', ['backend/server.js'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
})

// 2. Start Vite Frontend Server
const frontend = spawn('npx', ['vite'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
})

process.on('SIGINT', () => {
  backend.kill()
  frontend.kill()
  process.exit()
})

