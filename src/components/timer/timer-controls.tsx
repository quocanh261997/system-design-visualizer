import { useState } from 'react'
import { Play, Pause, RotateCcw, Timer, ChevronDown, Layers } from 'lucide-react'
import { DURATION_PRESETS, type UseInterviewTimerReturn } from '@/hooks/use-interview-timer'

interface TimerControlsProps {
  timer: UseInterviewTimerReturn
}

export function TimerControls({ timer }: TimerControlsProps) {
  const [showPresets, setShowPresets] = useState(false)
  const {
    isStarted, isRunning, isPaused, remainingFormatted, urgencyLevel,
    phasesEnabled, togglePhases, start, pause, resume, reset, setDuration, totalSeconds,
  } = timer

  const currentMinutes = Math.round(totalSeconds / 60)

  const btnClass =
    'flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/10'

  const urgencyTextColor: Record<string, string> = {
    normal: 'var(--color-text-primary)',
    warning: '#eab308',
    critical: '#ef4444',
    expired: '#ef4444',
  }

  if (!isStarted) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={start}
          className={btnClass}
          style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: 'var(--color-accent)' }}
          title="Start interview timer (Ctrl+Shift+T)"
        >
          <Timer size={14} />
          Start Interview
        </button>

        <div className="relative">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className={btnClass}
            style={{ color: 'var(--color-text-secondary)' }}
            title="Timer duration"
          >
            {currentMinutes}m <ChevronDown size={10} />
          </button>
          {showPresets && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowPresets(false)} />
              <div
                className="absolute right-0 top-full mt-1 rounded-lg overflow-hidden z-50"
                style={{
                  backgroundColor: 'var(--color-panel-bg)',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
              >
                {DURATION_PRESETS.map((mins) => (
                  <button
                    key={mins}
                    onClick={() => { setDuration(mins); setShowPresets(false) }}
                    className="w-full px-4 py-1.5 text-xs text-left hover:bg-white/5 transition-colors"
                    style={{
                      color: mins === currentMinutes ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                      fontWeight: mins === currentMinutes ? 600 : 400,
                    }}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button
          onClick={togglePhases}
          className={btnClass}
          style={{
            color: phasesEnabled ? 'var(--color-accent)' : 'var(--color-text-muted)',
            backgroundColor: phasesEnabled ? 'rgba(99, 102, 241, 0.1)' : undefined,
          }}
          title="Toggle phase breakdown"
        >
          <Layers size={12} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <Timer size={14} style={{ color: 'var(--color-text-muted)' }} />
      <span
        className="text-xs font-mono font-semibold tabular-nums"
        style={{
          color: urgencyTextColor[urgencyLevel],
          animation: urgencyLevel === 'expired' ? 'timer-flash 0.5s ease-in-out infinite' : undefined,
        }}
      >
        {remainingFormatted}
      </span>

      {isRunning ? (
        <button onClick={pause} className={btnClass} title="Pause (Ctrl+Shift+T)">
          <Pause size={14} />
        </button>
      ) : (
        <button onClick={isPaused ? resume : start} className={btnClass} title="Resume (Ctrl+Shift+T)">
          <Play size={14} />
        </button>
      )}

      <button onClick={reset} className={btnClass} title="Reset timer">
        <RotateCcw size={12} />
      </button>

      <button
        onClick={togglePhases}
        className={btnClass}
        style={{
          color: phasesEnabled ? 'var(--color-accent)' : 'var(--color-text-muted)',
          backgroundColor: phasesEnabled ? 'rgba(99, 102, 241, 0.1)' : undefined,
        }}
        title="Toggle phase breakdown"
      >
        <Layers size={12} />
      </button>
    </div>
  )
}
