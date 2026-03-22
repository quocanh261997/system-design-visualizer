import { useMemo, useCallback, useState } from 'react'
import { X, Copy, Check } from 'lucide-react'
import { useSchemaStore } from '@/store/use-schema-store'
import { generateDDL } from '@/lib/ddl-generator'

interface DDLModalProps {
  open: boolean
  onClose: () => void
}

function highlightSQL(sql: string): string {
  const keywords = [
    'CREATE', 'TABLE', 'ALTER', 'ADD', 'CONSTRAINT', 'FOREIGN', 'KEY',
    'REFERENCES', 'PRIMARY', 'NOT', 'NULL', 'UNIQUE', 'DEFAULT', 'INDEX',
    'ON', 'USING', 'IF', 'EXISTS', 'INT', 'INTEGER', 'BIGINT', 'VARCHAR',
    'TEXT', 'BOOLEAN', 'TIMESTAMP', 'DATE', 'UUID', 'JSONB', 'JSON',
    'SERIAL', 'DOUBLE', 'PRECISION', 'TINYINT', 'DATETIME', 'CHAR',
    'AUTO_INCREMENT',
  ]
  const pattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi')
  return sql.replace(pattern, '<span style="color:#6366f1;font-weight:600">$1</span>')
}

export function DDLModal({ open, onClose }: DDLModalProps) {
  const tables = useSchemaStore((s) => s.tables)
  const relationships = useSchemaStore((s) => s.relationships)
  const dialect = useSchemaStore((s) => s.dialect)
  const [copied, setCopied] = useState(false)

  const ddl = useMemo(
    () => generateDDL(tables, relationships, dialect),
    [tables, relationships, dialect]
  )

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(ddl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }, [ddl])

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
            Generated DDL ({dialect === 'postgresql' ? 'PostgreSQL' : 'MySQL'})
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-white/10"
              style={{ color: copied ? 'var(--color-success)' : 'var(--color-text-secondary)' }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button onClick={onClose} className="p-1 rounded hover:bg-white/10" style={{ color: 'var(--color-text-muted)' }}>
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {tables.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              No tables defined. Add tables to generate DDL.
            </p>
          ) : (
            <pre
              className="text-xs leading-relaxed font-mono whitespace-pre-wrap"
              style={{ color: 'var(--color-text-primary)' }}
              dangerouslySetInnerHTML={{ __html: highlightSQL(ddl) }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
