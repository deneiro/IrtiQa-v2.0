-- ============================================================
-- Migration: 20260418000006_create_journals
-- Purpose: Daily reflection journal with mood, stress, and productivity
-- ============================================================

CREATE TABLE IF NOT EXISTS public.journals (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entry_date          DATE NOT NULL DEFAULT CURRENT_DATE,
  mood                mood_type,
  stress_level        INT CHECK (stress_level >= 1 AND stress_level <= 10),
  answers             JSONB DEFAULT '[]'::jsonb,  -- 5 reflection question answers
  productivity_stats  JSONB DEFAULT '{}'::jsonb,  -- auto-snapshot: habits done, tasks done, xp earned
  xp_earned           INT DEFAULT 50 NOT NULL CHECK (xp_earned >= 0),
  unlocked_by_powerup BOOLEAN DEFAULT false NOT NULL,
  created_at          TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT now() NOT NULL,

  UNIQUE(user_id, entry_date)  -- one journal per day
);

CREATE INDEX IF NOT EXISTS idx_journals_user_id ON public.journals(user_id);
CREATE INDEX IF NOT EXISTS idx_journals_date ON public.journals(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_journals_mood ON public.journals(user_id, mood);

ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journals"
  ON public.journals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journals"
  ON public.journals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journals"
  ON public.journals FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own journals"
  ON public.journals FOR DELETE USING (auth.uid() = user_id);
