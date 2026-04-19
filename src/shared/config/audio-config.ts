/**
 * IrtiQa v2.0 Tactical Audio Registry
 * 
 * Each sound is calibrated for its role in the RPG ecosystem.
 */

export const TACTICAL_AUDIO = {
  // Core Actions
  LEVEL_UP: { path: '/sounds/level-up.mp3', volume: 0.6 },
  XP_GAIN: { path: '/sounds/xp-gain.mp3', volume: 0.4 },
  GOLD_GAIN: { path: '/sounds/gold-gain.mp3', volume: 0.5 },
  
  // Feedback
  HURT: { path: '/sounds/hurt.mp3', volume: 0.5 },
  HEAL: { path: '/sounds/heal.mp3', volume: 0.4 },
  HEAL_GLUG: { path: '/sounds/heal-glug.mp3', volume: 0.5 },
  SHIELD_BREAK: { path: '/sounds/shield-break.mp3', volume: 0.5 },
  
  // UI Interactions
  POP: { path: '/sounds/pop.mp3', volume: 0.5 },
  PUFF: { path: '/sounds/puff.mp3', volume: 0.5 },
  CLICK_SCAN: { path: '/sounds/click-scan.mp3', volume: 0.3 },
  
  // Specific Modules
  QUEST_DEPLOY: { path: '/sounds/quest-deploy.mp3', volume: 0.5 },
  JOURNAL_SEAL: { path: '/sounds/journal-seal.mp3', volume: 0.5 },
  ACHIEVEMENT_FANFARE: { path: '/sounds/achievement-fanfare.mp3', volume: 0.6 },
  POWERUP_ACTIVATE: { path: '/sounds/powerup-activate.mp3', volume: 0.5 },
  ATTRIBUTE_UP: { path: '/sounds/attribute-up.mp3', volume: 0.5 },
} as const

export type AudioEvent = keyof typeof TACTICAL_AUDIO
