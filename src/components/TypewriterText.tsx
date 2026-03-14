"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

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
  const prefersReduced = useReducedMotion();
  const [visibleCount, setVisibleCount] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const completedRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    completedRef.current = false;
    indexRef.current = 0;
    setIsTypingComplete(false);
    setVisibleCount(0);

    if (prefersReduced) {
      setVisibleCount(text.length);
      setIsTypingComplete(true);
      if (onComplete) onComplete();
      return;
    }

    const tick = () => {
      indexRef.current = Math.min(indexRef.current + 1, text.length);
      setVisibleCount(indexRef.current);

      if (indexRef.current >= text.length) {
        if (!completedRef.current) {
          completedRef.current = true;
          setIsTypingComplete(true);
          if (onComplete) onComplete();
        }
        return;
      }

      timeoutRef.current = window.setTimeout(tick, speed * 1000);
    };

    startRef.current = window.setTimeout(() => {
      timeoutRef.current = window.setTimeout(tick, speed * 1000);
    }, startDelay * 1000);

    return () => {
      if (startRef.current) window.clearTimeout(startRef.current);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [text, speed, startDelay, onComplete, prefersReduced]);

  return (
    <div className={`relative inline-block ${className}`}>
      <span aria-label={text} className="whitespace-pre-wrap break-words inline">
        {text.slice(0, visibleCount)}
      </span>
      
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
