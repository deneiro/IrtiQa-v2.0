-- ============================================================
-- Migration: 20260418000003_create_attributes
-- Purpose: Create attributes table — 8 life spheres per user
-- ============================================================

CREATE TABLE IF NOT EXISTS public.attributes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  attribute_type  attribute_type NOT NULL,
  xp              INT DEFAULT 0 NOT NULL CHECK (xp >= 0),
  level           INT DEFAULT 1 NOT NULL CHECK (level >= 1),
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  UNIQUE(user_id, attribute_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attributes_user_id ON public.attributes(user_id);

-- RLS
ALTER TABLE public.attributes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attributes"
  ON public.attributes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attributes"
  ON public.attributes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attributes"
  ON public.attributes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own attributes"
  ON public.attributes FOR DELETE
  USING (auth.uid() = user_id);
