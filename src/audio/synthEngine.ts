import { InstrumentId } from '../types/octapad'

/**
 * High-definition physical acoustic synthesis for authentic Indian devotional percussion.
 * Meticulously modeled after traditional Dholak, Tabla, Manjira, Kartal, Khanjari,
 * Temple Ghanti and devotional Sam accents.
 */

export interface SynthParams {
  velocity?: number
  pitchMultiplier?: number
  destination: AudioNode
}

export class DevotionalSynth {
  private ctx: AudioContext

  constructor(ctx: AudioContext) {
    this.ctx = ctx
  }

  play(instrument: InstrumentId, params: SynthParams) {
    const { velocity = 0.9, pitchMultiplier = 1.0, destination } = params
    const now = this.ctx.currentTime
    // Dynamic acoustic strike response: allows subtle ghost notes (0.06) up to punchy accents (1.5)
    const vel = Math.max(0.06, Math.min(1.5, Math.pow(velocity, 1.25)))

    switch (instrument) {
      case 'dholak':
        this.playDholak(now, vel, pitchMultiplier, destination)
        break
      case 'tabla_na':
        this.playTablaNa(now, vel, pitchMultiplier, destination)
        break
      case 'tabla_ge':
        this.playTablaGe(now, vel, pitchMultiplier, destination)
        break
      case 'manjira':
        this.playManjira(now, vel, pitchMultiplier, destination)
        break
      case 'kartal':
        this.playKartal(now, vel, pitchMultiplier, destination)
        break
      case 'khanjari':
        this.playKhanjari(now, vel, pitchMultiplier, destination)
        break
      case 'temple_ghanti':
        this.playTempleGhanti(now, vel, pitchMultiplier, destination)
        break
      case 'sam_accent':
        this.playSamAccent(now, vel, pitchMultiplier, destination)
        break
      case 'tasha':
        this.playTasha(now, vel, pitchMultiplier, destination)
        break
      case 'nagada':
        this.playNagada(now, vel, pitchMultiplier, destination)
        break
      case 'bass_808':
        this.play808Bass(now, vel, pitchMultiplier, destination)
        break
      case 'clap':
        this.playClap(now, vel, pitchMultiplier, destination)
        break
      case 'dj_effect':
        this.playDjEffect(now, vel, pitchMultiplier, destination)
        break
      case 'shankh':
        this.playShankh(now, vel, pitchMultiplier, destination)
        break
      case 'temple_gong':
        this.playTempleGong(now, vel, pitchMultiplier, destination)
        break
    }
  }

  /**
   * 1. DHOLAK (ढोलक):
   * Dual-membrane devotional barrel drum. Low resonant wooden bass thud
   * coupled with treble rim slap and body resonance.
   */
  private playDholak(t: number, vel: number, pitch: number, dest: AudioNode) {
    const ctx = this.ctx

    // Bass membrane: punchy attack falling into deep body resonance
    const bassOsc = ctx.createOscillator()
    const bassGain = ctx.createGain()
    const baseFreq = 78 * pitch
    bassOsc.type = 'sine'
    bassOsc.frequency.setValueAtTime(baseFreq * 2.1, t)
    bassOsc.frequency.exponentialRampToValueAtTime(baseFreq, t + 0.08)
    bassOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, t + 0.35)

    bassGain.gain.setValueAtTime(0.001, t)
    bassGain.gain.linearRampToValueAtTime(1.0 * vel, t + 0.004)
    bassGain.gain.exponentialRampToValueAtTime(0.3 * vel, t + 0.12)
    bassGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45)

    // Wooden shell body tone
    const bodyOsc = ctx.createOscillator()
    const bodyGain = ctx.createGain()
    bodyOsc.type = 'triangle'
    bodyOsc.frequency.setValueAtTime(156 * pitch, t)
    bodyOsc.frequency.exponentialRampToValueAtTime(120 * pitch, t + 0.15)
    bodyGain.gain.setValueAtTime(0.4 * vel, t)
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18)

    // Treble skin slap transient
    const noise = this.createNoiseBufferNode(0.05)
    const noiseFilter = ctx.createBiquadFilter()
    const noiseGain = ctx.createGain()
    noiseFilter.type = 'bandpass'
    noiseFilter.frequency.setValueAtTime(480 * pitch, t)
    noiseFilter.Q.setValueAtTime(2.5, t)
    noiseGain.gain.setValueAtTime(0.6 * vel, t)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05)

    // Connect nodes
    bassOsc.connect(bassGain)
    bassGain.connect(dest)

    bodyOsc.connect(bodyGain)
    bodyGain.connect(dest)

    noise.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(dest)

    bassOsc.start(t)
    bassOsc.stop(t + 0.5)
    bodyOsc.start(t)
    bodyOsc.stop(t + 0.2)
    noise.start(t)
  }

  /**
   * 2. TABLA NA (तबला ना - Dayan rim ring):
   * Crystalline, singing metallic bell-like tone tuned to key (D4 ~ 294Hz)
   * with harmonic modes at ~2.89x and ~4.9x due to central Syahi black paste.
   */
  private playTablaNa(t: number, vel: number, pitch: number, dest: AudioNode) {
    const ctx = this.ctx
    const fund = 293.66 * pitch // D4 fundamental

    // Fundamental pure singing mode
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(fund * 1.05, t)
    osc1.frequency.exponentialRampToValueAtTime(fund, t + 0.02)
    gain1.gain.setValueAtTime(0.001, t)
    gain1.gain.linearRampToValueAtTime(0.85 * vel, t + 0.003)
    gain1.gain.exponentialRampToValueAtTime(0.2 * vel, t + 0.4)
    gain1.gain.exponentialRampToValueAtTime(0.0001, t + 1.2)

    // 2nd Syahi modal harmonic (high metallic singing overtone ~ 2.89x)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(fund * 2.89, t)
    gain2.gain.setValueAtTime(0.7 * vel, t)
    gain2.gain.exponentialRampToValueAtTime(0.15 * vel, t + 0.3)
    gain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.95)

    // 3rd upper overtone (~ 4.92x)
    const osc3 = ctx.createOscillator()
    const gain3 = ctx.createGain()
    osc3.type = 'sine'
    osc3.frequency.setValueAtTime(fund * 4.92, t)
    gain3.gain.setValueAtTime(0.35 * vel, t)
    gain3.gain.exponentialRampToValueAtTime(0.0001, t + 0.35)

    // Crisp finger strike snap on outer Chat rim
    const slap = this.createNoiseBufferNode(0.025)
    const slapFilter = ctx.createBiquadFilter()
    const slapGain = ctx.createGain()
    slapFilter.type = 'bandpass'
    slapFilter.frequency.setValueAtTime(3200, t)
    slapFilter.Q.setValueAtTime(4.0, t)
    slapGain.gain.setValueAtTime(0.5 * vel, t)
    slapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.025)

    osc1.connect(gain1); gain1.connect(dest)
    osc2.connect(gain2); gain2.connect(dest)
    osc3.connect(gain3); gain3.connect(dest)
    slap.connect(slapFilter); slapFilter.connect(slapGain); slapGain.connect(dest)

    osc1.start(t); osc1.stop(t + 1.25)
    osc2.start(t); osc2.stop(t + 1.0)
    osc3.start(t); osc3.stop(t + 0.4)
    slap.start(t)
  }

  /**
   * 3. TABLA GE (तबला घे - Bayan Bass):
   * Deep copper kettle drum with palm heel pitch glide ("Ghe").
   */
  private playTablaGe(t: number, vel: number, pitch: number, dest: AudioNode) {
    const ctx = this.ctx
    const startFreq = 125 * pitch
    const endFreq = 65 * pitch

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    // Wrist pressure glide
    osc.frequency.setValueAtTime(startFreq, t)
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.18)
    osc.frequency.exponentialRampToValueAtTime(endFreq * 0.9, t + 0.45)

    gain.gain.setValueAtTime(0.001, t)
    gain.gain.linearRampToValueAtTime(1.0 * vel, t + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.4 * vel, t + 0.2)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6)

    // Warm sub-harmonic body resonance
    const subOsc = ctx.createOscillator()
    const subGain = ctx.createGain()
    subOsc.type = 'triangle'
    subOsc.frequency.setValueAtTime(startFreq * 0.5, t)
    subOsc.frequency.exponentialRampToValueAtTime(endFreq * 0.5, t + 0.2)
    subGain.gain.setValueAtTime(0.35 * vel, t)
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35)

    // Soft palm thud
    const thud = this.createNoiseBufferNode(0.04)
    const thudFilter = ctx.createBiquadFilter()
    const thudGain = ctx.createGain()
    thudFilter.type = 'lowpass'
    thudFilter.frequency.setValueAtTime(220, t)
    thudGain.gain.setValueAtTime(0.4 * vel, t)
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04)

    osc.connect(gain); gain.connect(dest)
    subOsc.connect(subGain); subGain.connect(dest)
    thud.connect(thudFilter); thudFilter.connect(thudGain); thudGain.connect(dest)

    osc.start(t); osc.stop(t + 0.65)
    subOsc.start(t); subOsc.stop(t + 0.4)
    thud.start(t)
  }

  /**
   * 4. MANJIRA (मंजीरा - Bronze Hand Cymbals):
   * High pure bronze chime with shimmer and phase beating between the two cymbals.
   */
  private playManjira(t: number, vel: number, pitch: number, dest: AudioNode) {
    const ctx = this.ctx
    const f1 = 3180 * pitch
    const f2 = 3205 * pitch // Detuned for 25Hz shimmer beat
    const f3 = 5820 * pitch

    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(f1, t)
    gain1.gain.setValueAtTime(0.5 * vel, t)
    gain1.gain.exponentialRampToValueAtTime(0.0001, t + 1.8)

    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(f2, t)
    gain2.gain.setValueAtTime(0.5 * vel, t)
    gain2.gain.exponentialRampToValueAtTime(0.0001, t + 1.8)

    const osc3 = ctx.createOscillator()
    const gain3 = ctx.createGain()
    osc3.type = 'sine'
    osc3.frequency.setValueAtTime(f3, t)
    gain3.gain.setValueAtTime(0.3 * vel, t)
    gain3.gain.exponentialRampToValueAtTime(0.0001, t + 0.9)

    // Initial bronze rim strike clink
    const clink = this.createNoiseBufferNode(0.02)
    const clinkFilter = ctx.createBiquadFilter()
    const clinkGain = ctx.createGain()
    clinkFilter.type = 'highpass'
    clinkFilter.frequency.setValueAtTime(4500, t)
    clinkGain.gain.setValueAtTime(0.4 * vel, t)
    clinkGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02)

    osc1.connect(gain1); gain1.connect(dest)
    osc2.connect(gain2); gain2.connect(dest)
    osc3.connect(gain3); gain3.connect(dest)
    clink.connect(clinkFilter); clinkFilter.connect(clinkGain); clinkGain.connect(dest)

    osc1.start(t); osc1.stop(t + 1.85)
    osc2.start(t); osc2.stop(t + 1.85)
    osc3.start(t); osc3.stop(t + 0.95)
    clink.start(t)
  }

  /**
   * 5. KARTAL (करताल - Wooden Clappers with Brass Jingles):
   * Sharp hardwood clack followed by flutter of miniature brass zills.
   */
  private playKartal(t: number, vel: number, pitch: number, dest: AudioNode) {
    const ctx = this.ctx

    // Hardwood block clack (dual resonant wood frequencies)
    const wood1 = ctx.createOscillator()
    const woodGain1 = ctx.createGain()
    wood1.type = 'sine'
    wood1.frequency.setValueAtTime(1250 * pitch, t)
    wood1.frequency.exponentialRampToValueAtTime(800 * pitch, t + 0.04)
    woodGain1.gain.setValueAtTime(0.8 * vel, t)
    woodGain1.gain.exponentialRampToValueAtTime(0.001, t + 0.045)

    const wood2 = ctx.createOscillator()
    const woodGain2 = ctx.createGain()
    wood2.type = 'triangle'
    wood2.frequency.setValueAtTime(2100 * pitch, t)
    woodGain2.gain.setValueAtTime(0.5 * vel, t)
    woodGain2.gain.exponentialRampToValueAtTime(0.001, t + 0.03)

    // Wood body impact noise
    const woodNoise = this.createNoiseBufferNode(0.035)
    const woodFilter = ctx.createBiquadFilter()
    const woodNoiseGain = ctx.createGain()
    woodFilter.type = 'bandpass'
    woodFilter.frequency.setValueAtTime(1400 * pitch, t)
    woodFilter.Q.setValueAtTime(3.5, t)
    woodNoiseGain.gain.setValueAtTime(0.7 * vel, t)
    woodNoiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.035)

    // Shaking brass jingles (rapid flutter)
    const jingles = this.createNoiseBufferNode(0.25)
    const jingleFilter = ctx.createBiquadFilter()
    const jingleGain = ctx.createGain()
    jingleFilter.type = 'highpass'
    jingleFilter.frequency.setValueAtTime(6000, t)

    // Modulate jingle gain to create loose disk flutter
    jingleGain.gain.setValueAtTime(0.35 * vel, t + 0.005)
    jingleGain.gain.exponentialRampToValueAtTime(0.2 * vel, t + 0.07)
    jingleGain.gain.exponentialRampToValueAtTime(0.08 * vel, t + 0.14)
    jingleGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.24)

    wood1.connect(woodGain1); woodGain1.connect(dest)
    wood2.connect(woodGain2); woodGain2.connect(dest)
    woodNoise.connect(woodFilter); woodFilter.connect(woodNoiseGain); woodNoiseGain.connect(dest)
    jingles.connect(jingleFilter); jingleFilter.connect(jingleGain); jingleGain.connect(dest)

    wood1.start(t); wood1.stop(t + 0.05)
    wood2.start(t); wood2.stop(t + 0.04)
    woodNoise.start(t)
    jingles.start(t)
  }

  /**
   * 6. KHANJARI (खंजरी - Devotional Dapli / Frame Drum):
   * Snappy goat-skin slap with tambourine-like jingle rattle.
   */
  private playKhanjari(t: number, vel: number, pitch: number, dest: AudioNode) {
    const ctx = this.ctx

    // Frame membrane tone
    const drum = ctx.createOscillator()
    const drumGain = ctx.createGain()
    drum.type = 'sine'
    drum.frequency.setValueAtTime(240 * pitch, t)
    drum.frequency.exponentialRampToValueAtTime(160 * pitch, t + 0.12)
    drumGain.gain.setValueAtTime(0.001, t)
    drumGain.gain.linearRampToValueAtTime(0.9 * vel, t + 0.004)
    drumGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22)

    // Crisp skin slap
    const slap = this.createNoiseBufferNode(0.05)
    const slapFilter = ctx.createBiquadFilter()
    const slapGain = ctx.createGain()
    slapFilter.type = 'bandpass'
    slapFilter.frequency.setValueAtTime(950 * pitch, t)
    slapFilter.Q.setValueAtTime(3.0, t)
    slapGain.gain.setValueAtTime(0.7 * vel, t)
    slapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05)

    // Rim jingle burst
    const jingles = this.createNoiseBufferNode(0.28)
    const jingleFilter = ctx.createBiquadFilter()
    const jingleGain = ctx.createGain()
    jingleFilter.type = 'highpass'
    jingleFilter.frequency.setValueAtTime(4500, t)
    jingleGain.gain.setValueAtTime(0.4 * vel, t)
    jingleGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.26)

    drum.connect(drumGain); drumGain.connect(dest)
    slap.connect(slapFilter); slapFilter.connect(slapGain); slapGain.connect(dest)
    jingles.connect(jingleFilter); jingleFilter.connect(jingleGain); jingleGain.connect(dest)

    drum.start(t); drum.stop(t + 0.25)
    slap.start(t)
    jingles.start(t)
  }

  /**
   * 7. TEMPLE GHANTI (मंदिर घण्टा - Sacred Brass Mandir Bell):
   * Deep multi-harmonic resonance, hum tone, minor third, and slow sacred sustain.
   */
  private playTempleGhanti(t: number, vel: number, pitch: number, dest: AudioNode) {
    const ctx = this.ctx
    const strike = 1046.5 * pitch // C6

    // Bell overtones: Hum (0.5x), Strike (1.0x), Tierce (1.19x), Quint (1.5x), Octave (2.0x), High (3.0x)
    const harmonics = [
      { ratio: 0.5, gain: 0.45, decay: 4.2 },
      { ratio: 1.0, gain: 0.8, decay: 3.5 },
      { ratio: 1.19, gain: 0.5, decay: 3.0 },
      { ratio: 1.5, gain: 0.4, decay: 2.5 },
      { ratio: 2.0, gain: 0.35, decay: 2.0 },
      { ratio: 3.0, gain: 0.2, decay: 1.2 },
    ]

    harmonics.forEach(h => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(strike * h.ratio, t)
      
      // Slight sacred tremolo / beating
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfo.frequency.setValueAtTime(3.8 + Math.random() * 0.8, t)
      lfoGain.gain.setValueAtTime(strike * h.ratio * 0.004, t)
      lfo.connect(osc.frequency)
      lfo.start(t)
      lfo.stop(t + h.decay)

      g.gain.setValueAtTime(0.001, t)
      g.gain.linearRampToValueAtTime(h.gain * vel, t + 0.005)
      g.gain.exponentialRampToValueAtTime(0.0001, t + h.decay)

      osc.connect(g)
      g.connect(dest)

      osc.start(t)
      osc.stop(t + h.decay + 0.05)
    })

    // Clapper striking brass impact
    const clapper = this.createNoiseBufferNode(0.03)
    const clapperFilter = ctx.createBiquadFilter()
    const clapperGain = ctx.createGain()
    clapperFilter.type = 'bandpass'
    clapperFilter.frequency.setValueAtTime(2800, t)
    clapperFilter.Q.setValueAtTime(5, t)
    clapperGain.gain.setValueAtTime(0.5 * vel, t)
    clapperGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03)

    clapper.connect(clapperFilter); clapperFilter.connect(clapperGain); clapperGain.connect(dest)
    clapper.start(t)
  }

  /**
   * 8. TAAL / SAM ACCENT (ताल / सम एक्सेंट - Devotional Climax Accent):
   * Powerful resonant combination of bronze tam-tam/gong, deep drum punch,
   * and sacred bell shimmer marking the rhythm cycle's pinnacle beat (Sam).
   */
  private playSamAccent(t: number, vel: number, pitch: number, dest: AudioNode) {
    const ctx = this.ctx

    // Deep bronze gong fundamental & low body
    const gongFund = 98 * pitch
    const gongOsc = ctx.createOscillator()
    const gongGain = ctx.createGain()
    gongOsc.type = 'sine'
    gongOsc.frequency.setValueAtTime(gongFund * 1.5, t)
    gongOsc.frequency.exponentialRampToValueAtTime(gongFund, t + 0.08)
    gongGain.gain.setValueAtTime(1.1 * vel, t)
    gongGain.gain.exponentialRampToValueAtTime(0.4 * vel, t + 0.4)
    gongGain.gain.exponentialRampToValueAtTime(0.0001, t + 2.5)

    // Rich inharmonic bronze gong shimmer (FM synthesis)
    const modOsc = ctx.createOscillator()
    const modGain = ctx.createGain()
    const carrier = ctx.createOscillator()
    const carrierGain = ctx.createGain()

    carrier.frequency.setValueAtTime(295 * pitch, t)
    modOsc.frequency.setValueAtTime(410 * pitch, t)
    modGain.gain.setValueAtTime(600 * vel, t)
    modGain.gain.exponentialRampToValueAtTime(0.1, t + 1.8)

    modOsc.connect(carrier.frequency)
    carrier.connect(carrierGain)
    carrierGain.gain.setValueAtTime(0.7 * vel, t)
    carrierGain.gain.exponentialRampToValueAtTime(0.0001, t + 2.2)

    // Majestic brass wash / crash
    const wash = this.createNoiseBufferNode(1.5)
    const washFilter = ctx.createBiquadFilter()
    const washGain = ctx.createGain()
    washFilter.type = 'bandpass'
    washFilter.frequency.setValueAtTime(3200, t)
    washFilter.Q.setValueAtTime(1.8, t)
    washGain.gain.setValueAtTime(0.65 * vel, t)
    washGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4)

    gongOsc.connect(gongGain); gongGain.connect(dest)
    carrierGain.connect(dest)
    wash.connect(washFilter); washFilter.connect(washGain); washGain.connect(dest)

    gongOsc.start(t); gongOsc.stop(t + 2.6)
    modOsc.start(t); modOsc.stop(t + 2.0)
    carrier.start(t); carrier.stop(t + 2.3)
    wash.start(t)
  }

  /**
   * 9. TASHA SNARE (ताशा):
   * Crisp, metallic marching percussion with snappy rim bite and snare wire sizzle.
   */
  private playTasha(t: number, vel: number, pitch: number, dest: AudioNode) {
    const ctx = this.ctx
    // Rim / membrane tone
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(320 * pitch, t)
    osc.frequency.exponentialRampToValueAtTime(180 * pitch, t + 0.08)
    oscGain.gain.setValueAtTime(0.8 * vel, t)
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
    osc.connect(oscGain); oscGain.connect(dest)
    osc.start(t); osc.stop(t + 0.14)

    // Snappy noise snare bed
    const noise = this.createNoiseBufferNode(0.18)
    const filter = ctx.createBiquadFilter()
    const noiseGain = ctx.createGain()
    filter.type = 'highpass'
    filter.frequency.setValueAtTime(1200 * pitch, t)
    noiseGain.gain.setValueAtTime(0.9 * vel, t)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16)
    noise.connect(filter); filter.connect(noiseGain); noiseGain.connect(dest)
    noise.start(t)
  }

  /**
   * 10. ROYAL NAGADA (शाही नगाड़ा):
   * Massive kettle drum with huge acoustic air movement and sub bass decay.
   */
  private playNagada(t: number, vel: number, pitch: number, dest: AudioNode) {
    const ctx = this.ctx
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const baseFreq = 62 * pitch
    osc.type = 'sine'
    osc.frequency.setValueAtTime(baseFreq * 2.8, t)
    osc.frequency.exponentialRampToValueAtTime(baseFreq, t + 0.09)
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, t + 0.6)

    gain.gain.setValueAtTime(0.001, t)
    gain.gain.linearRampToValueAtTime(1.2 * vel, t + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.4 * vel, t + 0.2)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9)

    // Wooden strike transient
    const strike = this.createNoiseBufferNode(0.04)
    const filter = ctx.createBiquadFilter()
    const strikeGain = ctx.createGain()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(350 * pitch, t)
    filter.Q.setValueAtTime(3, t)
    strikeGain.gain.setValueAtTime(0.7 * vel, t)
    strikeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04)
    strike.connect(filter); filter.connect(strikeGain); strikeGain.connect(dest)
    strike.start(t)

    osc.connect(gain); gain.connect(dest)
    osc.start(t); osc.stop(t + 0.95)
  }

  /**
   * 11. 808 SUB BASS BOOM (808 सब बास):
   * Low punchy sine wave drop for DJ, hip-hop and modern fusion sets.
   */
  private play808Bass(t: number, vel: number, pitch: number, dest: AudioNode) {
    const ctx = this.ctx
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const baseFreq = 52 * pitch
    osc.type = 'sine'
    osc.frequency.setValueAtTime(baseFreq * 3.2, t)
    osc.frequency.exponentialRampToValueAtTime(baseFreq, t + 0.06)
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.95, t + 0.8)

    gain.gain.setValueAtTime(1.1 * vel, t)
    gain.gain.exponentialRampToValueAtTime(0.6 * vel, t + 0.3)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2)

    osc.connect(gain); gain.connect(dest)
    osc.start(t); osc.stop(t + 1.25)
  }

  /**
   * 12. STUDIO HAND CLAP (स्टूडियो क्लैप):
   * Multi-burst realistic hand clap with ambient tail.
   */
  private playClap(t: number, vel: number, pitch: number, dest: AudioNode) {
    const ctx = this.ctx
    // 3 micro-bursts of hands slapping before main envelope
    const burstTimes = [0, 0.012, 0.024]
    burstTimes.forEach(offset => {
      const noise = this.createNoiseBufferNode(0.03)
      const filter = ctx.createBiquadFilter()
      const gain = ctx.createGain()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(1100 * pitch, t + offset)
      filter.Q.setValueAtTime(2.0, t + offset)
      gain.gain.setValueAtTime(0.7 * vel, t + offset)
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.025)
      noise.connect(filter); filter.connect(gain); gain.connect(dest)
      noise.start(t + offset)
    })

    // Main body & tail
    const mainNoise = this.createNoiseBufferNode(0.25)
    const mainFilter = ctx.createBiquadFilter()
    const mainGain = ctx.createGain()
    mainFilter.type = 'bandpass'
    mainFilter.frequency.setValueAtTime(1050 * pitch, t + 0.03)
    mainFilter.Q.setValueAtTime(1.5, t + 0.03)
    mainGain.gain.setValueAtTime(0.9 * vel, t + 0.03)
    mainGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28)
    mainNoise.connect(mainFilter); mainFilter.connect(mainGain); mainGain.connect(dest)
    mainNoise.start(t + 0.03)
  }

  /**
   * 13. DJ AIR HORN / SIREN (डीजे एयर हॉर्न):
   * Dual oscillator harmonic horn blast.
   */
  private playDjEffect(t: number, vel: number, pitch: number, dest: AudioNode) {
    const ctx = this.ctx
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()
    const freq = 466 * pitch // Bb4
    osc1.type = 'sawtooth'
    osc2.type = 'sawtooth'
    osc1.frequency.setValueAtTime(freq * 0.9, t)
    osc1.frequency.linearRampToValueAtTime(freq, t + 0.04)
    osc2.frequency.setValueAtTime((freq * 1.5) * 0.9, t)
    osc2.frequency.linearRampToValueAtTime(freq * 1.5, t + 0.04)

    gain.gain.setValueAtTime(0.7 * vel, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45)

    osc1.connect(gain); osc2.connect(gain); gain.connect(dest)
    osc1.start(t); osc1.stop(t + 0.5)
    osc2.start(t); osc2.stop(t + 0.5)
  }

  /**
   * 14. DEVOTIONAL SHANKH (दिव्य शंख):
   * Sacred conch shell resonant glide and soaring overtones.
   */
  private playShankh(t: number, vel: number, pitch: number, dest: AudioNode) {
    const ctx = this.ctx
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const fund = 233 * pitch
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(fund * 0.85, t)
    osc.frequency.linearRampToValueAtTime(fund, t + 0.12)
    osc.frequency.linearRampToValueAtTime(fund * 1.05, t + 0.7)

    gain.gain.setValueAtTime(0.001, t)
    gain.gain.linearRampToValueAtTime(0.85 * vel, t + 0.1)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6)

    osc.connect(gain); gain.connect(dest)
    osc.start(t); osc.stop(t + 1.7)
  }

  /**
   * 15. TEMPLE GONG (कांस्य घंटा):
   * Heavy bronze gong with deep metallic resonance.
   */
  private playTempleGong(t: number, vel: number, pitch: number, dest: AudioNode) {
    const ctx = this.ctx
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(110 * pitch, t)
    gain.gain.setValueAtTime(1.0 * vel, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.2)

    osc.connect(gain); gain.connect(dest)
    osc.start(t); osc.stop(t + 2.3)
  }

  /**
   * Helper: generates a clean white noise audio buffer source
   */
  private createNoiseBufferNode(durationSeconds: number): AudioBufferSourceNode {
    const ctx = this.ctx
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * durationSeconds))
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    return source
  }
}
