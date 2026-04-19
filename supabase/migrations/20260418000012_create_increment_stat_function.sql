-- ============================================================
-- Migration: 20260418000012_create_increment_stat_function
-- Purpose: Helper function to increment user_statistics counters
-- ============================================================

CREATE OR REPLACE FUNCTION public.increment_stat(
  p_user_id UUID,
  p_stat_key TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE format(
    'UPDATE public.user_statistics SET %I = %I + 1, updated_at = now() WHERE user_id = $1',
    p_stat_key, p_stat_key
  ) USING p_user_id;
END;
$$;
