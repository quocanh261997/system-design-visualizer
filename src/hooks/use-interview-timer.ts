import { useState, useRef, useCallback, useMemo } from 'react'
import { useInterval } from './use-interval'

export interface TimerPhase {
  name: string
  color: string
  percent: number
}

export type UrgencyLevel = 'normal' | 'warning' | 'critical' | 'expired'

const DEFAULT_PHASES: TimerPhase[] = [
  { name: 'Requirements & Estimation', color: '#6366f1', percent: 0.2 },
  { name: 'High-Level Design', color: '#22c55e', percent: 0.3 },
  { name: 'Detailed Design', color: '#f59e0b', percent: 0.3 },
  { name: 'Wrap-up & Questions', color: '#8b5cf6', percent: 0.2 },
]

export const DURATION_PRESETS = [30, 35, 40, 45, 60] as const

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export interface UseInterviewTimerReturn {
  isRunning: boolean
  isPaused: boolean
  isStarted: boolean
  totalSeconds: number
  remainingSeconds: number
  elapsedPercent: number
  currentPhase: TimerPhase | null
  currentPhaseIndex: number
  phasesEnabled: boolean
  remainingFormatted: string
  urgencyLevel: UrgencyLevel
  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
  toggle: () => void
  setDuration: (minutes: number) => void
  togglePhases: () => void
  phases: TimerPhase[]
}

export function useInterviewTimer(
  onPhaseChange?: () => void,
  onUrgencyChange?: (level: UrgencyLevel) => void,
  onExpired?: () => void,
): UseInterviewTimerReturn {
  const [totalSeconds, setTotalSeconds] = useState(45 * 60)
  const [remainingSeconds, setRemainingSeconds] = useState(45 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [phasesEnabled, setPhasesEnabled] = useState(false)

  const prevPhaseIndexRef = useRef(-1)
  const prevUrgencyRef = useRef<UrgencyLevel>('normal')
  const hasExpiredRef = useRef(false)

  const elapsedPercent = totalSeconds > 0
    ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100
    : 0

  const remainingPercent = totalSeconds > 0
    ? (remainingSeconds / totalSeconds) * 100
    : 100

  const urgencyLevel: UrgencyLevel = useMemo(() => {
    if (remainingSeconds <= 0) return 'expired'
    if (remainingPercent <= 10) return 'critical'
    if (remainingPercent <= 25) return 'warning'
    return 'normal'
  }, [remainingSeconds, remainingPercent])

  const currentPhaseIndex = useMemo(() => {
    if (!phasesEnabled) return -1
    const elapsed = elapsedPercent / 100
    let cumulative = 0
    for (let i = 0; i < DEFAULT_PHASES.length; i++) {
      cumulative += DEFAULT_PHASES[i].percent
      if (elapsed < cumulative) return i
    }
    return DEFAULT_PHASES.length - 1
  }, [phasesEnabled, elapsedPercent])

  const currentPhase = phasesEnabled && currentPhaseIndex >= 0
    ? DEFAULT_PHASES[currentPhaseIndex]
    : null

  useInterval(
    () => {
      setRemainingSeconds((prev) => {
        const next = prev - 1

        if (phasesEnabled && currentPhaseIndex !== prevPhaseIndexRef.current && prevPhaseIndexRef.current >= 0) {
          onPhaseChange?.()
        }
        prevPhaseIndexRef.current = currentPhaseIndex

        if (urgencyLevel !== prevUrgencyRef.current) {
          onUrgencyChange?.(urgencyLevel)
        }
        prevUrgencyRef.current = urgencyLevel

        if (next <= 0) {
          setIsRunning(false)
          if (!hasExpiredRef.current) {
            hasExpiredRef.current = true
            onExpired?.()
          }
          return 0
        }
        return next
      })
    },
    isRunning ? 1000 : null,
  )

  const start = useCallback(() => {
    setIsStarted(true)
    setIsRunning(true)
    setIsPaused(false)
    hasExpiredRef.current = false
    prevPhaseIndexRef.current = -1
    prevUrgencyRef.current = 'normal'
  }, [])

  const pause = useCallback(() => {
    setIsRunning(false)
    setIsPaused(true)
  }, [])

  const resume = useCallback(() => {
    setIsRunning(true)
    setIsPaused(false)
  }, [])

  const reset = useCallback(() => {
    setIsRunning(false)
    setIsPaused(false)
    setIsStarted(false)
    setRemainingSeconds(totalSeconds)
    hasExpiredRef.current = false
    prevPhaseIndexRef.current = -1
    prevUrgencyRef.current = 'normal'
  }, [totalSeconds])

  const toggle = useCallback(() => {
    if (!isStarted) {
      start()
    } else if (isRunning) {
      pause()
    } else {
      resume()
    }
  }, [isStarted, isRunning, start, pause, resume])

  const setDuration = useCallback((minutes: number) => {
    const secs = minutes * 60
    setTotalSeconds(secs)
    setRemainingSeconds(secs)
    setIsRunning(false)
    setIsPaused(false)
    setIsStarted(false)
    hasExpiredRef.current = false
  }, [])

  const togglePhases = useCallback(() => {
    setPhasesEnabled((v) => !v)
  }, [])

  return {
    isRunning,
    isPaused,
    isStarted,
    totalSeconds,
    remainingSeconds,
    elapsedPercent,
    currentPhase,
    currentPhaseIndex,
    phasesEnabled,
    remainingFormatted: formatTime(remainingSeconds),
    urgencyLevel,
    start,
    pause,
    resume,
    reset,
    toggle,
    setDuration,
    togglePhases,
    phases: DEFAULT_PHASES,
  }
}
