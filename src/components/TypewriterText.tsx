"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TypewriterTextProps {
  text: string;
  speed?: number; // Delay between characters in seconds
  className?: string;
  onComplete?: () => void;
  startDelay?: number;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 0.04,
  className = "",
  onComplete,
  startDelay = 0.5,
}) => {
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // Split text into characters, keeping spaces intact
  const characters = Array.from(text);

  useEffect(() => {
    // Calculate total duration roughly to trigger complete callback
    const totalDuration = startDelay + characters.length * speed;
    const timeout = setTimeout(() => {
      setIsTypingComplete(true);
      if (onComplete) onComplete();
    }, totalDuration * 1000 + 500); // 500ms buffer after typing ends

    return () => clearTimeout(timeout);
  }, [characters.length, speed, startDelay, onComplete]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: speed,
        delayChildren: startDelay,
      },
    },
  };

  const characterVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <motion.p
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        aria-label={text}
        className="whitespace-pre-wrap break-words inline"
      >
        {characters.map((char, index) => (
          <motion.span
            key={`${char}-${index}`}
            variants={characterVariants}
            aria-hidden="true"
            // Make spaces render properly
            className={char === " " ? "inline-block w-[0.25em]" : "inline-block"}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.p>
      
      {/* Blinking cursor effect */}
      {!isTypingComplete && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: [1, 0, 1] }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          className="inline-block w-2 bg-slate-400 h-[1em] ml-1 align-baseline translate-y-1"
        />
      )}
    </div>
  );
};
