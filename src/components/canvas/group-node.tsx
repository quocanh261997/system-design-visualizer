import { memo, useState, useRef, useEffect } from 'react'
import { NodeResizer, type NodeProps } from '@xyflow/react'
import type { SystemNode } from '@/types'
import { useFlowStore } from '@/store/use-flow-store'

/** Group boundary type visual presets */
const GROUP_STYLES: Record<string, { color: string; border: string }> = {
  service: { color: '#6366f1', border: 'rgba(99, 102, 241, 0.4)' },
  vpc: { color: '#22c55e', border: 'rgba(34, 197, 94, 0.4)' },
  region: { color: '#f59e0b', border: 'rgba(245, 158, 11, 0.4)' },
  subnet: { color: '#06b6d4', border: 'rgba(6, 182, 212, 0.4)' },
  zone: { color: '#a855f7', border: 'rgba(168, 85, 247, 0.4)' },
}

/** Resizable group/boundary box node with typed boundaries */
function GroupNodeComponent({ id, data, selected }: NodeProps<SystemNode>) {
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode)
  const updateNodeLabel = useFlowStore((s) => s.updateNodeLabel)
  const groupType = (data.config.groupType as string) ?? 'service'
  const style = GROUP_STYLES[groupType] ?? GROUP_STYLES.service

  const [isEditing, setIsEditing] = useState(false)
  const [editValueState, setEditValue] = useState(data.label)
  const inputRef = useRef<HTMLInputElement>(null)

  const editValue = isEditing ? editValueState : data.label

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    if (editValue.trim() !== '') {
      updateNodeLabel(id, editValue.trim())
    } else {
      setEditValue(data.label)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation()
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') {
      setEditValue(data.label)
      setIsEditing(false)
    }
  }

  return (
    <>
      <NodeResizer
        minWidth={200}
        minHeight={150}
        isVisible={selected}
        lineStyle={{ border: 'none' }}
        handleStyle={{ backgroundColor: style.color, width: 8, height: 8 }}
      />
      <div
        className="w-full h-full cursor-pointer relative"
        onClick={() => setSelectedNode(id)}
        style={{
          backgroundColor: 'transparent',
          borderColor: style.border,
          borderWidth: 2,
          borderStyle: 'dashed',
          borderRadius: 12,
        }}
      >
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-10 text-sm font-bold tracking-wide break-words whitespace-nowrap"
          style={{ 
            color: 'var(--color-text-primary)'
          }}
          onDoubleClick={() => { if (!isEditing) setIsEditing(true) }}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none text-center font-bold tracking-wide pointer-events-auto"
              style={{
                color: 'var(--color-text-primary)',
                borderBottom: `2px solid ${style.color}`,
                width: `${Math.max(editValue.length, 5)}ch`
              }}
              onPointerDown={(e) => e.stopPropagation()} // Prevent react-flow dragging while editing
            />
          ) : (
            data.label
          )}
        </div>
      </div>
    </>
  )
}

export const GroupNodeMemo = memo(GroupNodeComponent)
