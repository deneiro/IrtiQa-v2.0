-- ============================================================
-- Migration: 20260418000009_create_inventory
-- Purpose: Create inventory table for purchased power-ups and potions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.inventory (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_key      TEXT NOT NULL,         -- references frontend item catalog key
  item_name     TEXT NOT NULL,         -- display name snapshot
  item_category item_category NOT NULL,
  quantity      INT DEFAULT 1 NOT NULL CHECK (quantity >= 0),
  purchased_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON public.inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_item_key ON public.inventory(user_id, item_key);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inventory"
  ON public.inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own inventory"
  ON public.inventory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inventory"
  ON public.inventory FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own inventory"
  ON public.inventory FOR DELETE USING (auth.uid() = user_id);
