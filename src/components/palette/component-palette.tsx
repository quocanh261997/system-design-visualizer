import { useState, useMemo } from 'react'
import { Search, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import {
  componentDefinitions,
  categoryLabels,
} from '@/data/component-definitions'
import { brandIconMap } from '@/data/brand-icons'
import type { ComponentDefinition, ComponentCategory } from '@/types'

/** Sidebar palette for browsing and dragging components onto the canvas */
export function ComponentPalette() {
  const [search, setSearch] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)

  const filtered = useMemo(() => {
    if (!search.trim()) return componentDefinitions
    const q = search.toLowerCase()
    return componentDefinitions.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    )
  }, [search])

  /** Group filtered results by category */
  const grouped = useMemo(() => {
    const map = new Map<ComponentCategory, ComponentDefinition[]>()
    for (const comp of filtered) {
      const list = map.get(comp.category) ?? []
      list.push(comp)
      map.set(comp.category, list)
    }
    return map
  }, [filtered])

  if (isCollapsed) {
    return (
      <aside
        className="w-12 h-full flex flex-col items-center py-3 border-r shrink-0 transition-all"
        style={{
          backgroundColor: 'var(--color-sidebar-bg)',
          borderColor: 'var(--color-border)',
        }}
      >
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
          title="Expand palette"
          aria-label="Expand palette"
        >
          <PanelLeftOpen size={16} />
        </button>
      </aside>
    )
  }

  return (
    <aside
      className="w-64 h-full flex flex-col border-r overflow-hidden shrink-0 transition-all"
      style={{
        backgroundColor: 'var(--color-sidebar-bg)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Header */}
      <div className="p-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Components
          </h2>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded-md hover:bg-white/10 transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
            title="Collapse palette"
            aria-label="Collapse palette"
          >
            <PanelLeftClose size={14} />
          </button>
        </div>
        <div
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm"
          style={{
            backgroundColor: 'var(--color-panel-bg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <Search size={14} style={{ color: 'var(--color-text-muted)' }} />
          <input
            className="bg-transparent outline-none w-full text-sm"
            style={{ color: 'var(--color-text-primary)' }}
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Component list */}
      <div className="flex-1 overflow-y-auto p-2">
        {Array.from(grouped.entries()).map(([category, components]) => (
          <div key={category} className="mb-3">
            <div
              className="text-xs font-semibold uppercase tracking-wider px-2 py-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {categoryLabels[category] ?? category}
            </div>
            <div className="space-y-0.5">
              {components.map((comp) => (
                <PaletteItem key={comp.type} definition={comp} />
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
            No components found
          </div>
        )}
      </div>
    </aside>
  )
}

/** Individual draggable palette item */
function PaletteItem({ definition }: { definition: ComponentDefinition }) {
  const LucideIcon = definition.icon
  const BrandIcon = brandIconMap[definition.type]

  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/sdb-component', definition.type)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-grab active:cursor-grabbing transition-colors hover:bg-white/5"
      draggable
      onDragStart={onDragStart}
      title={definition.description}
    >
      <div
        className="flex items-center justify-center w-7 h-7 rounded-md shrink-0"
        style={{ backgroundColor: `${definition.color}1a` }}
      >
        {BrandIcon ? (
          <BrandIcon size={16} />
        ) : (
          <LucideIcon size={14} style={{ color: definition.color }} />
        )}
      </div>
      <span className="text-sm truncate" style={{ color: 'var(--color-text-secondary)' }}>
        {definition.label}
      </span>
    </div>
  )
}
