import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import type {
  ProjectNotes,
  FunctionalRequirement,
  NonFunctionalTargets,
  TradeoffEntry,
} from '@/types'
import { DEFAULT_PROJECT_NOTES, DEFAULT_NON_FUNCTIONAL_TARGETS } from '@/types'

interface NotesState {
  notes: ProjectNotes
  addFunctionalReq: (text: string) => void
  toggleFunctionalReq: (id: string) => void
  removeFunctionalReq: (id: string) => void
  updateFunctionalReq: (id: string, text: string) => void
  updateNonFunctionalTargets: (targets: Partial<NonFunctionalTargets>) => void
  addAssumption: (text: string) => void
  toggleAssumption: (id: string) => void
  removeAssumption: (id: string) => void
  updateAssumption: (id: string, text: string) => void
  addTradeoff: (entry: Omit<TradeoffEntry, 'id'>) => void
  removeTradeoff: (id: string) => void
  updateTradeoff: (id: string, data: Partial<TradeoffEntry>) => void
  setFreeformNotes: (text: string) => void
  loadNotes: (notes: ProjectNotes) => void
  clear: () => void
}

function createChecklistItem(text: string): FunctionalRequirement {
  return { id: uuid(), text, completed: false }
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: { ...DEFAULT_PROJECT_NOTES, nonFunctionalTargets: { ...DEFAULT_NON_FUNCTIONAL_TARGETS } },

  addFunctionalReq: (text) =>
    set({
      notes: {
        ...get().notes,
        functionalRequirements: [
          ...get().notes.functionalRequirements,
          createChecklistItem(text),
        ],
      },
    }),

  toggleFunctionalReq: (id) =>
    set({
      notes: {
        ...get().notes,
        functionalRequirements: get().notes.functionalRequirements.map((r) =>
          r.id === id ? { ...r, completed: !r.completed } : r
        ),
      },
    }),

  removeFunctionalReq: (id) =>
    set({
      notes: {
        ...get().notes,
        functionalRequirements: get().notes.functionalRequirements.filter(
          (r) => r.id !== id
        ),
      },
    }),

  updateFunctionalReq: (id, text) =>
    set({
      notes: {
        ...get().notes,
        functionalRequirements: get().notes.functionalRequirements.map((r) =>
          r.id === id ? { ...r, text } : r
        ),
      },
    }),

  updateNonFunctionalTargets: (targets) =>
    set({
      notes: {
        ...get().notes,
        nonFunctionalTargets: { ...get().notes.nonFunctionalTargets, ...targets },
      },
    }),

  addAssumption: (text) =>
    set({
      notes: {
        ...get().notes,
        assumptions: [...get().notes.assumptions, createChecklistItem(text)],
      },
    }),

  toggleAssumption: (id) =>
    set({
      notes: {
        ...get().notes,
        assumptions: get().notes.assumptions.map((a) =>
          a.id === id ? { ...a, completed: !a.completed } : a
        ),
      },
    }),

  removeAssumption: (id) =>
    set({
      notes: {
        ...get().notes,
        assumptions: get().notes.assumptions.filter((a) => a.id !== id),
      },
    }),

  updateAssumption: (id, text) =>
    set({
      notes: {
        ...get().notes,
        assumptions: get().notes.assumptions.map((a) =>
          a.id === id ? { ...a, text } : a
        ),
      },
    }),

  addTradeoff: (entry) =>
    set({
      notes: {
        ...get().notes,
        tradeoffs: [...get().notes.tradeoffs, { ...entry, id: uuid() }],
      },
    }),

  removeTradeoff: (id) =>
    set({
      notes: {
        ...get().notes,
        tradeoffs: get().notes.tradeoffs.filter((t) => t.id !== id),
      },
    }),

  updateTradeoff: (id, data) =>
    set({
      notes: {
        ...get().notes,
        tradeoffs: get().notes.tradeoffs.map((t) =>
          t.id === id ? { ...t, ...data } : t
        ),
      },
    }),

  setFreeformNotes: (text) =>
    set({ notes: { ...get().notes, freeformNotes: text } }),

  loadNotes: (notes) => set({ notes }),

  clear: () =>
    set({
      notes: {
        ...DEFAULT_PROJECT_NOTES,
        nonFunctionalTargets: { ...DEFAULT_NON_FUNCTIONAL_TARGETS },
      },
    }),
}))
