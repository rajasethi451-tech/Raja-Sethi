import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Question } from '../types';
import { soundEngine } from '../utils/audio';

interface AnimalCanvasProps {
  question: Question;
  showTouchCount: boolean;
  onCountProgress?: (counted: number) => void;
}

export const AnimalCanvas: React.FC<AnimalCanvasProps> = ({
  question,
  showTouchCount,
  onCountProgress,
}) => {
  // Set of animal keys that the child has tapped to count
  const [tappedMap, setTappedMap] = useState<Record<string, number>>({});
  const [lastBouncedId, setLastBouncedId] = useState<string | null>(null);

  // Reset tapped map whenever question changes
  useEffect(() => {
    setTappedMap({});
    setLastBouncedId(null);
  }, [question.id]);

  const handleAnimalTap = (animalKey: string, soundType: string) => {
    const existingCount = tappedMap[animalKey];
    let nextCount = existingCount;

    if (!existingCount) {
      const currentTappedCount = Object.keys(tappedMap).length;
      nextCount = currentTappedCount + 1;
      const newMap = { ...tappedMap, [animalKey]: nextCount };
      setTappedMap(newMap);
      soundEngine.playTapCount(nextCount - 1);
      if (onCountProgress) {
        onCountProgress(nextCount);
      }
    } else {
      // Re-tapping plays animal's voice
      soundEngine.playAnimalSound(soundType);
    }

    setLastBouncedId(animalKey);
    setTimeout(() => {
      setLastBouncedId((prev) => (prev === animalKey ? null : prev));
    }, 500);
  };

  const renderAnimalGroup = (
    animals: { animal: Question['leftGroup']['animal']; count: number },
    groupKeyPrefix: string,
    title: string,
    badgeColor: string
  ) => {
    const items = Array.from({ length: animals.count }, (_, i) => ({
      key: `${groupKeyPrefix}_${i}`,
      index: i,
    }));

    return (
      <div className="flex flex-col items-center justify-center p-3 sm:p-5 rounded-3xl bg-white/80 border-3 border-amber-200/80 shadow-md backdrop-blur-xs w-full max-w-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{animals.animal.emoji}</span>
          <span className="font-display font-extrabold text-amber-900 text-sm sm:text-base">
            {animals.count} {animals.animal.name.split(' ')[0]}s
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
            {animals.animal.habitat}
          </span>
        </div>

        {/* Animal items grid / cluster */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 min-h-[90px]">
          {items.map((item) => {
            const countOrder = tappedMap[item.key];
            const isBouncing = lastBouncedId === item.key;

            return (
              <motion.button
                id={`animal-item-${item.key}`}
                key={item.key}
                onClick={() => handleAnimalTap(item.key, animals.animal.soundType)}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.88 }}
                animate={
                  isBouncing
                    ? { y: [-12, 0, -6, 0], rotate: [0, -10, 10, 0] }
                    : { y: [0, -3, 0] }
                }
                transition={
                  isBouncing
                    ? { duration: 0.45, ease: 'easeOut' }
                    : { duration: 2.5, repeat: Infinity, delay: item.index * 0.2 }
                }
                className={`relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl text-3xl sm:text-4xl shadow-sm transition-all cursor-pointer select-none ${
                  countOrder
                    ? 'bg-amber-100 border-3 border-amber-400 ring-2 ring-amber-300'
                    : 'bg-amber-50/90 border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-100/50'
                }`}
              >
                {/* Animal Emoji */}
                <span className="drop-shadow-xs">{animals.animal.emoji}</span>

                {/* Tactile Count Badge */}
                <AnimatePresence>
                  {countOrder && showTouchCount && (
                    <motion.span
                      initial={{ scale: 0, y: 10 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center shadow-md border-2 border-white ring-1 ring-amber-400"
                    >
                      {countOrder}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* Tip for kids */}
        <span className="text-[11px] font-semibold text-amber-700/80 mt-2.5">
          Tap any {animals.animal.name.split(' ')[0]} to count! 👆
        </span>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center justify-center my-2">
      {question.mode === 'counting' && (
        <div className="w-full flex justify-center">
          {renderAnimalGroup(
            question.leftGroup,
            'left',
            'Animal Safari Group',
            'bg-amber-100 text-amber-800'
          )}
        </div>
      )}

      {question.mode === 'addition' && question.rightGroup && (
        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-4">
          {/* Left Group */}
          <div className="flex-1 max-w-xs w-full">
            {renderAnimalGroup(
              question.leftGroup,
              'left',
              'Group 1',
              'bg-blue-100 text-blue-800'
            )}
          </div>

          {/* Plus Sign */}
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="w-12 h-12 rounded-full bg-amber-400 border-3 border-amber-500 flex items-center justify-center text-2xl font-black text-amber-950 shadow-md my-1"
          >
            ➕
          </motion.div>

          {/* Right Group */}
          <div className="flex-1 max-w-xs w-full">
            {renderAnimalGroup(
              question.rightGroup,
              'right',
              'Group 2',
              'bg-purple-100 text-purple-800'
            )}
          </div>
        </div>
      )}

      {question.mode === 'missing_number' && question.rightGroup && (
        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-4">
          {/* Left Group */}
          <div className="flex-1 max-w-xs w-full">
            {renderAnimalGroup(
              question.leftGroup,
              'left',
              'Known Friends',
              'bg-emerald-100 text-emerald-800'
            )}
          </div>

          <div className="w-12 h-12 rounded-full bg-amber-400 border-3 border-amber-500 flex items-center justify-center text-2xl font-black text-amber-950 shadow-md">
            ➕
          </div>

          {/* Mystery Box */}
          <div className="flex-1 max-w-xs w-full flex flex-col items-center justify-center p-5 rounded-3xl bg-amber-100/90 border-3 border-dashed border-amber-400 shadow-sm backdrop-blur-xs min-h-[160px]">
            <span className="text-4xl animate-bounce">❓</span>
            <span className="font-display font-bold text-amber-900 text-sm mt-2">
              Mystery Friends!
            </span>
            <span className="text-xs text-amber-700 text-center mt-1">
              How many more {question.rightGroup.animal.name.split(' ')[0]}s are hiding?
            </span>
          </div>
        </div>
      )}

      {question.mode === 'which_has_more' && question.rightGroup && (
        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="flex-1 max-w-xs w-full">
            {renderAnimalGroup(
              question.leftGroup,
              'left',
              'Team 1',
              'bg-rose-100 text-rose-800'
            )}
          </div>

          <div className="px-3 py-1 bg-amber-200 text-amber-900 font-extrabold text-xs rounded-full border border-amber-300">
            VS
          </div>

          <div className="flex-1 max-w-xs w-full">
            {renderAnimalGroup(
              question.rightGroup,
              'right',
              'Team 2',
              'bg-teal-100 text-teal-800'
            )}
          </div>
        </div>
      )}
    </div>
  );
};
