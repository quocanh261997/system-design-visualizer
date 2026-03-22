import { useMemo } from 'react'
import { useEstimationStore } from '@/store/use-estimation-store'
import { formatCompact, formatBytes, formatBandwidth } from './estimation-utils'

function formatSummaryValue(value: number | null, unit: string): string {
  if (value === null) return 'N/A'
  if (unit === 'bytes') return formatBytes(value)
  if (unit === 'bytes/s') return formatBandwidth(value)
  return `${formatCompact(value)} ${unit}`
}

const SUMMARY_FORMULAS = [
  'readQps', 'writeQps', 'peakReadQps', 'peakWriteQps',
  'totalStorage', 'incomingBw', 'outgoingBw',
  'peakInBw', 'peakOutBw', 'dailyCacheSize',
]

export function EstimationSummary() {
  const sections = useEstimationStore((s) => s.data.sections)
  const summary = useMemo(() => {
    const results: { label: string; value: number | null; unit: string; formulaId: string }[] = []
    for (const section of sections) {
      for (const f of section.formulas) {
        if (SUMMARY_FORMULAS.includes(f.id)) {
          results.push({ label: f.label, value: f.result, unit: f.unit, formulaId: f.id })
        }
      }
    }
    return results
  }, [sections])
  const hasValues = summary.some((s) => s.value !== null)

  if (!hasValues) return null

  return (
    <section
      className="rounded-lg border"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-sidebar-bg)' }}
    >
      <div className="px-4 py-3">
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
          Summary
        </h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {summary.map((item) => (
            <div key={item.formulaId} className="flex justify-between items-baseline py-1">
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {item.label}
              </span>
              <span
                className="text-xs font-semibold font-mono"
                style={{
                  color: item.value !== null ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                }}
              >
                {formatSummaryValue(item.value, item.unit)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
