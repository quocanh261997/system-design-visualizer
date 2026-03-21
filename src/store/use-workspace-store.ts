import { create } from 'zustand'
import type { WorkspaceTabId } from '@/types'

interface WorkspaceState {
  activeTab: WorkspaceTabId
  setActiveTab: (tab: WorkspaceTabId) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeTab: 'architecture',

  setActiveTab: (tab) => set({ activeTab: tab }),
}))
