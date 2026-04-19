-- ============================================================
-- Migration: 20260418000015_create_purchase_item_rpc
-- Purpose: Add unique constraint and create atomic purchase function
-- ============================================================

-- 1. Add unique constraint to allow ON CONFLICT upsert
ALTER TABLE public.inventory ADD CONSTRAINT inventory_user_item_unique UNIQUE (user_id, item_key);

-- 2. Create the purchase function
CREATE OR REPLACE FUNCTION public.purchase_item(
  p_user_id       UUID,
  p_item_key      TEXT,
  p_item_name     TEXT,
  p_item_category item_category,
  p_price         INT
) RETURNS JSON AS $$
DECLARE
  v_current_gold INT;
BEGIN
  -- 1. Check current gold
  SELECT gold INTO v_current_gold FROM public.profiles WHERE user_id = p_user_id;
  
  IF v_current_gold IS NULL OR v_current_gold < p_price THEN
    RETURN json_build_object('success', false, 'message', 'Insufficient gold');
  END IF;

  -- 2. Subtract gold
  UPDATE public.profiles 
  SET gold = gold - p_price,
      updated_at = now()
  WHERE user_id = p_user_id;

  -- 3. Upsert inventory
  INSERT INTO public.inventory (user_id, item_key, item_name, item_category, quantity)
  VALUES (p_user_id, p_item_key, p_item_name, p_item_category, 1)
  ON CONFLICT (user_id, item_key) DO UPDATE
  SET quantity = inventory.quantity + 1,
      updated_at = now();

  -- 4. Record statistic
  INSERT INTO public.user_statistics (user_id, total_gold_spent, total_items_purchased)
  VALUES (p_user_id, p_price, 1)
  ON CONFLICT (user_id) DO UPDATE
  SET total_gold_spent = user_statistics.total_gold_spent + p_price,
      total_items_purchased = user_statistics.total_items_purchased + 1,
      updated_at = now();

  RETURN json_build_object('success', true, 'message', 'Purchase successful', 'new_gold', v_current_gold - p_price);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
