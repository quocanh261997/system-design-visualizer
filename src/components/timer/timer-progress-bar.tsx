import type { UseInterviewTimerReturn } from '@/hooks/use-interview-timer'

interface TimerProgressBarProps {
  timer: UseInterviewTimerReturn
}

const URGENCY_COLORS: Record<string, string> = {
  normal: '#22c55e',
  warning: '#eab308',
  critical: '#ef4444',
  expired: '#ef4444',
}

export function TimerProgressBar({ timer }: TimerProgressBarProps) {
  if (!timer.isStarted && timer.urgencyLevel !== 'expired') return null

  const { elapsedPercent, urgencyLevel, phasesEnabled, phases } = timer

  return (
    <div
      className="relative w-full shrink-0"
      style={{ height: 3, backgroundColor: 'var(--color-border)', zIndex: 9999 }}
    >
      {phasesEnabled ? (
        <PhasedBar elapsedPercent={elapsedPercent} phases={phases} />
      ) : (
        <div
          className="h-full transition-all duration-1000 ease-linear"
          style={{
            width: `${Math.min(elapsedPercent, 100)}%`,
            backgroundColor: URGENCY_COLORS[urgencyLevel],
            animation: urgencyLevel === 'critical' ? 'timer-pulse 1s ease-in-out infinite' : undefined,
          }}
        />
      )}
      {urgencyLevel === 'expired' && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: '#ef4444',
            animation: 'timer-flash 0.5s ease-in-out infinite',
          }}
        />
      )}
      {phasesEnabled && timer.currentPhase && timer.isRunning && (
        <div
          className="absolute text-[9px] font-medium px-1.5 py-0.5 rounded-b"
          style={{
            top: 3,
            left: `${getPhaseStartPercent(timer.currentPhaseIndex, phases)}%`,
            backgroundColor: timer.currentPhase.color,
            color: '#fff',
            zIndex: 10000,
          }}
        >
          {timer.currentPhase.name}
        </div>
      )}
      <style>{`
        @keyframes timer-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes timer-flash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}

function getPhaseStartPercent(index: number, phases: { percent: number }[]): number {
  let start = 0
  for (let i = 0; i < index; i++) start += phases[i].percent * 100
  return start
}

function PhasedBar({
  elapsedPercent,
  phases,
}: {
  elapsedPercent: number
  phases: { color: string; percent: number }[]
}) {
  const segments = phases.reduce<{ start: number; width: number; color: string }[]>(
    (acc, phase) => {
      const start = acc.length > 0 ? acc[acc.length - 1].start + acc[acc.length - 1].width : 0
      acc.push({ start, width: phase.percent * 100, color: phase.color })
      return acc
    },
    [],
  )

  return (
    <>
      {segments.map((seg, i) => {
        const segEnd = seg.start + seg.width
        const fillEnd = Math.min(elapsedPercent, segEnd)
        const fillWidth = Math.max(0, fillEnd - seg.start)

        return (
          <div
            key={i}
            className="absolute h-full"
            style={{ left: `${seg.start}%`, width: `${seg.width}%` }}
          >
            <div
              className="h-full transition-all duration-1000 ease-linear"
              style={{
                width: fillWidth > 0 ? `${(fillWidth / seg.width) * 100}%` : '0%',
                backgroundColor: seg.color,
              }}
            />
            {i > 0 && (
              <div
                className="absolute top-0 left-0 h-full"
                style={{ width: 1, backgroundColor: 'var(--color-canvas-bg)' }}
              />
            )}
          </div>
        )
      })}
    </>
  )
}
