-- ============================================================
-- Migration: 20260418000018_enforce_habit_attribute_limit
-- Purpose: Enforce the rule that a habit can only be linked to up to 3 attributes.
-- ============================================================

-- Add a check constraint to the habits table
-- This ensures that the array length of attribute_ids is between 0 and 3
ALTER TABLE public.habits 
  ADD CONSTRAINT habits_attribute_limit 
  CHECK (attribute_ids IS NULL OR cardinality(attribute_ids) <= 3);

-- Comment explaining the constraint for documentation
COMMENT ON CONSTRAINT habits_attribute_limit ON public.habits IS 'Strictly limits habits to a maximum of 3 associated life attributes.';
