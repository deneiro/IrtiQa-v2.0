-- ============================================================
-- Migration: 20260418000001_create_enums
-- Purpose: Create all custom ENUM types used across Irtiqa v2.0
-- ============================================================

-- 8 life spheres (attributes)
CREATE TYPE attribute_type AS ENUM (
  'health',
  'friends',
  'family',
  'money',
  'career',
  'spirituality',
  'development',
  'brightness'
);

-- Quest lifecycle
CREATE TYPE quest_status AS ENUM ('active', 'completed', 'failed', 'archived');

-- Task lifecycle
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed');

-- Habit polarity
CREATE TYPE habit_type AS ENUM ('good', 'bad');

-- Habit recurrence
CREATE TYPE habit_frequency AS ENUM ('daily', 'weekly', 'custom');

-- Journal mood
CREATE TYPE mood_type AS ENUM (
  'happy', 'sad', 'angry', 'anxious',
  'neutral', 'excited', 'tired', 'grateful'
);

-- Achievement rarity (visual glow tiers)
CREATE TYPE achievement_rarity AS ENUM (
  'common', 'uncommon', 'rare', 'epic', 'legendary', 'divine'
);

-- Achievement scope (global vs local section)
CREATE TYPE achievement_scope AS ENUM (
  'global', 'quests', 'habits', 'journal', 'social', 'economy'
);

-- Marketplace item categories
CREATE TYPE item_category AS ENUM ('potion', 'consumable');

-- Debt direction
CREATE TYPE debt_direction AS ENUM ('i_owe', 'they_owe');

-- Player rank (every 10 levels)
CREATE TYPE player_rank AS ENUM (
  'F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'L'
);
