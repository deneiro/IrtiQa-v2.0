import { create } from 'zustand'

export type VFXType = 'xp' | 'gold' | 'xp_gain' | 'gold_gain' | 'damage' | 'heal' | 'journal_complete' | 'quest_deploy' | 'attribute_up' | 'item_use' | 'shield_activate' | 'temporal_shift'

export interface VFXEffect {
  id: string
  type: VFXType
  amount: number
  x: number
  y: number
  createdAt: number
}

interface VFXState {
  activeEffects: VFXEffect[]
  addEffect: (type: VFXType, amount: number, x: number, y: number) => void
  removeEffect: (id: string) => void
}

export const useVFXStore = create<VFXState>((set) => ({
  activeEffects: [],
  
  addEffect: (type, amount, x, y) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newEffect: VFXEffect = {
      id,
      type,
      amount,
      x,
      y,
      createdAt: Date.now()
    }
    
    set((state) => ({
      activeEffects: [...state.activeEffects, newEffect]
    }))
    
    // Auto-remove after animation duration (e.g., 2 seconds)
    setTimeout(() => {
      set((state) => ({
        activeEffects: state.activeEffects.filter((e) => e.id !== id)
      }))
    }, 2000)
  },
  
  removeEffect: (id) => set((state) => ({
    activeEffects: state.activeEffects.filter((e) => e.id !== id)
  }))
}))
