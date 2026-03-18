import { memo, useState, useRef, useEffect } from 'react'
import { type NodeProps } from '@xyflow/react'
import type { SystemNode } from '@/types'
import { useFlowStore } from '@/store/use-flow-store'

/** A simple text node that supports multiline editing on double click */
function TextNodeComponent({ id, data, selected }: NodeProps<SystemNode>) {
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode)
  const updateNodeLabel = useFlowStore((s) => s.updateNodeLabel)

  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(data.label)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!isEditing) setEditValue(data.label)
  }, [data.label, isEditing])

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      // Put cursor at the end
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length)
    }
  }, [isEditing])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [editValue, isEditing])

  const handleSave = () => {
    if (editValue.trim() !== '') {
      updateNodeLabel(id, editValue.trim())
    } else {
      setEditValue(data.label)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Stop React Flow default handlers (which can consume Enter, Shift, Space, etc.)
    e.stopPropagation()

    // Shift+Enter adds newline (handled natively by textarea). Enter alone saves.
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      setEditValue(data.label)
      setIsEditing(false)
    }
  }

  return (
    <div
      className="cursor-pointer group relative"
      onClick={() => setSelectedNode(id)}
      onDoubleClick={() => setIsEditing(true)}
      style={{
        padding: '8px',
        minWidth: 50,
        minHeight: 20,
      }}
    >
      {/* Subtle selection outline */}
      {selected && !isEditing && (
        <div className="absolute inset-0 border border-blue-500 rounded-md pointer-events-none opacity-50" />
      )}
      
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          onPointerDown={(e) => e.stopPropagation()} // Prevent pan while selecting text
          className="bg-transparent border-none outline-none font-medium leading-relaxed resize-none overflow-hidden m-0 p-0 pointer-events-auto"
          style={{
            color: 'var(--color-text-primary)',
            whiteSpace: 'pre-wrap',
            minWidth: '50px',
            width: `${Math.max(...editValue.split('\n').map(line => line.length), 5)}ch`
          }}
          rows={1}
        />
      ) : (
        <div
          className="font-medium leading-relaxed whitespace-pre-wrap"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {data.label}
        </div>
      )}
    </div>
  )
}

export const TextNodeMemo = memo(TextNodeComponent)
