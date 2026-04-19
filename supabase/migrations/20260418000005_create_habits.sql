-- ============================================================
-- Migration: 20260418000005_create_habits
-- Purpose: Create habits and habit_logs for streak/heatmap tracking
-- ============================================================

-- Habits table
CREATE TABLE IF NOT EXISTS public.habits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title           TEXT NOT NULL,
  type            habit_type NOT NULL DEFAULT 'good',
  frequency       habit_frequency DEFAULT 'daily' NOT NULL,
  schedule_days   INT[] DEFAULT '{0,1,2,3,4,5,6}',  -- 0=Sun..6=Sat
  attribute_ids   attribute_type[] DEFAULT '{}',
  xp_reward       INT DEFAULT 10 NOT NULL CHECK (xp_reward >= 0),
  current_streak  INT DEFAULT 0 NOT NULL CHECK (current_streak >= 0),
  best_streak     INT DEFAULT 0 NOT NULL CHECK (best_streak >= 0),
  is_active       BOOLEAN DEFAULT true NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_active ON public.habits(user_id, is_active);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habits"
  ON public.habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habits"
  ON public.habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits"
  ON public.habits FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits"
  ON public.habits FOR DELETE USING (auth.uid() = user_id);

-- Habit logs table (check-in history)
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  habit_id    UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  logged_at   DATE NOT NULL DEFAULT CURRENT_DATE,
  completed   BOOLEAN DEFAULT true NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  UNIQUE(habit_id, logged_at)  -- prevent double check-in
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON public.habit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON public.habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON public.habit_logs(user_id, logged_at);

ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habit_logs"
  ON public.habit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habit_logs"
  ON public.habit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habit_logs"
  ON public.habit_logs FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own habit_logs"
  ON public.habit_logs FOR DELETE USING (auth.uid() = user_id);
