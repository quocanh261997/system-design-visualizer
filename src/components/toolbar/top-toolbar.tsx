import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Save,
  Download,
  Upload,
  Trash2,
  SquareDashedBottom,
  ShieldCheck,
  Layout,
  Image,
  FileCode,
  FileText,
  Undo2,
  Redo2,
  Keyboard,
} from 'lucide-react'
import { useFlowStore } from '@/store/use-flow-store'
import { useUndoStore } from '@/store/use-undo-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'
import { useNotesStore } from '@/store/use-notes-store'
import { saveProject, exportProjectJson, importProjectJson } from '@/lib/persistence'
import { WORKSPACE_TABS } from '@/types'
import { exportAsPng, exportAsSvg, exportAsPdf } from '@/lib/export-canvas'

interface TopToolbarProps {
  projectId: string | null
  onProjectIdChange: (id: string) => void
  onToggleAnalysis: () => void
  onOpenTemplates: () => void
  onOpenShortcuts: () => void
  analysisOpen: boolean
}

/** Top toolbar with project name, save/load, export, analysis, and templates */
export function TopToolbar({
  projectId,
  onProjectIdChange,
  onToggleAnalysis,
  onOpenTemplates,
  onOpenShortcuts,
  analysisOpen,
}: TopToolbarProps) {
  const projectName = useFlowStore((s) => s.projectName)
  const setProjectName = useFlowStore((s) => s.setProjectName)
  const nodes = useFlowStore((s) => s.nodes)
  const edges = useFlowStore((s) => s.edges)
  const loadProject = useFlowStore((s) => s.loadProject)
  const clear = useFlowStore((s) => s.clear)
  const addGroup = useFlowStore((s) => s.addGroup)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [saveStatus, setSaveStatus] = useState<string>('')
  const [showExportMenu, setShowExportMenu] = useState(false)

  const handleSave = useCallback(async () => {
    try {
      const { activeTab } = useWorkspaceStore.getState()
      const id = await saveProject({
        nodes,
        edges,
        name: projectName,
        existingId: projectId ?? undefined,
        activeTab,
        notes: useNotesStore.getState().notes,
      })
      onProjectIdChange(id)
      setSaveStatus('Saved!')
      setTimeout(() => setSaveStatus(''), 2000)
    } catch {
      setSaveStatus('Save failed')
    }
  }, [nodes, edges, projectName, projectId, onProjectIdChange])

  // Listen for keyboard shortcut save trigger
  useEffect(() => {
    const handler = () => { handleSave() }
    window.addEventListener('sdb:save', handler)
    return () => window.removeEventListener('sdb:save', handler)
  }, [handleSave])

  const handleExportJson = useCallback(() => {
    const { activeTab } = useWorkspaceStore.getState()
    const json = exportProjectJson(nodes, edges, projectName, activeTab, useNotesStore.getState().notes)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}.sdb.json`
    a.click()
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }, [nodes, edges, projectName])

  const handleExportPng = useCallback(async () => {
    try {
      await exportAsPng(projectName.replace(/\s+/g, '-').toLowerCase())
    } catch { /* ignore */ }
    setShowExportMenu(false)
  }, [projectName])

  const handleExportSvg = useCallback(async () => {
    try {
      await exportAsSvg(projectName.replace(/\s+/g, '-').toLowerCase())
    } catch { /* ignore */ }
    setShowExportMenu(false)
  }, [projectName])

  const handleExportPdf = useCallback(async () => {
    try {
      await exportAsPdf(projectName.replace(/\s+/g, '-').toLowerCase())
    } catch { /* ignore */ }
    setShowExportMenu(false)
  }, [projectName])

  const handleImport = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const onFileSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = importProjectJson(text)
        loadProject(data.nodes, data.edges, data.name)
        if (data.notes) useNotesStore.getState().loadNotes(data.notes)
        if (data.activeTab && WORKSPACE_TABS.some((t) => t.id === data.activeTab)) {
          useWorkspaceStore.getState().setActiveTab(data.activeTab as 'architecture')
        }
        onProjectIdChange(data.id)
      } catch {
        alert('Invalid project file')
      }
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    [loadProject, onProjectIdChange]
  )

  const handleAddGroup = useCallback(() => {
    addGroup({ x: 100, y: 100 })
  }, [addGroup])

  const btnClass =
    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/10'

  return (
    <header
      className="flex items-center justify-between px-4 py-2 border-b shrink-0"
      style={{ backgroundColor: 'var(--color-sidebar-bg)', borderColor: 'var(--color-border)' }}
    >
      {/* Left: project name */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>SDB</span>
        <input
          className="bg-transparent text-sm font-medium outline-none border-b border-transparent focus:border-accent px-1"
          style={{ color: 'var(--color-text-primary)' }}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project name"
        />
        {saveStatus && (
          <span className="text-xs" style={{ color: 'var(--color-success)' }}>{saveStatus}</span>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
        {/* Templates */}
        <button onClick={onOpenTemplates} className={btnClass} title="Browse templates">
          <Layout size={14} /> Templates
        </button>

        {/* Analysis */}
        <button
          onClick={onToggleAnalysis}
          className={btnClass}
          style={analysisOpen ? { backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--color-accent)' } : undefined}
          title="Analyze design"
        >
          <ShieldCheck size={14} /> Analyze
        </button>

        <div className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--color-border)' }} />

        <button onClick={handleSave} className={btnClass} title="Save (Ctrl+S)">
          <Save size={14} /> Save
        </button>

        {/* Export dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className={btnClass}
            title="Export"
          >
            <Download size={14} /> Export
          </button>
          {showExportMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
              <div
                className="absolute right-0 top-full mt-1 w-40 rounded-lg overflow-hidden z-50"
                style={{
                  backgroundColor: 'var(--color-panel-bg)',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
              >
                <button onClick={handleExportJson} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
                  <FileCode size={12} /> JSON Project
                </button>
                <button onClick={handleExportPng} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
                  <Image size={12} /> PNG Image
                </button>
                <button onClick={handleExportSvg} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
                  <FileCode size={12} /> SVG Vector
                </button>
                <button onClick={handleExportPdf} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
                  <FileText size={12} /> PDF (Print)
                </button>
              </div>
            </>
          )}
        </div>

        <button onClick={handleImport} className={btnClass} title="Import JSON">
          <Upload size={14} /> Import
        </button>
        <button onClick={handleAddGroup} className={btnClass} title="Add group boundary">
          <SquareDashedBottom size={14} /> Group
        </button>
        <div className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--color-border)' }} />

        {/* Undo/Redo */}
        <button
          onClick={() => { useUndoStore.getState().undo() }}
          className={btnClass}
          title="Undo (Ctrl+Z)"
          style={{ opacity: useUndoStore.getState().canUndo() ? 1 : 0.3 }}
        >
          <Undo2 size={14} />
        </button>
        <button
          onClick={() => { useUndoStore.getState().redo() }}
          className={btnClass}
          title="Redo (Ctrl+Shift+Z)"
          style={{ opacity: useUndoStore.getState().canRedo() ? 1 : 0.3 }}
        >
          <Redo2 size={14} />
        </button>

        <div className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--color-border)' }} />
        <button onClick={() => { clear(); useNotesStore.getState().clear() }} className={btnClass} title="Clear canvas">
          <Trash2 size={14} /> Clear
        </button>
        <button onClick={onOpenShortcuts} className={btnClass} title="Keyboard shortcuts">
          <Keyboard size={14} />
        </button>
        <input ref={fileInputRef} type="file" accept=".json,.sdb.json" className="hidden" onChange={onFileSelected} />
      </div>
    </header>
  )
}
