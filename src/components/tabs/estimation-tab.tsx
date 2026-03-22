import { useCallback } from 'react'
import { Calculator, Copy, RotateCcw } from 'lucide-react'
import { useEstimationStore } from '@/store/use-estimation-store'
import { EstimationPresetPicker } from '@/components/estimation/estimation-preset-picker'
import { EstimationSection } from '@/components/estimation/estimation-section'
import { EstimationSummary } from '@/components/estimation/estimation-summary'

export function EstimationTab() {
  const sections = useEstimationStore((s) => s.data.sections)
  const customNotes = useEstimationStore((s) => s.data.customNotes)
  const resetAll = useEstimationStore((s) => s.resetAll)
  const setCustomNotes = useEstimationStore((s) => s.setCustomNotes)
  const copyAsText = useEstimationStore((s) => s.copyAsText)

  const handleCopy = useCallback(async () => {
    const text = copyAsText()
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      /* clipboard API may fail without user gesture */
    }
  }, [copyAsText])

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[900px] mx-auto px-6 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator size={18} style={{ color: 'var(--color-accent)' }} />
            <h1
              className="text-lg font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Back-of-Envelope Estimation
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/10"
              style={{ color: 'var(--color-text-secondary)' }}
              title="Copy summary to clipboard"
            >
              <Copy size={14} /> Copy
            </button>
            <button
              onClick={resetAll}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/10"
              style={{ color: 'var(--color-text-secondary)' }}
              title="Reset all values"
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>

        <EstimationPresetPicker />

        {sections.map((section) => (
          <EstimationSection key={section.id} section={section} />
        ))}

        <EstimationSummary />

        <section
          className="rounded-lg border"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-sidebar-bg)' }}
        >
          <div className="px-4 py-3">
            <h3
              className="text-sm font-semibold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Notes
            </h3>
            <textarea
              className="w-full min-h-[80px] px-3 py-2 rounded-lg text-xs resize-y outline-none"
              style={{
                backgroundColor: 'var(--color-panel-bg)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
              placeholder="Additional estimation notes..."
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
