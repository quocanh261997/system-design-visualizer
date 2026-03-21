import { useState } from 'react'
import { Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { useNotesStore } from '@/store/use-notes-store'
import { ChecklistItem } from './checklist-item'

export function AssumptionsSection() {
  const [collapsed, setCollapsed] = useState(false)
  const [lastAddedId, setLastAddedId] = useState<string | null>(null)
  const items = useNotesStore((s) => s.notes.assumptions)
  const { addAssumption, toggleAssumption, removeAssumption, updateAssumption } =
    useNotesStore()

  const handleAdd = () => {
    addAssumption('')
    const latest = useNotesStore.getState().notes.assumptions
    setLastAddedId(latest[latest.length - 1]?.id ?? null)
  }

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
        Assumptions & Constraints
        <span
          className="ml-auto text-xs font-normal"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {items.length}
        </span>
      </button>
      {!collapsed && (
        <div className="px-4 pb-3">
          {items.length === 0 && (
            <p className="text-xs py-2" style={{ color: 'var(--color-text-muted)' }}>
              What constraints exist? Add assumptions about scale, users, or limits.
            </p>
          )}
          {items.map((item) => (
            <ChecklistItem
              key={item.id}
              id={item.id}
              text={item.text}
              completed={item.completed}
              onToggle={toggleAssumption}
              onUpdate={updateAssumption}
              onRemove={removeAssumption}
              onAddBelow={handleAdd}
              autoFocus={item.id === lastAddedId}
            />
          ))}
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 text-xs mt-1 px-1 py-1 rounded hover:bg-[var(--color-panel-bg)] transition-colors"
            style={{ color: 'var(--color-accent)' }}
          >
            <Plus size={14} />
            Add assumption
          </button>
        </div>
      )}
    </section>
  )
}
