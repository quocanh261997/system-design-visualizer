import { FileText } from 'lucide-react'
import { TabPlaceholder } from './tab-placeholder'

export function NotesTabPlaceholder() {
  return (
    <TabPlaceholder
      icon={FileText}
      title="Notes & Requirements"
      description="Capture functional and non-functional requirements, assumptions, and trade-off decisions."
    />
  )
}
