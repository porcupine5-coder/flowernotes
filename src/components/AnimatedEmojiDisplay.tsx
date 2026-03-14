"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

// Available animated emojis with custom animation configs
export const ANIMATED_EMOJI_OPTIONS = [
  { id: "heart", label: "Beating Heart", emoji: "❤️", animation: "pulse" },
  { id: "fire", label: "Fire", emoji: "🔥", animation: "bounce" },
  { id: "smile", label: "Smiling Face", emoji: "😊", animation: "rotate" },
  { id: "sparkles", label: "Sparkles", emoji: "✨", animation: "twinkle" },
  { id: "clapping", label: "Clapping Hands", emoji: "👏", animation: "bounce" },
  { id: "kiss", label: "Kiss Mark", emoji: "💋", animation: "pulse" },
  { id: "rainbow", label: "Rainbow", emoji: "🌈", animation: "rotate" },
  { id: "butterfly", label: "Butterfly", emoji: "🦋", animation: "float" },
  { id: "star", label: "Glowing Star", emoji: "⭐", animation: "twinkle" },
  { id: "flower", label: "Flower", emoji: "🌸", animation: "pulse" },
  { id: "rose", label: "Rose", emoji: "🌹", animation: "rotate" },
  { id: "sunflower", label: "Sunflower", emoji: "🌻", animation: "rotate" },
];

interface AnimatedEmojiDisplayProps {
  emojiId: string;
  size?: number;
  className?: string;
  animate?: boolean;
}

export const AnimatedEmojiDisplay: React.FC<AnimatedEmojiDisplayProps> = ({
  emojiId,
  size = 40,
  className = "",
  animate = true,
}) => {
  const emoji = ANIMATED_EMOJI_OPTIONS.find((e) => e.id === emojiId);
  const prefersReduced = useReducedMotion();

  if (!emoji) {
    return <span className={`inline-block text-2xl ${className}`}>❓</span>;
  }

  // Animation definitions
  const getAnimation = (type: string) => {
    switch (type) {
      case "pulse":
        return { scale: [1, 1.15, 1] };
      case "bounce":
        return { y: [0, -10, 0] };
      case "rotate":
        return { rotate: [0, 15, -15, 0] };
      case "twinkle":
        return { opacity: [1, 0.4, 1] };
      case "float":
        return { y: [0, -8, 0], x: [0, 4, -4, 0] };
      default:
        return { scale: [1, 1.05, 1] };
    }
  };

  // Duration for each animation type
  const getDuration = (type: string) => {
    switch (type) {
      case "pulse":
        return 1.5;
      case "bounce":
        return 0.8;
      case "rotate":
        return 2;
      case "twinkle":
        return 1.2;
      case "float":
        return 3;
      default:
        return 1;
    }
  };

  const shouldAnimate = animate && !prefersReduced;

  if (!shouldAnimate) {
    return (
      <span
        className={`inline-block select-none ${className}`}
        style={{
          fontSize: size,
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {emoji.emoji}
      </span>
    );
  }

  return (
    <motion.div
      className={`inline-block select-none ${className}`}
      style={{
        fontSize: size,
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      animate={getAnimation(emoji.animation)}
      transition={{
        duration: getDuration(emoji.animation),
        repeat: Infinity,
        repeatType: "loop" as const,
      }}
    >
      {emoji.emoji}
    </motion.div>
  );
};
