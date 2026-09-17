import React from 'react';
import { Award, X, Sparkles, Lock, CheckCircle2 } from 'lucide-react';
import { BADGES } from '../data/badgesAndStickers';
import { UserProfile } from '../types';

interface BadgesModalProps {
  profile: UserProfile;
  onClose: () => void;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({ profile, onClose }) => {
  const getBadgeProgress = (badge: (typeof BADGES)[0]) => {
    let current = 0;
    if (badge.progressKey === 'totalSolved') current = profile.totalSolved;
    else if (badge.progressKey === 'totalCorrect') current = profile.totalCorrect;
    else if (badge.progressKey === 'bestStreak') current = profile.bestStreak;
    else if (badge.progressKey === 'countingSolved') current = profile.countingSolved;
    else if (badge.progressKey === 'additionSolved') current = profile.additionSolved;
    else if (badge.progressKey === 'stickersCount') current = profile.unlockedStickerIds.length;

    const percent = Math.min(100, Math.round((current / badge.requirementCount) * 100));
    return { current, required: badge.requirementCount, percent };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-linear-to-r from-amber-400 via-amber-300 to-yellow-400 p-4 sm:p-6 flex items-center justify-between border-b-2 border-amber-300">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-white/90 flex items-center justify-center text-2xl shadow-xs">
              🏆
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-amber-950 font-display">
                Safari Trophy Room
              </h3>
              <p className="text-xs sm:text-sm font-bold text-amber-800">
                {profile.name} has unlocked {profile.unlockedBadgeIds.length} of {BADGES.length} badges!
              </p>
            </div>
          </div>

          <button
            id="close-badges-modal-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-amber-950 flex items-center justify-center transition shadow-xs cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badges List Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-amber-50/50">
          {BADGES.map((badge) => {
            const isUnlocked = profile.unlockedBadgeIds.includes(badge.id);
            const { current, required, percent } = getBadgeProgress(badge);

            return (
              <div
                key={badge.id}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 transition flex items-start gap-3 ${
                  isUnlocked
                    ? 'bg-white border-amber-300 shadow-md ring-1 ring-amber-200'
                    : 'bg-slate-50/80 border-slate-200 opacity-75'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                    isUnlocked
                      ? 'bg-amber-100 border border-amber-300 shadow-xs'
                      : 'bg-slate-200 text-slate-400 grayscale filter'
                  }`}
                >
                  {badge.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4
                      className={`font-display font-extrabold text-sm truncate ${
                        isUnlocked ? 'text-amber-950' : 'text-slate-600'
                      }`}
                    >
                      {badge.title}
                    </h4>
                    {isUnlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                    {badge.description}
                  </p>

                  {/* Progress Bar */}
                  {!isUnlocked && (
                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-0.5">
                        <span>Progress</span>
                        <span>
                          {current} / {required}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {isUnlocked && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full mt-2">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Unlocked & Ready!</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-amber-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-xs transition"
          >
            Back to Safari
          </button>
        </div>
      </div>
    </div>
  );
};
