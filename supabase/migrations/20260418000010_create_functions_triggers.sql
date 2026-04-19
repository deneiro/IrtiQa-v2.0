-- ============================================================
-- Migration: 20260418000010_create_functions_triggers
-- Purpose: Core game functions (XP, levels, HP, ranks) and triggers
-- ============================================================

-- ===================
-- HELPER FUNCTIONS
-- ===================

-- Calculate XP needed for a given level: 150 + 30 * (level - 1)
CREATE OR REPLACE FUNCTION public.calculate_xp_for_level(p_level INT)
RETURNS INT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN 150 + 30 * (p_level - 1);
END;
$$;

-- Determine rank based on level (every 10 levels)
CREATE OR REPLACE FUNCTION public.get_rank_for_level(p_level INT)
RETURNS player_rank
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  rank_index INT;
  ranks player_rank[] := ARRAY['F','E','D','C','B','A','S','SS','SSS','L']::player_rank[];
BEGIN
  rank_index := LEAST(FLOOR((p_level - 1) / 10)::INT + 1, 10);
  RETURN ranks[rank_index];
END;
$$;

-- ===================
-- CORE GAME FUNCTIONS
-- ===================

-- Award XP to a user's profile and distribute across attributes
-- Handles level-up and rank promotion automatically
CREATE OR REPLACE FUNCTION public.award_xp(
  p_user_id UUID,
  p_xp INT,
  p_attribute_types attribute_type[] DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile RECORD;
  v_new_xp INT;
  v_xp_needed INT;
  v_new_level INT;
  v_new_rank player_rank;
  v_leveled_up BOOLEAN := false;
  v_attr attribute_type;
  v_attr_xp INT;
  v_attr_count INT;
  v_attr_record RECORD;
  v_attr_xp_needed INT;
BEGIN
  -- Get current profile
  SELECT * INTO v_profile FROM public.profiles WHERE user_id = p_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Profile not found');
  END IF;

  -- Calculate new XP on profile
  v_new_xp := v_profile.current_xp + p_xp;
  v_new_level := v_profile.level;

  -- Level-up loop: keep leveling while we have enough XP
  LOOP
    v_xp_needed := public.calculate_xp_for_level(v_new_level);
    EXIT WHEN v_new_xp < v_xp_needed;
    v_new_xp := v_new_xp - v_xp_needed;
    v_new_level := v_new_level + 1;
    v_leveled_up := true;
  END LOOP;

  -- Determine new rank
  v_new_rank := public.get_rank_for_level(v_new_level);

  -- Update profile
  UPDATE public.profiles
  SET 
    current_xp = v_new_xp,
    level = v_new_level,
    rank = v_new_rank,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Distribute XP across linked attributes
  v_attr_count := COALESCE(array_length(p_attribute_types, 1), 0);
  IF v_attr_count > 0 THEN
    v_attr_xp := CEIL(p_xp::NUMERIC / v_attr_count)::INT;
    
    FOREACH v_attr IN ARRAY p_attribute_types LOOP
      -- Get current attribute
      SELECT * INTO v_attr_record 
      FROM public.attributes 
      WHERE user_id = p_user_id AND attribute_type = v_attr;
      
      IF FOUND THEN
        -- Calculate attribute level-ups
        DECLARE
          v_attr_new_xp INT := v_attr_record.xp + v_attr_xp;
          v_attr_new_level INT := v_attr_record.level;
        BEGIN
          LOOP
            v_attr_xp_needed := public.calculate_xp_for_level(v_attr_new_level);
            EXIT WHEN v_attr_new_xp < v_attr_xp_needed;
            v_attr_new_xp := v_attr_new_xp - v_attr_xp_needed;
            v_attr_new_level := v_attr_new_level + 1;
          END LOOP;

          UPDATE public.attributes
          SET xp = v_attr_new_xp, level = v_attr_new_level, updated_at = now()
          WHERE user_id = p_user_id AND attribute_type = v_attr;
        END;
      END IF;
    END LOOP;
  END IF;

  -- Update user_statistics
  UPDATE public.user_statistics
  SET total_xp_earned = total_xp_earned + p_xp, updated_at = now()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'xp_awarded', p_xp,
    'new_level', v_new_level,
    'new_xp', v_new_xp,
    'new_rank', v_new_rank,
    'leveled_up', v_leveled_up
  );
END;
$$;

-- Award gold to a user
CREATE OR REPLACE FUNCTION public.award_gold(
  p_user_id UUID,
  p_gold INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_gold INT;
BEGIN
  UPDATE public.profiles
  SET gold = gold + p_gold, updated_at = now()
  WHERE user_id = p_user_id
  RETURNING gold INTO v_new_gold;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Profile not found');
  END IF;

  -- Update statistics
  IF p_gold > 0 THEN
    UPDATE public.user_statistics
    SET total_gold_earned = total_gold_earned + p_gold, updated_at = now()
    WHERE user_id = p_user_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'new_gold', v_new_gold);
END;
$$;

-- Spend gold (for marketplace purchases)
CREATE OR REPLACE FUNCTION public.spend_gold(
  p_user_id UUID,
  p_gold INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_gold INT;
  v_new_gold INT;
BEGIN
  SELECT gold INTO v_current_gold FROM public.profiles WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Profile not found');
  END IF;

  IF v_current_gold < p_gold THEN
    RETURN jsonb_build_object('error', 'Insufficient gold', 'current_gold', v_current_gold);
  END IF;

  UPDATE public.profiles
  SET gold = gold - p_gold, updated_at = now()
  WHERE user_id = p_user_id
  RETURNING gold INTO v_new_gold;

  -- Update statistics
  UPDATE public.user_statistics
  SET total_gold_spent = total_gold_spent + p_gold, updated_at = now()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object('success', true, 'new_gold', v_new_gold);
END;
$$;

-- Deal HP damage to a user
CREATE OR REPLACE FUNCTION public.deal_hp_damage(
  p_user_id UUID,
  p_damage INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_hp INT;
BEGIN
  UPDATE public.profiles
  SET current_hp = GREATEST(current_hp - p_damage, 0), updated_at = now()
  WHERE user_id = p_user_id
  RETURNING current_hp INTO v_new_hp;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Profile not found');
  END IF;

  RETURN jsonb_build_object('success', true, 'damage', p_damage, 'new_hp', v_new_hp);
END;
$$;

-- Heal HP (potions)
CREATE OR REPLACE FUNCTION public.heal_hp(
  p_user_id UUID,
  p_amount INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_hp INT;
  v_max_hp INT;
BEGIN
  SELECT max_hp INTO v_max_hp FROM public.profiles WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Profile not found');
  END IF;

  UPDATE public.profiles
  SET current_hp = LEAST(current_hp + p_amount, v_max_hp), updated_at = now()
  WHERE user_id = p_user_id
  RETURNING current_hp INTO v_new_hp;

  RETURN jsonb_build_object('success', true, 'healed', p_amount, 'new_hp', v_new_hp);
END;
$$;

-- ===================
-- TRIGGERS
-- ===================

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger to all user tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'profiles', 'attributes', 'quests', 'tasks', 'habits',
    'journals', 'contacts', 'events', 'debts',
    'user_statistics', 'inventory'
  ]) LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();',
      tbl
    );
  END LOOP;
END;
$$;

-- Auto-create profile + attributes + statistics on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attr attribute_type;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Adventurer'));

  -- Create 8 attribute rows
  FOREACH v_attr IN ARRAY ARRAY[
    'health', 'friends', 'family', 'money',
    'career', 'spirituality', 'development', 'brightness'
  ]::attribute_type[] LOOP
    INSERT INTO public.attributes (user_id, attribute_type)
    VALUES (NEW.id, v_attr);
  END LOOP;

  -- Create user_statistics row
  INSERT INTO public.user_statistics (user_id) VALUES (NEW.id);

  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
