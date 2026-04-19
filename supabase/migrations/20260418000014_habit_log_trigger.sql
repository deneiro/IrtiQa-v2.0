-- ============================================================
-- Migration: 20260418000014_habit_log_trigger
-- Purpose: Automate streak updates and XP/Gold rewards on habit check-in
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_habit_checkin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_habit RECORD;
  v_gold_reward INT := 2; -- Default gold reward for any habit
BEGIN
  -- Get the habit details
  SELECT * INTO v_habit FROM public.habits WHERE id = NEW.habit_id;
  
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Only process if the log is marked as 'completed'
  IF NEW.completed = true THEN
    -- 1. Update Streaks in habits table
    UPDATE public.habits
    SET 
      current_streak = current_streak + 1,
      best_streak = GREATEST(best_streak, current_streak + 1),
      updated_at = now()
    WHERE id = NEW.habit_id;

    -- 2. Award XP (using the xp_reward and attribute_ids from the habit)
    PERFORM public.award_xp(
      NEW.user_id,
      v_habit.xp_reward,
      v_habit.attribute_ids
    );

    -- 3. Award Gold
    PERFORM public.award_gold(
      NEW.user_id,
      v_gold_reward
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger to habit_logs
-- Runs AFTER INSERT to ensure the log is committed
DROP TRIGGER IF EXISTS tr_on_habit_log_inserted ON public.habit_logs;
CREATE TRIGGER tr_on_habit_log_inserted
  AFTER INSERT ON public.habit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_habit_checkin();
