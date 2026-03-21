import { useWorkspaceStore } from '@/store/use-workspace-store'
import { ArchitectureTab } from '@/components/tabs/architecture-tab'
import { SchemaTabPlaceholder } from '@/components/tabs/schema-tab-placeholder'
import { ApiTabPlaceholder } from '@/components/tabs/api-tab-placeholder'
import { SequenceTabPlaceholder } from '@/components/tabs/sequence-tab-placeholder'
import { NotesTabPlaceholder } from '@/components/tabs/notes-tab-placeholder'
import { EstimationTabPlaceholder } from '@/components/tabs/estimation-tab-placeholder'

interface WorkspaceContentProps {
  showAnalysis: boolean
  onCloseAnalysis: () => void
}

export function WorkspaceContent({ showAnalysis, onCloseAnalysis }: WorkspaceContentProps) {
  const activeTab = useWorkspaceStore((s) => s.activeTab)

  switch (activeTab) {
    case 'architecture':
      return <ArchitectureTab showAnalysis={showAnalysis} onCloseAnalysis={onCloseAnalysis} />
    case 'schema':
      return <SchemaTabPlaceholder />
    case 'api':
      return <ApiTabPlaceholder />
    case 'sequence':
      return <SequenceTabPlaceholder />
    case 'notes':
      return <NotesTabPlaceholder />
    case 'estimation':
      return <EstimationTabPlaceholder />
    default:
      return <ArchitectureTab showAnalysis={showAnalysis} onCloseAnalysis={onCloseAnalysis} />
  }
}
