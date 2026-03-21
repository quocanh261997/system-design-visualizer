import { GitBranch } from 'lucide-react'
import { TabPlaceholder } from './tab-placeholder'

export function SequenceTabPlaceholder() {
  return (
    <TabPlaceholder
      icon={GitBranch}
      title="Sequence Diagrams"
      description="Visualize request flows between services with numbered steps and timing."
    />
  )
}
