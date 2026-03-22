import { useCallback } from 'react'
import { Lock, Unlock } from 'lucide-react'
import { formatCompact, formatBytes, formatBandwidth } from './estimation-utils'

interface EstimationFormulaDisplayProps {
  label: string
  formula: string
  result: number | null
  unit: string
  isOverridden: boolean
  onOverride: (value: number) => void
  onClearOverride: () => void
}

function formatResult(value: number | null, unit: string): string {
  if (value === null) return 'N/A'
  if (unit === 'bytes') return formatBytes(value)
  if (unit === 'bytes/s') return formatBandwidth(value)
  return formatCompact(value)
}

export function EstimationFormulaDisplay({
  label,
  formula,
  result,
  unit,
  isOverridden,
  onOverride,
  onClearOverride,
}: EstimationFormulaDisplayProps) {
  const handleOverrideInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/,/g, '')
      if (raw === '') return
      const num = parseFloat(raw)
      if (!isNaN(num)) onOverride(num)
    },
    [onOverride]
  )

  const displayUnit = unit === 'bytes' || unit === 'bytes/s' ? '' : ` ${unit}`

  return (
    <div
      className="flex items-center gap-3 py-1.5 px-3 rounded-lg"
      style={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
    >
      <div className="w-48 shrink-0">
        <div className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {label}
        </div>
        <div className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
          {formula}
        </div>
      </div>
      {isOverridden ? (
        <input
          type="text"
          inputMode="decimal"
          className="w-40 px-2.5 py-1.5 rounded-lg text-xs text-right outline-none"
          style={{
            backgroundColor: 'var(--color-panel-bg)',
            border: '1px solid var(--color-accent)',
            color: 'var(--color-accent)',
          }}
          defaultValue={result !== null ? result.toString() : ''}
          onChange={handleOverrideInput}
        />
      ) : (
        <div
          className="w-40 text-right text-xs font-semibold px-2.5 py-1.5"
          style={{ color: result !== null ? 'var(--color-success)' : 'var(--color-text-muted)' }}
        >
          {formatResult(result, unit)}
        </div>
      )}
      <span className="text-[10px] w-16 shrink-0" style={{ color: 'var(--color-text-muted)' }}>
        {displayUnit}
      </span>
      <button
        onClick={isOverridden ? onClearOverride : () => result !== null && onOverride(result)}
        className="p-1 rounded hover:bg-white/10 transition-colors"
        title={isOverridden ? 'Use calculated value' : 'Override value'}
      >
        {isOverridden ? (
          <Lock size={12} style={{ color: 'var(--color-accent)' }} />
        ) : (
          <Unlock size={12} style={{ color: 'var(--color-text-muted)' }} />
        )}
      </button>
    </div>
  )
}
