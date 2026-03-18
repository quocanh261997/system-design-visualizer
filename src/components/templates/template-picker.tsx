import { useState, useMemo } from 'react'
import { X, Search, Layout, Zap, Trophy, BookOpen } from 'lucide-react'
import { designTemplates, type DesignTemplate } from '@/data/templates'
import { useFlowStore } from '@/store/use-flow-store'

const DIFFICULTY_CONFIG = {
  beginner: { color: '#22c55e', label: 'Beginner', icon: BookOpen },
  intermediate: { color: '#f59e0b', label: 'Intermediate', icon: Zap },
  advanced: { color: '#ef4444', label: 'Advanced', icon: Trophy },
}

interface TemplatePickerProps {
  onClose: () => void
}

/** Modal/overlay for browsing and loading design templates */
export function TemplatePicker({ onClose }: TemplatePickerProps) {
  const [search, setSearch] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const loadProject = useFlowStore((s) => s.loadProject)

  const filtered = useMemo(() => {
    let result = designTemplates
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    }
    if (selectedDifficulty) {
      result = result.filter((t) => t.difficulty === selectedDifficulty)
    }
    return result
  }, [search, selectedDifficulty])

  const handleSelect = (template: DesignTemplate) => {
    loadProject(template.nodes, template.edges, template.name)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-3xl max-h-[80vh] rounded-2xl flex flex-col overflow-hidden"
        style={{
          backgroundColor: 'var(--color-sidebar-bg)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <Layout size={16} style={{ color: 'var(--color-accent)' }} />
            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Design Templates
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-panel-bg)', color: 'var(--color-text-muted)' }}>
              {designTemplates.length} templates
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X size={16} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div
            className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg"
            style={{ backgroundColor: 'var(--color-panel-bg)', border: '1px solid var(--color-border)' }}
          >
            <Search size={14} style={{ color: 'var(--color-text-muted)' }} />
            <input
              className="bg-transparent outline-none w-full text-sm"
              style={{ color: 'var(--color-text-primary)' }}
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex gap-1">
            {(['beginner', 'intermediate', 'advanced'] as const).map((diff) => {
              const cfg = DIFFICULTY_CONFIG[diff]
              const isActive = selectedDifficulty === diff
              return (
                <button
                  key={diff}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    backgroundColor: isActive ? `${cfg.color}22` : 'transparent',
                    border: `1px solid ${isActive ? cfg.color : 'var(--color-border)'}`,
                    color: isActive ? cfg.color : 'var(--color-text-muted)',
                  }}
                  onClick={() => setSelectedDifficulty(isActive ? null : diff)}
                >
                  {cfg.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Template grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((template) => (
              <TemplateCard key={template.id} template={template} onSelect={handleSelect} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
              <Search size={24} className="mx-auto mb-2 opacity-50" />
              <div className="text-sm">No templates match your search</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t shadow-[0_-4px_16px_rgba(0,0,0,0.2)]" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-sidebar-bg)' }}>
          <button
            onClick={onClose}
            className="w-full text-sm font-semibold px-4 py-3 rounded-xl transition-all shadow-lg hover:brightness-110 active:scale-[0.98]"
            style={{ backgroundColor: 'var(--color-accent)', color: '#ffffff' }}
          >
            Start with Blank Canvas
          </button>
        </div>
      </div>
    </div>
  )
}

/** Individual template card */
function TemplateCard({
  template,
  onSelect,
}: {
  template: DesignTemplate
  onSelect: (t: DesignTemplate) => void
}) {
  const cfg = DIFFICULTY_CONFIG[template.difficulty]
  const DiffIcon = cfg.icon

  return (
    <button
      className="text-left rounded-xl p-4 transition-all hover:scale-[1.02]"
      style={{
        backgroundColor: 'var(--color-panel-bg)',
        border: '1px solid var(--color-border)',
      }}
      onClick={() => onSelect(template)}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {template.name}
        </h3>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <DiffIcon size={10} style={{ color: cfg.color }} />
          <span className="text-[10px] font-medium" style={{ color: cfg.color }}>
            {cfg.label}
          </span>
        </div>
      </div>
      <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--color-text-muted)' }}>
        {template.description}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--color-sidebar-bg)', color: 'var(--color-text-muted)' }}>
          {template.nodes.length} components
        </span>
        {template.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-accent)' }}>
            {tag}
          </span>
        ))}
      </div>
    </button>
  )
}
