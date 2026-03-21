import type { LucideIcon } from 'lucide-react'

interface TabPlaceholderProps {
  icon: LucideIcon
  title: string
  description: string
}

export function TabPlaceholder({ icon: Icon, title, description }: TabPlaceholderProps) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
          style={{ backgroundColor: 'var(--color-panel-bg)', border: '1px solid var(--color-border)' }}
        >
          <Icon size={28} style={{ color: 'var(--color-text-muted)' }} />
        </div>
        <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </h2>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          {description}
        </p>
        <span
          className="inline-block text-xs font-medium px-3 py-1 rounded-full"
          style={{ backgroundColor: 'var(--color-panel-bg)', color: 'var(--color-accent)', border: '1px solid var(--color-border)' }}
        >
          Coming Soon
        </span>
      </div>
    </div>
  )
}
