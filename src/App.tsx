import { useState, useCallback } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { DesignCanvas } from '@/components/canvas/design-canvas'
import { ComponentPalette } from '@/components/palette/component-palette'
import { PropertyPanel } from '@/components/properties/property-panel'
import { EdgePropertyPanel } from '@/components/properties/edge-property-panel'
import { AnalysisPanel } from '@/components/analysis/analysis-panel'
import { TopToolbar } from '@/components/toolbar/top-toolbar'
import { SimulationControls } from '@/components/toolbar/simulation-controls'
import { TemplatePicker } from '@/components/templates/template-picker'
import { ShortcutsHelp } from '@/components/toolbar/shortcuts-help'
import { useAutoSave } from '@/hooks/use-auto-save'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useFlowStore } from '@/store/use-flow-store'

function AppContent() {
  const [projectId, setProjectId] = useState<string | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [showTemplates, setShowTemplates] = useState(true)
  const [showShortcuts, setShowShortcuts] = useState(false)
  useAutoSave(projectId)

  const selectedNodeId = useFlowStore((s) => s.selectedNodeId)
  const selectedEdgeId = useFlowStore((s) => s.selectedEdgeId)

  const toggleAnalysis = useCallback(() => setShowAnalysis((v) => !v), [])
  const openTemplates = useCallback(() => setShowTemplates(true), [])

  useKeyboardShortcuts({
    projectId,
    onSave: setProjectId,
    onToggleAnalysis: toggleAnalysis,
    onOpenTemplates: openTemplates,
  })

  const rightPanel = showAnalysis
    ? <AnalysisPanel onClose={() => setShowAnalysis(false)} />
    : selectedEdgeId
      ? <EdgePropertyPanel />
      : selectedNodeId
        ? <PropertyPanel />
        : null

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <TopToolbar
        projectId={projectId}
        onProjectIdChange={setProjectId}
        onToggleAnalysis={toggleAnalysis}
        onOpenTemplates={openTemplates}
        onOpenShortcuts={() => setShowShortcuts(true)}
        analysisOpen={showAnalysis}
      />
      <div className="flex flex-1 overflow-hidden">
        <ComponentPalette />
        <div className="relative flex-1 h-full">
          <SimulationControls />
          <DesignCanvas />
        </div>
        {rightPanel}
      </div>

      {showTemplates && <TemplatePicker onClose={() => setShowTemplates(false)} />}
      {showShortcuts && <ShortcutsHelp onClose={() => setShowShortcuts(false)} />}
    </div>
  )
}

export default function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  )
}
