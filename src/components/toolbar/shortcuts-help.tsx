import { X, Keyboard } from 'lucide-react'
import { SHORTCUT_MAP } from '@/hooks/use-keyboard-shortcuts'

interface ShortcutsHelpProps {
  onClose: () => void
}

/** Modal displaying all keyboard shortcuts */
export function ShortcutsHelp({ onClose }: ShortcutsHelpProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--color-sidebar-bg)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <Keyboard size={14} style={{ color: 'var(--color-accent)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Keyboard Shortcuts
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
            <X size={14} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>
        <div className="p-4 space-y-2">
          {SHORTCUT_MAP.map((shortcut) => (
            <div key={shortcut.action} className="flex items-center justify-between py-1">
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {shortcut.action}
              </span>
              <div className="flex gap-1">
                {shortcut.keys.map((key) => (
                  <kbd
                    key={key}
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium"
                    style={{
                      backgroundColor: 'var(--color-panel-bg)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
