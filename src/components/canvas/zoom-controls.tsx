import { useReactFlow, useViewport } from '@xyflow/react'
import { Minus, Plus } from 'lucide-react'

export function ZoomControls() {
  const { zoomTo } = useReactFlow()
  const { zoom } = useViewport()

  const zoomPercent = Math.round(zoom * 100)

  return (
    <div
      className="absolute bottom-4 left-4 z-10 flex items-center gap-1 p-1 rounded-full text-sm font-medium shadow-lg backdrop-blur-md transition-all"
      style={{
        backgroundColor: 'var(--color-panel-bg)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-primary)',
      }}
    >
      <button
        onClick={() => zoomTo(Math.max(0.1, zoom - 0.1), { duration: 200 })}
        className="p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        title="Zoom Out"
      >
        <Minus size={16} />
      </button>

      <button
        onClick={() => zoomTo(1, { duration: 200 })}
        className="w-12 text-center hover:text-white transition-colors cursor-pointer"
        title="Reset Zoom to 100%"
      >
        {zoomPercent}%
      </button>

      <button
        onClick={() => zoomTo(Math.min(30, zoom + 0.1), { duration: 200 })}
        className="p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        title="Zoom In"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}
