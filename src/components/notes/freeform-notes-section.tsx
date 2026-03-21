import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useNotesStore } from '@/store/use-notes-store'

export function FreeformNotesSection() {
  const [collapsed, setCollapsed] = useState(false)
  const text = useNotesStore((s) => s.notes.freeformNotes)
  const { setFreeformNotes } = useNotesStore()

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
        Free-form Notes
      </button>
      {!collapsed && (
        <div className="px-4 pb-3">
          <textarea
            value={text}
            onChange={(e) => setFreeformNotes(e.target.value)}
            className="w-full bg-transparent text-sm px-2 py-2 rounded border outline-none resize-y min-h-[120px] focus:border-[var(--color-accent)]"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
            placeholder="Additional thoughts, back-of-envelope calculations, design notes..."
          />
        </div>
      )}
    </section>
  )
}
