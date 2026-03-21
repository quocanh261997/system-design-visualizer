import { describe, it, expect, beforeEach } from 'vitest'
import { useNotesStore } from '../use-notes-store'
import { DEFAULT_NON_FUNCTIONAL_TARGETS } from '@/types'

describe('useNotesStore', () => {
  beforeEach(() => {
    useNotesStore.getState().clear()
  })

  describe('functional requirements', () => {
    it('adds a requirement', () => {
      useNotesStore.getState().addFunctionalReq('Users can shorten URLs')
      const items = useNotesStore.getState().notes.functionalRequirements
      expect(items).toHaveLength(1)
      expect(items[0].text).toBe('Users can shorten URLs')
      expect(items[0].completed).toBe(false)
    })

    it('toggles a requirement', () => {
      useNotesStore.getState().addFunctionalReq('Test')
      const id = useNotesStore.getState().notes.functionalRequirements[0].id
      useNotesStore.getState().toggleFunctionalReq(id)
      expect(useNotesStore.getState().notes.functionalRequirements[0].completed).toBe(true)
      useNotesStore.getState().toggleFunctionalReq(id)
      expect(useNotesStore.getState().notes.functionalRequirements[0].completed).toBe(false)
    })

    it('removes a requirement', () => {
      useNotesStore.getState().addFunctionalReq('A')
      useNotesStore.getState().addFunctionalReq('B')
      const id = useNotesStore.getState().notes.functionalRequirements[0].id
      useNotesStore.getState().removeFunctionalReq(id)
      expect(useNotesStore.getState().notes.functionalRequirements).toHaveLength(1)
      expect(useNotesStore.getState().notes.functionalRequirements[0].text).toBe('B')
    })

    it('updates a requirement', () => {
      useNotesStore.getState().addFunctionalReq('Old')
      const id = useNotesStore.getState().notes.functionalRequirements[0].id
      useNotesStore.getState().updateFunctionalReq(id, 'New')
      expect(useNotesStore.getState().notes.functionalRequirements[0].text).toBe('New')
    })
  })

  describe('non-functional targets', () => {
    it('updates individual targets', () => {
      useNotesStore.getState().updateNonFunctionalTargets({ latencyMs: 200 })
      expect(useNotesStore.getState().notes.nonFunctionalTargets.latencyMs).toBe(200)
      expect(useNotesStore.getState().notes.nonFunctionalTargets.throughputQps).toBeNull()
    })

    it('updates consistency model', () => {
      useNotesStore.getState().updateNonFunctionalTargets({ consistencyModel: 'eventual' })
      expect(useNotesStore.getState().notes.nonFunctionalTargets.consistencyModel).toBe('eventual')
    })

    it('updates multiple targets at once', () => {
      useNotesStore.getState().updateNonFunctionalTargets({
        latencyMs: 100,
        throughputQps: 10000,
        availabilityPercent: 99.9,
      })
      const t = useNotesStore.getState().notes.nonFunctionalTargets
      expect(t.latencyMs).toBe(100)
      expect(t.throughputQps).toBe(10000)
      expect(t.availabilityPercent).toBe(99.9)
    })
  })

  describe('assumptions', () => {
    it('adds an assumption', () => {
      useNotesStore.getState().addAssumption('100M DAU')
      expect(useNotesStore.getState().notes.assumptions).toHaveLength(1)
      expect(useNotesStore.getState().notes.assumptions[0].text).toBe('100M DAU')
    })

    it('toggles an assumption', () => {
      useNotesStore.getState().addAssumption('Test')
      const id = useNotesStore.getState().notes.assumptions[0].id
      useNotesStore.getState().toggleAssumption(id)
      expect(useNotesStore.getState().notes.assumptions[0].completed).toBe(true)
    })

    it('removes an assumption', () => {
      useNotesStore.getState().addAssumption('A')
      const id = useNotesStore.getState().notes.assumptions[0].id
      useNotesStore.getState().removeAssumption(id)
      expect(useNotesStore.getState().notes.assumptions).toHaveLength(0)
    })

    it('updates an assumption', () => {
      useNotesStore.getState().addAssumption('Old')
      const id = useNotesStore.getState().notes.assumptions[0].id
      useNotesStore.getState().updateAssumption(id, 'New')
      expect(useNotesStore.getState().notes.assumptions[0].text).toBe('New')
    })
  })

  describe('tradeoffs', () => {
    it('adds a tradeoff', () => {
      useNotesStore.getState().addTradeoff({
        title: 'SQL vs NoSQL',
        options: 'PostgreSQL, MongoDB',
        chosen: 'PostgreSQL',
        rationale: 'Need ACID',
      })
      const items = useNotesStore.getState().notes.tradeoffs
      expect(items).toHaveLength(1)
      expect(items[0].title).toBe('SQL vs NoSQL')
      expect(items[0].id).toBeTruthy()
    })

    it('removes a tradeoff', () => {
      useNotesStore.getState().addTradeoff({ title: 'A', options: '', chosen: '', rationale: '' })
      const id = useNotesStore.getState().notes.tradeoffs[0].id
      useNotesStore.getState().removeTradeoff(id)
      expect(useNotesStore.getState().notes.tradeoffs).toHaveLength(0)
    })

    it('updates a tradeoff', () => {
      useNotesStore.getState().addTradeoff({ title: 'A', options: '', chosen: '', rationale: '' })
      const id = useNotesStore.getState().notes.tradeoffs[0].id
      useNotesStore.getState().updateTradeoff(id, { title: 'B', chosen: 'Option 1' })
      const updated = useNotesStore.getState().notes.tradeoffs[0]
      expect(updated.title).toBe('B')
      expect(updated.chosen).toBe('Option 1')
    })
  })

  describe('freeform notes', () => {
    it('sets freeform notes', () => {
      useNotesStore.getState().setFreeformNotes('Some notes here')
      expect(useNotesStore.getState().notes.freeformNotes).toBe('Some notes here')
    })
  })

  describe('loadNotes and clear', () => {
    it('loads notes replacing entire state', () => {
      useNotesStore.getState().addFunctionalReq('Existing')
      useNotesStore.getState().loadNotes({
        functionalRequirements: [{ id: '1', text: 'Loaded', completed: true }],
        nonFunctionalTargets: { ...DEFAULT_NON_FUNCTIONAL_TARGETS, latencyMs: 50 },
        assumptions: [],
        tradeoffs: [],
        freeformNotes: 'Loaded notes',
      })
      const notes = useNotesStore.getState().notes
      expect(notes.functionalRequirements).toHaveLength(1)
      expect(notes.functionalRequirements[0].text).toBe('Loaded')
      expect(notes.nonFunctionalTargets.latencyMs).toBe(50)
      expect(notes.freeformNotes).toBe('Loaded notes')
    })

    it('clears all notes to defaults', () => {
      useNotesStore.getState().addFunctionalReq('Test')
      useNotesStore.getState().addAssumption('Test')
      useNotesStore.getState().setFreeformNotes('Notes')
      useNotesStore.getState().clear()
      const notes = useNotesStore.getState().notes
      expect(notes.functionalRequirements).toHaveLength(0)
      expect(notes.assumptions).toHaveLength(0)
      expect(notes.tradeoffs).toHaveLength(0)
      expect(notes.freeformNotes).toBe('')
      expect(notes.nonFunctionalTargets.latencyMs).toBeNull()
    })
  })
})
