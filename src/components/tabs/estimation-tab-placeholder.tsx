import { Calculator } from 'lucide-react'
import { TabPlaceholder } from './tab-placeholder'

export function EstimationTabPlaceholder() {
  return (
    <TabPlaceholder
      icon={Calculator}
      title="Back-of-Envelope Estimation"
      description="Calculate QPS, storage, bandwidth, and cache requirements with guided presets."
    />
  )
}
