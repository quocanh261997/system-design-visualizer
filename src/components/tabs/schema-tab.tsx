import { useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { useSchemaStore } from '@/store/use-schema-store'
import { SchemaCanvas } from '@/components/schema/schema-canvas'
import { SchemaToolbar } from '@/components/schema/schema-toolbar'
import { TablePropertyPanel } from '@/components/schema/table-property-panel'
import { RelationshipPropertyPanel } from '@/components/schema/relationship-property-panel'
import { DDLModal } from '@/components/schema/ddl-modal'
import { SQLImportModal } from '@/components/schema/sql-import-modal'

export function SchemaTab() {
  const selectedTableId = useSchemaStore((s) => s.selectedTableId)
  const selectedRelationshipId = useSchemaStore((s) => s.selectedRelationshipId)
  const [ddlOpen, setDdlOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <SchemaToolbar
        onOpenDDL={() => setDdlOpen(true)}
        onOpenImport={() => setImportOpen(true)}
      />
      <div className="flex flex-1 overflow-hidden">
        <ReactFlowProvider>
          <SchemaCanvas />
        </ReactFlowProvider>
        {selectedTableId && <TablePropertyPanel />}
        {selectedRelationshipId && !selectedTableId && <RelationshipPropertyPanel />}
      </div>
      <DDLModal open={ddlOpen} onClose={() => setDdlOpen(false)} />
      <SQLImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  )
}
