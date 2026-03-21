import { FunctionalRequirementsSection } from '@/components/notes/functional-requirements-section'
import { NonFunctionalTargetsSection } from '@/components/notes/non-functional-targets-section'
import { AssumptionsSection } from '@/components/notes/assumptions-section'
import { TradeoffsSection } from '@/components/notes/tradeoffs-section'
import { FreeformNotesSection } from '@/components/notes/freeform-notes-section'

export function NotesTab() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[800px] mx-auto px-6 py-6 space-y-4">
        <h1
          className="text-lg font-semibold mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Notes & Requirements
        </h1>
        <FunctionalRequirementsSection />
        <NonFunctionalTargetsSection />
        <AssumptionsSection />
        <TradeoffsSection />
        <FreeformNotesSection />
      </div>
    </div>
  )
}
