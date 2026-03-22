import Dexie, { type EntityTable } from 'dexie'
import { v4 as uuid } from 'uuid'
import type { ProjectData, SystemNode, SystemEdge, ProjectNotes, EstimationData } from '@/types'
import {
  DEFAULT_PROJECT_NOTES,
  DEFAULT_NON_FUNCTIONAL_TARGETS,
  DEFAULT_ESTIMATION_DATA,
  DEFAULT_DATABASE_SCHEMA,
  DEFAULT_API_CONTRACT,
  DEFAULT_SEQUENCE_DIAGRAM,
} from '@/types'

/** IndexedDB database for local project storage */
class SDBDatabase extends Dexie {
  projects!: EntityTable<ProjectData, 'id'>

  constructor() {
    super('system-design-builder')

    this.version(1).stores({
      projects: 'id, name, updatedAt',
    })

    this.version(2).stores({
      projects: 'id, name, updatedAt',
    }).upgrade((tx) => {
      return tx.table('projects').toCollection().modify((project) => {
        project.notes ??= { ...DEFAULT_PROJECT_NOTES }
        project.estimations ??= []
        project.schemas ??= { ...DEFAULT_DATABASE_SCHEMA }
        project.apiContracts ??= { ...DEFAULT_API_CONTRACT }
        project.sequences ??= { ...DEFAULT_SEQUENCE_DIAGRAM }
        project.activeTab ??= 'architecture'
      })
    })

    this.version(3).stores({
      projects: 'id, name, updatedAt',
    }).upgrade((tx) => {
      return tx.table('projects').toCollection().modify((project) => {
        if (project.notes && !project.notes.nonFunctionalTargets) {
          project.notes = {
            functionalRequirements: (project.notes.functionalRequirements ?? []).map(
              (text: string) => typeof text === 'string'
                ? { id: uuid(), text, completed: false }
                : text
            ),
            nonFunctionalTargets: { ...DEFAULT_NON_FUNCTIONAL_TARGETS },
            assumptions: (project.notes.assumptions ?? []).map(
              (text: string) => typeof text === 'string'
                ? { id: uuid(), text, completed: false }
                : text
            ),
            tradeoffs: (project.notes.tradeoffs ?? []).map(
              (text: string) => typeof text === 'string'
                ? { id: uuid(), title: text, options: '', chosen: '', rationale: '' }
                : text
            ),
            freeformNotes: project.notes.freeformNotes ?? '',
          }
        }
      })
    })

    this.version(4).stores({
      projects: 'id, name, updatedAt',
    }).upgrade((tx) => {
      return tx.table('projects').toCollection().modify((project) => {
        if (Array.isArray(project.estimations)) {
          project.estimations = { presetId: null, sections: [], customNotes: '' }
        }
      })
    })
  }
}

export const db = new SDBDatabase()

/** Apply defaults to a loaded project for backward compatibility */
function withDefaults(project: ProjectData): ProjectData {
  const notes = project.notes ?? { ...DEFAULT_PROJECT_NOTES }
  return {
    ...project,
    notes: {
      ...DEFAULT_PROJECT_NOTES,
      ...notes,
      nonFunctionalTargets: {
        ...DEFAULT_NON_FUNCTIONAL_TARGETS,
        ...(notes as ProjectNotes).nonFunctionalTargets,
      },
    },
    estimations: project.estimations && typeof project.estimations === 'object' && !Array.isArray(project.estimations)
      ? project.estimations
      : { ...DEFAULT_ESTIMATION_DATA },
    schemas: project.schemas ?? { ...DEFAULT_DATABASE_SCHEMA },
    apiContracts: project.apiContracts ?? { ...DEFAULT_API_CONTRACT },
    sequences: project.sequences ?? { ...DEFAULT_SEQUENCE_DIAGRAM },
    activeTab: project.activeTab ?? 'architecture',
  }
}

export interface SaveProjectOptions {
  nodes: SystemNode[]
  edges: SystemEdge[]
  name: string
  existingId?: string
  activeTab?: string
  notes?: ProjectNotes
  estimations?: EstimationData
}

/** Save current project to IndexedDB */
export async function saveProject(opts: SaveProjectOptions): Promise<string> {
  const { nodes, edges, name, existingId, activeTab, notes, estimations } = opts
  const now = new Date().toISOString()
  const id = existingId ?? uuid()

  const existing = existingId ? await db.projects.get(existingId) : undefined

  const project: ProjectData = {
    id,
    name,
    description: '',
    nodes,
    edges,
    notes: notes ?? existing?.notes ?? { ...DEFAULT_PROJECT_NOTES },
    estimations: estimations ?? existing?.estimations ?? { ...DEFAULT_ESTIMATION_DATA },
    schemas: existing?.schemas ?? { ...DEFAULT_DATABASE_SCHEMA },
    apiContracts: existing?.apiContracts ?? { ...DEFAULT_API_CONTRACT },
    sequences: existing?.sequences ?? { ...DEFAULT_SEQUENCE_DIAGRAM },
    activeTab: activeTab ?? existing?.activeTab ?? 'architecture',
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }

  await db.projects.put(project)
  return id
}

/** Load a project by id with backward-compatible defaults */
export async function loadProject(id: string): Promise<ProjectData | undefined> {
  const project = await db.projects.get(id)
  return project ? withDefaults(project) : undefined
}

/** List all saved projects */
export async function listProjects(): Promise<ProjectData[]> {
  return db.projects.orderBy('updatedAt').reverse().toArray()
}

/** Delete a project */
export async function deleteProject(id: string): Promise<void> {
  await db.projects.delete(id)
}

/** Export project as JSON string */
export function exportProjectJson(
  nodes: SystemNode[],
  edges: SystemEdge[],
  name: string,
  activeTab?: string,
  notes?: ProjectNotes
): string {
  const project: ProjectData = {
    id: uuid(),
    name,
    description: '',
    nodes,
    edges,
    notes: notes ?? { ...DEFAULT_PROJECT_NOTES },
    estimations: { ...DEFAULT_ESTIMATION_DATA },
    schemas: { ...DEFAULT_DATABASE_SCHEMA },
    apiContracts: { ...DEFAULT_API_CONTRACT },
    sequences: { ...DEFAULT_SEQUENCE_DIAGRAM },
    activeTab: activeTab ?? 'architecture',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return JSON.stringify(project, null, 2)
}

/** Import project from JSON string with backward-compatible defaults */
export function importProjectJson(json: string): ProjectData {
  const data: unknown = JSON.parse(json)
  if (
    !data ||
    typeof data !== 'object' ||
    !Array.isArray((data as ProjectData).nodes) ||
    !Array.isArray((data as ProjectData).edges) ||
    typeof (data as ProjectData).name !== 'string' ||
    !(data as ProjectData).name.trim()
  ) {
    throw new Error('Invalid project file format')
  }
  return withDefaults(data as ProjectData)
}
