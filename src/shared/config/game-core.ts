export const GAME_CORE = {
  // Base HP settings
  MAX_HP: 100,
  
  // Leveling Formula: 150 + 30 * (Level - 1)
  calculateXpForNextLevel: (currentLevel: number): number => {
    return 150 + 30 * (currentLevel - 1);
  },
  
  // 8 established life attributes and HEX colors defined in rules
  ATTRIBUTES: {
    health: { key: 'health', name: 'Health', color: '#ef4444' },         // Red
    friends: { key: 'friends', name: 'Friends', color: '#f97316' },     // Orange
    family: { key: 'family', name: 'Family', color: '#eab308' },       // Yellow
    money: { key: 'money', name: 'Money', color: '#84cc16' },         // Lime
    career: { key: 'career', name: 'Career', color: '#10b981' },       // Emerald
    spirituality: { key: 'spirituality', name: 'Spirituality', color: '#8b5cf6' }, // Violet
    development: { key: 'development', name: 'Development', color: '#3b82f6' }, // Blue
    brightness: { key: 'brightness', name: 'Brightness', color: '#ec4899' },  // Pink
  },
  
  // Ranks (every 10 levels)
  RANKS: [
    { threshold: 1, rank: 'F', title: 'Weak' },
    { threshold: 10, rank: 'E', title: 'Novice' },
    { threshold: 20, rank: 'D', title: 'Apprentice' },
    { threshold: 30, rank: 'C', title: 'Strong' },
    { threshold: 40, rank: 'B', title: 'Veteran' },
    { threshold: 50, rank: 'A', title: 'Master' },
    { threshold: 60, rank: 'S', title: 'Elite' },
    { threshold: 70, rank: 'SS', title: 'Hero' },
    { threshold: 80, rank: 'SSS', title: 'Champion' },
    { threshold: 90, rank: 'L', title: 'Legend' },
  ] as const,

  RARITIES: {
    common: { label: 'Common', color: '#9ca3af', bg: 'bg-gray-500', glow: 'shadow-gray-500/20', animation: '' },
    rare: { label: 'Rare', color: '#3b82f6', bg: 'bg-blue-500', glow: 'shadow-blue-500/40', animation: '' },
    epic: { label: 'Epic', color: '#a855f7', bg: 'bg-purple-500', glow: 'shadow-purple-500/60', animation: '' },
    divine: { label: 'Divine', color: '#fbbf24', bg: 'bg-amber-400', glow: 'shadow-amber-400/80', animation: 'animate-pulse' },
  } as const,

  getRankForLevel: (level: number) => {
    const rankObj = [...GAME_CORE.RANKS].reverse().find(r => level >= r.threshold);
    return (rankObj?.rank || 'F') as "F" | "E" | "D" | "C" | "B" | "A" | "S" | "SS" | "SSS" | "L";
  },

  getRarityForRank: (rank: string) => {
    if (['F', 'E', 'D'].includes(rank)) return GAME_CORE.RARITIES.common;
    if (['C', 'B'].includes(rank)) return GAME_CORE.RARITIES.rare;
    if (['A', 'S'].includes(rank)) return GAME_CORE.RARITIES.epic;
    return GAME_CORE.RARITIES.divine; // SS, SSS, L
  },
  
  // Rewards multipliers
  JOURNAL_XP_REWARD: 50,

  // Market Items Catalog
  MARKET_ITEMS: {
    // POTIONS
    pot_small: {
      key: 'pot_small',
      name: 'Small Health Potion',
      description: 'Restores 10 HP. A basic brew for minor setbacks.',
      price: 50,
      category: 'potion' as const,
      effect: { type: 'heal', value: 10 },
      icon: '🧪'
    },
    pot_medium: {
      key: 'pot_medium',
      name: 'Medium Health Potion',
      description: 'Restores 30 HP. For mid-level fatigue.',
      price: 120,
      category: 'potion' as const,
      effect: { type: 'heal', value: 30 },
      icon: '🍷'
    },
    pot_large: {
      key: 'pot_large',
      name: 'Large Health Potion',
      description: 'Restores 100 HP. Full recovery for the weary soul.',
      price: 350,
      category: 'potion' as const,
      effect: { type: 'heal', value: 100 },
      icon: '🏺'
    },

    // CONSUMABLES
    streak_shield: {
      key: 'streak_shield',
      name: 'Streak Shield',
      description: 'Protects your habit streak for one missed day.',
      price: 500,
      category: 'consumable' as const,
      effect: { type: 'protect_streak', value: 1 },
      icon: '🛡️'
    },
    habit_pardon: {
      key: 'habit_pardon',
      name: 'Habit Pardon',
      description: 'Mark a missed habit as done for a previous day.',
      price: 1000,
      category: 'consumable' as const,
      effect: { type: 'backdate_habit', value: 1 },
      icon: '📜'
    },
    focus_unlock: {
      key: 'focus_unlock',
      name: 'Focus Unlock',
      description: 'Allows setting a second Focus Quest for today.',
      price: 2000,
      category: 'consumable' as const,
      effect: { type: 'focus_slot', value: 1 },
      icon: '🔓'
    },
    indulgence: {
      key: 'indulgence',
      name: 'Indulgence',
      description: 'Ignore the negative effects of a failed bad habit today.',
      price: 300,
      category: 'consumable' as const,
      effect: { type: 'ignore_bad_habit', value: 1 },
      icon: '🍬'
    },
    missing_journal: {
      key: 'missing_journal',
      name: 'Missing Journal',
      description: 'Recover the ability to write a journal for a missed day.',
      price: 400,
      category: 'consumable' as const,
      effect: { type: 'journal_recovery', value: 1 },
      icon: '🖊️'
    },
    attribute_boost: {
      key: 'attribute_boost',
      name: 'Attribute Boost',
      description: 'A one-time 2x XP multiplier for the next 3 tasks.',
      price: 1500,
      category: 'consumable' as const,
      effect: { type: 'xp_boost', value: 2 },
      icon: '⚡'
    },
    ghost_day: {
      key: 'ghost_day',
      name: 'Ghost Day',
      description: 'Freeze all habits and status for 24 hours (Sick/Vacation).',
      price: 2500,
      category: 'consumable' as const,
      effect: { type: 'freeze_state', value: 1 },
      icon: '👻'
    },
    rename: {
      key: 'rename',
      name: 'Identity Scroll',
      description: 'Allows you to change your name and class.',
      price: 5000,
      category: 'consumable' as const,
      effect: { type: 'rename', value: 1 },
      icon: '🖋️'
    },
    feather_of_time: {
      key: 'feather_of_time',
      name: 'Feather of Time',
      description: 'Unlocks editing for a journal entry older than 3 days.',
      price: 1200,
      category: 'consumable' as const,
      effect: { type: 'unlock_journal_edit', value: 1 },
      icon: '🪶'
    },
  } as const,

  getItemByKey: (key: string) => {
    return (GAME_CORE.MARKET_ITEMS as any)[key] || null;
  }
};

export type MarketItemKey = keyof typeof GAME_CORE.MARKET_ITEMS;
export type MarketItem = (typeof GAME_CORE.MARKET_ITEMS)[MarketItemKey];
