import { useContext } from 'react'
import { TimerContext } from './timer-context'
import type { UseInterviewTimerReturn } from '@/hooks/use-interview-timer'

export function useTimerContext(): UseInterviewTimerReturn {
  const ctx = useContext(TimerContext)
  if (!ctx) throw new Error('useTimerContext must be used within TimerProvider')
  return ctx
}
