import { useState } from 'react'
import {
  Play,
  Pause,
  SkipForward,
  Square,
  Gauge,
  Crosshair,
  Activity,
} from 'lucide-react'
import { useSimulationStore } from '@/store/use-simulation-store'
import { useFlowStore } from '@/store/use-flow-store'

const SPEED_OPTIONS = [
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '2x', value: 2 },
  { label: '4x', value: 4 },
]

/** Floating simulation control bar shown above the canvas */
export function SimulationControls() {
  const status = useSimulationStore((s) => s.status)
  const steps = useSimulationStore((s) => s.steps)
  const currentStepIndex = useSimulationStore((s) => s.currentStepIndex)
  const speed = useSimulationStore((s) => s.speed)
  const play = useSimulationStore((s) => s.play)
  const pause = useSimulationStore((s) => s.pause)
  const stepForward = useSimulationStore((s) => s.stepForward)
  const reset = useSimulationStore((s) => s.reset)
  const setSpeed = useSimulationStore((s) => s.setSpeed)
  const trafficDensity = useSimulationStore((s) => s.trafficDensity)
  const setTrafficDensity = useSimulationStore((s) => s.setTrafficDensity)
  const buildSimulation = useSimulationStore((s) => s.buildSimulation)

  const nodes = useFlowStore((s) => s.nodes)
  const [selectingStart, setSelectingStart] = useState(false)

  /** Pick a start node -- show client/entry nodes first */
  const clientNodes = nodes.filter(
    (n) => n.type === 'system-component' && n.data.componentType !== 'group'
  )

  const handleStartSimulation = (nodeId: string) => {
    buildSimulation(nodeId)
    setSelectingStart(false)
    // Auto-play after building
    setTimeout(() => useSimulationStore.getState().play(), 100)
  }

  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null
  const isIdle = status === 'idle' && steps.length === 0

  return (
    <div
      className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-2 rounded-xl"
      style={{
        backgroundColor: 'var(--color-panel-bg)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Start / node picker */}
      {isIdle ? (
        <div className="relative">
          <button
            onClick={() => setSelectingStart(!selectingStart)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              color: '#22c55e',
              border: '1px solid rgba(34, 197, 94, 0.3)',
            }}
          >
            <Crosshair size={13} /> Simulate Request
          </button>
          {/* Dropdown to pick start node */}
          {selectingStart && (
            <div
              className="absolute top-full left-0 mt-1 w-56 rounded-lg overflow-hidden max-h-64 overflow-y-auto"
              style={{
                backgroundColor: 'var(--color-sidebar-bg)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            >
              <div className="px-2.5 py-1.5 text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                Pick start node
              </div>
              {clientNodes.map((node) => (
                <button
                  key={node.id}
                  className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-white/5 transition-colors"
                  style={{ color: 'var(--color-text-secondary)' }}
                  onClick={() => handleStartSimulation(node.id)}
                >
                  {node.data.label}
                </button>
              ))}
              {clientNodes.length === 0 && (
                <div className="px-2.5 py-3 text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
                  Add components to the canvas first
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Playback controls */}
          <div className="flex items-center gap-1">
            {status === 'playing' ? (
              <button onClick={pause} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Pause">
                <Pause size={14} style={{ color: '#f59e0b' }} />
              </button>
            ) : (
              <button onClick={play} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Play">
                <Play size={14} style={{ color: '#22c55e' }} />
              </button>
            )}
            <button onClick={stepForward} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Step Forward">
              <SkipForward size={14} style={{ color: 'var(--color-text-secondary)' }} />
            </button>
            <button onClick={reset} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Stop">
              <Square size={14} style={{ color: 'var(--color-error)' }} />
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-5" style={{ backgroundColor: 'var(--color-border)' }} />

          {/* Speed control */}
          <div className="flex items-center gap-1">
            <Gauge size={12} style={{ color: 'var(--color-text-muted)' }} />
            {SPEED_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className="px-1.5 py-0.5 rounded text-[10px] font-medium transition-all"
                style={{
                  backgroundColor: speed === opt.value ? 'var(--color-accent)' : 'transparent',
                  color: speed === opt.value ? '#fff' : 'var(--color-text-muted)',
                }}
                onClick={() => setSpeed(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-5" style={{ backgroundColor: 'var(--color-border)' }} />

          {/* Traffic density slider */}
          <div className="flex items-center gap-1.5">
            <Activity size={12} style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="range"
              min={0}
              max={100}
              value={trafficDensity}
              onChange={(e) => setTrafficDensity(Number(e.target.value))}
              className="w-16 h-1 appearance-none rounded-full cursor-pointer"
              style={{ accentColor: '#22c55e', backgroundColor: 'var(--color-border)' }}
              title={`Traffic: ${trafficDensity}%`}
            />
            <span className="text-[10px] font-medium w-7" style={{ color: 'var(--color-text-muted)' }}>
              {trafficDensity}%
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-5" style={{ backgroundColor: 'var(--color-border)' }} />

          {/* Step info */}
          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {currentStep ? (
              <span>
                <span className="font-medium">{currentStep.label}</span>
                <span className="ml-2" style={{ color: 'var(--color-text-muted)' }}>
                  {currentStep.latencyMs}ms (total: {currentStep.cumulativeMs}ms)
                </span>
              </span>
            ) : (
              <span style={{ color: 'var(--color-text-muted)' }}>
                {steps.length} steps · {status}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
