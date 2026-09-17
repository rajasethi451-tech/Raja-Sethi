import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sparkles, Award } from 'lucide-react';
import { Badge, Sticker } from '../types';
import { soundEngine } from '../utils/audio';

interface RewardCelebrationProps {
  badges: Badge[];
  stickers: Sticker[];
  bonusStars: number;
  onClose: () => void;
  onGoToStickers?: () => void;
}

export const RewardCelebration: React.FC<RewardCelebrationProps> = ({
  badges,
  stickers,
  bonusStars,
  onClose,
  onGoToStickers,
}) => {
  useEffect(() => {
    soundEngine.playBadgeUnlock();

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        className="w-full max-w-md bg-linear-to-b from-amber-100 via-white to-amber-50 rounded-3xl p-6 shadow-2xl border-4 border-amber-400 text-center relative overflow-hidden"
      >
        <div className="text-5xl mb-2 animate-bounce">🎉</div>

        <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-amber-950">
          Super Animal Math Achievement!
        </h3>

        <p className="text-xs sm:text-sm text-amber-800 font-bold mt-1">
          You worked so hard and earned exciting new rewards!
        </p>

        {/* Badges Earned */}
        {badges.length > 0 && (
          <div className="mt-4 space-y-2">
            {badges.map((b) => (
              <div
                key={b.id}
                className="p-3 bg-amber-50 rounded-2xl border-2 border-amber-300 flex items-center gap-3 shadow-xs"
              >
                <span className="text-3xl p-2 bg-amber-200 rounded-xl">{b.icon}</span>
                <div className="text-left">
                  <div className="font-display font-extrabold text-sm text-amber-950">
                    Badge: {b.title}
                  </div>
                  <div className="text-xs text-amber-800">{b.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stickers Earned */}
        {stickers.length > 0 && (
          <div className="mt-4 space-y-2">
            {stickers.map((s) => (
              <div
                key={s.id}
                className="p-3 bg-purple-50 rounded-2xl border-2 border-purple-300 flex items-center gap-3 shadow-xs"
              >
                <span className="text-4xl p-2 bg-purple-200 rounded-xl">{s.animal.emoji}</span>
                <div className="text-left">
                  <div className="font-display font-extrabold text-sm text-purple-950">
                    Sticker: {s.name}
                  </div>
                  <div className="text-xs text-purple-800">{s.unlockedMsg}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bonus Stars */}
        {bonusStars > 0 && (
          <div className="mt-3 flex items-center justify-center gap-1.5 text-amber-700 font-extrabold text-sm bg-yellow-100 py-1.5 px-3 rounded-full mx-auto w-fit border border-yellow-300">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Streak Bonus: +{bonusStars} Extra Stars!</span>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          {stickers.length > 0 && onGoToStickers && (
            <button
              onClick={() => {
                onClose();
                onGoToStickers();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition cursor-pointer"
            >
              Open Sticker Book 🎨
            </button>
          )}

          <button
            id="collect-rewards-btn"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition cursor-pointer"
          >
            Keep Playing! 🚀
          </button>
        </div>
      </motion.div>
    </div>
  );
};
