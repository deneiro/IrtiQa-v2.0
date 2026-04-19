-- ============================================================
-- Migration: 20260418000002_create_profiles
-- Purpose: Create the profiles table — the user's RPG identity
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url  TEXT,
  class       TEXT DEFAULT 'Adventurer',
  level       INT DEFAULT 1 NOT NULL CHECK (level >= 1),
  current_xp  INT DEFAULT 0 NOT NULL CHECK (current_xp >= 0),
  gold        INT DEFAULT 100 NOT NULL CHECK (gold >= 0),
  current_hp  INT DEFAULT 100 NOT NULL CHECK (current_hp >= 0),
  max_hp      INT DEFAULT 100 NOT NULL CHECK (max_hp >= 1),
  rank        player_rank DEFAULT 'F' NOT NULL,
  timezone    TEXT DEFAULT 'UTC' NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profiles"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profiles"
  ON public.profiles FOR DELETE
  USING (auth.uid() = user_id);
