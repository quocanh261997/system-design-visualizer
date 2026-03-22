import { useCallback, useId } from 'react'
import { formatNumber } from './estimation-utils'

interface EstimationInputFieldProps {
  label: string
  value: number | null
  unit: string
  hint?: string
  onChange: (value: number | null) => void
}

export function EstimationInputField({ label, value, unit, hint, onChange }: EstimationInputFieldProps) {
  const inputId = useId()
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/,/g, '')
      if (raw === '') {
        onChange(null)
        return
      }
      const num = parseFloat(raw)
      if (!isNaN(num)) onChange(num)
    },
    [onChange]
  )

  return (
    <div className="flex items-center gap-3 py-1.5">
      <label
        htmlFor={inputId}
        className="text-xs w-48 shrink-0 flex flex-col"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {label}
        {hint && (
          <span className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {hint}
          </span>
        )}
      </label>
      <input
        id={inputId}
        type="text"
        inputMode="decimal"
        className="w-40 px-2.5 py-1.5 rounded-lg text-xs text-right outline-none transition-colors focus:ring-1"
        style={{
          backgroundColor: 'var(--color-panel-bg)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
          '--tw-ring-color': 'var(--color-accent)',
        } as React.CSSProperties}
        value={value !== null ? formatNumber(value) : ''}
        onChange={handleChange}
        placeholder="--"
      />
      <span className="text-[10px] w-16 shrink-0" style={{ color: 'var(--color-text-muted)' }}>
        {unit}
      </span>
    </div>
  )
}
