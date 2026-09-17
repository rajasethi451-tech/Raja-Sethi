/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Badge, Sticker, UserProfile } from './types';
import { getActiveProfile, updateActiveProfile } from './utils/storage';
import { soundEngine } from './utils/audio';
import { Header } from './components/Header';
import { GameScreen } from './components/GameScreen';
import { StickerBook } from './components/StickerBook';
import { BadgesModal } from './components/BadgesModal';
import { ParentDashboard } from './components/ParentDashboard';
import { ProfileModal } from './components/ProfileModal';
import { RewardCelebration } from './components/RewardCelebration';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(getActiveProfile);
  const [activeView, setActiveView] = useState<'game' | 'stickers'>('game');

  // Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [rewardData, setRewardData] = useState<{
    badges: Badge[];
    stickers: Sticker[];
    bonusStars: number;
  } | null>(null);

  // Sync initial sound settings
  useEffect(() => {
    soundEngine.setMuted(!profile.settings.soundEffects);
  }, []);

  const handleProfileUpdated = (updated: UserProfile) => {
    setProfile(updated);
  };

  const handleRewardUnlocked = (
    badges: Badge[],
    stickers: Sticker[],
    bonusStars: number
  ) => {
    setRewardData({ badges, stickers, bonusStars });
  };

  const handleUpdateProfile = (updater: (prev: UserProfile) => UserProfile) => {
    const next = updateActiveProfile(updater);
    setProfile(next);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-amber-50 via-orange-50/50 to-amber-100/60 text-slate-900 flex flex-col selection:bg-amber-200">
      {/* Top Header */}
      <Header
        profile={profile}
        onOpenProfiles={() => {
          soundEngine.playTapCount(0);
          setShowProfileModal(true);
        }}
        onOpenParents={() => {
          soundEngine.playTapCount(1);
          setShowParentModal(true);
        }}
        onOpenBadges={() => {
          soundEngine.playSuccess();
          setShowBadgesModal(true);
        }}
        onOpenStickers={() => {
          setActiveView('stickers');
        }}
        activeView={activeView}
        setActiveView={setActiveView}
        onSoundToggled={(muted) => {
          handleUpdateProfile((p) => ({
            ...p,
            settings: { ...p.settings, soundEffects: !muted },
          }));
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center">
        {activeView === 'game' ? (
          <GameScreen
            profile={profile}
            onProfileUpdated={handleProfileUpdated}
            onRewardUnlocked={handleRewardUnlocked}
          />
        ) : (
          <StickerBook
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
      </main>

      {/* Footer info & Offline badge */}
      <footer className="py-3 text-center text-xs text-amber-800/80 font-semibold select-none">
        <p>🐾 Animal Math Quest • Tactile Math & Addition for Young Explorers • 100% Offline Ready</p>
      </footer>

      {/* Offline Status Badge */}
      <OfflineIndicator />

      {/* Modals */}
      {showProfileModal && (
        <ProfileModal
          currentProfileId={profile.id}
          onSelectProfile={(selected) => {
            setProfile(selected);
            soundEngine.setMuted(!selected.settings.soundEffects);
          }}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {showParentModal && (
        <ParentDashboard
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
          onClose={() => setShowParentModal(false)}
        />
      )}

      {showBadgesModal && (
        <BadgesModal
          profile={profile}
          onClose={() => setShowBadgesModal(false)}
        />
      )}

      {rewardData && (
        <RewardCelebration
          badges={rewardData.badges}
          stickers={rewardData.stickers}
          bonusStars={rewardData.bonusStars}
          onClose={() => setRewardData(null)}
          onGoToStickers={() => {
            setRewardData(null);
            setActiveView('stickers');
          }}
        />
      )}
    </div>
  );
}
