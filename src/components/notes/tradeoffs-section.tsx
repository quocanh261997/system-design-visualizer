import { useState } from 'react'
import { Plus, ChevronDown, ChevronRight, Trash2 } from 'lucide-react'
import { useNotesStore } from '@/store/use-notes-store'

function TradeoffField({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  multiline?: boolean
}) {
  const inputStyle = {
    borderColor: 'var(--color-border)',
    color: 'var(--color-text-primary)',
  }

  return (
    <div className="flex gap-2">
      <label
        className="text-xs w-20 shrink-0 pt-1.5"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-sm px-2 py-1 rounded border outline-none resize-none focus:border-[var(--color-accent)]"
          style={inputStyle}
          placeholder={placeholder}
          rows={2}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-sm px-2 py-1 rounded border outline-none focus:border-[var(--color-accent)]"
          style={inputStyle}
          placeholder={placeholder}
        />
      )}
    </div>
  )
}

export function TradeoffsSection() {
  const [collapsed, setCollapsed] = useState(false)
  const items = useNotesStore((s) => s.notes.tradeoffs)
  const { addTradeoff, removeTradeoff, updateTradeoff } = useNotesStore()

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
        Trade-offs & Decisions
        <span
          className="ml-auto text-xs font-normal"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {items.length}
        </span>
      </button>
      {!collapsed && (
        <div className="px-4 pb-3 space-y-3">
          {items.length === 0 && (
            <p className="text-xs py-2" style={{ color: 'var(--color-text-muted)' }}>
              Document key design decisions and their trade-offs.
            </p>
          )}
          {items.map((entry) => (
            <div
              key={entry.id}
              className="rounded-lg border p-3 space-y-2"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-panel-bg)' }}
            >
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={entry.title}
                  onChange={(e) => updateTradeoff(entry.id, { title: e.target.value })}
                  className="bg-transparent text-sm font-medium outline-none flex-1"
                  style={{ color: 'var(--color-text-primary)' }}
                  placeholder="Decision title..."
                />
                <button
                  onClick={() => removeTradeoff(entry.id)}
                  className="p-1 rounded hover:bg-[var(--color-sidebar-bg)] transition-colors"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <TradeoffField
                label="Options"
                value={entry.options}
                onChange={(v) => updateTradeoff(entry.id, { options: v })}
                placeholder="e.g., PostgreSQL, MongoDB, DynamoDB"
              />
              <TradeoffField
                label="Chosen"
                value={entry.chosen}
                onChange={(v) => updateTradeoff(entry.id, { chosen: v })}
                placeholder="e.g., PostgreSQL"
              />
              <TradeoffField
                label="Rationale"
                value={entry.rationale}
                onChange={(v) => updateTradeoff(entry.id, { rationale: v })}
                placeholder="Why this choice?"
                multiline
              />
            </div>
          ))}
          <button
            onClick={() =>
              addTradeoff({ title: '', options: '', chosen: '', rationale: '' })
            }
            className="flex items-center gap-1.5 text-xs px-1 py-1 rounded hover:bg-[var(--color-panel-bg)] transition-colors"
            style={{ color: 'var(--color-accent)' }}
          >
            <Plus size={14} />
            Add trade-off
          </button>
        </div>
      )}
    </section>
  )
}
