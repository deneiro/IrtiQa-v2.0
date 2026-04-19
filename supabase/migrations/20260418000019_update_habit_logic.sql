-- ============================================================
-- Migration: 20260418000019_update_habit_logic
-- Purpose: Branch check-in logic for rewards (good) vs penalties (bad)
-- ============================================================

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

  -- Only process if the log is marked as 'completed' (i.e., Action Taken)
  IF NEW.completed = true THEN
    IF v_habit.type = 'good' THEN
      -- 1. Good Habit: Standard Rewards & Streak Incr
      UPDATE public.habits
      SET 
        current_streak = current_streak + 1,
        best_streak = GREATEST(best_streak, current_streak + 1),
        updated_at = now()
      WHERE id = NEW.habit_id;

      -- Award XP (using the xp_reward and attribute_ids from the habit)
      PERFORM public.award_xp(
        NEW.user_id,
        v_habit.xp_reward,
        v_habit.attribute_ids
      );

      -- Award Gold
      PERFORM public.award_gold(
        NEW.user_id,
        v_gold_reward
      );
    ELSE
      -- 2. Bad Habit: Penalty for Relapse
      v_streak_lost := v_habit.current_streak;
      v_damage := LEAST(10 + v_streak_lost * 3, 50); -- Penalty scales with lost streak

      -- Reset Streak
      UPDATE public.habits
      SET 
        current_streak = 0,
        updated_at = now()
      WHERE id = NEW.habit_id;

      -- Subtract HP
      PERFORM public.deal_hp_damage(
        NEW.user_id,
        v_damage
      );
      
      -- No XP or Gold rewarded for failures
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
