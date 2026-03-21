import { WORKSPACE_TABS } from '@/types'
import { useWorkspaceStore } from '@/store/use-workspace-store'

export function WorkspaceTabs() {
  const activeTab = useWorkspaceStore((s) => s.activeTab)
  const setActiveTab = useWorkspaceStore((s) => s.setActiveTab)

  return (
    <div
      className="flex items-center gap-0.5 px-4 border-b shrink-0"
      style={{ backgroundColor: 'var(--color-sidebar-bg)', borderColor: 'var(--color-border)' }}
    >
      {WORKSPACE_TABS.map((tab) => {
        const isActive = activeTab === tab.id
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors"
            style={{
              color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
            }}
            title={`${tab.description} (Ctrl+${tab.shortcutKey})`}
          >
            <Icon size={13} />
            {tab.label}
            {isActive && (
              <div
                className="absolute bottom-0 left-2 right-2 h-[2px] rounded-t"
                style={{ backgroundColor: 'var(--color-accent)' }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
