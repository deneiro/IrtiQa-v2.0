-- ============================================================
-- Migration: 20260418000004_create_quests_tasks
-- Purpose: Create quests (SMART goals) and tasks (subtasks)
-- ============================================================

-- Quests table
CREATE TABLE IF NOT EXISTS public.quests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  status          quest_status DEFAULT 'active' NOT NULL,
  deadline        TIMESTAMPTZ,
  xp_reward       INT DEFAULT 50 NOT NULL CHECK (xp_reward >= 0),
  gold_reward     INT DEFAULT 10 NOT NULL CHECK (gold_reward >= 0),
  attribute_ids   attribute_type[] DEFAULT '{}',
  resources       TEXT,  -- SMART markdown
  priority        INT DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quests_user_id ON public.quests(user_id);
CREATE INDEX IF NOT EXISTS idx_quests_status ON public.quests(user_id, status);

ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quests"
  ON public.quests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quests"
  ON public.quests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quests"
  ON public.quests FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own quests"
  ON public.quests FOR DELETE USING (auth.uid() = user_id);

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quest_id        UUID REFERENCES public.quests(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  status          task_status DEFAULT 'pending' NOT NULL,
  deadline        TIMESTAMPTZ,
  xp_reward       INT DEFAULT 15 NOT NULL CHECK (xp_reward >= 0),
  gold_reward     INT DEFAULT 5 NOT NULL CHECK (gold_reward >= 0),
  attribute_ids   attribute_type[] DEFAULT '{}',
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_quest_id ON public.tasks(quest_id);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks"
  ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks"
  ON public.tasks FOR DELETE USING (auth.uid() = user_id);
