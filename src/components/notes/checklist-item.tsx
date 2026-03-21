import { useRef, useEffect } from 'react'
import { Trash2 } from 'lucide-react'

interface ChecklistItemProps {
  id: string
  text: string
  completed: boolean
  onToggle: (id: string) => void
  onUpdate: (id: string, text: string) => void
  onRemove: (id: string) => void
  onAddBelow: () => void
  autoFocus?: boolean
}

export function ChecklistItem({
  id,
  text,
  completed,
  onToggle,
  onUpdate,
  onRemove,
  onAddBelow,
  autoFocus,
}: ChecklistItemProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  return (
    <div className="group flex items-center gap-2 py-1">
      <input
        type="checkbox"
        checked={completed}
        onChange={() => onToggle(id)}
        className="w-4 h-4 shrink-0 rounded accent-[var(--color-accent)] cursor-pointer"
      />
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => onUpdate(id, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            onAddBelow()
          }
          if (e.key === 'Backspace' && text === '') {
            e.preventDefault()
            onRemove(id)
          }
        }}
        className="flex-1 bg-transparent border-none outline-none text-sm"
        style={{
          color: completed
            ? 'var(--color-text-muted)'
            : 'var(--color-text-primary)',
          textDecoration: completed ? 'line-through' : 'none',
        }}
        placeholder="Type a requirement..."
      />
      <button
        onClick={() => onRemove(id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[var(--color-panel-bg)]"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}
