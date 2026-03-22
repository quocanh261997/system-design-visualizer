import { useState, useCallback } from 'react'
import { X, Upload, AlertTriangle } from 'lucide-react'
import { parseSql } from '@/lib/sql-parser'
import { useSchemaStore } from '@/store/use-schema-store'

interface SQLImportModalProps {
  open: boolean
  onClose: () => void
}

export function SQLImportModal({ open, onClose }: SQLImportModalProps) {
  const [sql, setSql] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [preview, setPreview] = useState<{ tables: number; rels: number } | null>(null)
  const loadSchema = useSchemaStore((s) => s.loadSchema)
  const dialect = useSchemaStore((s) => s.dialect)

  const handleParse = useCallback(() => {
    const result = parseSql(sql)
    setErrors(result.errors)
    setPreview({ tables: result.tables.length, rels: result.relationships.length })

    if (result.tables.length > 0) {
      const positions: Record<string, { x: number; y: number }> = {}
      const cols = Math.ceil(Math.sqrt(result.tables.length))
      result.tables.forEach((t, i) => {
        positions[t.id] = {
          x: (i % cols) * 350 + 50,
          y: Math.floor(i / cols) * 300 + 50,
        }
      })

      loadSchema({
        tables: result.tables,
        relationships: result.relationships,
        tablePositions: positions,
        dialect,
      })
      onClose()
    }
  }, [sql, loadSchema, dialect, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-2xl max-h-[80vh] rounded-xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: 'var(--color-sidebar-bg)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Import SQL
          </span>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10" style={{ color: 'var(--color-text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Paste CREATE TABLE statements. Supports PostgreSQL and MySQL syntax.
          </p>
          <textarea
            className="w-full min-h-[250px] px-3 py-2 rounded-lg text-xs font-mono resize-y outline-none"
            style={{
              backgroundColor: 'var(--color-panel-bg)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
            placeholder={`CREATE TABLE users (\n  id UUID PRIMARY KEY,\n  username VARCHAR(255) NOT NULL UNIQUE,\n  email VARCHAR(255) NOT NULL,\n  created_at TIMESTAMP DEFAULT NOW()\n);`}
            value={sql}
            onChange={(e) => { setSql(e.target.value); setErrors([]); setPreview(null) }}
          />

          {errors.length > 0 && (
            <div className="space-y-1">
              {errors.map((err, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px]" style={{ color: '#ef4444' }}>
                  <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                  {err}
                </div>
              ))}
            </div>
          )}

          {preview && (
            <p className="text-xs" style={{ color: 'var(--color-success)' }}>
              Found {preview.tables} table(s) and {preview.rels} relationship(s).
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-white/10"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleParse}
            disabled={!sql.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-30"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'white',
            }}
          >
            <Upload size={12} /> Import
          </button>
        </div>
      </div>
    </div>
  )
}
