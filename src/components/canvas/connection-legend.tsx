import { CONNECTION_TYPE_STYLES, type ConnectionType } from '@/types'
import { useFlowStore } from '@/store/use-flow-store'

const LEGEND_ENTRIES: { type: ConnectionType; dash?: string }[] = [
  { type: 'sync' },
  { type: 'async' },
  { type: 'streaming' },
  { type: 'response' },
]

/** Compact legend overlay showing connection type color/style mapping */
export function ConnectionLegend() {
  const edges = useFlowStore((s) => s.edges)
  
  if (edges.length === 0) return null

  return (
    <div
      className="absolute top-3 right-3 z-10 px-3 py-2 rounded-lg text-[10px]"
      style={{
        backgroundColor: 'var(--color-panel-bg)',
        border: '1px solid var(--color-border)',
        opacity: 0.85,
      }}
    >
      <div className="font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Connections
      </div>
      <div className="flex flex-col gap-1.5">
        {LEGEND_ENTRIES.map(({ type }) => {
          const s = CONNECTION_TYPE_STYLES[type]
          return (
            <div key={type} className="flex items-center gap-2">
              <svg width="24" height="6">
                <line
                  x1="0" y1="3" x2="24" y2="3"
                  stroke={s.color}
                  strokeWidth="2"
                  strokeDasharray={s.strokeDasharray === '0' ? undefined : s.strokeDasharray}
                />
              </svg>
              <span style={{ color: s.color }}>{s.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
