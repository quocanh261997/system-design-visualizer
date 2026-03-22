let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      audioCtx = new AudioContext()
    }
    return audioCtx
  } catch {
    return null
  }
}

export function playBeep(frequency = 800, duration = 200): void {
  const ctx = getAudioContext()
  if (!ctx) return
  if (ctx.state === 'suspended') ctx.resume()

  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()

  oscillator.connect(gain)
  gain.connect(ctx.destination)

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
  gain.gain.setValueAtTime(0.15, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000)

  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + duration / 1000)
}

export function playPhaseBeep(): void {
  playBeep(800, 200)
}

export function playWarningBeep(): void {
  playBeep(1000, 300)
}

export function playExpiredBeep(): void {
  playBeep(1200, 150)
  setTimeout(() => playBeep(1200, 150), 200)
  setTimeout(() => playBeep(1200, 300), 400)
}
