import { InstrumentId, RecordedHit, RecordingSession } from '../types/octapad'
import { DevotionalSynth } from './synthEngine'
import { createTempleImpulseResponse } from './reverb'

export interface AudioEngineCallbacks {
  onPadTriggerVisual?: (padId: string) => void
  onMetronomeTick?: (beat: number, isAccent: boolean) => void
  onRecordingPlaybackComplete?: () => void
  onTrackStateChange?: (padId: string, isPlaying: boolean) => void
}

export class AudioEngine {
  private ctx: AudioContext | null = null
  private synth: DevotionalSynth | null = null
  private masterGain: GainNode | null = null
  private reverbConvolver: ConvolverNode | null = null
  private reverbGain: GainNode | null = null
  private analyser: AnalyserNode | null = null

  // Individual Pad Gains & Panners (keyed by padId or InstrumentId)
  private padGains: Map<string, GainNode> = new Map()
  private padReverbSends: Map<string, GainNode> = new Map()

  // Audio Samples Cache (keyed by padId, InstrumentId, or soundUrl)
  private sampleBuffers: Map<string, AudioBuffer> = new Map()
  private sampleLoadedState: Map<string, boolean> = new Map()

  // Track Audio Elements for backing music / loops
  private trackAudios: Map<string, HTMLAudioElement> = new Map()
  private trackMediaSources: Map<string, MediaElementAudioSourceNode> = new Map()
  private trackPlayingStates: Map<string, boolean> = new Map()

  // State
  private masterVolume = 0.85
  private isMuted = false
  private reverbAmount = 0.35 // 0 to 1

  // Metronome
  private metronomeBpm = 90
  private isMetronomePlaying = false
  private metronomeTimerId: number | null = null
  private currentMetronomeBeat = 0
  private beatsPerCycle = 8 // 8 Matras (Keharwa / standard devotional cycle)
  private nextBeatTime = 0
  private metronomeVolume = 0.65

  // Recorder
  private isRecording = false
  private recordingStartTime = 0
  private recordedHits: RecordedHit[] = []
  private isPlayingBack = false
  private playbackTimeoutIds: number[] = []

  // Callbacks
  private callbacks: AudioEngineCallbacks = {}

  constructor(callbacks?: AudioEngineCallbacks) {
    if (callbacks) {
      this.callbacks = callbacks
    }
  }

  setCallbacks(callbacks: AudioEngineCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  /**
   * Initializes or resumes the AudioContext on first user interaction.
   */
  async ensureAudioContext(): Promise<AudioContext> {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AudioCtxClass({
        latencyHint: 'interactive'
      })

      this.synth = new DevotionalSynth(this.ctx)

      // Master output node
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime)

      // Analyser for UI visual meters
      this.analyser = this.ctx.createAnalyser()
      this.analyser.fftSize = 64
      this.analyser.smoothingTimeConstant = 0.8

      // Reverb routing
      this.reverbConvolver = this.ctx.createConvolver()
      this.reverbConvolver.buffer = createTempleImpulseResponse(this.ctx)

      this.reverbGain = this.ctx.createGain()
      this.reverbGain.gain.setValueAtTime(this.reverbAmount, this.ctx.currentTime)

      this.reverbConvolver.connect(this.reverbGain)
      this.reverbGain.connect(this.masterGain)

      this.masterGain.connect(this.analyser)
      this.analyser.connect(this.ctx.destination)

      // Pre-initialize gain nodes for default pads
      const pads = [
        'dholak', 'tabla_na', 'tabla_ge', 'manjira',
        'kartal', 'khanjari', 'temple_ghanti', 'sam_accent'
      ]

      pads.forEach(id => {
        this.getPadGain(id)
      })

      // Initialize backing tracks
      this.initTrackAudios()

      // Load all available sample files
      this.loadSoundSamples()
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume()
    }

    return this.ctx
  }

  /**
   * Lazily creates or returns the GainNode for a pad
   */
  getPadGain(padId: string): GainNode {
    let padGain = this.padGains.get(padId)
    if (!padGain && this.ctx && this.masterGain) {
      padGain = this.ctx.createGain()
      padGain.gain.setValueAtTime(1.0, this.ctx.currentTime)
      padGain.connect(this.masterGain)
      this.padGains.set(padId, padGain)

      if (this.reverbConvolver) {
        const send = this.ctx.createGain()
        send.gain.setValueAtTime(this.reverbAmount, this.ctx.currentTime)
        send.connect(this.reverbConvolver)
        padGain.connect(send)
        this.padReverbSends.set(padId, send)
      }
    }
    return padGain || this.masterGain!
  }

  /**
   * Initializes backing tracks for Pad 4 (Garba Loop), Pad 7 (Dholak Matka), Pad 8 (Dhol Thali)
   */
  private initTrackAudios() {
    if (!this.ctx || this.trackAudios.size > 0) return

    const trackConfigs = [
      { id: 'manjira', path: '/sounds/garba_loop.mp3' },
      { id: 'temple_ghanti', path: '/sounds/dholak_matka.m4a' },
      { id: 'sam_accent', path: '/sounds/dhol_thali.m4a' },
      { id: '/sounds/garba_loop.mp3', path: '/sounds/garba_loop.mp3' },
      { id: '/sounds/dholak_matka.m4a', path: '/sounds/dholak_matka.m4a' },
      { id: '/sounds/dhol_thali.m4a', path: '/sounds/dhol_thali.m4a' }
    ]

    trackConfigs.forEach(({ id, path }) => {
      if (this.trackAudios.has(id)) return

      const audio = new Audio(path)
      audio.preload = 'metadata'
      audio.loop = true
      audio.crossOrigin = 'anonymous'

      audio.addEventListener('play', () => {
        this.trackPlayingStates.set(id, true)
        if (this.callbacks.onTrackStateChange) {
          this.callbacks.onTrackStateChange(id, true)
        }
      })

      audio.addEventListener('pause', () => {
        this.trackPlayingStates.set(id, false)
        if (this.callbacks.onTrackStateChange) {
          this.callbacks.onTrackStateChange(id, false)
        }
      })

      audio.addEventListener('ended', () => {
        this.trackPlayingStates.set(id, false)
        if (this.callbacks.onTrackStateChange) {
          this.callbacks.onTrackStateChange(id, false)
        }
      })

      try {
        const sourceNode = this.ctx!.createMediaElementSource(audio)
        const padGain = this.getPadGain(id)
        sourceNode.connect(padGain)
        this.trackMediaSources.set(id, sourceNode)
      } catch (err) {
        console.warn(`Could not connect media element source for ${id}:`, err)
      }

      this.trackAudios.set(id, audio)
      this.trackPlayingStates.set(id, false)
    })
  }

  /**
   * Preloads all authentic one-shot sound sample files into memory
   */
  private async loadSoundSamples() {
    if (!this.ctx) return

    const sampleFiles = [
      { id: 'dholak', url: '/sounds/dholak.wav' },
      { id: 'tabla_na', url: '/sounds/tabla_na.wav' },
      { id: 'tabla_ge', url: '/sounds/tabla_ge.wav' },
      { id: 'kartal', url: '/sounds/kartal.wav' },
      { id: 'khanjari', url: '/sounds/khanjari.wav' },
      { id: 'manjira', url: '/sounds/manjira.wav' },
      { id: 'temple_ghanti', url: '/sounds/temple_ghanti.wav' },
      { id: 'sam_accent', url: '/sounds/sam_accent.wav' }
    ]

    for (const item of sampleFiles) {
      try {
        const fileRes = await fetch(item.url)
        if (fileRes.ok) {
          const arrayBuffer = await fileRes.arrayBuffer()
          const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer)
          this.sampleBuffers.set(item.id, audioBuffer)
          this.sampleBuffers.set(item.url, audioBuffer)
          this.sampleLoadedState.set(item.id, true)
        }
      } catch (err) {
        console.warn(`Could not preload audio sample ${item.url}:`, err)
        this.sampleLoadedState.set(item.id, false)
      }
    }
  }

  /**
   * Registers a custom user-dropped audio file for a pad
   */
  async loadCustomSample(padId: InstrumentId, file: File): Promise<boolean> {
    const ctx = await this.ensureAudioContext()
    try {
      const arrayBuffer = await file.arrayBuffer()
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
      this.sampleBuffers.set(padId, audioBuffer)
      this.sampleLoadedState.set(padId, true)
      return true
    } catch (err) {
      console.error(`Failed to decode custom audio file for ${padId}:`, err)
      return false
    }
  }

  getSampleStatus(): Record<InstrumentId, { hasCustomSample: boolean }> {
    const status = {} as Record<InstrumentId, { hasCustomSample: boolean }>
    const pads: InstrumentId[] = [
      'dholak', 'tabla_na', 'tabla_ge', 'manjira',
      'kartal', 'khanjari', 'temple_ghanti', 'sam_accent'
    ]
    pads.forEach(id => {
      status[id] = {
        hasCustomSample: this.sampleBuffers.has(id) || this.trackAudios.has(id)
      }
    })
    return status
  }

  /**
   * Stops other backing tracks except the specified one
   */
  stopOtherTracks(exceptId?: InstrumentId) {
    this.trackAudios.forEach((audio, id) => {
      if (id !== exceptId && !audio.paused) {
        audio.pause()
        audio.currentTime = 0
        this.trackPlayingStates.set(id, false)
        if (this.callbacks.onTrackStateChange) {
          this.callbacks.onTrackStateChange(id, false)
        }
      }
    })
  }

  /**
   * Stops all backing tracks
   */
  stopAllTracks() {
    this.trackAudios.forEach((audio, id) => {
      if (!audio.paused) {
        audio.pause()
        audio.currentTime = 0
        this.trackPlayingStates.set(id, false)
        if (this.callbacks.onTrackStateChange) {
          this.callbacks.onTrackStateChange(id, false)
        }
      }
    })
  }

  isTrackPlaying(padId: InstrumentId): boolean {
    return this.trackPlayingStates.get(padId) ?? false
  }

  getPlayingTracks(): Record<InstrumentId, boolean> {
    const res = {} as Record<InstrumentId, boolean>
    this.trackPlayingStates.forEach((val, key) => {
      res[key] = val
    })
    return res
  }

  setPadPitch(padId: string, pitch: number) {
    const audio = this.trackAudios.get(padId)
    if (audio) {
      audio.playbackRate = Math.max(0.5, Math.min(2.0, pitch))
    }
  }

  /**
   * Trigger a pad strike with immediate zero-latency playback.
   */
  async playPad(
    padId: string,
    params: {
      velocity?: number
      pitchMultiplier?: number
      isManualTrigger?: boolean
      soundUrl?: string
      isTrack?: boolean
      synthType?: string
    } = {}
  ) {
    const ctx = await this.ensureAudioContext()
    const { velocity = 0.95, pitchMultiplier = 1.0, isManualTrigger = true, soundUrl, isTrack, synthType } = params

    // Trigger visual callback immediately
    if (this.callbacks.onPadTriggerVisual) {
      this.callbacks.onPadTriggerVisual(padId)
    }

    // If recording is active and this is a manual strike, record it!
    if (this.isRecording && isManualTrigger) {
      const timeMs = Math.round(performance.now() - this.recordingStartTime)
      this.recordedHits.push({
        padId,
        timeMs,
        velocity
      })
    }

    // Check if this pad is a backing music track (Loop or long track)
    if (isTrack || this.trackAudios.has(padId) || (soundUrl && this.trackAudios.has(soundUrl))) {
      let trackAudio = this.trackAudios.get(padId) || (soundUrl ? this.trackAudios.get(soundUrl) : undefined)

      if (!trackAudio && soundUrl) {
        trackAudio = new Audio(soundUrl)
        trackAudio.preload = 'metadata'
        trackAudio.loop = true
        trackAudio.crossOrigin = 'anonymous'

        trackAudio.addEventListener('play', () => {
          this.trackPlayingStates.set(padId, true)
          if (this.callbacks.onTrackStateChange) {
            this.callbacks.onTrackStateChange(padId, true)
          }
        })

        trackAudio.addEventListener('pause', () => {
          this.trackPlayingStates.set(padId, false)
          if (this.callbacks.onTrackStateChange) {
            this.callbacks.onTrackStateChange(padId, false)
          }
        })

        trackAudio.addEventListener('ended', () => {
          this.trackPlayingStates.set(padId, false)
          if (this.callbacks.onTrackStateChange) {
            this.callbacks.onTrackStateChange(padId, false)
          }
        })

        try {
          const sourceNode = ctx.createMediaElementSource(trackAudio)
          const padGain = this.getPadGain(padId)
          sourceNode.connect(padGain)
          this.trackMediaSources.set(padId, sourceNode)
        } catch (err) {
          console.warn(`Could not connect media element source for ${padId}:`, err)
        }

        this.trackAudios.set(padId, trackAudio)
        this.trackAudios.set(soundUrl, trackAudio)
      }

      if (trackAudio) {
        if (!trackAudio.paused) {
          // Already playing -> Toggle stop
          trackAudio.pause()
          trackAudio.currentTime = 0
          this.trackPlayingStates.set(padId, false)
          if (this.callbacks.onTrackStateChange) {
            this.callbacks.onTrackStateChange(padId, false)
          }
        } else {
          // Start playing: stop any other active track so tempos do not clash
          this.stopOtherTracks(padId)
          trackAudio.playbackRate = pitchMultiplier || 1.0
          trackAudio.currentTime = 0
          try {
            await trackAudio.play()
            this.trackPlayingStates.set(padId, true)
            if (this.callbacks.onTrackStateChange) {
              this.callbacks.onTrackStateChange(padId, true)
            }
          } catch (err) {
            console.error(`Failed to play backing track ${padId}:`, err)
          }
        }
        return
      }
    }

    const padGain = this.getPadGain(padId)

    // Check if authentic sample buffer exists by soundUrl or padId
    let sampleBuffer = soundUrl ? this.sampleBuffers.get(soundUrl) : undefined
    if (!sampleBuffer) {
      sampleBuffer = this.sampleBuffers.get(padId)
    }

    if (sampleBuffer) {
      // Play authentic recorded sample with dynamic strike sensor velocity
      const source = ctx.createBufferSource()
      source.buffer = sampleBuffer
      source.playbackRate.setValueAtTime(pitchMultiplier, ctx.currentTime)

      // Ephemeral strike sensor gain node:
      // Human hearing perceives volume logarithmically; an exponential curve creates a distinct,
      // expressive difference between a gentle tap (0.18 -> ~0.10 volume) and a hard strike (1.35 -> ~1.45 volume).
      const hitGain = ctx.createGain()
      const effectiveGain = Math.max(0.06, Math.min(1.5, Math.pow(velocity, 1.35)))
      hitGain.gain.setValueAtTime(effectiveGain, ctx.currentTime)

      // Dynamic strike timbre filter:
      // In acoustic percussion, soft hits dampen high frequencies for a warm touch,
      // while hard strikes open up full treble harmonics and crisp transient snap.
      const strikeFilter = ctx.createBiquadFilter()
      strikeFilter.type = 'lowpass'
      const cutoff = Math.min(22000, 3200 + Math.pow(Math.min(1.4, velocity), 1.25) * 16800)
      strikeFilter.frequency.setValueAtTime(cutoff, ctx.currentTime)

      // Signal chain: source -> strikeFilter -> hitGain -> padGain (channel) -> masterGain -> destination
      source.connect(strikeFilter)
      strikeFilter.connect(hitGain)
      hitGain.connect(padGain)

      source.onended = () => {
        try {
          source.disconnect()
          strikeFilter.disconnect()
          hitGain.disconnect()
        } catch {}
      }

      source.start(ctx.currentTime)
    } else if (this.synth) {
      // High-definition acoustic synthesis fallback or selected synth instrument
      const synthId = (synthType ||
                       (padId.includes('dhol') ? 'dholak' :
                        padId.includes('tabla') ? (padId.includes('ge') ? 'tabla_ge' : 'tabla_na') :
                        padId.includes('tasha') ? 'tasha' :
                        padId.includes('nagada') ? 'nagada' :
                        padId.includes('bass') ? 'bass_808' :
                        padId.includes('clap') ? 'clap' :
                        padId.includes('dj') ? 'dj_effect' :
                        padId.includes('shankh') ? 'shankh' :
                        padId.includes('gong') ? 'temple_gong' :
                        padId.includes('kartal') ? 'kartal' :
                        padId.includes('khanjari') ? 'khanjari' :
                        padId.includes('ghanti') ? 'temple_ghanti' :
                        padId.includes('manjira') ? 'manjira' :
                        'sam_accent')) as InstrumentId

      this.synth.play(synthId, {
        velocity,
        pitchMultiplier,
        destination: padGain
      })
    }
  }

  /**
   * Preview any sound from library or custom upload without affecting active pads
   */
  async previewSound(params: {
    soundUrl?: string
    synthType?: string
    isTrack?: boolean
    pitchMultiplier?: number
    volume?: number
  }) {
    const ctx = await this.ensureAudioContext()
    const { soundUrl, synthType, isTrack, pitchMultiplier = 1.0, volume = 0.95 } = params

    const previewGain = ctx.createGain()
    previewGain.gain.setValueAtTime(Math.min(1.2, volume), ctx.currentTime)
    previewGain.connect(this.masterGain || ctx.destination)

    // Check if buffer is already cached
    let buffer = soundUrl ? this.sampleBuffers.get(soundUrl) : undefined
    if (buffer) {
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.playbackRate.setValueAtTime(pitchMultiplier, ctx.currentTime)
      source.connect(previewGain)
      source.start(ctx.currentTime)
      return
    }

    if (soundUrl && !isTrack) {
      try {
        const res = await fetch(soundUrl)
        if (res.ok) {
          const ab = await res.arrayBuffer()
          const decoded = await ctx.decodeAudioData(ab)
          this.sampleBuffers.set(soundUrl, decoded)
          const source = ctx.createBufferSource()
          source.buffer = decoded
          source.playbackRate.setValueAtTime(pitchMultiplier, ctx.currentTime)
          source.connect(previewGain)
          source.start(ctx.currentTime)
          return
        }
      } catch (e) {
        console.warn('Could not fetch preview buffer, falling back to audio/synth', e)
      }
    }

    if (isTrack && soundUrl) {
      const audio = new Audio(soundUrl)
      audio.volume = Math.min(1, volume)
      audio.play().catch(() => {})
      setTimeout(() => {
        try { audio.pause() } catch {}
      }, 4000)
      return
    }

    if (synthType && this.synth) {
      this.synth.play(synthType as InstrumentId, {
        velocity: volume,
        pitchMultiplier,
        destination: previewGain
      })
      return
    }

    if (this.synth) {
      this.synth.play('dholak', { velocity: volume, pitchMultiplier, destination: previewGain })
    }
  }

  /**
   * Registers custom decoded audio buffer for a given sound key (e.g. data URL or custom pad ID)
   */
  async registerCustomAudioBuffer(key: string, fileOrBlob: Blob | File | ArrayBuffer): Promise<boolean> {
    const ctx = await this.ensureAudioContext()
    try {
      let arrayBuffer: ArrayBuffer
      if (fileOrBlob instanceof ArrayBuffer) {
        arrayBuffer = fileOrBlob
      } else {
        arrayBuffer = await fileOrBlob.arrayBuffer()
      }
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
      this.sampleBuffers.set(key, audioBuffer)
      return true
    } catch (err) {
      console.error(`Failed to register custom audio buffer for ${key}:`, err)
      return false
    }
  }

  /**
   * Removes assigned custom audio buffer for a pad
   */
  removePadSound(padId: string) {
    this.sampleBuffers.delete(padId)
    const audio = this.trackAudios.get(padId)
    if (audio) {
      audio.pause()
      this.trackAudios.delete(padId)
      this.trackPlayingStates.delete(padId)
    }
  }

  setPadVolume(padId: string, volume: number) {
    const gainNode = this.getPadGain(padId)
    if (gainNode && this.ctx) {
      gainNode.gain.setValueAtTime(Math.max(0, Math.min(1.5, volume)), this.ctx.currentTime)
    }
  }

  // --- Volume & Audio Controls ---

  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1.5, volume))
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime)
    }
  }

  getMasterVolume(): number {
    return this.masterVolume
  }

  setMuted(muted: boolean) {
    this.isMuted = muted
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime)
    }
  }

  getIsMuted(): boolean {
    return this.isMuted
  }

  setReverbAmount(amount: number) {
    this.reverbAmount = Math.max(0, Math.min(1, amount))
    if (this.reverbGain && this.ctx) {
      this.reverbGain.gain.setValueAtTime(this.reverbAmount, this.ctx.currentTime)
    }
  }

  getReverbAmount(): number {
    return this.reverbAmount
  }

  getAudioLevels(): number {
    if (!this.analyser) return 0
    const buffer = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteFrequencyData(buffer)
    let sum = 0
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i]
    }
    return sum / buffer.length / 255
  }

  // --- Metronome Engine ---

  setBpm(bpm: number) {
    this.metronomeBpm = Math.max(40, Math.min(240, bpm))
  }

  getBpm(): number {
    return this.metronomeBpm
  }

  setMetronomeVolume(vol: number) {
    this.metronomeVolume = Math.max(0, Math.min(1, vol))
  }

  toggleMetronome(): boolean {
    if (this.isMetronomePlaying) {
      this.stopMetronome()
      return false
    } else {
      this.startMetronome()
      return true
    }
  }

  async startMetronome() {
    const ctx = await this.ensureAudioContext()
    if (this.isMetronomePlaying) return

    this.isMetronomePlaying = true
    this.currentMetronomeBeat = 0
    this.nextBeatTime = ctx.currentTime + 0.05
    this.scheduleMetronome()
  }

  stopMetronome() {
    this.isMetronomePlaying = false
    if (this.metronomeTimerId !== null) {
      clearTimeout(this.metronomeTimerId)
      this.metronomeTimerId = null
    }
  }

  getIsMetronomePlaying(): boolean {
    return this.isMetronomePlaying
  }

  private scheduleMetronome = () => {
    if (!this.ctx || !this.isMetronomePlaying) return

    const lookAheadTime = 0.1 // seconds
    const interval = 60.0 / this.metronomeBpm

    while (this.nextBeatTime < this.ctx.currentTime + lookAheadTime) {
      const beat = this.currentMetronomeBeat
      const isAccent = beat === 0 // 1st beat of cycle (Sam)

      this.playMetronomeClick(this.nextBeatTime, isAccent)

      // Schedule visual sync callback
      const delayMs = Math.max(0, (this.nextBeatTime - this.ctx.currentTime) * 1000)
      window.setTimeout(() => {
        if (this.callbacks.onMetronomeTick && this.isMetronomePlaying) {
          this.callbacks.onMetronomeTick(beat, isAccent)
        }
      }, delayMs)

      this.nextBeatTime += interval
      this.currentMetronomeBeat = (this.currentMetronomeBeat + 1) % this.beatsPerCycle
    }

    this.metronomeTimerId = window.setTimeout(this.scheduleMetronome, 25)
  }

  /**
   * Generates a warm devotional wood/temple tick for the metronome
   */
  private playMetronomeClick(time: number, isAccent: boolean) {
    if (!this.ctx || !this.masterGain) return

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    // Wood clack frequency
    const freq = isAccent ? 1400 : 880
    osc.type = isAccent ? 'sine' : 'triangle'
    osc.frequency.setValueAtTime(freq, time)
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, time + 0.03)

    const vol = (isAccent ? 0.7 : 0.45) * this.metronomeVolume
    gain.gain.setValueAtTime(vol, time)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + (isAccent ? 0.08 : 0.04))

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start(time)
    osc.stop(time + 0.09)
  }

  // --- Recorder & Playback Engine ---

  startRecording() {
    this.recordedHits = []
    this.recordingStartTime = performance.now()
    this.isRecording = true
  }

  stopRecording(): RecordedHit[] {
    this.isRecording = false
    return [...this.recordedHits]
  }

  getIsRecording(): boolean {
    return this.isRecording
  }

  getRecordedHits(): RecordedHit[] {
    return [...this.recordedHits]
  }

  clearRecording() {
    this.stopPlayback()
    this.recordedHits = []
    this.isRecording = false
  }

  startPlayback(hits?: RecordedHit[], onComplete?: () => void) {
    const hitsToPlay = hits || this.recordedHits
    if (hitsToPlay.length === 0) return

    this.stopPlayback()
    this.isPlayingBack = true

    hitsToPlay.forEach(hit => {
      const timerId = window.setTimeout(() => {
        if (!this.isPlayingBack) return
        this.playPad(hit.padId, {
          velocity: hit.velocity,
          isManualTrigger: false
        })
      }, hit.timeMs)
      this.playbackTimeoutIds.push(timerId)
    })

    const totalDuration = Math.max(...hitsToPlay.map(h => h.timeMs)) + 600
    const endTimer = window.setTimeout(() => {
      this.isPlayingBack = false
      if (onComplete) onComplete()
      if (this.callbacks.onRecordingPlaybackComplete) {
        this.callbacks.onRecordingPlaybackComplete()
      }
    }, totalDuration)

    this.playbackTimeoutIds.push(endTimer)
  }

  stopPlayback() {
    this.isPlayingBack = false
    this.playbackTimeoutIds.forEach(id => clearTimeout(id))
    this.playbackTimeoutIds = []
  }

  getIsPlayingBack(): boolean {
    return this.isPlayingBack
  }

  // --- Session Storage ---

  saveSessionToLocal(name: string): RecordingSession | null {
    if (this.recordedHits.length === 0) return null

    const duration = Math.max(...this.recordedHits.map(h => h.timeMs))
    const session: RecordingSession = {
      id: 'rec_' + Date.now(),
      name: name.trim() || 'Devotional Keertan Session',
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      durationMs: duration,
      hits: [...this.recordedHits]
    }

    try {
      const saved = JSON.parse(localStorage.getItem('octapad_saved_sessions') || '[]')
      saved.unshift(session)
      localStorage.setItem('octapad_saved_sessions', JSON.stringify(saved.slice(0, 10)))
      return session
    } catch (e) {
      console.warn('Failed to save to localStorage:', e)
      return null
    }
  }

  loadSavedSessions(): RecordingSession[] {
    try {
      return JSON.parse(localStorage.getItem('octapad_saved_sessions') || '[]')
    } catch {
      return []
    }
  }

  loadSession(session: RecordingSession) {
    this.stopPlayback()
    this.recordedHits = [...session.hits]
  }

  exportRecordingAsJson(): string {
    const data = {
      type: 'bhajan_octapad_recording',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      hits: this.recordedHits
    }
    return JSON.stringify(data, null, 2)
  }

  importRecordingFromJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString)
      if (Array.isArray(data.hits)) {
        this.recordedHits = data.hits
        return true
      }
      return false
    } catch {
      return false
    }
  }
}

// Global audio engine singleton
export const audioEngine = new AudioEngine()
