import { useMemo, useState } from 'react'
import { AlertTriangle, AlertCircle, Info, RefreshCw, ShieldCheck } from 'lucide-react'
import { useFlowStore } from '@/store/use-flow-store'
import { analyzeGraph, type AnalysisWarning, type WarningSeverity } from '@/lib/analysis-engine'

const SEVERITY_CONFIG: Record<WarningSeverity, { icon: typeof AlertTriangle; color: string; bg: string }> = {
  error: { icon: AlertCircle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  warning: { icon: AlertTriangle, color: '#eab308', bg: 'rgba(234, 179, 8, 0.1)' },
  info: { icon: Info, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
}

interface AnalysisPanelProps {
  onClose: () => void
}

/** Side panel showing design analysis warnings with clickable severity filters */
export function AnalysisPanel({ onClose }: AnalysisPanelProps) {
  const nodes = useFlowStore((s) => s.nodes)
  const edges = useFlowStore((s) => s.edges)
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode)

  /** Active severity filters -- all enabled by default */
  const [activeFilters, setActiveFilters] = useState<Set<WarningSeverity>>(
    new Set(['error', 'warning', 'info'])
  )

  const warnings = useMemo(() => analyzeGraph(nodes, edges), [nodes, edges])

  const errorCount = warnings.filter((w) => w.severity === 'error').length
  const warnCount = warnings.filter((w) => w.severity === 'warning').length
  const infoCount = warnings.filter((w) => w.severity === 'info').length

  /** Filtered warnings based on active severity toggles */
  const filteredWarnings = useMemo(
    () => warnings.filter((w) => activeFilters.has(w.severity)),
    [warnings, activeFilters]
  )

  const toggleFilter = (severity: WarningSeverity) => {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      if (next.has(severity)) {
        next.delete(severity)
      } else {
        next.add(severity)
      }
      return next
    })
  }

  const handleWarningClick = (warning: AnalysisWarning) => {
    if (warning.nodeIds.length > 0) {
      setSelectedNode(warning.nodeIds[0])
    }
  }

  return (
    <aside
      className="w-80 h-full border-l flex flex-col overflow-hidden shrink-0"
      style={{ backgroundColor: 'var(--color-sidebar-bg)', borderColor: 'var(--color-border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} style={{ color: 'var(--color-accent)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Design Analysis
          </span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors">
          <RefreshCw size={12} style={{ color: 'var(--color-text-muted)' }} />
        </button>
      </div>

      {/* Clickable severity filter badges */}
      <div className="flex items-center gap-2 p-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        {([
          { severity: 'error' as const, count: errorCount, label: 'error' },
          { severity: 'warning' as const, count: warnCount, label: 'warning' },
          { severity: 'info' as const, count: infoCount, label: 'suggestion' },
        ]).map(({ severity, count, label }) => {
          if (count === 0) return null
          const cfg = SEVERITY_CONFIG[severity]
          const isActive = activeFilters.has(severity)
          return (
            <button
              key={severity}
              className="text-xs font-medium px-2 py-0.5 rounded transition-all cursor-pointer"
              style={{
                backgroundColor: isActive ? cfg.bg : 'transparent',
                color: isActive ? cfg.color : 'var(--color-text-muted)',
                border: `1px solid ${isActive ? cfg.color + '44' : 'var(--color-border)'}`,
                opacity: isActive ? 1 : 0.5,
              }}
              onClick={() => toggleFilter(severity)}
              title={isActive ? `Hide ${label}s` : `Show ${label}s`}
            >
              {count} {label}{count > 1 ? 's' : ''}
            </button>
          )
        })}
        {warnings.length === 0 && (
          <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
            No issues found
          </span>
        )}
      </div>

      {/* Warning list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filteredWarnings.map((warning) => {
          const config = SEVERITY_CONFIG[warning.severity]
          const Icon = config.icon
          return (
            <button
              key={warning.id}
              className="w-full text-left rounded-lg p-2.5 transition-colors hover:bg-white/5"
              style={{ border: `1px solid ${config.color}22` }}
              onClick={() => handleWarningClick(warning)}
            >
              <div className="flex items-start gap-2">
                <Icon size={14} style={{ color: config.color, marginTop: 1 }} className="shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {warning.title}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {warning.description}
                  </div>
                  <div className="text-[10px] mt-1 uppercase tracking-wider" style={{ color: config.color }}>
                    {warning.rule.replace(/-/g, ' ')}
                  </div>
                </div>
              </div>
            </button>
          )
        })}

        {filteredWarnings.length === 0 && warnings.length > 0 && (
          <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
            <div className="text-xs">All issues filtered out</div>
            <div className="text-[10px] mt-1">Click badges above to show</div>
          </div>
        )}

        {warnings.length === 0 && (
          <div className="text-center py-12">
            <ShieldCheck size={32} className="mx-auto mb-2" style={{ color: '#22c55e' }} />
            <div className="text-sm font-medium" style={{ color: '#22c55e' }}>Looking good!</div>
            <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>No issues detected.</div>
          </div>
        )}
      </div>
    </aside>
  )
}
