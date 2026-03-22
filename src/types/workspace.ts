import type { LucideIcon } from 'lucide-react'
import {
  Workflow,
  Database,
  FileCode,
  GitBranch,
  FileText,
  Calculator,
} from 'lucide-react'

export type WorkspaceTabId =
  | 'architecture'
  | 'schema'
  | 'api'
  | 'sequence'
  | 'notes'
  | 'estimation'

export interface WorkspaceTabDef {
  id: WorkspaceTabId
  label: string
  icon: LucideIcon
  shortcutKey: string
  description: string
}

export const WORKSPACE_TABS: WorkspaceTabDef[] = [
  {
    id: 'architecture',
    label: 'Architecture',
    icon: Workflow,
    shortcutKey: '1',
    description: 'High-level system architecture diagram',
  },
  {
    id: 'schema',
    label: 'Schema',
    icon: Database,
    shortcutKey: '2',
    description: 'Database schema and ER diagrams',
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: FileText,
    shortcutKey: '3',
    description: 'Requirements, assumptions, and trade-offs',
  },
  {
    id: 'estimation',
    label: 'Estimation',
    icon: Calculator,
    shortcutKey: '4',
    description: 'Back-of-envelope capacity estimation',
  },
  {
    id: 'api',
    label: 'API',
    icon: FileCode,
    shortcutKey: '5',
    description: 'API contract definitions',
  },
  {
    id: 'sequence',
    label: 'Sequence',
    icon: GitBranch,
    shortcutKey: '6',
    description: 'Sequence diagrams and request flows',
  },
]
