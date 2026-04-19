import { create } from 'zustand'
import { Database } from '@/shared/types/database.types'
import { GAME_CORE } from '@/shared/config/game-core'

type AttributeRow = Database['public']['Tables']['attributes']['Row']
type AttributeType = Database['public']['Enums']['attribute_type']

interface AttributeState {
  attributes: Record<AttributeType, AttributeRow> | null
  isLoading: boolean
  
  // Actions
  setAttributes: (attrs: AttributeRow[]) => void
  updateAttributeXp: (type: AttributeType, amount: number) => void
}

export const useAttributeStore = create<AttributeState>((set) => ({
  attributes: null,
  isLoading: true,
  
  setAttributes: (attrs) => {
    const attrMap = attrs.reduce((acc, attr) => {
      acc[attr.attribute_type] = attr
      return acc
    }, {} as Record<AttributeType, AttributeRow>)
    
    set({ attributes: attrMap, isLoading: false })
  },

  updateAttributeXp: (type, amount) => set((state) => {
    if (!state.attributes || !state.attributes[type]) return state
    
    const attr = state.attributes[type]
    let newXp = attr.xp + amount
    let newLevel = attr.level
    
    // Level-up loop
    while (true) {
      const xpNeeded = GAME_CORE.calculateXpForNextLevel(newLevel)
      if (newXp < xpNeeded) break
      
      newXp -= xpNeeded
      newLevel += 1
    }
    
    return {
      attributes: {
        ...state.attributes,
        [type]: {
          ...attr,
          xp: newXp,
          level: newLevel
        }
      }
    }
  })
}))
