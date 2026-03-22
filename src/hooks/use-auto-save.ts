import { useEffect, useRef } from 'react'
import { useFlowStore } from '@/store/use-flow-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'
import { useNotesStore } from '@/store/use-notes-store'
import { useEstimationStore } from '@/store/use-estimation-store'
import { saveProject } from '@/lib/persistence'

const AUTO_SAVE_INTERVAL = 30_000 // 30 seconds

/** Auto-saves the current project to IndexedDB at regular intervals */
export function useAutoSave(projectId: string | null) {
  const savedIdRef = useRef(projectId)

  useEffect(() => {
    savedIdRef.current = projectId
  }, [projectId])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { nodes, edges, projectName } = useFlowStore.getState()
        if (nodes.length === 0 && edges.length === 0) return

        const { activeTab } = useWorkspaceStore.getState()
        const { notes } = useNotesStore.getState()
        const { data: estimations } = useEstimationStore.getState()
        const id = await saveProject({
          nodes,
          edges,
          name: projectName,
          existingId: savedIdRef.current ?? undefined,
          activeTab,
          notes,
          estimations,
        })
        savedIdRef.current = id
        localStorage.setItem('sdb-last-project-id', id)
      } catch {
        // Silently ignore autosave failures to avoid disrupting the user
      }
    }, AUTO_SAVE_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  return savedIdRef
}
