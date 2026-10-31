// Script to synthesize and write authentic 16-bit 44.1kHz WAV sample files
// for Indian devotional percussion instruments into public/sounds/

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SAMPLE_RATE = 44100

function createWavBuffer(numChannels, sampleRate, samples) {
  const byteRate = sampleRate * numChannels * 2
  const blockAlign = numChannels * 2
  const dataLength = samples.length * 2
  const buffer = Buffer.alloc(44 + dataLength)

  // RIFF header
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataLength, 4)
  buffer.write('WAVE', 8)

  // fmt subchunk
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16) // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20)  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(byteRate, 28)
  buffer.writeUInt16LE(blockAlign, 32)
  buffer.writeUInt16LE(16, 34) // BitsPerSample

  // data subchunk
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataLength, 40)

  // Write samples (clamped 16-bit signed PCM)
  let offset = 44
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    const intVal = s < 0 ? s * 0x8000 : s * 0x7FFF
    buffer.writeInt16LE(Math.floor(intVal), offset)
    offset += 2
  }

  return buffer
}

function noise(t) {
  return (Math.random() * 2 - 1)
}

// 1. Dholak: Bass thud + wooden body + rim slap
function generateDholak() {
  const duration = 0.55
  const totalSamples = Math.floor(SAMPLE_RATE * duration)
  const samples = new Float32Array(totalSamples)

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE
    // Bass pitch envelope: 160Hz -> 76Hz
    const pitch = 76 + 84 * Math.exp(-t * 22)
    const phase = 2 * Math.PI * (76 * t + (84 / 22) * (1 - Math.exp(-t * 22)))
    const bass = Math.sin(phase) * Math.exp(-t * 6.5)

    // Wood shell body resonance (140Hz)
    const body = Math.sin(2 * Math.PI * 140 * t) * Math.exp(-t * 18) * 0.45

    // Skin slap transient (filtered noise burst)
    let slap = 0
    if (t < 0.04) {
      slap = noise(t) * Math.sin(2 * Math.PI * 520 * t) * Math.exp(-t * 90) * 0.7
    }

    samples[i] = (bass * 0.8 + body + slap) * 0.95
  }
  return samples
}

// 2. Tabla Na: Crystalline ringing Syahi mode (294Hz + 855Hz + 1445Hz)
function generateTablaNa() {
  const duration = 1.3
  const totalSamples = Math.floor(SAMPLE_RATE * duration)
  const samples = new Float32Array(totalSamples)
  const f0 = 293.66 // D4 fundamental

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE
    const env1 = Math.exp(-t * 2.2)
    const env2 = Math.exp(-t * 2.8)
    const env3 = Math.exp(-t * 5.5)

    const fund = Math.sin(2 * Math.PI * f0 * t) * env1 * 0.75
    // Iconic ringing 2nd modal harmonic (approx 2.91x of fundamental on loaded membrane)
    const harmonic2 = Math.sin(2 * Math.PI * (f0 * 2.91) * t) * env2 * 0.55
    const harmonic3 = Math.sin(2 * Math.PI * (f0 * 4.92) * t) * env3 * 0.25

    // Outer rim chat finger strike
    let rimSnap = 0
    if (t < 0.02) {
      rimSnap = noise(t) * Math.sin(2 * Math.PI * 3400 * t) * Math.exp(-t * 120) * 0.4
    }

    samples[i] = (fund + harmonic2 + harmonic3 + rimSnap) * 0.9
  }
  return samples
}

// 3. Tabla Ge: Bayan deep bass with wrist glide (125Hz down to 62Hz)
function generateTablaGe() {
  const duration = 0.7
  const totalSamples = Math.floor(SAMPLE_RATE * duration)
  const samples = new Float32Array(totalSamples)

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE
    // Pitch drops from 125 to 62 Hz simulating wrist glide
    const pitch = 62 + 63 * Math.exp(-t * 9.5)
    const phase = 2 * Math.PI * (62 * t + (63 / 9.5) * (1 - Math.exp(-t * 9.5)))
    const sub = Math.sin(phase) * Math.exp(-t * 4.2)
    const warmHarmonic = Math.sin(phase * 2) * Math.exp(-t * 6.0) * 0.3

    let palmThud = 0
    if (t < 0.035) {
      palmThud = noise(t) * Math.exp(-t * 80) * 0.35
    }

    samples[i] = (sub * 0.85 + warmHarmonic + palmThud) * 0.95
  }
  return samples
}

// 4. Manjira: Bronze cup cymbals with phase beating and crystalline shimmer
function generateManjira() {
  const duration = 1.9
  const totalSamples = Math.floor(SAMPLE_RATE * duration)
  const samples = new Float32Array(totalSamples)

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE
    const env = Math.exp(-t * 1.8)
    // Detuned frequencies create 22Hz shimmer beating
    const c1 = Math.sin(2 * Math.PI * 3180 * t) * 0.5
    const c2 = Math.sin(2 * Math.PI * 3204 * t) * 0.5
    const overtone = Math.sin(2 * Math.PI * 5820 * t) * 0.35 * Math.exp(-t * 3.5)

    let clink = 0
    if (t < 0.015) {
      clink = noise(t) * Math.exp(-t * 150) * 0.4
    }

    samples[i] = ((c1 + c2) * env + overtone + clink) * 0.85
  }
  return samples
}

// 5. Kartal: Hardwood clack + rattling brass discs
function generateKartal() {
  const duration = 0.4
  const totalSamples = Math.floor(SAMPLE_RATE * duration)
  const samples = new Float32Array(totalSamples)

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE
    // Wood impact
    const wood1 = Math.sin(2 * Math.PI * 1150 * t) * Math.exp(-t * 65) * 0.7
    const wood2 = Math.sin(2 * Math.PI * 1850 * t) * Math.exp(-t * 85) * 0.4

    // Brass jingles flurry
    let jingles = 0
    if (t < 0.22) {
      // Fluttering envelope
      const flutter = (Math.sin(2 * Math.PI * 45 * t) + 1) * 0.5
      jingles = noise(t) * flutter * Math.sin(2 * Math.PI * 6200 * t) * Math.exp(-t * 14) * 0.45
    }

    samples[i] = (wood1 + wood2 + jingles) * 0.9
  }
  return samples
}

// 6. Khanjari: Goat-skin frame drum slap + rim jingles
function generateKhanjari() {
  const duration = 0.45
  const totalSamples = Math.floor(SAMPLE_RATE * duration)
  const samples = new Float32Array(totalSamples)

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE
    const pitch = 175 + 75 * Math.exp(-t * 16)
    const phase = 2 * Math.PI * (175 * t + (75 / 16) * (1 - Math.exp(-t * 16)))
    const drum = Math.sin(phase) * Math.exp(-t * 11) * 0.8

    let slap = 0
    if (t < 0.04) {
      slap = noise(t) * Math.sin(2 * Math.PI * 880 * t) * Math.exp(-t * 70) * 0.5
    }

    let jingles = 0
    if (t < 0.25) {
      jingles = noise(t) * Math.sin(2 * Math.PI * 4800 * t) * Math.exp(-t * 12) * 0.35
    }

    samples[i] = (drum + slap + jingles) * 0.9
  }
  return samples
}

// 7. Temple Ghanti: Sacred multi-tone brass bell with lingering sustain
function generateTempleGhanti() {
  const duration = 3.8
  const totalSamples = Math.floor(SAMPLE_RATE * duration)
  const samples = new Float32Array(totalSamples)
  const f = 1046.5 // C6

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE
    // Subtle sacred beating (3.6Hz tremolo)
    const trem = 1 + 0.06 * Math.sin(2 * Math.PI * 3.6 * t)

    const hum = Math.sin(2 * Math.PI * (f * 0.5) * t) * Math.exp(-t * 0.8) * 0.45
    const strike = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 1.0) * 0.75 * trem
    const tierce = Math.sin(2 * Math.PI * (f * 1.19) * t) * Math.exp(-t * 1.2) * 0.4
    const quint = Math.sin(2 * Math.PI * (f * 1.5) * t) * Math.exp(-t * 1.4) * 0.35
    const octave = Math.sin(2 * Math.PI * (f * 2.0) * t) * Math.exp(-t * 1.8) * 0.25

    let impact = 0
    if (t < 0.02) {
      impact = noise(t) * Math.exp(-t * 110) * 0.3
    }

    samples[i] = (hum + strike + tierce + quint + octave + impact) * 0.8
  }
  return samples
}

// 8. Sam Accent: Climax bronze gong crash + deep drum punch + bell shimmer
function generateSamAccent() {
  const duration = 2.6
  const totalSamples = Math.floor(SAMPLE_RATE * duration)
  const samples = new Float32Array(totalSamples)

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE
    // Deep bronze gong fundamental
    const gong = Math.sin(2 * Math.PI * 96 * t) * Math.exp(-t * 1.8) * 0.85

    // Inharmonic FM shimmer for bronze gong
    const mod = Math.sin(2 * Math.PI * 420 * t) * Math.exp(-t * 2.5) * 450
    const bronzeFM = Math.sin(2 * Math.PI * 290 * t + mod * t) * Math.exp(-t * 1.6) * 0.6

    // Devotional brass crash shimmer
    let crash = 0
    if (t < 1.2) {
      crash = noise(t) * Math.sin(2 * Math.PI * 2800 * t) * Math.exp(-t * 2.8) * 0.45
    }

    samples[i] = (gong + bronzeFM + crash) * 0.85
  }
  return samples
}

const generators = {
  'dholak.wav': generateDholak,
  'tabla_na.wav': generateTablaNa,
  'tabla_ge.wav': generateTablaGe,
  'manjira.wav': generateManjira,
  'kartal.wav': generateKartal,
  'khanjari.wav': generateKhanjari,
  'temple_ghanti.wav': generateTempleGhanti,
  'sam_accent.wav': generateSamAccent,
}

const outDir = path.resolve(__dirname, '../public/sounds')
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

console.log('Generating authentic devotional audio sample files into:', outDir)

for (const [filename, genFn] of Object.entries(generators)) {
  const samples = genFn()
  const wavBuffer = createWavBuffer(1, SAMPLE_RATE, samples)
  const filePath = path.join(outDir, filename)
  fs.writeFileSync(filePath, wavBuffer)
  console.log(`✓ Generated ${filename} (${(wavBuffer.length / 1024).toFixed(1)} KB)`)
}

console.log('All 8 authentic devotional percussion samples generated successfully!')
