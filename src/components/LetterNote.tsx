"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TypewriterText } from "./TypewriterText";
import { Bouquet } from "./Bouquet";
import { Lock, Globe, Mail } from "lucide-react";

interface LetterNoteProps {
  recipient: string;
  message: string;
  flowers: string[];
  stampEmoji: string;
  isPublic: boolean;
  drawingUrl?: string;
  animatedEmojis?: any[];
  enableHover?: boolean;
}

export const LetterNote: React.FC<LetterNoteProps> = ({
  recipient,
  message,
  flowers,
  stampEmoji,
  isPublic,
  drawingUrl,
  animatedEmojis,
  enableHover = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Paper texture styling mixed with a slight warm gradient
  const paperBackground = {
    background: `
      linear-gradient(rgba(244, 237, 222, 0.95), rgba(244, 237, 222, 0.95)),
      url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")
    `,
    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1), inset 0 0 20px rgba(0,0,0,0.05)",
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8 perspective-1000 relative z-20">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          // ENVELOPE (CLOSED) STATE
          <motion.div
            key="envelope"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 1.05, opacity: 0, transition: { duration: 0.3 } }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsOpen(true)}
            className="cursor-pointer mx-auto relative group w-full sm:w-[500px] h-[300px] bg-amber-50 rounded-lg shadow-xl border border-amber-200/50 flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Envelope Flap Illusion */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-amber-100/50 clip-bottom border-b border-amber-200" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}></div>

            <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
               className="relative z-10 flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center text-3xl border-2 border-amber-100">
                {stampEmoji}
              </div>
              <span className="font-bold text-amber-900 bg-white/50 px-4 py-1.5 rounded-full backdrop-blur-sm text-sm tracking-wide shadow-sm flex items-center gap-2">
                <Mail size={16} /> Tap to unseal the letter
              </span>
            </motion.div>

            {/* Hint of flowers poking out */}
             <div className="absolute -bottom-10 opacity-30 group-hover:opacity-50 transition-opacity">
                <Bouquet 
                  flowers={flowers.slice(0, 3)} 
                  containerSize="sm"
                />
             </div>
          </motion.div>
        ) : (
          // OPEN LETTER STATE
          <motion.div
            key="letter"
            initial={{ rotateX: 90, opacity: 0, y: 50, scale: 0.9 }}
            animate={{ rotateX: 0, opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", damping: 18, stiffness: 100 }}
            style={{ ...paperBackground, transformOrigin: "bottom" }}
            className="rounded-md p-8 sm:p-12 relative overflow-hidden"
          >
            {/* Soft edge burning / vintage effect */}
            <div className="absolute inset-0 pointer-events-none rounded-md shadow-[inset_0_0_100px_rgba(139,69,19,0.1)]"></div>
            
            {/* Header: Bouquet & Stamp */}
            <div className="flex justify-between items-start mb-8 sm:mb-12 relative z-10">
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="flex-1"
              >
                 <Bouquet 
                   flowers={flowers} 
                   containerSize="lg"
                   enableHover={enableHover}
                 />
              </motion.div>
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.7, type: "spring" }}
                className="text-5xl opacity-80 flex-shrink-0 drop-shadow-md bg-white/20 p-4 rounded-full"
              >
                {stampEmoji}
              </motion.div>
            </div>

            {/* Typography / Message content block */}
            <div className="relative z-10 max-w-prose text-slate-800">
              <motion.h3 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="text-2xl sm:text-3xl font-serif italic mb-6 text-amber-950 font-bold border-b border-amber-900/10 pb-4 inline-block pr-10"
              >
                Dear {recipient},
              </motion.h3>

              <div className="text-lg sm:text-xl leading-[1.8] font-medium text-slate-700 font-serif min-h-[120px]">
                <TypewriterText 
                  text={message} 
                  speed={0.03} 
                  startDelay={1.5}
                />
              </div>

              {animatedEmojis && animatedEmojis.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 + message.length * 0.03 }}
                  className="mt-12 flex flex-wrap gap-3 p-4 bg-white/40 rounded-xl"
                >
                  {animatedEmojis.map((emoji) => (
                    <motion.div
                      key={emoji.id}
                      animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 2.5 + Math.random() }}
                      className="w-12 h-12 flex items-center justify-center bg-white/60 rounded-full shadow-sm"
                    >
                      <span className="text-2xl">✨</span> {/* Fallback visual if display missing */}
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {drawingUrl && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.8 + message.length * 0.03 }}
                  className="mt-12"
                >
                  <p className="text-xs text-amber-900/40 uppercase tracking-widest font-bold mb-4 font-sans">
                    A handmade doodle
                  </p>
                  <img
                    src={drawingUrl}
                    alt="Custom drawing attached to letter"
                    className="max-h-40 object-contain drop-shadow-md mix-blend-multiply opacity-80"
                  />
                </motion.div>
              )}

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 + message.length * 0.03 }}
                className="mt-12 flex items-center gap-2 text-xs text-slate-400 font-sans border-t border-amber-900/10 pt-6"
              >
                {isPublic ? (
                  <><Globe size={12} /> Stored in public archives</>
                ) : (
                  <><Lock size={12} /> Secured tightly</>
                )}
              </motion.div>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
