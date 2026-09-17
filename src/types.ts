/**
 * Core types for Animal Math Quest
 */

export type DifficultyLevel = 'toddler' | 'kindergarten' | 'early_elementary';

export type GameMode = 'counting' | 'addition' | 'missing_number' | 'which_has_more';

export interface AnimalItem {
  id: string;
  name: string;
  emoji: string;
  category: 'mammal' | 'bird' | 'amphibian' | 'aquatic';
  soundType: 'lion' | 'bunny' | 'frog' | 'bird' | 'puppy' | 'elephant' | 'monkey' | 'cat' | 'penguin' | 'bear';
  habitat: string;
  funFact: string;
  color: string;
  accentBg: string;
}

export interface Question {
  id: string;
  mode: GameMode;
  difficulty: DifficultyLevel;
  promptText: string;
  speechText: string;
  storyContext?: string;
  leftGroup: {
    animal: AnimalItem;
    count: number;
  };
  rightGroup?: {
    animal: AnimalItem;
    count: number;
  };
  operation: '+' | 'count' | 'missing' | 'compare';
  targetAnswer: number;
  missingPosition?: 'left' | 'right' | 'result';
  options: number[];
  hint: string;
}

export interface PlacedSticker {
  id: string;
  stickerId: string;
  xPercent: number;
  yPercent: number;
  scale: number;
  rotation: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'count' | 'addition' | 'streak' | 'stickers' | 'explorer';
  requirementCount: number;
  progressKey: 'totalSolved' | 'totalCorrect' | 'bestStreak' | 'stickersCount' | 'countingSolved' | 'additionSolved';
}

export interface Sticker {
  id: string;
  name: string;
  animal: AnimalItem;
  title: string;
  rarity: 'common' | 'rare' | 'legendary';
  requiredScore: number;
  unlockedMsg: string;
}

export interface AdditionSkillStats {
  attempted: number;
  correct: number;
}

export interface SessionHistoryEntry {
  id: string;
  date: string;
  mode: GameMode;
  correct: number;
  total: number;
  timeSpentSec: number;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  avatarAnimal: string;
  themeColor: string;
  difficulty: DifficultyLevel;
  stars: number;
  totalSolved: number;
  totalCorrect: number;
  currentStreak: number;
  bestStreak: number;
  countingSolved: number;
  additionSolved: number;
  unlockedBadgeIds: string[];
  unlockedStickerIds: string[];
  placedStickers: PlacedSticker[];
  activeStickerBackground: string;
  statsByRange: {
    sumsTo5: AdditionSkillStats;
    sumsTo10: AdditionSkillStats;
    sumsTo20: AdditionSkillStats;
  };
  recentSessions: SessionHistoryEntry[];
  settings: {
    soundEffects: boolean;
    voiceReadAloud: boolean;
    speechRate: number;
    showVisualTouchCounts: boolean;
  };
}
