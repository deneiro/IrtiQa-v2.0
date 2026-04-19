import { supabase } from '@/shared/api/supabase'
import { GAME_CORE, MarketItem } from '@/shared/config/game-core'
import { useInventoryStore } from '@/entities/inventory'
import { useProfileStore } from '@/entities/profile'
import { toast } from '@/shared/lib/toast'

export const usePurchaseItem = () => {
  const { addItem } = useInventoryStore.getState()
  const { profile, setProfile } = useProfileStore.getState()

  const purchaseItem = async (item: MarketItem) => {
    if (!profile) return { success: false, message: 'User not logged in' }
    
    if (profile.gold < item.price) {
      toast.error('Insufficient gold!')
      return { success: false, message: 'Insufficient gold' }
    }

    // 1. Call atomic RPC
    const { data, error } = await supabase.rpc('purchase_item', {
      p_user_id: profile.user_id,
      p_item_key: item.key,
      p_item_name: item.name,
      p_item_category: item.category,
      p_price: item.price
    } as any)

    const result = data as unknown as { success: boolean, message: string, new_gold?: number }

    if (error || !result.success) {
      toast.error(result.message || 'Purchase failed')
      return { success: false, message: result.message || 'Purchase failed' }
    }

    // 2. Update local stores (Optimistic-ish sync)
    if (result.new_gold !== undefined) {
      setProfile({ ...profile, gold: result.new_gold })
    }

    addItem({
      user_id: profile.user_id,
      item_key: item.key,
      item_name: item.name,
      item_category: item.category,
      quantity: 1
    })

    toast.success(`Purchased ${item.name}!`)
    return { success: true }
  }

  return { purchaseItem }
}
