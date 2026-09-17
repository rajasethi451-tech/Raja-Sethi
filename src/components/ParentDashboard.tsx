import React, { useState } from 'react';
import {
  Shield,
  X,
  Sliders,
  BarChart3,
  Volume2,
  CheckCircle2,
  Clock,
  Sparkles,
  RotateCcw,
  Download,
  Flame,
} from 'lucide-react';
import { DifficultyLevel, UserProfile } from '../types';
import { resetProfileData, exportAllData } from '../utils/storage';
import { soundEngine } from '../utils/audio';
import { downloadAppZip } from '../utils/exportZip';

interface ParentDashboardProps {
  profile: UserProfile;
  onUpdateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  onClose: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  profile,
  onUpdateProfile,
  onClose,
}) => {
  // Kid-proof math gate (e.g. 3 x 3 = 9 or 4 + 5 = 9)
  const [gateUnlocked, setGateUnlocked] = useState(false);
  const [gateNum1] = useState(() => Math.floor(Math.random() * 4) + 2);
  const [gateNum2] = useState(() => Math.floor(Math.random() * 4) + 2);
  const [gateInput, setGateInput] = useState('');
  const [gateError, setGateError] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      soundEngine.playSuccess();
      await downloadAppZip();
    } finally {
      setIsZipping(false);
    }
  };

  const handleGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(gateInput, 10) === gateNum1 * gateNum2) {
      setGateUnlocked(true);
      setGateError(false);
      soundEngine.playSuccess();
    } else {
      setGateError(true);
      soundEngine.playGentleBoing();
    }
  };

  const handleDifficultyChange = (diff: DifficultyLevel) => {
    soundEngine.playTapCount(2);
    onUpdateProfile((prev) => ({
      ...prev,
      difficulty: diff,
    }));
  };

  const handleToggleSound = (key: 'soundEffects' | 'voiceReadAloud' | 'showVisualTouchCounts') => {
    onUpdateProfile((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: !prev.settings[key],
      },
    }));
  };

  const handleSpeechRateChange = (rate: number) => {
    onUpdateProfile((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        speechRate: rate,
      },
    }));
  };

  const handleResetProgress = () => {
    if (window.confirm(`Are you sure you want to reset all progress for ${profile.name}?`)) {
      resetProfileData(profile.id);
      onUpdateProfile((prev) => ({
        ...prev,
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
      }));
      soundEngine.playGentleBoing();
    }
  };

  const handleExportData = () => {
    const json = exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `animal_math_progress_${profile.name.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const overallAccuracy =
    profile.totalSolved > 0
      ? Math.round((profile.totalCorrect / profile.totalSolved) * 100)
      : 0;

  const calculateRangeAccuracy = (stats: { attempted: number; correct: number }) => {
    return stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border-4 border-slate-300 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg sm:text-xl">
                Parent & Educator Zone
              </h3>
              <p className="text-xs text-slate-400">
                Tracking progress and adjusting curriculum for {profile.name}
              </p>
            </div>
          </div>

          <button
            id="close-parent-dashboard-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gate screen if locked */}
        {!gateUnlocked ? (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-3xl mb-3">
              🔒
            </div>
            <h4 className="font-display font-bold text-lg text-slate-900">
              Parent Verification Check
            </h4>
            <p className="text-xs text-slate-600 max-w-xs mt-1 mb-4">
              To keep little fingers from changing settings, please solve this quick math problem:
            </p>

            <form onSubmit={handleGateSubmit} className="flex flex-col items-center gap-3 w-full max-w-xs">
              <div className="text-2xl font-black text-slate-800 font-mono bg-slate-100 px-6 py-2 rounded-2xl border border-slate-300">
                {gateNum1} × {gateNum2} = ?
              </div>
              <input
                id="parent-gate-input"
                type="number"
                value={gateInput}
                onChange={(e) => setGateInput(e.target.value)}
                placeholder="Answer"
                autoFocus
                className="w-full text-center text-lg font-bold py-2 border-2 border-slate-300 rounded-xl focus:border-amber-500 focus:outline-none"
              />
              {gateError && (
                <p className="text-xs text-rose-600 font-bold">Incorrect answer. Please try again.</p>
              )}
              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl transition shadow-xs cursor-pointer"
              >
                Unlock Parent Dashboard
              </button>
            </form>
          </div>
        ) : (
          /* Unlocked Parent Dashboard Content */
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
            {/* Top KPI Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="text-xs font-bold text-amber-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Accuracy</span>
                </div>
                <div className="text-2xl font-black text-amber-950 mt-1">{overallAccuracy}%</div>
                <div className="text-[10px] text-amber-700">
                  {profile.totalCorrect} of {profile.totalSolved} correct
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200">
                <div className="text-xs font-bold text-blue-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Total Stars</span>
                </div>
                <div className="text-2xl font-black text-blue-950 mt-1">{profile.stars}</div>
                <div className="text-[10px] text-blue-700">Earned in all games</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200">
                <div className="text-xs font-bold text-orange-800 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-600" />
                  <span>Best Streak</span>
                </div>
                <div className="text-2xl font-black text-orange-950 mt-1">{profile.bestStreak}</div>
                <div className="text-[10px] text-orange-700">Current: {profile.currentStreak} in a row</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200">
                <div className="text-xs font-bold text-purple-800 flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Rewards</span>
                </div>
                <div className="text-2xl font-black text-purple-950 mt-1">
                  {profile.unlockedBadgeIds.length + profile.unlockedStickerIds.length}
                </div>
                <div className="text-[10px] text-purple-700">
                  {profile.unlockedBadgeIds.length} Badges, {profile.unlockedStickerIds.length} Stickers
                </div>
              </div>
            </div>

            {/* Adjustable Difficulty Level */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="font-display font-extrabold text-sm text-slate-900 flex items-center gap-2 mb-2">
                <Sliders className="w-4 h-4 text-amber-500" />
                <span>Adjust Difficulty Level & Age Group</span>
              </h4>
              <p className="text-xs text-slate-600 mb-3">
                Tailors number ranges, visual assistance, and math complexity:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  id="set-diff-toddler"
                  onClick={() => handleDifficultyChange('toddler')}
                  className={`p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                    profile.difficulty === 'toddler'
                      ? 'bg-amber-100 border-amber-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-display font-extrabold text-xs text-amber-950">
                    🐣 Toddler / Pre-K (Ages 3-4)
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 leading-snug">
                    Numbers 1-5, tactile 1-to-1 counting, gentle sums up to 5, pictorial options.
                  </div>
                </button>

                <button
                  id="set-diff-kindergarten"
                  onClick={() => handleDifficultyChange('kindergarten')}
                  className={`p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                    profile.difficulty === 'kindergarten'
                      ? 'bg-amber-100 border-amber-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-display font-extrabold text-xs text-amber-950">
                    🦊 Kindergarten (Ages 5-6)
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 leading-snug">
                    Addition sums up to 10, word stories, missing addends, comparison games.
                  </div>
                </button>

                <button
                  id="set-diff-elementary"
                  onClick={() => handleDifficultyChange('early_elementary')}
                  className={`p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                    profile.difficulty === 'early_elementary'
                      ? 'bg-amber-100 border-amber-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-display font-extrabold text-xs text-amber-950">
                    🦁 Early Elementary (Ages 7-8)
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 leading-snug">
                    Addition sums up to 20, missing number mysteries, fast mental math.
                  </div>
                </button>
              </div>
            </div>

            {/* Addition Skill Breakdown Mastery */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="font-display font-extrabold text-sm text-slate-900 mb-2 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Addition Skill Mastery by Number Range</span>
              </h4>

              <div className="space-y-3 mt-3">
                {/* Sums to 5 */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Sums up to 5 (Foundational)</span>
                    <span>
                      {profile.statsByRange.sumsTo5.correct}/{profile.statsByRange.sumsTo5.attempted} (
                      {calculateRangeAccuracy(profile.statsByRange.sumsTo5)}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${calculateRangeAccuracy(profile.statsByRange.sumsTo5)}%` }}
                    />
                  </div>
                </div>

                {/* Sums to 10 */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Sums up to 10 (Core Kindergarten Target)</span>
                    <span>
                      {profile.statsByRange.sumsTo10.correct}/{profile.statsByRange.sumsTo10.attempted} (
                      {calculateRangeAccuracy(profile.statsByRange.sumsTo10)}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${calculateRangeAccuracy(profile.statsByRange.sumsTo10)}%` }}
                    />
                  </div>
                </div>

                {/* Sums to 20 */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Sums up to 20 (Early Elementary Target)</span>
                    <span>
                      {profile.statsByRange.sumsTo20.correct}/{profile.statsByRange.sumsTo20.attempted} (
                      {calculateRangeAccuracy(profile.statsByRange.sumsTo20)}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${calculateRangeAccuracy(profile.statsByRange.sumsTo20)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Audio & Accessibility Settings */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-display font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-600" />
                <span>Audio & Learning Assistance</span>
              </h4>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <div>
                  <div className="text-xs font-bold text-slate-800">Voice Read-Aloud Narration</div>
                  <div className="text-[11px] text-slate-500">
                    Reads math questions aloud automatically for non-readers
                  </div>
                </div>
                <input
                  id="toggle-voice-read"
                  type="checkbox"
                  checked={profile.settings.voiceReadAloud}
                  onChange={() => handleToggleSound('voiceReadAloud')}
                  className="w-5 h-5 accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-800">Tactile Number Counting Badges</div>
                  <div className="text-[11px] text-slate-500">
                    Shows numbers (1, 2, 3...) when kids tap each animal on screen
                  </div>
                </div>
                <input
                  id="toggle-visual-count"
                  type="checkbox"
                  checked={profile.settings.showVisualTouchCounts}
                  onChange={() => handleToggleSound('showVisualTouchCounts')}
                  className="w-5 h-5 accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-slate-200">
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Speech Rate (Speed of Voice)</span>
                  <span>{Math.round(profile.settings.speechRate * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.2"
                  step="0.05"
                  value={profile.settings.speechRate}
                  onChange={(e) => handleSpeechRateChange(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Slow (Toddler)</span>
                  <span>Normal</span>
                  <span>Quick</span>
                </div>
              </div>
            </div>

            {/* Session History Log */}
            {profile.recentSessions.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="font-display font-extrabold text-sm text-slate-900 flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <span>Recent Activity Sessions</span>
                </h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {profile.recentSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-white text-xs border border-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 capitalize">
                          {session.mode.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400">{session.date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-emerald-700">
                          {session.correct}/{session.total} correct
                        </span>
                        <span className="text-slate-500 text-[10px]">
                          ~{Math.round(session.timeSpentSec / 60)} min
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* App Bundle & Offline Access Info */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 className="font-display font-extrabold text-sm text-amber-950 flex items-center gap-2 mb-1.5">
                <Download className="w-4 h-4 text-amber-600" />
                <span>Download App Bundle & Offline Installation</span>
              </h4>
              <p className="text-xs text-amber-900 leading-relaxed">
                You can download or install the app bundle in two ways:
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-amber-800 list-disc list-inside">
                <li>
                  <strong>Direct Device Install (PWA Bundle):</strong> Click the green <strong>"Install App"</strong> button in the top header. This saves the application bundle directly onto your iPad, Android tablet, phone, or computer for instant offline play.
                </li>
                <li>
                  <strong>Full Source Code Bundle (ZIP):</strong> Open the <strong>three dots (⋮) / Settings menu</strong> in the top-right corner of Google AI Studio and select <strong>Export as ZIP</strong>, or click the direct button below!
                </li>
              </ul>

              <button
                id="parent-download-zip-btn"
                onClick={handleDownloadZip}
                disabled={isZipping}
                className="mt-3 flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isZipping ? 'Packaging ZIP Archive...' : 'Download Project Bundle (ZIP)'}</span>
              </button>
            </div>

            {/* Management & Export */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
              <button
                id="export-progress-btn"
                onClick={handleExportData}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Progress (JSON)</span>
              </button>

              <button
                id="reset-profile-btn"
                onClick={handleResetProgress}
                className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-rose-200 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset {profile.name}'s Data</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs transition"
          >
            Close Parent Zone
          </button>
        </div>
      </div>
    </div>
  );
};
