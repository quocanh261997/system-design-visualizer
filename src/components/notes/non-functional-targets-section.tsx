import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useNotesStore } from '@/store/use-notes-store'
import type { NonFunctionalTargets } from '@/types'

const CONSISTENCY_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: 'strong', label: 'Strong' },
  { value: 'eventual', label: 'Eventual' },
  { value: 'causal', label: 'Causal' },
] as const

function NumberInput({
  label,
  unit,
  value,
  field,
  onChange,
}: {
  label: string
  unit: string
  value: number | null
  field: keyof NonFunctionalTargets
  onChange: (targets: Partial<NonFunctionalTargets>) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <label
        className="text-xs w-24 shrink-0"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {label}
      </label>
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) =>
          onChange({
            [field]: e.target.value === '' ? null : Number(e.target.value),
          })
        }
        className="flex-1 bg-transparent text-sm px-2 py-1 rounded border outline-none focus:border-[var(--color-accent)]"
        style={{
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
        placeholder="—"
      />
      <span className="text-xs w-10 shrink-0" style={{ color: 'var(--color-text-muted)' }}>
        {unit}
      </span>
    </div>
  )
}

export function NonFunctionalTargetsSection() {
  const [collapsed, setCollapsed] = useState(false)
  const targets = useNotesStore((s) => s.notes.nonFunctionalTargets)
  const { updateNonFunctionalTargets } = useNotesStore()

  return (
    <section
      className="rounded-lg border"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-sidebar-bg)' }}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 w-full px-4 py-3 text-left text-sm font-semibold"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        Non-Functional Targets
      </button>
      {!collapsed && (
        <div className="px-4 pb-3 space-y-2">
          <NumberInput
            label="Latency"
            unit="ms"
            value={targets.latencyMs}
            field="latencyMs"
            onChange={updateNonFunctionalTargets}
          />
          <NumberInput
            label="Throughput"
            unit="QPS"
            value={targets.throughputQps}
            field="throughputQps"
            onChange={updateNonFunctionalTargets}
          />
          <NumberInput
            label="Availability"
            unit="%"
            value={targets.availabilityPercent}
            field="availabilityPercent"
            onChange={updateNonFunctionalTargets}
          />
          <div className="flex items-center gap-3">
            <label
              className="text-xs w-24 shrink-0"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Consistency
            </label>
            <select
              value={targets.consistencyModel ?? ''}
              onChange={(e) =>
                updateNonFunctionalTargets({
                  consistencyModel:
                    (e.target.value as 'strong' | 'eventual' | 'causal') || null,
                })
              }
              className="flex-1 bg-transparent text-sm px-2 py-1 rounded border outline-none focus:border-[var(--color-accent)]"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              {CONSISTENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} style={{ background: 'var(--color-panel-bg)' }}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="w-10 shrink-0" />
          </div>
          <div className="flex items-center gap-3">
            <label
              className="text-xs w-24 shrink-0"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Storage
            </label>
            <input
              type="text"
              value={targets.storageEstimate}
              onChange={(e) =>
                updateNonFunctionalTargets({ storageEstimate: e.target.value })
              }
              className="flex-1 bg-transparent text-sm px-2 py-1 rounded border outline-none focus:border-[var(--color-accent)]"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
              placeholder="e.g., 500 GB"
            />
            <span className="w-10 shrink-0" />
          </div>
          <div className="flex items-center gap-3">
            <label
              className="text-xs w-24 shrink-0"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              R/W Ratio
            </label>
            <input
              type="text"
              value={targets.readWriteRatio}
              onChange={(e) =>
                updateNonFunctionalTargets({ readWriteRatio: e.target.value })
              }
              className="flex-1 bg-transparent text-sm px-2 py-1 rounded border outline-none focus:border-[var(--color-accent)]"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
              placeholder="e.g., 10:1"
            />
            <span className="w-10 shrink-0" />
          </div>
        </div>
      )}
    </section>
  )
}
