-- ============================================================
-- Migration: 20260418000008_create_achievements
-- Purpose: Achievement catalog, user unlocks, and aggregated statistics
-- ============================================================

-- Achievements catalog (reference data — NOT user-owned)
CREATE TABLE IF NOT EXISTS public.achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  icon            TEXT,
  rarity          achievement_rarity DEFAULT 'common' NOT NULL,
  scope           achievement_scope DEFAULT 'global' NOT NULL,
  condition_key   TEXT NOT NULL,    -- e.g., 'total_quests_completed'
  condition_value INT NOT NULL,     -- threshold to unlock
  xp_reward       INT DEFAULT 25 NOT NULL CHECK (xp_reward >= 0),
  gold_reward     INT DEFAULT 10 NOT NULL CHECK (gold_reward >= 0),
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS: Read-only for authenticated users, writes via service_role only
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view achievements"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (true);

-- User achievements (unlocked)
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id  UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at     TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,

  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own user_achievements"
  ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own user_achievements"
  ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own user_achievements"
  ON public.user_achievements FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own user_achievements"
  ON public.user_achievements FOR DELETE USING (auth.uid() = user_id);

-- User statistics (aggregated counters for achievement triggers)
CREATE TABLE IF NOT EXISTS public.user_statistics (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_quests_completed      INT DEFAULT 0 NOT NULL,
  total_tasks_completed       INT DEFAULT 0 NOT NULL,
  total_habits_checked        INT DEFAULT 0 NOT NULL,
  total_journals_written      INT DEFAULT 0 NOT NULL,
  total_gold_spent            INT DEFAULT 0 NOT NULL,
  total_gold_earned           INT DEFAULT 0 NOT NULL,
  total_xp_earned             INT DEFAULT 0 NOT NULL,
  max_streak                  INT DEFAULT 0 NOT NULL,
  total_contacts_added        INT DEFAULT 0 NOT NULL,
  total_achievements_unlocked INT DEFAULT 0 NOT NULL,
  total_items_purchased       INT DEFAULT 0 NOT NULL,
  total_debts_settled         INT DEFAULT 0 NOT NULL,
  created_at                  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at                  TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON public.user_statistics(user_id);

ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own user_statistics"
  ON public.user_statistics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own user_statistics"
  ON public.user_statistics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own user_statistics"
  ON public.user_statistics FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own user_statistics"
  ON public.user_statistics FOR DELETE USING (auth.uid() = user_id);
