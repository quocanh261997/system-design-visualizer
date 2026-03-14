import { memo } from 'react'
import { NodeResizer, type NodeProps } from '@xyflow/react'
import type { SystemNode } from '@/types'
import { useFlowStore } from '@/store/use-flow-store'

/** Group boundary type visual presets */
const GROUP_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  service: { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.05)', border: 'rgba(99, 102, 241, 0.3)' },
  vpc: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.04)', border: 'rgba(34, 197, 94, 0.25)' },
  region: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.04)', border: 'rgba(245, 158, 11, 0.25)' },
  subnet: { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.04)', border: 'rgba(6, 182, 212, 0.25)' },
  zone: { color: '#a855f7', bg: 'rgba(168, 85, 247, 0.04)', border: 'rgba(168, 85, 247, 0.25)' },
}

/** Resizable group/boundary box node with typed boundaries */
function GroupNodeComponent({ id, data, selected }: NodeProps<SystemNode>) {
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode)
  const groupType = (data.config.groupType as string) ?? 'service'
  const style = GROUP_STYLES[groupType] ?? GROUP_STYLES.service

  return (
    <>
      <NodeResizer
        minWidth={200}
        minHeight={150}
        isVisible={selected}
        lineStyle={{ borderColor: style.color }}
        handleStyle={{ backgroundColor: style.color, width: 8, height: 8 }}
      />
      <div
        className="w-full h-full p-3 cursor-pointer"
        onClick={() => setSelectedNode(id)}
        style={{
          backgroundColor: style.bg,
          borderColor: style.border,
          borderWidth: 2,
          borderStyle: 'dashed',
          borderRadius: 12,
        }}
      >
        <div
          className="text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-md inline-block"
          style={{ color: style.color, backgroundColor: `${style.color}1a` }}
        >
          {data.label}
        </div>
      </div>
    </>
  )
}

export const GroupNodeMemo = memo(GroupNodeComponent)
