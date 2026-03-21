import { FileCode } from 'lucide-react'
import { TabPlaceholder } from './tab-placeholder'

export function ApiTabPlaceholder() {
  return (
    <TabPlaceholder
      icon={FileCode}
      title="API Design"
      description="Define REST endpoints, gRPC services, and GraphQL schemas for your system."
    />
  )
}
