import { supabase } from '@/shared/api/supabase'
import { GAME_CORE } from '@/shared/config/game-core'
import { useInventoryStore } from '@/entities/inventory'
import { useProfileStore } from '@/entities/profile'
import { useVFXStore } from '@/shared/model/vfx-store'
import { toast } from '@/shared/lib/toast'

/**
 * useItem handles the business logic for consuming a purchased item.
 * @param itemId - The UUID of the specific inventory record
 * @param userId - The user's UUID
 * @param contextId - Optional ID for items that require a target (e.g., journal_id)
 */
export const useItem = async (itemId: string, userId: string, contextId?: string) => {
  const { items, removeItem } = useInventoryStore.getState()
  const { healHp } = useProfileStore.getState()
  const { addEffect } = useVFXStore.getState()
  
  const item = items.find(i => i.id === itemId)
  if (!item) return

  const itemData = GAME_CORE.getItemByKey(item.item_key)
  if (!itemData) return

  // Prevent using items that need a target if target is missing
  if (itemData.effect.type === 'unlock_journal_edit' && !contextId) {
    toast.error('Select a journal entry to unlock from the Archive.')
    return
  }

  // 1. Optimistic removal (if single use or quantity > 0)
  removeItem(itemId, 1)

  // 2. Apply effect
  let effectApplied = false
  const mousePos = { x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 500 }

  try {
    if (itemData.effect.type === 'heal') {
      const { error: healError } = await supabase.rpc('heal_hp', {
        p_user_id: userId,
        p_amount: itemData.effect.value
      } as any)
      
      if (!healError) {
        healHp(itemData.effect.value)
        addEffect('heal', itemData.effect.value, mousePos.x, mousePos.y)
        effectApplied = true
        toast.success(`Used ${itemData.name}! Healed ${itemData.effect.value} HP.`)
      }
    } 
    else if (itemData.effect.type === 'protect_streak') {
      const { error: shieldError } = await supabase.rpc('activate_streak_shield', {
        p_user_id: userId
      } as any)
      
      if (!shieldError) {
        addEffect('shield_activate', 1, mousePos.x, mousePos.y)
        // await fetchProfile(userId)
        effectApplied = true
        toast.success(`${itemData.name} activated! Your next missed habit is protected.`)
      }
    }
    else if (itemData.effect.type === 'unlock_journal_edit' && contextId) {
      const { error: unlockError } = await (supabase.rpc('unlock_journal_entry', {
        p_user_id: userId,
        p_journal_id: contextId
      } as any))
      
      if (!unlockError) {
        addEffect('item_use', 1, mousePos.x, mousePos.y)
        effectApplied = true
        toast.success(`Temporal anomaly resolved! ${itemData.name} used to unlock journal entry.`)
      }
    }
    else {
      // Other theoretical effects logic
      addEffect('item_use', 1, mousePos.x, mousePos.y)
      toast.info(`${itemData.name} used!`)
      effectApplied = true 
    }
  } catch (err) {
    console.error('Item use error:', err)
    effectApplied = false
  }

  // 3. Database Sync
  if (effectApplied) {
    if (item.quantity > 1) {
      await (supabase
        .from('inventory' as any) as any)
        .update({ quantity: item.quantity - 1 } as any)
        .eq('id', itemId)
    } else {
      await (supabase
        .from('inventory' as any) as any)
        .delete()
        .eq('id', itemId)
    }
  } else {
    // Rollback if failed
    toast.error(`Failed to use ${itemData.name}.`)
    useInventoryStore.getState().fetchInventory(userId)
  }
}
