import { useState, useCallback } from 'react'
import { ChevronDown, ChevronRight, RotateCcw } from 'lucide-react'
import type { EstimationSection as EstimationSectionType } from '@/types'
import { useEstimationStore } from '@/store/use-estimation-store'
import { EstimationInputField } from './estimation-input-field'
import { EstimationFormulaDisplay } from './estimation-formula-display'

interface EstimationSectionProps {
  section: EstimationSectionType
}

export function EstimationSection({ section }: EstimationSectionProps) {
  const [collapsed, setCollapsed] = useState(false)
  const updateInput = useEstimationStore((s) => s.updateInput)
  const overrideFormula = useEstimationStore((s) => s.overrideFormula)
  const clearOverride = useEstimationStore((s) => s.clearOverride)
  const resetSection = useEstimationStore((s) => s.resetSection)

  const handleInputChange = useCallback(
    (inputId: string, value: number | null) => {
      updateInput(section.id, inputId, value)
    },
    [section.id, updateInput]
  )

  const handleReset = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      resetSection(section.id)
    },
    [section.id, resetSection]
  )

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
        {section.title}
        <button
          onClick={handleReset}
          className="ml-auto p-1 rounded hover:bg-white/10 transition-colors"
          title="Reset section"
        >
          <RotateCcw size={12} style={{ color: 'var(--color-text-muted)' }} />
        </button>
      </button>
      {!collapsed && (
        <div className="px-4 pb-4 space-y-1">
          {section.inputs.map((inp) => (
            <EstimationInputField
              key={inp.id}
              label={inp.label}
              value={inp.value}
              unit={inp.unit}
              hint={inp.hint}
              onChange={(v) => handleInputChange(inp.id, v)}
            />
          ))}
          <div className="border-t my-2" style={{ borderColor: 'var(--color-border)' }} />
          {section.formulas.map((f) => (
            <EstimationFormulaDisplay
              key={f.id}
              label={f.label}
              formula={f.formula}
              result={f.result}
              unit={f.unit}
              isOverridden={f.isOverridden}
              onOverride={(v) => overrideFormula(section.id, f.id, v)}
              onClearOverride={() => clearOverride(section.id, f.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
