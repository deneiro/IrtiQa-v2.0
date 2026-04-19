-- ============================================================
-- Migration: 20260419000001_advance_habit_system
-- Purpose: Support occasional frequency, habit log status enums, 
--          and stricter streak/log life cycle for Habit System v1.
-- ============================================================

-- 1. Update habit_frequency enum
-- Note: 'custom' is being replaced by 'occasional' conceptually.
-- PostgreSQL doesn't support easy enum renaming/removing if used. 
-- We'll add 'occasional' and keep 'custom' as a legacy alias if it exists.
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'habit_frequency' AND e.enumlabel = 'occasional') THEN
    ALTER TYPE habit_frequency ADD VALUE 'occasional';
  END IF;
END $$;

-- 2. Create habit_log_status enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'habit_log_status') THEN
    CREATE TYPE habit_log_status AS ENUM ('completed', 'failed', 'empty');
  END IF;
END $$;

-- 3. Update habits table
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS schedule_dates TEXT[] DEFAULT '{}';

-- 4. Update habit_logs table
-- First, add the new columns
ALTER TABLE public.habit_logs ADD COLUMN IF NOT EXISTS status habit_log_status DEFAULT 'empty';
ALTER TABLE public.habit_logs ADD COLUMN IF NOT EXISTS date TEXT;
ALTER TABLE public.habit_logs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Migrate old data: logged_at to date (text), completed boolean to status enum
UPDATE public.habit_logs 
SET 
  date = logged_at::date::text,
  status = CASE WHEN completed = true THEN 'completed'::habit_log_status ELSE 'failed'::habit_log_status END
WHERE date IS NULL;

-- Now enforce constraints and remove old columns
ALTER TABLE public.habit_logs ALTER COLUMN date SET NOT NULL;
ALTER TABLE public.habit_logs ALTER COLUMN status SET NOT NULL;

-- Keep 'completed' and 'logged_at' for a transition period or drop them if safe.
-- Spec says "Log Creation -> System generates a log entry only for scheduled days"
-- This implies we should have a unique constraint on (habit_id, date)
ALTER TABLE public.habit_logs DROP CONSTRAINT IF EXISTS habit_logs_habit_id_date_key;
ALTER TABLE public.habit_logs ADD CONSTRAINT habit_logs_habit_id_date_key UNIQUE (habit_id, date);

-- 5. Update handle_habit_checkin trigger logic
-- We need to branch logic for GOOD vs BAD habits and status changes.
CREATE OR REPLACE FUNCTION public.handle_habit_checkin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_habit RECORD;
  v_gold_reward INT := 2;
  v_streak_lost INT;
  v_damage INT;
BEGIN
  -- Get the habit details
  SELECT * INTO v_habit FROM public.habits WHERE id = NEW.habit_id;
  
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Logic depends on the NEW status
  IF NEW.status = 'completed' THEN
    IF v_habit.type = 'good' THEN
      -- GOOD Habit: Rewards + Streak Incr
      UPDATE public.habits
      SET 
        current_streak = current_streak + 1,
        best_streak = GREATEST(best_streak, current_streak + 1),
        updated_at = now()
      WHERE id = NEW.habit_id;

      PERFORM public.award_xp(NEW.user_id, v_habit.xp_reward, v_habit.attribute_ids);
      PERFORM public.award_gold(NEW.user_id, v_gold_reward);
    ELSE
      -- BAD Habit: "I avoided it" -> Streak Incr + Small Reward? (Spec is silent, let's give 5 XP)
      UPDATE public.habits
      SET 
        current_streak = current_streak + 1,
        best_streak = GREATEST(best_streak, current_streak + 1),
        updated_at = now()
      WHERE id = NEW.habit_id;
      
      -- Small reward for discipline
      PERFORM public.award_xp(NEW.user_id, 5, v_habit.attribute_ids);
    END IF;

  ELSIF NEW.status = 'failed' THEN
    -- Penalty for failure (applies to both Good missed and Bad relapsed)
    v_streak_lost := v_habit.current_streak;
    
    IF v_habit.type = 'good' THEN
      v_damage := LEAST(5 + v_streak_lost * 2, 30); -- Lower damage for missed good habit
    ELSE
      v_damage := LEAST(10 + v_streak_lost * 3, 50); -- Higher damage for relapsed bad habit
    END IF;

    -- Reset Streak
    UPDATE public.habits
    SET 
      current_streak = 0,
      updated_at = now()
    WHERE id = NEW.habit_id;

    -- Subtract HP
    PERFORM public.deal_hp_damage(NEW.user_id, v_damage);
  END IF;

  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 6. Helper function to ensure logs exist for today (Optimistic UI helper if needed)
-- But usually, we trigger this from the Edge Function for all users.

-- 7. Ensure RLS is updated if needed (usually it stays the same as it's user_id based)
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
