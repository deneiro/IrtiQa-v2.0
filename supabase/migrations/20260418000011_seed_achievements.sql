-- ============================================================
-- Migration: 20260418000011_seed_achievements
-- Purpose: Seed the achievements catalog with ~20 starter achievements
-- ============================================================

INSERT INTO public.achievements (title, description, icon, rarity, scope, condition_key, condition_value, xp_reward, gold_reward) VALUES
-- Global achievements
('First Steps', 'Complete your first quest', '🎯', 'common', 'global', 'total_quests_completed', 1, 25, 10),
('Quest Hunter', 'Complete 5 quests', '⚔️', 'uncommon', 'global', 'total_quests_completed', 5, 50, 25),
('Quest Master', 'Complete 25 quests', '🏆', 'rare', 'global', 'total_quests_completed', 25, 100, 50),
('Legendary Champion', 'Complete 100 quests', '👑', 'legendary', 'global', 'total_quests_completed', 100, 250, 100),

-- Habits achievements
('Habit Starter', 'Check in a habit 10 times', '✅', 'common', 'habits', 'total_habits_checked', 10, 25, 10),
('Discipline', 'Check in a habit 50 times', '💪', 'uncommon', 'habits', 'total_habits_checked', 50, 50, 25),
('Iron Will', 'Check in a habit 200 times', '🔥', 'rare', 'habits', 'total_habits_checked', 200, 100, 50),
('Week Warrior', 'Maintain a 7-day streak', '📅', 'uncommon', 'habits', 'max_streak', 7, 50, 25),
('Month Master', 'Maintain a 30-day streak', '🌟', 'epic', 'habits', 'max_streak', 30, 150, 75),
('Streak Legend', 'Maintain a 100-day streak', '💎', 'legendary', 'habits', 'max_streak', 100, 300, 150),

-- Journal achievements  
('First Reflection', 'Write your first journal entry', '📝', 'common', 'journal', 'total_journals_written', 1, 25, 10),
('Thoughtful Mind', 'Write 10 journal entries', '📓', 'uncommon', 'journal', 'total_journals_written', 10, 50, 25),
('Journal Master', 'Write 30 journal entries', '📚', 'epic', 'journal', 'total_journals_written', 30, 150, 75),
('Chronicle Keeper', 'Write 100 journal entries', '🏛️', 'legendary', 'journal', 'total_journals_written', 100, 300, 150),

-- Social achievements
('Socializer', 'Add 3 contacts', '👋', 'common', 'social', 'total_contacts_added', 3, 25, 10),
('Social Butterfly', 'Add 10 contacts', '🦋', 'uncommon', 'social', 'total_contacts_added', 10, 50, 25),
('Networker', 'Add 25 contacts', '🌐', 'rare', 'social', 'total_contacts_added', 25, 100, 50),
('Debt Settler', 'Settle 5 debts', '💰', 'uncommon', 'social', 'total_debts_settled', 5, 50, 25),

-- Economy achievements
('First Purchase', 'Buy your first item', '🛒', 'common', 'economy', 'total_items_purchased', 1, 25, 10),
('Gold Hoarder', 'Earn 1000 gold total', '🪙', 'rare', 'economy', 'total_gold_earned', 1000, 100, 50),
('Big Spender', 'Spend 500 gold total', '💸', 'uncommon', 'economy', 'total_gold_spent', 500, 50, 25),

-- XP / Level achievements
('Centurion', 'Earn 1000 total XP', '⭐', 'uncommon', 'global', 'total_xp_earned', 1000, 50, 25),
('XP Machine', 'Earn 5000 total XP', '🌠', 'rare', 'global', 'total_xp_earned', 5000, 100, 50),
('Transcendent', 'Earn 25000 total XP', '✨', 'divine', 'global', 'total_xp_earned', 25000, 500, 250);
