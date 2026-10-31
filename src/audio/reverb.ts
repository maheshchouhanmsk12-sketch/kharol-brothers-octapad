/**
 * Generates an authentic sacred temple hall impulse response
 * simulating natural stone dome reflections and warm brass resonance.
 */
export function createTempleImpulseResponse(
  ctx: AudioContext,
  duration = 2.2,
  decay = 2.8
): AudioBuffer {
  const sampleRate = ctx.sampleRate
  const length = Math.floor(sampleRate * duration)
  const impulse = ctx.createBuffer(2, length, sampleRate)
  const left = impulse.getChannelData(0)
  const right = impulse.getChannelData(1)

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate
    // Exponential decay curve
    const envelope = Math.exp(-t * decay)
    
    // Subtle pre-delay & early reflections from temple stone pillars
    let earlyReflection = 0
    if (i < sampleRate * 0.08) {
      earlyReflection = (Math.random() * 2 - 1) * Math.sin(t * 320) * 0.4
    }

    // High frequency dampening over time (air and stone absorption)
    const damp = Math.exp(-t * 3.5)
    const noiseL = (Math.random() * 2 - 1) * damp + (Math.random() * 2 - 1) * 0.2
    const noiseR = (Math.random() * 2 - 1) * damp + (Math.random() * 2 - 1) * 0.2

    left[i] = (noiseL * envelope + earlyReflection) * 0.8
    right[i] = (noiseR * envelope + earlyReflection * -0.8) * 0.8
  }

  return impulse
}
