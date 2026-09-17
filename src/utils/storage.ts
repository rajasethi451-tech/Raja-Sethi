import { Badge, DifficultyLevel, PlacedSticker, Question, Sticker, UserProfile } from '../types';
import { BADGES, STICKERS } from '../data/badgesAndStickers';

const STORAGE_PROFILES_KEY = 'animal_math_profiles_v1';
const STORAGE_ACTIVE_ID_KEY = 'animal_math_active_profile_v1';

const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'profile_leo',
    name: 'Leo',
    age: 4,
    avatarAnimal: 'lion',
    themeColor: '#F59E0B',
    difficulty: 'toddler',
    stars: 8,
    totalSolved: 10,
    totalCorrect: 8,
    currentStreak: 2,
    bestStreak: 4,
    countingSolved: 5,
    additionSolved: 3,
    unlockedBadgeIds: ['first_safari', 'counting_whiz'],
    unlockedStickerIds: ['sticker_lion_king', 'sticker_bunny_flower', 'sticker_frog_surf'],
    placedStickers: [
      {
        id: 'ps_1',
        stickerId: 'sticker_lion_king',
        xPercent: 30,
        yPercent: 60,
        scale: 1.2,
        rotation: -5,
      },
      {
        id: 'ps_2',
        stickerId: 'sticker_bunny_flower',
        xPercent: 65,
        yPercent: 65,
        scale: 1.0,
        rotation: 8,
      },
    ],
    activeStickerBackground: 'savannah',
    statsByRange: {
      sumsTo5: { attempted: 8, correct: 7 },
      sumsTo10: { attempted: 2, correct: 1 },
      sumsTo20: { attempted: 0, correct: 0 },
    },
    recentSessions: [
      {
        id: 'sess_1',
        date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        mode: 'counting',
        correct: 5,
        total: 6,
        timeSpentSec: 120,
      },
      {
        id: 'sess_2',
        date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        mode: 'addition',
        correct: 3,
        total: 4,
        timeSpentSec: 150,
      },
    ],
    settings: {
      soundEffects: true,
      voiceReadAloud: true,
      speechRate: 0.9,
      showVisualTouchCounts: true,
    },
  },
  {
    id: 'profile_mia',
    name: 'Mia',
    age: 6,
    avatarAnimal: 'bunny',
    themeColor: '#EC4899',
    difficulty: 'kindergarten',
    stars: 15,
    totalSolved: 18,
    totalCorrect: 16,
    currentStreak: 5,
    bestStreak: 6,
    countingSolved: 6,
    additionSolved: 10,
    unlockedBadgeIds: ['first_safari', 'counting_whiz', 'high_five', 'streak_3'],
    unlockedStickerIds: ['sticker_lion_king', 'sticker_bunny_flower', 'sticker_frog_surf', 'sticker_panda_space'],
    placedStickers: [
      {
        id: 'ps_3',
        stickerId: 'sticker_panda_space',
        xPercent: 50,
        yPercent: 40,
        scale: 1.3,
        rotation: 0,
      },
    ],
    activeStickerBackground: 'meadow',
    statsByRange: {
      sumsTo5: { attempted: 6, correct: 6 },
      sumsTo10: { attempted: 10, correct: 9 },
      sumsTo20: { attempted: 2, correct: 1 },
    },
    recentSessions: [
      {
        id: 'sess_3',
        date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        mode: 'addition',
        correct: 9,
        total: 10,
        timeSpentSec: 210,
      },
    ],
    settings: {
      soundEffects: true,
      voiceReadAloud: true,
      speechRate: 0.95,
      showVisualTouchCounts: true,
    },
  },
];

export function getStoredProfiles(): UserProfile[] {
  if (typeof window === 'undefined') return DEFAULT_PROFILES;
  try {
    const raw = localStorage.getItem(STORAGE_PROFILES_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(DEFAULT_PROFILES));
      return DEFAULT_PROFILES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PROFILES;
  } catch {
    return DEFAULT_PROFILES;
  }
}

export function saveStoredProfiles(profiles: UserProfile[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.error('Failed to save profiles to localStorage', err);
  }
}

export function getActiveProfileId(): string {
  if (typeof window === 'undefined') return DEFAULT_PROFILES[0].id;
  try {
    const active = localStorage.getItem(STORAGE_ACTIVE_ID_KEY);
    if (active) return active;
    const profiles = getStoredProfiles();
    const fallbackId = profiles[0]?.id || DEFAULT_PROFILES[0].id;
    localStorage.setItem(STORAGE_ACTIVE_ID_KEY, fallbackId);
    return fallbackId;
  } catch {
    return DEFAULT_PROFILES[0].id;
  }
}

export function setActiveProfileId(id: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_ACTIVE_ID_KEY, id);
  } catch (err) {
    console.error('Failed to set active profile id', err);
  }
}

export function getActiveProfile(): UserProfile {
  const profiles = getStoredProfiles();
  const activeId = getActiveProfileId();
  const found = profiles.find((p) => p.id === activeId);
  return found || profiles[0] || DEFAULT_PROFILES[0];
}

export function updateActiveProfile(updater: (prev: UserProfile) => UserProfile): UserProfile {
  const profiles = getStoredProfiles();
  const activeId = getActiveProfileId();
  const index = profiles.findIndex((p) => p.id === activeId);

  const current = index >= 0 ? profiles[index] : profiles[0];
  const updated = updater(current);

  if (index >= 0) {
    profiles[index] = updated;
  } else {
    profiles.push(updated);
  }

  saveStoredProfiles(profiles);
  return updated;
}

export function createNewProfile(
  name: string,
  age: number,
  avatarAnimal: string,
  themeColor: string,
  difficulty: DifficultyLevel
): UserProfile {
  const profiles = getStoredProfiles();
  const newProfile: UserProfile = {
    id: `prof_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim() || 'Little Explorer',
    age,
    avatarAnimal,
    themeColor,
    difficulty,
    stars: 0,
    totalSolved: 0,
    totalCorrect: 0,
    currentStreak: 0,
    bestStreak: 0,
    countingSolved: 0,
    additionSolved: 0,
    unlockedBadgeIds: [],
    unlockedStickerIds: [],
    placedStickers: [],
    activeStickerBackground: 'savannah',
    statsByRange: {
      sumsTo5: { attempted: 0, correct: 0 },
      sumsTo10: { attempted: 0, correct: 0 },
      sumsTo20: { attempted: 0, correct: 0 },
    },
    recentSessions: [],
    settings: {
      soundEffects: true,
      voiceReadAloud: true,
      speechRate: 0.9,
      showVisualTouchCounts: true,
    },
  };

  profiles.push(newProfile);
  saveStoredProfiles(profiles);
  setActiveProfileId(newProfile.id);
  return newProfile;
}

export function deleteProfile(id: string) {
  let profiles = getStoredProfiles();
  if (profiles.length <= 1) {
    return; // Don't delete the last profile
  }
  profiles = profiles.filter((p) => p.id !== id);
  saveStoredProfiles(profiles);
  if (getActiveProfileId() === id) {
    setActiveProfileId(profiles[0].id);
  }
}

export function resetProfileData(id: string) {
  const profiles = getStoredProfiles();
  const index = profiles.findIndex((p) => p.id === id);
  if (index >= 0) {
    profiles[index] = {
      ...profiles[index],
      stars: 0,
      totalSolved: 0,
      totalCorrect: 0,
      currentStreak: 0,
      bestStreak: 0,
      countingSolved: 0,
      additionSolved: 0,
      unlockedBadgeIds: [],
      unlockedStickerIds: [],
      placedStickers: [],
      statsByRange: {
        sumsTo5: { attempted: 0, correct: 0 },
        sumsTo10: { attempted: 0, correct: 0 },
        sumsTo20: { attempted: 0, correct: 0 },
      },
      recentSessions: [],
    };
    saveStoredProfiles(profiles);
  }
}

export function recordQuestionResult(
  question: Question,
  isCorrect: boolean,
  timeSpentSec: number = 10
): {
  profile: UserProfile;
  newBadges: Badge[];
  newStickers: Sticker[];
  bonusStars: number;
} {
  let newBadges: Badge[] = [];
  let newStickers: Sticker[] = [];
  let bonusStars = 0;

  const updatedProfile = updateActiveProfile((prev) => {
    const next: UserProfile = { ...prev };
    next.totalSolved += 1;

    if (isCorrect) {
      next.totalCorrect += 1;
      next.currentStreak += 1;
      if (next.currentStreak > next.bestStreak) {
        next.bestStreak = next.currentStreak;
      }

      // Base stars
      let starGain = 1;
      // Streak bonus
      if (next.currentStreak >= 5) {
        starGain += 2;
        bonusStars = 2;
      } else if (next.currentStreak >= 3) {
        starGain += 1;
        bonusStars = 1;
      }
      next.stars += starGain;

      if (question.mode === 'counting') {
        next.countingSolved += 1;
      } else {
        next.additionSolved += 1;
      }
    } else {
      next.currentStreak = 0;
    }

    // Range stats
    const target = question.targetAnswer;
    const targetRangeKey =
      target <= 5 ? 'sumsTo5' : target <= 10 ? 'sumsTo10' : 'sumsTo20';

    next.statsByRange = {
      ...next.statsByRange,
      [targetRangeKey]: {
        attempted: next.statsByRange[targetRangeKey].attempted + 1,
        correct: next.statsByRange[targetRangeKey].correct + (isCorrect ? 1 : 0),
      },
    };

    // Check new badges
    const currentBadgesSet = new Set(next.unlockedBadgeIds);
    for (const badge of BADGES) {
      if (currentBadgesSet.has(badge.id)) continue;

      let value = 0;
      if (badge.progressKey === 'totalSolved') value = next.totalSolved;
      else if (badge.progressKey === 'totalCorrect') value = next.totalCorrect;
      else if (badge.progressKey === 'bestStreak') value = next.bestStreak;
      else if (badge.progressKey === 'countingSolved') value = next.countingSolved;
      else if (badge.progressKey === 'additionSolved') value = next.additionSolved;
      else if (badge.progressKey === 'stickersCount') value = next.unlockedStickerIds.length;

      if (value >= badge.requirementCount) {
        currentBadgesSet.add(badge.id);
        newBadges.push(badge);
      }
    }
    next.unlockedBadgeIds = Array.from(currentBadgesSet);

    // Check new stickers
    const currentStickersSet = new Set(next.unlockedStickerIds);
    for (const sticker of STICKERS) {
      if (currentStickersSet.has(sticker.id)) continue;
      if (next.totalCorrect >= sticker.requiredScore) {
        currentStickersSet.add(sticker.id);
        newStickers.push(sticker);
      }
    }
    next.unlockedStickerIds = Array.from(currentStickersSet);

    // Update recent session
    const todayDate = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const existingSession = next.recentSessions[0];
    if (existingSession && existingSession.date === todayDate && existingSession.mode === question.mode) {
      existingSession.total += 1;
      existingSession.correct += isCorrect ? 1 : 0;
      existingSession.timeSpentSec += timeSpentSec;
    } else {
      next.recentSessions.unshift({
        id: `sess_${Date.now()}`,
        date: todayDate,
        mode: question.mode,
        correct: isCorrect ? 1 : 0,
        total: 1,
        timeSpentSec,
      });
      // Keep only last 10 sessions
      if (next.recentSessions.length > 10) {
        next.recentSessions = next.recentSessions.slice(0, 10);
      }
    }

    return next;
  });

  return {
    profile: updatedProfile,
    newBadges,
    newStickers,
    bonusStars,
  };
}

export function exportAllData(): string {
  const profiles = getStoredProfiles();
  const activeId = getActiveProfileId();
  return JSON.stringify({ profiles, activeId, exportedAt: new Date().toISOString() }, null, 2);
}

export function importAllData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data && Array.isArray(data.profiles) && data.profiles.length > 0) {
      saveStoredProfiles(data.profiles);
      if (data.activeId) {
        setActiveProfileId(data.activeId);
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
