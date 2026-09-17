import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Trash2, RotateCw, ZoomIn, ZoomOut, Check, Lock } from 'lucide-react';
import { PlacedSticker, UserProfile } from '../types';
import { STICKERS, STICKER_BACKGROUNDS } from '../data/badgesAndStickers';
import { soundEngine } from '../utils/audio';

interface StickerBookProps {
  profile: UserProfile;
  onUpdateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
}

export const StickerBook: React.FC<StickerBookProps> = ({ profile, onUpdateProfile }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedPlacedId, setSelectedPlacedId] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState(false);

  const activeBg =
    STICKER_BACKGROUNDS.find((b) => b.id === profile.activeStickerBackground) ||
    STICKER_BACKGROUNDS[0];

  const unlockedStickers = STICKERS.filter((s) =>
    profile.unlockedStickerIds.includes(s.id)
  );
  const lockedStickers = STICKERS.filter(
    (s) => !profile.unlockedStickerIds.includes(s.id)
  );

  const handlePlaceSticker = (stickerId: string) => {
    soundEngine.playStickerPop();
    const newPlaced: PlacedSticker = {
      id: `ps_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      stickerId,
      xPercent: 30 + Math.random() * 40,
      yPercent: 40 + Math.random() * 30,
      scale: 1,
      rotation: (Math.random() - 0.5) * 20,
    };

    onUpdateProfile((prev) => ({
      ...prev,
      placedStickers: [...prev.placedStickers, newPlaced],
    }));
    setSelectedPlacedId(newPlaced.id);
  };

  const handleStickerClick = (placedId: string, stickerId: string) => {
    const sticker = STICKERS.find((s) => s.id === stickerId);
    if (sticker) {
      soundEngine.playAnimalSound(sticker.animal.soundType);
    }
    setSelectedPlacedId(placedId);
  };

  const handleDragEnd = (placedId: string, e: any, info: any) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const xPct = Math.max(10, Math.min(90, ((info.point.x - rect.left) / rect.width) * 100));
    const yPct = Math.max(15, Math.min(85, ((info.point.y - rect.top) / rect.height) * 100));

    onUpdateProfile((prev) => ({
      ...prev,
      placedStickers: prev.placedStickers.map((ps) =>
        ps.id === placedId ? { ...ps, xPercent: xPct, yPercent: yPct } : ps
      ),
    }));
  };

  const handleRotateSelected = () => {
    if (!selectedPlacedId) return;
    soundEngine.playTapCount(1);
    onUpdateProfile((prev) => ({
      ...prev,
      placedStickers: prev.placedStickers.map((ps) =>
        ps.id === selectedPlacedId
          ? { ...ps, rotation: (ps.rotation + 15) % 360 }
          : ps
      ),
    }));
  };

  const handleScaleSelected = (delta: number) => {
    if (!selectedPlacedId) return;
    soundEngine.playTapCount(2);
    onUpdateProfile((prev) => ({
      ...prev,
      placedStickers: prev.placedStickers.map((ps) =>
        ps.id === selectedPlacedId
          ? { ...ps, scale: Math.max(0.6, Math.min(2.2, ps.scale + delta)) }
          : ps
      ),
    }));
  };

  const handleDeleteSelected = () => {
    if (!selectedPlacedId) return;
    soundEngine.playGentleBoing();
    onUpdateProfile((prev) => ({
      ...prev,
      placedStickers: prev.placedStickers.filter((ps) => ps.id !== selectedPlacedId),
    }));
    setSelectedPlacedId(null);
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all stickers from this scene?')) {
      soundEngine.playGentleBoing();
      onUpdateProfile((prev) => ({
        ...prev,
        placedStickers: [],
      }));
      setSelectedPlacedId(null);
    }
  };

  const handleSelectBackground = (bgId: string) => {
    soundEngine.playTapCount(3);
    onUpdateProfile((prev) => ({
      ...prev,
      activeStickerBackground: bgId,
    }));
  };

  const handleSaveScene = () => {
    soundEngine.playSuccess();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 py-4 sm:py-6 flex flex-col items-center">
      {/* Title Bar */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-950 font-display flex items-center gap-2">
            <span>🎨</span>
            <span>Animal Sticker Safari</span>
          </h2>
          <p className="text-xs sm:text-sm text-amber-800">
            Drag, tap, and build your own animal kingdom scene!
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {profile.placedStickers.length > 0 && (
            <button
              id="clear-stickers-btn"
              onClick={handleClearAll}
              className="flex items-center gap-1 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-rose-300 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}

          <button
            id="save-scene-btn"
            onClick={handleSaveScene}
            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-md transition transform active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save Scene</span>
          </button>
        </div>
      </div>

      {/* Background Selector */}
      <div className="w-full flex items-center gap-2 overflow-x-auto pb-2 mb-3">
        <span className="text-xs font-bold text-amber-900 shrink-0">Backgrounds:</span>
        {STICKER_BACKGROUNDS.map((bg) => (
          <button
            id={`bg-select-${bg.id}`}
            key={bg.id}
            onClick={() => handleSelectBackground(bg.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              profile.activeStickerBackground === bg.id
                ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-400'
                : 'bg-white text-amber-900 border border-amber-200 hover:bg-amber-50'
            }`}
          >
            <span>{bg.icon}</span>
            <span>{bg.name}</span>
          </button>
        ))}
      </div>

      {/* Interactive Sticker Stage Canvas */}
      <div
        ref={canvasRef}
        id="sticker-canvas-stage"
        onClick={(e) => {
          if (e.target === canvasRef.current) {
            setSelectedPlacedId(null);
          }
        }}
        className={`relative w-full h-[320px] sm:h-[440px] rounded-3xl overflow-hidden border-4 border-amber-300 shadow-xl bg-linear-to-b ${activeBg.bgClass} select-none`}
      >
        {/* Scenery details */}
        <div className="absolute top-4 left-6 text-3xl opacity-50 select-none pointer-events-none">☁️</div>
        <div className="absolute top-8 right-12 text-2xl opacity-40 select-none pointer-events-none">✨</div>
        <div className="absolute top-3 right-5 text-4xl select-none pointer-events-none">☀️</div>

        {/* Ground */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-24 sm:h-32 border-t-4 ${activeBg.groundClass} rounded-t-[40px] opacity-90`}
        />

        {/* Empty Canvas Notice if no stickers placed */}
        {profile.placedStickers.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-4">
            <span className="text-5xl mb-2 animate-bounce">👇</span>
            <p className="font-display font-extrabold text-amber-950 text-base sm:text-lg">
              Your Safari Canvas is Ready!
            </p>
            <p className="text-xs sm:text-sm text-amber-800 max-w-xs">
              Tap any unlocked sticker below to add animal friends to this scene!
            </p>
          </div>
        )}

        {/* Placed Stickers */}
        {profile.placedStickers.map((ps) => {
          const stickerDef = STICKERS.find((s) => s.id === ps.stickerId);
          if (!stickerDef) return null;
          const isSelected = selectedPlacedId === ps.id;

          return (
            <motion.div
              id={`placed-sticker-${ps.id}`}
              key={ps.id}
              drag
              dragConstraints={canvasRef}
              onDragEnd={(e, info) => handleDragEnd(ps.id, e, info)}
              onClick={(e) => {
                e.stopPropagation();
                handleStickerClick(ps.id, ps.stickerId);
              }}
              style={{
                left: `${ps.xPercent}%`,
                top: `${ps.yPercent}%`,
                transform: `translate(-50%, -50%) rotate(${ps.rotation}deg) scale(${ps.scale})`,
              }}
              className={`absolute cursor-grab active:cursor-grabbing p-1 rounded-2xl select-none ${
                isSelected
                  ? 'ring-3 ring-amber-400 bg-white/40 shadow-lg'
                  : 'hover:scale-105'
              }`}
            >
              <div className="text-5xl sm:text-6xl drop-shadow-md">
                {stickerDef.animal.emoji}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Kid controls for selected sticker */}
      {selectedPlacedId && (
        <div className="mt-3 flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border-2 border-amber-300 shadow-md">
          <span className="text-xs font-bold text-amber-900 mr-1">Selected Animal:</span>
          <button
            id="sticker-rotate-btn"
            onClick={handleRotateSelected}
            className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1 transition"
            title="Rotate Animal"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Spin</span>
          </button>
          <button
            id="sticker-scale-up-btn"
            onClick={() => handleScaleSelected(0.15)}
            className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1 transition"
            title="Make Bigger"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>Bigger</span>
          </button>
          <button
            id="sticker-scale-down-btn"
            onClick={() => handleScaleSelected(-0.15)}
            className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1 transition"
            title="Make Smaller"
          >
            <ZoomOut className="w-3.5 h-3.5" />
            <span>Smaller</span>
          </button>
          <button
            id="sticker-delete-btn"
            onClick={handleDeleteSelected}
            className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold flex items-center gap-1 transition ml-1"
            title="Remove from Scene"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sticker Drawer Collection */}
      <div className="w-full mt-6 bg-white/90 rounded-3xl p-4 sm:p-5 border-3 border-amber-200 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-extrabold text-amber-950 text-base sm:text-lg flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>My Unlocked Stickers ({unlockedStickers.length})</span>
          </h3>
          <span className="text-xs font-bold text-amber-700">
            Solve math questions to unlock more!
          </span>
        </div>

        {/* Unlocked stickers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {unlockedStickers.map((sticker) => (
            <button
              id={`unlocked-sticker-${sticker.id}`}
              key={sticker.id}
              onClick={() => handlePlaceSticker(sticker.id)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 shadow-xs hover:shadow-md transition transform active:scale-95 cursor-pointer text-center group"
            >
              <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform">
                {sticker.animal.emoji}
              </span>
              <span className="font-display font-bold text-xs text-amber-950 mt-1.5 truncate max-w-full">
                {sticker.name}
              </span>
              <span className="text-[10px] text-amber-700 bg-amber-200/70 px-2 py-0.5 rounded-full mt-1">
                + Tap to Add
              </span>
            </button>
          ))}
        </div>

        {/* Locked Stickers Preview */}
        {lockedStickers.length > 0 && (
          <div className="mt-6 pt-4 border-t border-amber-200">
            <h4 className="font-display font-bold text-slate-500 text-xs sm:text-sm mb-2.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Upcoming Mystery Stickers</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {lockedStickers.map((sticker) => (
                <div
                  key={sticker.id}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 text-center opacity-70"
                >
                  <span className="text-4xl grayscale filter opacity-50">
                    {sticker.animal.emoji}
                  </span>
                  <span className="font-bold text-xs text-slate-600 mt-1.5">
                    {sticker.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold mt-1">
                    Need {sticker.requiredScore} correct ({profile.totalCorrect}/{sticker.requiredScore})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save confirmation toast */}
      {saveToast && (
        <div className="fixed bottom-6 z-50 bg-purple-700 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 animate-pop">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>Safari Scene Saved Successfully!</span>
        </div>
      )}
    </div>
  );
};
