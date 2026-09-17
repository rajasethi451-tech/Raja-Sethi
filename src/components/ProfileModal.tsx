import React, { useState } from 'react';
import { UserPlus, Check, X, Trash2, Sparkles } from 'lucide-react';
import { DifficultyLevel, UserProfile } from '../types';
import { ANIMALS, getAnimalById } from '../data/animals';
import {
  getStoredProfiles,
  createNewProfile,
  deleteProfile,
  setActiveProfileId,
} from '../utils/storage';
import { soundEngine } from '../utils/audio';

interface ProfileModalProps {
  currentProfileId: string;
  onSelectProfile: (profile: UserProfile) => void;
  onClose: () => void;
}

const THEME_COLORS = [
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EA580C', // Orange
  '#06B6D4', // Cyan
  '#F43F5E', // Rose
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  currentProfileId,
  onSelectProfile,
  onClose,
}) => {
  const [profiles, setProfiles] = useState<UserProfile[]>(getStoredProfiles);
  const [isCreating, setIsCreating] = useState(false);

  // New profile form state
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState(5);
  const [newAvatar, setNewAvatar] = useState('panda');
  const [newColor, setNewColor] = useState(THEME_COLORS[2]);
  const [newDifficulty, setNewDifficulty] = useState<DifficultyLevel>('kindergarten');

  const handleSelect = (p: UserProfile) => {
    soundEngine.playSuccess();
    setActiveProfileId(p.id);
    onSelectProfile(p);
    onClose();
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    soundEngine.playBadgeUnlock();
    const created = createNewProfile(
      newName,
      newAge,
      newAvatar,
      newColor,
      newDifficulty
    );
    setProfiles(getStoredProfiles());
    setIsCreating(false);
    onSelectProfile(created);
    onClose();
  };

  const handleDelete = (id: string, name: string) => {
    if (profiles.length <= 1) {
      alert('You must have at least one player profile!');
      return;
    }
    if (window.confirm(`Delete profile for ${name}?`)) {
      soundEngine.playGentleBoing();
      deleteProfile(id);
      const remaining = getStoredProfiles();
      setProfiles(remaining);
      if (currentProfileId === id) {
        onSelectProfile(remaining[0]);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-amber-400 p-4 sm:p-5 flex items-center justify-between border-b-2 border-amber-300">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">👥</span>
            <div>
              <h3 className="font-display font-extrabold text-xl text-amber-950">
                Choose Player Profile
              </h3>
              <p className="text-xs font-bold text-amber-800">
                Keep separate progress & stickers for each child!
              </p>
            </div>
          </div>

          <button
            id="close-profile-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-amber-950 flex items-center justify-center transition shadow-xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-amber-50/40">
          {!isCreating ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profiles.map((p) => {
                  const avatar = getAnimalById(p.avatarAnimal);
                  const isCurrent = p.id === currentProfileId;

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelect(p)}
                      className={`p-3.5 rounded-2xl border-3 flex items-center justify-between gap-3 cursor-pointer transition transform active:scale-95 ${
                        isCurrent
                          ? 'bg-amber-100 border-amber-500 shadow-md ring-2 ring-amber-300'
                          : 'bg-white border-amber-200 hover:border-amber-400 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs border-2 border-white"
                          style={{ backgroundColor: p.themeColor }}
                        >
                          {avatar?.emoji || '🦁'}
                        </div>
                        <div>
                          <div className="font-display font-extrabold text-base text-amber-950 flex items-center gap-1.5">
                            <span>{p.name}</span>
                            {isCurrent && (
                              <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-amber-800 font-semibold">
                            Age {p.age} • ⭐ {p.stars} Stars
                          </div>
                          <div className="text-[10px] text-amber-600 capitalize">
                            Level: {p.difficulty.replace('_', ' ')}
                          </div>
                        </div>
                      </div>

                      {profiles.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(p.id, p.name);
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Create New Profile Button */}
              <button
                id="create-new-profile-btn"
                onClick={() => {
                  setIsCreating(true);
                  soundEngine.playTapCount(1);
                }}
                className="w-full py-3.5 rounded-2xl border-3 border-dashed border-amber-400 hover:border-amber-500 bg-amber-100/60 hover:bg-amber-100 text-amber-950 font-display font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-amber-700" />
                <span>+ Add New Explorer Profile</span>
              </button>
            </div>
          ) : (
            /* Creation Form */
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-amber-950 mb-1">
                  Explorer's Name:
                </label>
                <input
                  id="new-profile-name"
                  type="text"
                  required
                  maxLength={15}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Toby, Emma, Noah"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-amber-300 text-amber-950 font-bold focus:outline-none focus:border-amber-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1">
                    Age: {newAge} years old
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="9"
                    value={newAge}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setNewAge(val);
                      if (val <= 4) setNewDifficulty('toddler');
                      else if (val <= 6) setNewDifficulty('kindergarten');
                      else setNewDifficulty('early_elementary');
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1">
                    Starting Level:
                  </label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full px-2 py-2 rounded-xl border-2 border-amber-300 text-xs font-bold text-amber-950 bg-white focus:outline-none"
                  >
                    <option value="toddler">Toddler (1-5)</option>
                    <option value="kindergarten">Kindergarten (1-10)</option>
                    <option value="early_elementary">Elementary (1-20)</option>
                  </select>
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-amber-950 mb-1.5">
                  Choose Animal Avatar:
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {ANIMALS.slice(0, 10).map((animal) => (
                    <button
                      type="button"
                      key={animal.id}
                      onClick={() => {
                        setNewAvatar(animal.id);
                        soundEngine.playAnimalSound(animal.soundType);
                      }}
                      className={`p-2 rounded-xl text-2xl flex items-center justify-center transition border-2 cursor-pointer ${
                        newAvatar === animal.id
                          ? 'bg-amber-200 border-amber-500 scale-110 shadow-xs'
                          : 'bg-white border-amber-200 hover:bg-amber-100/50'
                      }`}
                    >
                      {animal.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Theme Selector */}
              <div>
                <label className="block text-xs font-bold text-amber-950 mb-1.5">
                  Favorite Color:
                </label>
                <div className="flex items-center gap-2">
                  {THEME_COLORS.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setNewColor(color)}
                      className={`w-7 h-7 rounded-full transition cursor-pointer border-2 ${
                        newColor === color
                          ? 'border-slate-800 scale-115 shadow-sm'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-amber-200">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-amber-900 hover:bg-amber-200/50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md transition transform active:scale-95 cursor-pointer"
                >
                  Save & Start Playing!
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
