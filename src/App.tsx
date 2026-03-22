import { useState, useCallback } from 'react'
import { useMountEffect } from '@/hooks/use-mount-effect'
import { ReactFlowProvider } from '@xyflow/react'
import { TopToolbar } from '@/components/toolbar/top-toolbar'
import { WorkspaceTabs } from '@/components/workspace/workspace-tabs'
import { WorkspaceContent } from '@/components/workspace/workspace-content'
import { TemplatePicker } from '@/components/templates/template-picker'
import { ShortcutsHelp } from '@/components/toolbar/shortcuts-help'
import { TimerProgressBar } from '@/components/timer/timer-progress-bar'
import { TimerProvider } from '@/components/timer/timer-context'
import { useTimerContext } from '@/components/timer/use-timer-context'
import { useAutoSave } from '@/hooks/use-auto-save'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useFlowStore } from '@/store/use-flow-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'
import { useNotesStore } from '@/store/use-notes-store'
import { useEstimationStore } from '@/store/use-estimation-store'
import { useSchemaStore } from '@/store/use-schema-store'
import { loadProject } from '@/lib/persistence'

const LAST_PROJECT_KEY = 'sdb-last-project-id'
const TEMPLATES_SHOWN_KEY = 'sdb-templates-shown'

function AppContent() {
  const hasLastProject = localStorage.getItem(LAST_PROJECT_KEY) !== null
  const hasSeenTemplates = localStorage.getItem(TEMPLATES_SHOWN_KEY) !== null
  const [projectId, setProjectId] = useState<string | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [showTemplates, setShowTemplates] = useState(!hasLastProject && !hasSeenTemplates)
  const [showShortcuts, setShowShortcuts] = useState(false)
  useAutoSave(projectId)

  const handleProjectIdChange = useCallback((id: string) => {
    setProjectId(id)
    localStorage.setItem(LAST_PROJECT_KEY, id)
  }, [])

  // Load last project from IndexedDB on startup
  useMountEffect(() => {
    const lastId = localStorage.getItem(LAST_PROJECT_KEY)
    if (!lastId) return
    loadProject(lastId).then((data) => {
      if (data) {
        useFlowStore.getState().loadProject(data.nodes, data.edges, data.name)
        if (data.notes) useNotesStore.getState().loadNotes(data.notes)
        if (data.estimations) useEstimationStore.getState().loadEstimation(data.estimations)
        if (data.schemas && 'tablePositions' in data.schemas) {
          useSchemaStore.getState().loadSchema(data.schemas as import('@/types/schema').DatabaseSchemaData)
        }
        useWorkspaceStore.getState().setActiveTab(
          (data.activeTab as 'architecture') ?? 'architecture'
        )
        handleProjectIdChange(lastId)
      } else {
        localStorage.removeItem(LAST_PROJECT_KEY)
        setShowTemplates(true)
      }
    }).catch(() => {
      localStorage.removeItem(LAST_PROJECT_KEY)
      setShowTemplates(true)
    })
  })

  const toggleAnalysis = useCallback(() => setShowAnalysis((v) => !v), [])
  const openTemplates = useCallback(() => setShowTemplates(true), [])
  const timer = useTimerContext()

  useKeyboardShortcuts({
    onToggleAnalysis: toggleAnalysis,
    onOpenTemplates: openTemplates,
    onToggleTimer: timer.toggle,
  })

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <TimerProgressBar timer={timer} />
      <TopToolbar
        timer={timer}
        projectId={projectId}
        onProjectIdChange={handleProjectIdChange}
        onToggleAnalysis={toggleAnalysis}
        onOpenTemplates={openTemplates}
        onOpenShortcuts={() => setShowShortcuts(true)}
        analysisOpen={showAnalysis}
      />
      <WorkspaceTabs />
      <WorkspaceContent
        showAnalysis={showAnalysis}
        onCloseAnalysis={() => setShowAnalysis(false)}
      />

      {showTemplates && <TemplatePicker onClose={() => {
        setShowTemplates(false)
        localStorage.setItem(TEMPLATES_SHOWN_KEY, '1')
      }} />}
      {showShortcuts && <ShortcutsHelp onClose={() => setShowShortcuts(false)} />}
    </div>
  )
}

export default function App() {
  return (
    <ReactFlowProvider>
      <TimerProvider>
        <AppContent />
      </TimerProvider>
    </ReactFlowProvider>
  )
}
