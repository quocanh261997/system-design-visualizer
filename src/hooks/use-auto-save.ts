import { useEffect, useRef } from 'react'
import { useFlowStore } from '@/store/use-flow-store'
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
      const { nodes, edges, projectName } = useFlowStore.getState()
      if (nodes.length === 0 && edges.length === 0) return

      const id = await saveProject(
        nodes,
        edges,
        projectName,
        savedIdRef.current ?? undefined
      )
      savedIdRef.current = id
    }, AUTO_SAVE_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  return savedIdRef
}
