import { describe, it, expect, beforeEach } from 'vitest'
import { useWorkspaceStore } from '../use-workspace-store'

describe('useWorkspaceStore', () => {
  beforeEach(() => {
    useWorkspaceStore.setState({ activeTab: 'architecture' })
  })

  it('defaults to architecture tab', () => {
    expect(useWorkspaceStore.getState().activeTab).toBe('architecture')
  })

  it('switches to schema tab', () => {
    useWorkspaceStore.getState().setActiveTab('schema')
    expect(useWorkspaceStore.getState().activeTab).toBe('schema')
  })

  it('switches to notes tab', () => {
    useWorkspaceStore.getState().setActiveTab('notes')
    expect(useWorkspaceStore.getState().activeTab).toBe('notes')
  })

  it('switches to estimation tab', () => {
    useWorkspaceStore.getState().setActiveTab('estimation')
    expect(useWorkspaceStore.getState().activeTab).toBe('estimation')
  })

  it('switches through all tabs', () => {
    const tabs = ['architecture', 'schema', 'api', 'sequence', 'notes', 'estimation'] as const
    for (const tab of tabs) {
      useWorkspaceStore.getState().setActiveTab(tab)
      expect(useWorkspaceStore.getState().activeTab).toBe(tab)
    }
  })
})
