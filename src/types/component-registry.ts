import type { LucideIcon } from 'lucide-react'

/** Categories for grouping components in the palette */
export type ComponentCategory =
  | 'clients'
  | 'networking'
  | 'compute'
  | 'databases'
  | 'caching'
  | 'messaging'
  | 'storage'
  | 'search'
  | 'auth'
  | 'observability'
  | 'third-party'
  | 'decision'

/** Schema for a configurable property on a component */
export interface PropertySchema {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'boolean'
  defaultValue: string | number | boolean
  options?: string[] // for select type
  placeholder?: string
}

/** Definition of a system design component type */
export interface ComponentDefinition {
  type: string
  label: string
  category: ComponentCategory
  description: string
  icon: LucideIcon
  color: string // tailwind-compatible hex color for the node accent
  properties: PropertySchema[]
  defaultPorts: {
    inputs: number
    outputs: number
  }
}

/** Runtime config values for a placed component instance */
export type ComponentConfig = Record<string, string | number | boolean>
