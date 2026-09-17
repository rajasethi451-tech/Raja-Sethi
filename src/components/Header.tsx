import React, { useState } from 'react';
import { Volume2, VolumeX, Shield, Award, Sparkles, Flame, Image as ImageIcon, FolderArchive } from 'lucide-react';
import { UserProfile } from '../types';
import { getAnimalById } from '../data/animals';
import { soundEngine } from '../utils/audio';
import { downloadAppZip } from '../utils/exportZip';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  profile: UserProfile;
  onOpenProfiles: () => void;
  onOpenParents: () => void;
  onOpenBadges: () => void;
  onOpenStickers: () => void;
  activeView: 'game' | 'stickers';
  setActiveView: (view: 'game' | 'stickers') => void;
  onSoundToggled: (muted: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenProfiles,
  onOpenParents,
  onOpenBadges,
  onOpenStickers,
  activeView,
  setActiveView,
  onSoundToggled,
}) => {
  const avatarAnimal = getAnimalById(profile.avatarAnimal);
  const isMuted = soundEngine.getIsMuted();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportZip = async () => {
    try {
      setIsExporting(true);
      soundEngine.playSuccess();
      await downloadAppZip();
    } finally {
      setIsExporting(false);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    soundEngine.setMuted(nextMuted);
    onSoundToggled(nextMuted);
    if (!nextMuted) {
      soundEngine.playSuccess();
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b-2 border-amber-200 px-3 sm:px-6 py-2.5 shadow-xs">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Profile Badge & Switcher */}
        <div className="flex items-center gap-2">
          <button
            id="profile-switch-btn"
            onClick={onOpenProfiles}
            className="group flex items-center gap-2 rounded-2xl bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 px-2.5 py-1.5 transition transform active:scale-95 cursor-pointer"
            title="Switch Player Profile"
          >
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xl shadow-xs border border-white"
              style={{ backgroundColor: profile.themeColor || '#F59E0B' }}
            >
              {avatarAnimal?.emoji || '🦁'}
            </div>
            <div className="text-left pr-1">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-amber-950 font-display truncate max-w-[80px] sm:max-w-[110px]">
                  {profile.name}
                </span>
                <span className="text-[10px] bg-white text-amber-700 font-bold px-1.5 py-0.2 rounded-full border border-amber-300">
                  {profile.age}y
                </span>
              </div>
              <div className="text-[10px] font-semibold text-amber-700 capitalize">
                {profile.difficulty === 'toddler' ? 'Toddler' : profile.difficulty === 'kindergarten' ? 'Kinder' : 'Elementary'}
              </div>
            </div>
          </button>

          {/* Quick nav: Game vs Sticker Album */}
          <div className="flex bg-amber-100/80 p-1 rounded-2xl border border-amber-200">
            <button
              id="nav-game-tab"
              onClick={() => {
                setActiveView('game');
                soundEngine.playTapCount(2);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-xl transition ${
                activeView === 'game'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-800 hover:bg-amber-200/60'
              }`}
            >
              <span>🐾</span>
              <span className="hidden sm:inline">Play Math</span>
            </button>
            <button
              id="nav-stickers-tab"
              onClick={() => {
                setActiveView('stickers');
                soundEngine.playStickerPop();
              }}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-xl transition ${
                activeView === 'stickers'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-amber-800 hover:bg-amber-200/60'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sticker Book</span>
              <span className="bg-purple-100 text-purple-700 text-[10px] px-1 rounded-full ml-0.5">
                {profile.unlockedStickerIds.length}
              </span>
            </button>
          </div>
        </div>

        {/* Center / Right: Stars, Streak, Badges, Sound, Parent */}
        <div className="flex items-center gap-2">
          {/* Star Counter */}
          <div
            className="flex items-center gap-1.5 bg-yellow-100 border-2 border-yellow-300 text-yellow-800 px-2.5 py-1 rounded-2xl shadow-xs"
            title="Total Stars Earned"
          >
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="font-extrabold text-sm sm:text-base font-display">{profile.stars}</span>
          </div>

          {/* Streak Flame */}
          {profile.currentStreak >= 2 && (
            <div
              className="flex items-center gap-1 bg-orange-100 border border-orange-300 text-orange-600 px-2 py-1 rounded-2xl animate-bounce-subtle"
              title="Winning Streak"
            >
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span className="font-bold text-xs sm:text-sm">{profile.currentStreak}</span>
            </div>
          )}

          {/* Badges Trophy Button */}
          <button
            id="badges-modal-btn"
            onClick={onOpenBadges}
            className="relative flex items-center justify-center w-9 h-9 rounded-2xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 transition active:scale-95"
            title="Trophies & Badges"
          >
            <Award className="w-4 h-4 text-amber-600" />
            {profile.unlockedBadgeIds.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {profile.unlockedBadgeIds.length}
              </span>
            )}
          </button>

          {/* Audio Mute/Unmute */}
          <button
            id="audio-toggle-btn"
            onClick={handleToggleMute}
            className={`w-9 h-9 rounded-2xl flex items-center justify-center transition active:scale-95 border ${
              isMuted
                ? 'bg-rose-100 text-rose-600 border-rose-300'
                : 'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200'
            }`}
            title={isMuted ? 'Unmute Sound & Voice' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* PWA Install */}
          <PWAInstallButton />

          {/* Export ZIP Button */}
          <button
            id="header-export-zip-btn"
            onClick={handleExportZip}
            disabled={isExporting}
            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1.5 rounded-2xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
            title="Export & Download Project as ZIP"
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{isExporting ? 'Zipping...' : 'Export ZIP'}</span>
          </button>

          {/* Parent Zone Button */}
          <button
            id="parent-dashboard-btn"
            onClick={onOpenParents}
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-2.5 py-1.5 rounded-2xl text-xs font-bold transition active:scale-95 cursor-pointer"
            title="Parent Area & Progress Tracking"
          >
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Parents</span>
          </button>
        </div>
      </div>
    </header>
  );
};
