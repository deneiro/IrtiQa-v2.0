import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DashboardSettingsState {
  // Grid Layout Settings
  showProfile: boolean
  showQuickActions: boolean
  mainGridColumns: 2 | 3 | 4
  
  // Handlers
  toggleProfile: () => void
  toggleQuickActions: () => void
  setMainGridColumns: (cols: 2 | 3 | 4) => void
  
  // Reset
  resetSettings: () => void
}

export const useDashboardSettingsStore = create<DashboardSettingsState>()(
  persist(
    (set) => ({
      showProfile: true,
      showQuickActions: true,
      mainGridColumns: 2, // 2 indicates 2 main columns (+ profile + actions = 4 total in desktop)
      
      toggleProfile: () => set((state) => ({ showProfile: !state.showProfile })),
      toggleQuickActions: () => set((state) => ({ showQuickActions: !state.showQuickActions })),
      setMainGridColumns: (cols) => set({ mainGridColumns: cols }),
      
      resetSettings: () => set({
        showProfile: true,
        showQuickActions: true,
        mainGridColumns: 2,
      }),
    }),
    {
      name: 'irtiqa-dashboard-settings',
    }
  )
)
