-- ============================================================
-- Migration: 20260418000020_quest_task_logic
-- Purpose: Implement rewards logic for tasks/quests and enforce attribute limits
-- ============================================================

-- 1. Enforce max 3 attributes for quests
ALTER TABLE public.quests
ADD CONSTRAINT quests_attribute_limit CHECK (cardinality(attribute_ids) <= 3);

-- 2. Function to complete a task and award rewards
CREATE OR REPLACE FUNCTION public.complete_task(p_task_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_task RECORD;
  v_quest RECORD;
  v_attr_ids attribute_type[];
  v_result JSONB;
BEGIN
  -- Get task details
  SELECT * INTO v_task FROM public.tasks WHERE id = p_task_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Task not found or already completed');
  END IF;

  -- Update task status
  UPDATE public.tasks
  SET status = 'completed', completed_at = now()
  WHERE id = p_task_id;

  -- Determine which attributes to reward
  -- If task has specific attributes, use them. Otherwise, use parent quest's attributes.
  v_attr_ids := v_task.attribute_ids;
  
  IF (COALESCE(array_length(v_attr_ids, 1), 0) = 0) AND (v_task.quest_id IS NOT NULL) THEN
    SELECT attribute_ids INTO v_attr_ids FROM public.quests WHERE id = v_task.quest_id;
  END IF;

  -- Award XP
  IF v_task.xp_reward > 0 THEN
    v_result := public.award_xp(v_task.user_id, v_task.xp_reward, v_attr_ids);
  END IF;

  -- Award Gold
  IF v_task.gold_reward > 0 THEN
    v_result := public.award_gold(v_task.user_id, v_task.gold_reward);
  END IF;

  RETURN jsonb_build_object('success', true, 'task_id', p_task_id);
END;
$$;

-- 3. Function to complete a quest and award rewards
CREATE OR REPLACE FUNCTION public.complete_quest(p_quest_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_quest RECORD;
  v_result JSONB;
BEGIN
  -- Get quest details
  SELECT * INTO v_quest FROM public.quests WHERE id = p_quest_id AND status = 'active';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Quest not found or already completed');
  END IF;

  -- Update quest status
  UPDATE public.quests
  SET status = 'completed', completed_at = now()
  WHERE id = p_quest_id;

  -- Award XP
  IF v_quest.xp_reward > 0 THEN
    v_result := public.award_xp(v_quest.user_id, v_quest.xp_reward, v_quest.attribute_ids);
  END IF;

  -- Award Gold
  IF v_quest.gold_reward > 0 THEN
    v_result := public.award_gold(v_quest.user_id, v_quest.gold_reward);
  END IF;

  RETURN jsonb_build_object('success', true, 'quest_id', p_quest_id);
END;
$$;
