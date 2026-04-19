-- ============================================================
-- Migration: 20260418000016_recalculate_levels
-- Purpose: Fix existing data where Level and XP are out of sync
-- ============================================================

DO $$
DECLARE
  v_rec RECORD;
  v_new_level INT;
  v_new_xp INT;
  v_xp_needed INT;
  v_new_rank player_rank;
BEGIN
  -- 1. Recalculate Profiles
  FOR v_rec IN SELECT * FROM public.profiles LOOP
    v_new_level := 1;
    v_new_xp := v_rec.current_xp; -- Total XP they have
    -- The formula is 150 + 30*(lvl-1)
    -- But wait, award_xp subtracts xp_needed from current_xp.
    -- If they have 540 XP total and are level 1:
    -- Lvl 1: needs 150. 540 - 150 = 390. Lvl 2.
    -- Lvl 2: needs 180. 390 - 180 = 210. Lvl 3.
    -- Lvl 3: needs 210. 210 - 210 = 0. Lvl 4.
    
    LOOP
      v_xp_needed := 150 + 30 * (v_new_level - 1);
      EXIT WHEN v_new_xp < v_xp_needed;
      v_new_xp := v_new_xp - v_xp_needed;
      v_new_level := v_new_level + 1;
    END LOOP;

    v_new_rank := public.get_rank_for_level(v_new_level);

    UPDATE public.profiles
    SET level = v_new_level, current_xp = v_new_xp, rank = v_new_rank
    WHERE id = v_rec.id;
  END LOOP;

  -- 2. Recalculate Attributes
  FOR v_rec IN SELECT * FROM public.attributes LOOP
    v_new_level := 1;
    v_new_xp := v_rec.xp;
    
    LOOP
      v_xp_needed := 150 + 30 * (v_new_level - 1);
      EXIT WHEN v_new_xp < v_xp_needed;
      v_new_xp := v_new_xp - v_xp_needed;
      v_new_level := v_new_level + 1;
    END LOOP;

    UPDATE public.attributes
    SET level = v_new_level, xp = v_new_xp
    WHERE id = v_rec.id;
  END LOOP;
END $$;
