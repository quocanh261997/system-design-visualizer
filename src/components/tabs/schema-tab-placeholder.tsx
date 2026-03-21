import { Database } from 'lucide-react'
import { TabPlaceholder } from './tab-placeholder'

export function SchemaTabPlaceholder() {
  return (
    <TabPlaceholder
      icon={Database}
      title="Database Schema"
      description="Design ER diagrams, define tables and relationships, generate DDL, and import SQL."
    />
  )
}
