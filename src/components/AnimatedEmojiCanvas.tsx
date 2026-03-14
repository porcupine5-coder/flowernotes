"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { AnimatedEmojiDisplay, ANIMATED_EMOJI_OPTIONS } from "./AnimatedEmojiDisplay";

interface DraggedEmoji {
  id: string;
  x: number;
  y: number;
  size: number;
}

interface AnimatedEmojiCanvasProps {
  emojis: DraggedEmoji[];
  onAddEmoji: (emoji: DraggedEmoji) => void;
  onRemoveEmoji: (id: string) => void;
  onUpdatePosition?: (id: string, x: number, y: number) => void;
  minWidth?: number;
  minHeight?: number;
  disabled?: boolean;
  reducedMotion?: boolean;
}

export const AnimatedEmojiCanvas: React.FC<AnimatedEmojiCanvasProps> = ({
  emojis,
  onAddEmoji,
  onRemoveEmoji,
  onUpdatePosition,
  minHeight = 200,
  disabled = false,
  reducedMotion = false,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedEmoji, setDraggedEmoji] = useState<{
    id: string;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();

    const data = e.dataTransfer.getData("application/json");
    if (!data) return;

    try {
      const { emojiId } = JSON.parse(data);
      if (!emojiId) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Clamp values to canvas bounds
      const clampedX = Math.max(0, Math.min(x, rect.width - 48));
      const clampedY = Math.max(0, Math.min(y, rect.height - 48));

      const newEmoji: DraggedEmoji = {
        id: `${emojiId}-${Date.now()}`,
        x: clampedX,
        y: clampedY,
        size: 48,
      };

      onAddEmoji(newEmoji);
    } catch (err) {
      console.error("Failed to parse dropped emoji:", err);
    }
  };

  const handleEmojiMouseDown = (e: React.MouseEvent, id: string, emoji: DraggedEmoji) => {
    if (disabled) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const offsetX = e.clientX - (emoji.x + rect.left);
    const offsetY = e.clientY - (emoji.y + rect.top);

    setDraggedEmoji({
      id,
      startX: e.clientX,
      startY: e.clientY,
      offsetX,
      offsetY,
    });
  };

  const handleMouseMoveNative = React.useCallback((e: MouseEvent) => {
    if (!draggedEmoji) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left - draggedEmoji.offsetX;
    let y = e.clientY - rect.top - draggedEmoji.offsetY;

    // Clamp to canvas
    x = Math.max(0, Math.min(x, rect.width - 48));
    y = Math.max(0, Math.min(y, rect.height - 48));

    onUpdatePosition?.(draggedEmoji.id, x, y);
  }, [draggedEmoji, onUpdatePosition]);

  const handleMouseUpNative = React.useCallback(() => {
    setDraggedEmoji(null);
  }, []);

  React.useEffect(() => {
    if (!draggedEmoji) return;

    window.addEventListener("mousemove", handleMouseMoveNative as EventListener);
    window.addEventListener("mouseup", handleMouseUpNative as EventListener);

    return () => {
      window.removeEventListener("mousemove", handleMouseMoveNative as EventListener);
      window.removeEventListener("mouseup", handleMouseUpNative as EventListener);
    };
  }, [draggedEmoji, handleMouseMoveNative, handleMouseUpNative]);

  const containerClass = `relative w-full rounded-2xl border-2 border-dashed transition-all ${
    disabled
      ? "border-slate-200 bg-slate-50 cursor-not-allowed"
      : "border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-400"
  }`;

  if (reducedMotion) {
    return (
      <div
        ref={canvasRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={containerClass}
        style={{ minHeight: `${minHeight}px` }}
      >
        {/* Grid background */}
        <div className="absolute inset-0 rounded-2xl opacity-5 pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "linear-gradient(to right, #9f7aea 1px, transparent 1px), linear-gradient(to bottom, #9f7aea 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Empty state */}
        {emojis.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl text-center pointer-events-none">
            <span className="text-4xl mb-2 opacity-20">ðŸŽ¨</span>
            <p className="text-sm text-slate-400 font-medium">
              {disabled ? "Canvas is disabled" : "Drag emojis here to add them to your note"}
            </p>
          </div>
        )}

        {emojis.map((emoji) => {
          const isBeingDragged = draggedEmoji?.id === emoji.id;
          return (
            <div
              key={emoji.id}
              className={`absolute left-0 top-0 w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg border-2 border-slate-100 ${
                disabled ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing"
              } group`}
              onMouseDown={(e) => handleEmojiMouseDown(e, emoji.id, emoji)}
              style={{
                transform: `translate3d(${emoji.x}px, ${emoji.y}px, 0)`,
                opacity: isBeingDragged ? 0.8 : 1,
                willChange: "transform",
              }}
            >
              <AnimatedEmojiDisplay emojiId={emoji.id.split("-")[0]} size={32} animate={false} />

              {!disabled && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveEmoji(emoji.id);
                  }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                  title="Remove emoji"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <motion.div
      ref={canvasRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={containerClass}
      style={{ minHeight: `${minHeight}px` }}
    >
      {/* Grid background */}
      <div className="absolute inset-0 rounded-2xl opacity-5 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(to right, #9f7aea 1px, transparent 1px), linear-gradient(to bottom, #9f7aea 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Empty state */}
      {emojis.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl text-center pointer-events-none">
          <span className="text-4xl mb-2 opacity-20">🎨</span>
          <p className="text-sm text-slate-400 font-medium">
            {disabled ? "Canvas is disabled" : "Drag emojis here to add them to your note"}
          </p>
        </div>
      )}

      {/* Animated emojis */}
      <AnimatePresence mode="popLayout">
        {emojis.map((emoji) => {
          const emojiOption = ANIMATED_EMOJI_OPTIONS.find((e) => e.id.includes(emoji.id.split("-")[0]));
          const isBeingDragged = draggedEmoji?.id === emoji.id;

          return (
            <motion.div
              key={emoji.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: isBeingDragged ? 0.8 : 1,
                scale: isBeingDragged ? 1.1 : 1,
                x: emoji.x,
                y: emoji.y,
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              className={`absolute w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg border-2 border-slate-100 ${
                disabled ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing"
              } group`}
              onMouseDown={(e) => handleEmojiMouseDown(e, emoji.id, emoji)}
              style={{ cursor: isBeingDragged ? "grabbing" : "grab" }}
            >
              <AnimatedEmojiDisplay emojiId={emoji.id.split("-")[0]} size={32} />

              {/* Remove button */}
              {!disabled && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveEmoji(emoji.id);
                  }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                  title="Remove emoji"
                >
                  <X size={12} />
                </button>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};
