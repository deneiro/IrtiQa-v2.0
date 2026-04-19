-- ============================================================
-- Migration: 20260418000021_item_utilities
-- Purpose: Implement RPCs for consuming items (Shields, Chronos Chronacles)
-- ============================================================

-- Drop old versions if they exist to allow changing return types
DROP FUNCTION IF EXISTS public.activate_streak_shield(p_user_id UUID);
DROP FUNCTION IF EXISTS public.unlock_journal_entry(p_user_id UUID, p_journal_id UUID);

-- Function to activate a streak shield on a profile
CREATE OR REPLACE FUNCTION public.activate_streak_shield(
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_shields INT;
BEGIN
  UPDATE public.profiles
  SET 
    streak_shields = COALESCE(streak_shields, 0) + 1,
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING streak_shields INTO v_new_shields;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Profile not found');
  END IF;

  RETURN jsonb_build_object('success', true, 'new_shield_count', v_new_shields);
END;
$$;

-- Function to unlock an old journal entry for editing using a power-up
CREATE OR REPLACE FUNCTION public.unlock_journal_entry(
  p_user_id UUID,
  p_journal_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify the journal belongs to the user first
  IF NOT EXISTS (
    SELECT 1 FROM public.journals 
    WHERE id = p_journal_id AND user_id = p_user_id
  ) THEN
    RETURN jsonb_build_object('error', 'Journal entry not found or unauthorized');
  END IF;

  -- Unlock the entry
  UPDATE public.journals
  SET 
    unlocked_by_powerup = true,
    updated_at = now()
  WHERE id = p_journal_id AND user_id = p_user_id;

  RETURN jsonb_build_object('success', true, 'journal_id', p_journal_id);
END;
$$;

-- Add RLS helpers if needed
-- (Functions above are SECURITY DEFINER so they bypass RLS on behalf of the user check)
