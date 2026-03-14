import { useEffect, useCallback } from 'react'
import { useFlowStore } from '@/store/use-flow-store'
import { useUndoStore } from '@/store/use-undo-store'
import { saveProject } from '@/lib/persistence'

interface ShortcutOptions {
  projectId: string | null
  onSave: (id: string) => void
  onToggleAnalysis: () => void
  onOpenTemplates: () => void
}

/** Centralized keyboard shortcut handler */
export function useKeyboardShortcuts({
  projectId,
  onSave,
  onToggleAnalysis,
  onOpenTemplates,
}: ShortcutOptions) {
  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      const active = document.activeElement
      const isInput = active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA' || active?.tagName === 'SELECT'

      // Ctrl/Cmd+S: Save
      if (meta && e.key === 's') {
        e.preventDefault()
        const { nodes, edges, projectName } = useFlowStore.getState()
        const id = await saveProject(nodes, edges, projectName, projectId ?? undefined)
        onSave(id)
        return
      }

      // Ctrl/Cmd+Z: Undo
      if (meta && !e.shiftKey && e.key === 'z') {
        e.preventDefault()
        useUndoStore.getState().undo()
        return
      }

      // Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y: Redo
      if ((meta && e.shiftKey && e.key === 'z') || (meta && e.key === 'y')) {
        e.preventDefault()
        useUndoStore.getState().redo()
        return
      }

      // Ctrl/Cmd+A: Select all (prevent default, let React Flow handle)
      if (meta && e.key === 'a' && !isInput) {
        // Let React Flow handle select all
        return
      }

      // Escape: Deselect / close modals
      if (e.key === 'Escape') {
        useFlowStore.getState().setSelectedNode(null)
        useFlowStore.getState().setSelectedEdge(null)
        return
      }

      // Delete/Backspace: Delete selected (when not in input)
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInput) {
        useUndoStore.getState().snapshot()
        useFlowStore.getState().deleteSelected()
        return
      }

      // Ctrl/Cmd+Shift+A: Toggle analysis panel
      if (meta && e.shiftKey && e.key === 'a') {
        e.preventDefault()
        onToggleAnalysis()
        return
      }

      // Ctrl/Cmd+T: Open templates
      if (meta && e.key === 't') {
        e.preventDefault()
        onOpenTemplates()
        return
      }

      // G: Add group (when not in input)
      if (e.key === 'g' && !isInput && !meta) {
        useUndoStore.getState().snapshot()
        useFlowStore.getState().addGroup({ x: 100, y: 100 })
        return
      }
    },
    [projectId, onSave, onToggleAnalysis, onOpenTemplates]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/** Shortcut reference data for help display */
export const SHORTCUT_MAP = [
  { keys: ['Ctrl', 'S'], action: 'Save project' },
  { keys: ['Ctrl', 'Z'], action: 'Undo' },
  { keys: ['Ctrl', 'Shift', 'Z'], action: 'Redo' },
  { keys: ['Delete'], action: 'Delete selected' },
  { keys: ['Escape'], action: 'Deselect all' },
  { keys: ['G'], action: 'Add group boundary' },
  { keys: ['Ctrl', 'T'], action: 'Open templates' },
  { keys: ['Ctrl', 'Shift', 'A'], action: 'Toggle analysis' },
]
