import { useWorkspaceStore } from '@/store/use-workspace-store'
import { ArchitectureTab } from '@/components/tabs/architecture-tab'
import { SchemaTab } from '@/components/tabs/schema-tab'
import { ApiTabPlaceholder } from '@/components/tabs/api-tab-placeholder'
import { SequenceTabPlaceholder } from '@/components/tabs/sequence-tab-placeholder'
import { NotesTab } from '@/components/tabs/notes-tab'
import { EstimationTab } from '@/components/tabs/estimation-tab'

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
      return <SchemaTab />
    case 'api':
      return <ApiTabPlaceholder />
    case 'sequence':
      return <SequenceTabPlaceholder />
    case 'notes':
      return <NotesTab />
    case 'estimation':
      return <EstimationTab />
    default:
      return <ArchitectureTab showAnalysis={showAnalysis} onCloseAnalysis={onCloseAnalysis} />
  }
}
