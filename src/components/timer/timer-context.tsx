import { createContext, useCallback } from 'react'
import { useInterviewTimer, type UseInterviewTimerReturn } from '@/hooks/use-interview-timer'
import { playPhaseBeep, playWarningBeep, playExpiredBeep } from './timer-beep'
import type { UrgencyLevel } from '@/hooks/use-interview-timer'

// eslint-disable-next-line react-refresh/only-export-components
export const TimerContext = createContext<UseInterviewTimerReturn | null>(null)

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const onPhaseChange = useCallback(() => {
    playPhaseBeep()
  }, [])

  const onUrgencyChange = useCallback((level: UrgencyLevel) => {
    if (level === 'warning' || level === 'critical') playWarningBeep()
  }, [])

  const onExpired = useCallback(() => {
    playExpiredBeep()
  }, [])

  const timer = useInterviewTimer(onPhaseChange, onUrgencyChange, onExpired)

  return (
    <TimerContext.Provider value={timer}>
      {children}
    </TimerContext.Provider>
  )
}
