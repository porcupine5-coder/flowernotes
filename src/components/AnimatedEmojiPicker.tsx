"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, GripHorizontal } from "lucide-react";
import { ANIMATED_EMOJI_OPTIONS, AnimatedEmojiDisplay } from "./AnimatedEmojiDisplay";

interface SelectedAnimatedEmoji {
  id: string;
  instanceId: string;
  x?: number;
  y?: number;
  size?: number;
}

interface AnimatedEmojiPickerProps {
  selectedEmojis: SelectedAnimatedEmoji[];
  onAddEmoji: (emojiId: string) => void;
  onRemoveEmoji: (instanceId: string) => void;
  onUpdatePosition?: (instanceId: string, x: number, y: number) => void;
  maxEmojis?: number;
}

export const AnimatedEmojiPicker: React.FC<AnimatedEmojiPickerProps> = ({
  selectedEmojis,
  onAddEmoji,
  onRemoveEmoji,
  onUpdatePosition,
  maxEmojis = 20,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const draggedEmojiRef = useRef<string | null>(null);

  const handleDragStart = (e: React.DragEvent, emojiId: string) => {
    draggedEmojiRef.current = emojiId;
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("application/json", JSON.stringify({ emojiId, type: "emoji" }));
  };

  const canAddMore = selectedEmojis.length < maxEmojis;

  return (
    <div className="space-y-3">
      {/* Picker toggle and count */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-600 flex items-center gap-1">
          <span className="text-lg">🎨</span> Animated Emojis
        </label>
        <span className="text-xs text-slate-400 font-medium">
          {selectedEmojis.length} / {maxEmojis}
        </span>
      </div>

      {/* Selected emojis display area */}
      {selectedEmojis.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-slate-100 min-h-24"
        >
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            Your Emojis (drag to reorder or remove)
          </p>
          <div className="flex flex-wrap gap-3">
            <AnimatePresence mode="popLayout">
              {selectedEmojis.map((selected) => {
                const emoji = ANIMATED_EMOJI_OPTIONS.find((e) => e.id === selected.id);
                return (
                  <motion.div
                    key={selected.instanceId}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group"
                  >
                    <div className="bg-white rounded-xl p-3 shadow-md border border-slate-100 flex items-center gap-2 hover:shadow-lg transition-shadow cursor-grab active:cursor-grabbing">
                      <GripHorizontal size={14} className="text-slate-300" />
                      <div className="w-8 h-8 flex items-center justify-center">
                        <AnimatedEmojiDisplay emojiId={selected.id} size={32} />
                      </div>
                      <span className="text-xs font-medium text-slate-600 max-w-20 truncate">
                        {emoji?.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveEmoji(selected.instanceId)}
                        className="ml-1 p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-400 hover:text-red-500"
                        title="Remove emoji"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Emoji selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          disabled={!canAddMore}
          className={`w-full px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all border-2 ${
            canAddMore
              ? "bg-white border-slate-100 text-slate-600 hover:border-purple-300 hover:bg-purple-50"
              : "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          <Plus size={18} />
          {canAddMore ? "Add Animated Emoji" : "Max emojis reached"}
        </button>

        {/* Picker dropdown */}
        <AnimatePresence>
          {showPicker && canAddMore && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-4"
            >
              <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                Click to add or drag to canvas
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-64 overflow-y-auto">
                {ANIMATED_EMOJI_OPTIONS.map((emoji) => (
                  <button
                    type="button"
                    key={emoji.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, emoji.id)}
                    onClick={() => {
                      onAddEmoji(emoji.id);
                      if (selectedEmojis.length + 1 >= maxEmojis) {
                        setShowPicker(false);
                      }
                    }}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 border-2 border-slate-100 hover:border-purple-300 transition-all flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing group hover:scale-110 active:scale-95"
                    title={`${emoji.label} (drag or click)`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center">
                      <AnimatedEmojiDisplay emojiId={emoji.id} size={28} />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 group-hover:text-purple-600 text-center truncate max-w-full">
                      {emoji.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Help text */}
      <p className="text-xs text-slate-400 flex items-center gap-1">
        <span>💡</span> Tip: Click to add emojis to your note or drag them directly onto the note canvas!
      </p>
    </div>
  );
};
