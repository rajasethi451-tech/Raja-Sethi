import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Volume2, Lightbulb, RefreshCw, CheckCircle2, Heart, Sparkles, HelpCircle } from 'lucide-react';
import { DifficultyLevel, GameMode, Question, UserProfile, Badge, Sticker } from '../types';
import { generateQuestion } from '../utils/questionGenerator';
import { recordQuestionResult } from '../utils/storage';
import { soundEngine } from '../utils/audio';
import { AnimalCanvas } from './AnimalCanvas';

interface GameScreenProps {
  profile: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
  onRewardUnlocked: (badges: Badge[], stickers: Sticker[], bonusStars: number) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  profile,
  onProfileUpdated,
  onRewardUnlocked,
}) => {
  const [currentMode, setCurrentMode] = useState<GameMode>('addition');
  const [question, setQuestion] = useState<Question>(() =>
    generateQuestion('addition', profile.difficulty)
  );
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Generate a new question for mode and difficulty
  const loadNewQuestion = useCallback((mode: GameMode = currentMode, diff: DifficultyLevel = profile.difficulty) => {
    soundEngine.cancelSpeech();
    const nextQ = generateQuestion(mode, diff);
    setQuestion(nextQ);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
    setStartTime(Date.now());

    // Auto-read aloud if enabled in settings
    if (profile.settings.voiceReadAloud) {
      setTimeout(() => {
        soundEngine.speak(nextQ.speechText, profile.settings.speechRate, true);
      }, 400);
    }
  }, [currentMode, profile.difficulty, profile.settings.voiceReadAloud, profile.settings.speechRate]);

  // When difficulty changes in profile, update question
  useEffect(() => {
    loadNewQuestion(currentMode, profile.difficulty);
  }, [profile.difficulty]);

  const handleModeChange = (newMode: GameMode) => {
    if (newMode === currentMode) return;
    soundEngine.playTapCount(1);
    setCurrentMode(newMode);
    loadNewQuestion(newMode, profile.difficulty);
  };

  const handleReadAloud = () => {
    soundEngine.speak(question.speechText, profile.settings.speechRate, true);
  };

  const handleAnswerSelect = (option: number) => {
    if (isAnswered) return;

    const timeSpent = Math.max(2, Math.round((Date.now() - startTime) / 1000));
    const correct = option === question.targetAnswer;

    setSelectedAnswer(option);
    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      // Audio rewards
      if (profile.currentStreak >= 2) {
        soundEngine.playStreak();
      } else {
        soundEngine.playSuccess();
      }

      // Confetti burst
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899'],
        });
      } catch {
        // confetti fallback safe
      }

      // Record result
      const { profile: updatedProfile, newBadges, newStickers, bonusStars } =
        recordQuestionResult(question, true, timeSpent);
      onProfileUpdated(updatedProfile);

      if (newBadges.length > 0 || newStickers.length > 0) {
        onRewardUnlocked(newBadges, newStickers, bonusStars);
      }

      // Auto advance after 2 seconds or let user click Next
      setTimeout(() => {
        loadNewQuestion(currentMode, updatedProfile.difficulty);
      }, 2200);
    } else {
      soundEngine.playGentleBoing();
      const { profile: updatedProfile } = recordQuestionResult(question, false, timeSpent);
      onProfileUpdated(updatedProfile);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-4 sm:py-6">
      {/* Game Mode Selector Bar */}
      <div className="w-full flex items-center justify-center gap-1.5 sm:gap-2 mb-4 overflow-x-auto pb-1">
        <button
          id="mode-counting"
          onClick={() => handleModeChange('counting')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs sm:text-sm font-bold transition transform active:scale-95 cursor-pointer whitespace-nowrap shadow-xs ${
            currentMode === 'counting'
              ? 'bg-amber-500 text-white ring-3 ring-amber-300'
              : 'bg-white text-amber-900 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <span>🐾</span>
          <span>Safari Count</span>
        </button>

        <button
          id="mode-addition"
          onClick={() => handleModeChange('addition')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs sm:text-sm font-bold transition transform active:scale-95 cursor-pointer whitespace-nowrap shadow-xs ${
            currentMode === 'addition'
              ? 'bg-amber-500 text-white ring-3 ring-amber-300'
              : 'bg-white text-amber-900 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <span>➕</span>
          <span>Animal Add</span>
        </button>

        <button
          id="mode-missing"
          onClick={() => handleModeChange('missing_number')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs sm:text-sm font-bold transition transform active:scale-95 cursor-pointer whitespace-nowrap shadow-xs ${
            currentMode === 'missing_number'
              ? 'bg-amber-500 text-white ring-3 ring-amber-300'
              : 'bg-white text-amber-900 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <span>❓</span>
          <span>Mystery Guess</span>
        </button>

        <button
          id="mode-compare"
          onClick={() => handleModeChange('which_has_more')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs sm:text-sm font-bold transition transform active:scale-95 cursor-pointer whitespace-nowrap shadow-xs ${
            currentMode === 'which_has_more'
              ? 'bg-amber-500 text-white ring-3 ring-amber-300'
              : 'bg-white text-amber-900 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <span>⚖️</span>
          <span>More or Less</span>
        </button>
      </div>

      {/* Main Question Arena Card */}
      <div className="w-full bg-linear-to-b from-amber-50/90 to-orange-50/90 rounded-3xl p-4 sm:p-7 border-3 border-amber-300 shadow-xl relative overflow-hidden">
        {/* Decorative corner leaves */}
        <div className="absolute top-2 left-2 text-2xl opacity-40 pointer-events-none select-none">🍃</div>
        <div className="absolute top-2 right-2 text-2xl opacity-40 pointer-events-none select-none">🌸</div>

        {/* Story Clue & Audio Read Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 bg-amber-100/90 px-3.5 py-1.5 rounded-full border border-amber-200">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-amber-900 font-display text-center sm:text-left">
              {question.storyContext}
            </span>
          </div>

          <button
            id="read-question-aloud-btn"
            onClick={handleReadAloud}
            className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-amber-950 px-3 py-1.5 rounded-full font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer shrink-0"
            title="Listen to Question"
          >
            <Volume2 className="w-4 h-4" />
            <span>Read to Me</span>
          </button>
        </div>

        {/* Math Question Title */}
        <div className="text-center my-2 sm:my-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-amber-950 font-display tracking-wide drop-shadow-xs">
            {question.promptText}
          </h2>
        </div>

        {/* Interactive Animal Counting Stage */}
        <AnimalCanvas
          question={question}
          showTouchCount={profile.settings.showVisualTouchCounts}
        />

        {/* Feedback Banner on Answer */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`w-full max-w-md mx-auto my-3 p-3 rounded-2xl flex items-center justify-center gap-2 text-sm sm:text-base font-extrabold shadow-md ${
                isCorrect
                  ? 'bg-emerald-100 text-emerald-900 border-2 border-emerald-400'
                  : 'bg-amber-100 text-amber-900 border-2 border-amber-400'
              }`}
            >
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Hooray! That is correct! +1 Star ⭐</span>
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5 text-rose-500 animate-pulse" />
                  <span>Great try! The correct answer was {question.targetAnswer}. You can do it!</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Multiple Choice Answers Grid */}
        <div className="w-full max-w-lg mx-auto mt-4">
          <p className="text-center text-xs font-bold text-amber-800 uppercase tracking-wider mb-2.5">
            Tap Your Guess:
          </p>

          <div
            className={`grid gap-3 sm:gap-4 ${
              question.options.length === 2
                ? 'grid-cols-2'
                : question.options.length === 3
                ? 'grid-cols-3'
                : 'grid-cols-2 sm:grid-cols-4'
            }`}
          >
            {question.options.map((option, idx) => {
              const isChosen = selectedAnswer === option;
              const isTheTarget = option === question.targetAnswer;

              let btnClasses =
                'bg-white text-amber-950 hover:bg-amber-100 border-3 border-amber-300 shadow-md hover:border-amber-400';

              if (isAnswered) {
                if (isTheTarget) {
                  btnClasses =
                    'bg-emerald-500 text-white border-3 border-emerald-600 ring-4 ring-emerald-200 shadow-lg scale-105';
                } else if (isChosen && !isCorrect) {
                  btnClasses = 'bg-rose-200 text-rose-900 border-3 border-rose-400 line-through opacity-70';
                } else {
                  btnClasses = 'bg-white/60 text-slate-400 border-2 border-slate-200 opacity-50';
                }
              }

              return (
                <motion.button
                  id={`answer-option-${option}`}
                  key={`${question.id}_opt_${option}_${idx}`}
                  disabled={isAnswered}
                  onClick={() => handleAnswerSelect(option)}
                  whileHover={!isAnswered ? { scale: 1.06, y: -2 } : {}}
                  whileTap={!isAnswered ? { scale: 0.94 } : {}}
                  className={`h-16 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center text-2xl sm:text-4xl font-extrabold font-display transition-all cursor-pointer select-none ${btnClasses}`}
                >
                  <span>{option}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Hint and Next Controls */}
        <div className="flex items-center justify-between mt-6 pt-3 border-t border-amber-200/80">
          <button
            id="hint-toggle-btn"
            onClick={() => {
              setShowHint(!showHint);
              soundEngine.playTapCount(0);
            }}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-800 hover:text-amber-950 bg-amber-200/60 hover:bg-amber-200 px-3 py-1.5 rounded-full transition"
          >
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span>{showHint ? 'Hide Hint' : 'Ask Wise Owl 🦉'}</span>
          </button>

          <button
            id="next-question-btn"
            onClick={() => loadNewQuestion(currentMode, profile.difficulty)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isAnswered ? 'Next Adventure ➡️' : 'Skip / New'}</span>
          </button>
        </div>

        {/* Wise Owl Hint Box */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3.5 bg-purple-50 border-2 border-purple-200 rounded-2xl text-purple-950 text-xs sm:text-sm flex items-start gap-2.5 shadow-xs"
            >
              <span className="text-2xl">🦉</span>
              <div>
                <p className="font-bold font-display text-purple-900">Wise Owl's Secret Math Clue:</p>
                <p className="mt-0.5 text-purple-800 leading-relaxed">{question.hint}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
