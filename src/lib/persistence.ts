import Dexie, { type EntityTable } from 'dexie'
import { v4 as uuid } from 'uuid'
import type { ProjectData, SystemNode, SystemEdge } from '@/types'

/** IndexedDB database for local project storage */
class SDBDatabase extends Dexie {
  projects!: EntityTable<ProjectData, 'id'>

  constructor() {
    super('system-design-builder')
    this.version(1).stores({
      projects: 'id, name, updatedAt',
    })
  }
}

export const db = new SDBDatabase()

/** Save current graph as a project */
export async function saveProject(
  nodes: SystemNode[],
  edges: SystemEdge[],
  name: string,
  existingId?: string
): Promise<string> {
  const now = new Date().toISOString()
  const id = existingId ?? uuid()

  const project: ProjectData = {
    id,
    name,
    description: '',
    nodes,
    edges,
    createdAt: existingId
      ? ((await db.projects.get(existingId))?.createdAt ?? now)
      : now,
    updatedAt: now,
  }

  await db.projects.put(project)
  return id
}

/** Load a project by id */
export async function loadProject(id: string): Promise<ProjectData | undefined> {
  return db.projects.get(id)
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
  name: string
): string {
  const project: ProjectData = {
    id: uuid(),
    name,
    description: '',
    nodes,
    edges,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return JSON.stringify(project, null, 2)
}

/** Import project from JSON string */
export function importProjectJson(json: string): ProjectData {
  const data = JSON.parse(json) as ProjectData
  if (!data.nodes || !data.edges || !data.name) {
    throw new Error('Invalid project file format')
  }
  return data
}
