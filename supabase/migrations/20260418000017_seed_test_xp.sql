-- ============================================================
-- Migration: 20260418000017_seed_test_xp
-- Purpose: Add test XP to attributes for visual verification
-- ============================================================

DO $$
DECLARE
  v_rec RECORD;
BEGIN
  -- Add specific amounts of XP to different attributes to see varied progress
  -- Health: 40/150 (26%)
  -- Friends: 120/150 (80%)
  -- Money: 75/150 (50%)
  -- etc.
  
  UPDATE public.attributes SET xp = 40, level = 1 WHERE attribute_type = 'health';
  UPDATE public.attributes SET xp = 120, level = 1 WHERE attribute_type = 'friends';
  UPDATE public.attributes SET xp = 10, level = 1 WHERE attribute_type = 'family';
  UPDATE public.attributes SET xp = 75, level = 1 WHERE attribute_type = 'money';
  UPDATE public.attributes SET xp = 160, level = 1 WHERE attribute_type = 'career'; -- This should trigger level up if recalculated
  UPDATE public.attributes SET xp = 30, level = 1 WHERE attribute_type = 'spirituality';
  UPDATE public.attributes SET xp = 95, level = 1 WHERE attribute_type = 'development';
  UPDATE public.attributes SET xp = 55, level = 1 WHERE attribute_type = 'brightness';

  -- Also add some XP to the main profile
  UPDATE public.profiles SET current_xp = 85, level = 1;

  -- Run the recalculation to make sure levels are correct based on the XP we just added
  -- (Assuming 20260418000016_recalculate_levels.sql logic is applied here for convenience)
  
  FOR v_rec IN SELECT * FROM public.attributes LOOP
    DECLARE
      v_new_level INT := 1;
      v_new_xp INT := v_rec.xp;
      v_xp_needed INT;
    BEGIN
      LOOP
        v_xp_needed := 150 + 30 * (v_new_level - 1);
        EXIT WHEN v_new_xp < v_xp_needed;
        v_new_xp := v_new_xp - v_xp_needed;
        v_new_level := v_new_level + 1;
      END LOOP;

      UPDATE public.attributes
      SET level = v_new_level, xp = v_new_xp
      WHERE id = v_rec.id;
    END;
  END LOOP;
END $$;
