import { estimationPresets } from '@/data/estimation-presets'
import { useEstimationStore } from '@/store/use-estimation-store'

export function EstimationPresetPicker() {
  const activePresetId = useEstimationStore((s) => s.data.presetId)
  const loadPreset = useEstimationStore((s) => s.loadPreset)

  return (
    <div className="flex gap-2 flex-wrap">
      {estimationPresets.map((preset) => {
        const isActive = activePresetId === preset.id
        return (
          <button
            key={preset.id}
            className="px-3 py-2 rounded-lg text-left transition-all"
            style={{
              backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'var(--color-panel-bg)',
              border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
              minWidth: 120,
            }}
            onClick={() => loadPreset(preset.id)}
          >
            <div
              className="text-xs font-semibold"
              style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-primary)' }}
            >
              {preset.name}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {preset.description}
            </div>
          </button>
        )
      })}
    </div>
  )
}
