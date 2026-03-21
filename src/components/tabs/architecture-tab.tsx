import { DesignCanvas } from '@/components/canvas/design-canvas'
import { ComponentPalette } from '@/components/palette/component-palette'
import { PropertyPanel } from '@/components/properties/property-panel'
import { EdgePropertyPanel } from '@/components/properties/edge-property-panel'
import { AnalysisPanel } from '@/components/analysis/analysis-panel'
import { SimulationControls } from '@/components/toolbar/simulation-controls'
import { useFlowStore } from '@/store/use-flow-store'

interface ArchitectureTabProps {
  showAnalysis: boolean
  onCloseAnalysis: () => void
}

export function ArchitectureTab({ showAnalysis, onCloseAnalysis }: ArchitectureTabProps) {
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId)
  const selectedEdgeId = useFlowStore((s) => s.selectedEdgeId)

  const rightPanel = showAnalysis
    ? <AnalysisPanel onClose={onCloseAnalysis} />
    : selectedEdgeId
      ? <EdgePropertyPanel />
      : selectedNodeId
        ? <PropertyPanel />
        : null

  return (
    <div className="flex flex-1 overflow-hidden">
      <ComponentPalette />
      <div className="relative flex-1 h-full">
        <SimulationControls />
        <DesignCanvas />
      </div>
      {rightPanel}
    </div>
  )
}
