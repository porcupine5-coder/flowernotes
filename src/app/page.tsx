"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useReducedMotion } from "framer-motion";
import {
  Heart,
  Sparkles,
  Send,
  PenTool,
  CheckCircle,
  Share2,
  ArrowLeft,
  Download,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Copy,
  X,
  Flower2,
  Palette,
  Eraser,
  Plus,
  Minus,
} from "lucide-react";
import QRCode from "react-qr-code";
import SignatureCanvas from "react-signature-canvas";
import { AdvancedColorPicker } from "@/components/AdvancedColorPicker";
import { Bouquet } from "@/components/Bouquet";
import { AnimatedEmojiPicker } from "@/components/AnimatedEmojiPicker";
import { AnimatedEmojiCanvas } from "@/components/AnimatedEmojiCanvas";
import { LetterNote } from "@/components/LetterNote";

/* -------------------------------------------------------
   TYPES & MOCK DATA
------------------------------------------------------- */
interface AnimatedEmoji {
  id: string;
  x: number;
  y: number;
  size: number;
}

interface SavedNote {
  id: string;
  recipient: string;
  message: string;
  flowers: string[];
  stamp: string;
  isPublic: boolean;
  drawingUrl?: string;
  animatedEmojis?: AnimatedEmoji[];
  createdAt: Date;
}

const FLOWER_OPTIONS = [
  { value: "rose", emoji: "🌹", label: "Rose" },
  { value: "sunflower", emoji: "🌻", label: "Sunflower" },
  { value: "tulip", emoji: "🌷", label: "Tulip" },
  { value: "cherry", emoji: "🌸", label: "Cherry Blossom" },
  { value: "hibiscus", emoji: "🌺", label: "Hibiscus" },
  { value: "daisy", emoji: "🌼", label: "Daisy" },
  { value: "lily", emoji: "💮", label: "Lily" },
  { value: "lotus", emoji: "🪷", label: "Lotus" },
  { value: "water-lily", emoji: "🪷", label: "Water Lily" },
  { value: "lavender", emoji: "💜", label: "Lavender" },
  { value: "clover", emoji: "🍀", label: "Clover" },
  { value: "herb", emoji: "🌿", label: "Eucalyptus" },
  { value: "palm", emoji: "🌴", label: "Palm Leaf" },
  { value: "seedling", emoji: "🌱", label: "Seedling" },
];

const STAMP_OPTIONS = [
  { value: "heart", emoji: "💖", label: "Glowing Heart" },
  { value: "star", emoji: "✨", label: "Magic Sparkles" },
  { value: "kiss", emoji: "💋", label: "Kiss Mark" },
  { value: "gift", emoji: "🎁", label: "Surprise Gift" },
  { value: "butterfly", emoji: "🦋", label: "Butterfly" },
  { value: "rainbow", emoji: "🌈", label: "Rainbow" },
];

// Memoized flower button to prevent unnecessary re-renders
const FlowerButton = React.memo(({
  flower,
  isSelected,
  onClick,
}: {
  flower: typeof FLOWER_OPTIONS[0];
  isSelected: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-2.5 rounded-xl text-center transition-all border-2 group ${
        isSelected
          ? "border-[#14b8a6] bg-[#14b8a6]/5 shadow-md"
          : "border-slate-100 bg-slate-50/50 hover:border-slate-200"
      }`}
      title={flower.label}
    >
      <span className="text-2xl block">{flower.emoji}</span>
      <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block truncate">{flower.label}</span>
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#14b8a6] text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow"
        >
          ✓
        </motion.div>
      )}
    </button>
  );
}, (prev, next) => {
  return prev.isSelected === next.isSelected && prev.flower === next.flower;
});

FlowerButton.displayName = "FlowerButton";

// Memoized stamp button to prevent unnecessary re-renders
const StampButton = React.memo(({
  stamp,
  isSelected,
  onClick,
}: {
  stamp: typeof STAMP_OPTIONS[0];
  isSelected: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-2.5 rounded-xl text-center transition-all border-2 ${
        isSelected
          ? "border-[#e11d48] bg-[#e11d48]/5 shadow-md"
          : "border-slate-100 bg-slate-50/50 hover:border-slate-200"
      }`}
      title={stamp.label}
    >
      <span className="text-2xl block">{stamp.emoji}</span>
      <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block truncate">{stamp.label}</span>
    </button>
  );
}, (prev, next) => {
  return prev.isSelected === next.isSelected && prev.stamp === next.stamp;
});

StampButton.displayName = "StampButton";
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    if ("addEventListener" in media) {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }
    (media as any).addListener(update);
    return () => (media as any).removeListener(update);
  }, [query]);

  return matches;
};

/* PEN_COLORS kept as fallback initial */
const INITIAL_PEN_COLOR = "#e11d48";

/* -------------------------------------------------------
   SOME FAKE PUBLIC NOTES
------------------------------------------------------- */
const INITIAL_PUBLIC_NOTES: SavedNote[] = [
  {
    id: "abc1",
    recipient: "Sarah",
    message: "You light up my world more than all the stars in the universe. Every moment with you is pure magic. ✨",
    flowers: ["rose", "cherry"],
    stamp: "heart",
    isPublic: true,
    createdAt: new Date("2024-03-10T12:00:00Z"),
  },
  {
    id: "abc2",
    recipient: "Mom",
    message: "Thank you for everything you do. Your love and warmth make every day brighter. I love you to the moon and back! 🌙",
    flowers: ["sunflower", "daisy", "herb"],
    stamp: "star",
    isPublic: true,
    createdAt: new Date("2024-03-09T14:30:00Z"),
  },
  {
    id: "abc3",
    recipient: "Best Friend",
    message: "Life is so much better because you're in it. Here's a little flower and a big hug from me to you! 🦋",
    flowers: ["tulip"],
    stamp: "butterfly",
    isPublic: true,
    createdAt: new Date("2024-03-08T09:15:00Z"),
  },
  {
    id: "abc4",
    recipient: "My Love",
    message: "I fall more in love with you every single day. You're the most beautiful chapter of my life. 💐",
    flowers: ["cherry", "rose", "tulip", "hibiscus"],
    stamp: "kiss",
    isPublic: true,
    createdAt: new Date("2024-03-07T18:45:00Z"),
  },
];

/* -------------------------------------------------------
   ANIMATED FLOATING ELEMENTS
------------------------------------------------------- */
const FloatingFlowers = ({ enabled = true, density = 10 }: { enabled?: boolean; density?: number }) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const baseItems = ["🌹", "🌻", "🌷", "🌸", "🌺", "💐", "💖", "✨", "🦋", "🌈"];
  const items = useMemo(() => {
    const sliced = baseItems.slice(0, Math.min(density, baseItems.length));
    return sliced.map((item, i) => ({
      item,
      left: 5 + i * 9 + Math.random() * 4,
      top: 58 + Math.random() * 28,
      yTravel: 520 + Math.random() * 380,
      xDrift: (i % 2 === 0 ? 1 : -1) * (20 + Math.random() * 40),
      duration: 8 + Math.random() * 6,
      delay: i * 1.1,
    }));
  }, [density]);

  if (!enabled) return null;
  if (!mounted) return <div className="absolute inset-0 pointer-events-none" />;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {items.map((cfg, i) => (
        <motion.div
          key={`${cfg.item}-${i}`}
          className="absolute text-2xl sm:text-3xl select-none"
          style={{
            left: `${cfg.left}%`,
            top: `${cfg.top}%`,
          }}
          animate={{
            y: [0, -cfg.yTravel],
            x: [0, cfg.xDrift],
            rotate: [0, 360],
            opacity: [0, 0.8, 0.6, 0],
          }}
          transition={{
            duration: cfg.duration,
            repeat: Infinity,
            delay: cfg.delay,
            ease: "easeOut",
          }}
        >
          {cfg.item}
        </motion.div>
      ))}
    </div>
  );
};
/* -------------------------------------------------------
   TOAST NOTIFICATION
------------------------------------------------------- */
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 40, scale: 0.95 }}
    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0f172a] text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-medium text-sm"
  >
    <CheckCircle size={18} className="text-[#14b8a6] shrink-0" />
    <span>{message}</span>
    <button onClick={onClose} className="ml-2 hover:bg-white/10 p-1 rounded-full transition-colors">
      <X size={14} />
    </button>
  </motion.div>
);

/* -------------------------------------------------------
   CANVAS WRAPPER (SSR-safe)
------------------------------------------------------- */
const CanvasWrapper = ({
  canvasRef,
  onEnd,
  penColor,
  brushSize,
}: {
  canvasRef: React.RefObject<SignatureCanvas | null>;
  onEnd: () => void;
  penColor: string;
  brushSize: number;
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted)
    return <div className="h-48 bg-slate-100 rounded-xl animate-pulse" />;

  return (
    <div className="border-2 border-dashed border-slate-200 rounded-xl bg-white overflow-hidden shadow-inner relative group">
      <SignatureCanvas
        ref={canvasRef as any}
        penColor={penColor}
        minWidth={brushSize}
        maxWidth={brushSize}
        canvasProps={{
          className: "w-full h-48 sm:h-64 cursor-crosshair touch-none",
        }}
        onEnd={onEnd}
      />
      <div className="absolute bottom-2 right-2 text-xs text-slate-300 pointer-events-none flex items-center gap-1 group-hover:text-slate-400 transition-colors">
        <PenTool size={12} /> Draw freely with cursor or finger
      </div>
    </div>
  );
};

/* -------------------------------------------------------
   NOTE CARD COMPONENT
------------------------------------------------------- */
const NoteCard = ({ note, index, enableHover = true }: { note: SavedNote; index: number; enableHover?: boolean }) => {
  const reduceMotion = useReducedMotion();
  const allowHover = enableHover && !reduceMotion;
  const stampEmoji = STAMP_OPTIONS.find((s) => s.value === note.stamp)?.emoji || "💖";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { delay: index * 0.1, type: "spring", damping: 20 }}
      whileHover={allowHover ? { y: -6, scale: 1.02 } : undefined}
      className={`bg-white rounded-2xl shadow-md ${allowHover ? "hover:shadow-xl" : ""} transition-all border border-slate-100 overflow-hidden group cursor-default`}
    >
      <div className="h-2 bg-gradient-to-r from-[#0f766e] via-[#14b8a6] to-[#e11d48]" />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3 gap-3">
          <div className="flex-1 h-20">
            <Bouquet 
              flowers={(note.flowers || []).slice(0, 5)} 
              containerSize="sm"
              enableHover={enableHover}
            />
          </div>
          <span className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0">
            {stampEmoji}
          </span>
        </div>
        <h4 className="font-bold text-slate-800 mb-1 text-sm">To: {note.recipient}</h4>
        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
          {note.message}
        </p>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            {note.isPublic ? <Globe size={12} /> : <Lock size={12} />}
            {note.isPublic ? "Public" : "Private"}
          </span>
          <span>
            {note.createdAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

/* -------------------------------------------------------
   MAIN APP
------------------------------------------------------- */
export default function FlowerNotesApp() {
  const [step, setStep] = useState<"landing" | "compose" | "processing" | "result">("landing");
  const [mounted, setMounted] = useState(false);

  // Form
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [selectedFlowers, setSelectedFlowers] = useState<string[]>(["rose"]);
  const [stamp, setStamp] = useState("heart");
  const [hasDrawing, setHasDrawing] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [penColor, setPenColor] = useState(INITIAL_PEN_COLOR);
  const [brushSize, setBrushSize] = useState(2);
  const [activeTool, setActiveTool] = useState<"pen" | "eraser">("pen");
  const [animatedEmojis, setAnimatedEmojis] = useState<AnimatedEmoji[]>([]);
  const sigCanvas = useRef<SignatureCanvas | null>(null);

  // Processing
  const [progress, setProgress] = useState(0);

  // Result
  const [savedQRUrl, setSavedQRUrl] = useState("");
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>(INITIAL_PUBLIC_NOTES);

  // Toast
  const [toastMsg, setToastMsg] = useState("");

  // Gallery
  const [showGallery, setShowGallery] = useState(false);

  const reduceMotion = useReducedMotion();
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");
  const enableHover = canHover && !reduceMotion;
  const showFloating = !reduceMotion && !isSmallScreen;
  const floatingDensity = isSmallScreen ? 5 : 10;
  const processingDecorCount = reduceMotion ? 0 : (isSmallScreen ? 4 : 8);

  // Mouse parallax for hero
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const heroX = useTransform(mouseX, [0, 1], [-15, 15]);
  const heroY = useTransform(mouseY, [0, 1], [-15, 15]);

  useEffect(() => {
    setMounted(true);
    if (!canHover || reduceMotion) {
      mouseX.set(0.5);
      mouseY.set(0.5);
      return;
    }
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", handleMouseMove as EventListener);
    return () => window.removeEventListener("mousemove", handleMouseMove as EventListener);
  }, [mouseX, mouseY, canHover, reduceMotion]);

  useEffect(() => {
    if (step !== "processing") return;
    let curr = 0;
    const interval = setInterval(() => {
      curr += Math.floor(Math.random() * 15) + 5;
      if (curr >= 100) {
        setProgress(100);
        clearInterval(interval);
        const id = Math.random().toString(36).substring(2, 9);
        setSavedQRUrl(`https://flowernotes.vercel.app/note/${id}`);

        // Save note
        const drawUrl = sigCanvas.current && hasDrawing
          ? sigCanvas.current.getTrimmedCanvas().toDataURL("image/png")
          : undefined;
        const newNote: SavedNote = {
          id,
          recipient,
          message,
          flowers: selectedFlowers,
          stamp,
          isPublic,
          drawingUrl: drawUrl,
          animatedEmojis: animatedEmojis.length > 0 ? animatedEmojis : undefined,
          createdAt: new Date(),
        };
        setSavedNotes((prev) => [newNote, ...prev]);

        setTimeout(() => setStep("result"), 700);
      } else {
        setProgress(curr);
      }
    }, 350);
    return () => clearInterval(interval);
  }, [step, recipient, message, selectedFlowers, stamp, isPublic, hasDrawing]);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  }, []);

  const handleCopy = useCallback(() => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(savedQRUrl).then(() => {
        showToast("Link copied to clipboard!");
      });
    } else {
      // Fallback for non-secure contexts (http://localhost)
      const textarea = document.createElement("textarea");
      textarea.value = savedQRUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      showToast("Link copied to clipboard!");
    }
  }, [savedQRUrl, showToast]);

  const handleClearDrawing = useCallback(() => {
    sigCanvas.current?.clear();
    setHasDrawing(false);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !message.trim()) return;
    setStep("processing");
    setProgress(0);
  }, [recipient, message]);

  const addFlower = useCallback((value: string) => {
    setSelectedFlowers((prev) => [...prev, value]);
  }, []);

  const removeFlower = useCallback((index: number) => {
    setSelectedFlowers((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddAnimatedEmoji = (emojiId: string) => {
    const newEmoji: AnimatedEmoji = {
      id: `${emojiId}-${Date.now()}`,
      x: Math.random() * 200,
      y: Math.random() * 150,
      size: 48,
    };
    setAnimatedEmojis((prev) => [...prev, newEmoji]);
  };

  const handleRemoveAnimatedEmoji = (instanceId: string) => {
    setAnimatedEmojis((prev) => prev.filter((e) => e.id !== instanceId));
  };

  const handleUpdateEmojiPosition = (instanceId: string, x: number, y: number) => {
    setAnimatedEmojis((prev) =>
      prev.map((e) => (e.id === instanceId ? { ...e, x, y } : e))
    );
  };

  const resetForm = () => {
    setStep("landing");
    setRecipient("");
    setMessage("");
    setSelectedFlowers(["rose"]);
    setStamp("heart");
    setHasDrawing(false);
    setIsPublic(true);
    setProgress(0);
    setAnimatedEmojis([]);
  };

  const bouquetEmojis = selectedFlowers.map(
    (fv) => FLOWER_OPTIONS.find((f) => f.value === fv)?.emoji || "🌹"
  );
  const stampEmoji = STAMP_OPTIONS.find((s) => s.value === stamp)?.emoji || "💖";

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-[#0f172a] font-sans overflow-x-hidden selection:bg-[#14b8a6]/30 relative">
      {/* -------------------- GLOBAL BACKGROUND -------------------- */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full bg-gradient-to-br from-[#14b8a6]/15 to-transparent blur-[100px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-gradient-to-tl from-[#e11d48]/8 to-transparent blur-[100px]" />
        <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] rounded-full bg-gradient-to-t from-[#7c3aed]/6 to-transparent blur-[80px]" />
      </div>

      {/* ------------------------ HEADER ------------------------ */}
      <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-xl border-b border-white/80 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <button onClick={resetForm} className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-[#0f766e] to-[#14b8a6] rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Flower2 className="text-white" size={18} />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-[#0f172a]">
              Flower<span className="text-[#14b8a6]">Notes</span>
            </span>
          </button>

          <nav className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => { setShowGallery(!showGallery); if (step !== "landing") setStep("landing"); }}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                showGallery
                  ? "bg-[#0f766e] text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Eye size={14} /> Explore
              </span>
            </button>
            <button
              onClick={() => { setShowGallery(false); setStep("compose"); }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-full text-sm font-semibold bg-[#14b8a6] text-white hover:bg-[#0d9488] transition-all shadow-md flex items-center gap-1.5 justify-center"
            >
              <Send size={14} /> New Note
            </button>
          </nav>
        </div>
      </header>

      {/* --------------------- MAIN CONTENT --------------------- */}
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 relative">
        <AnimatePresence mode="wait">
          {/* ---------------------- GALLERY ---------------------- */}
          {showGallery && step === "landing" && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-10">
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#0f766e] to-[#14b8a6] bg-clip-text text-transparent mb-3"
                >
                  Love Notes Gallery
                </motion.h2>
                <p className="text-slate-500 text-lg max-w-md mx-auto">
                  Browse beautiful notes shared publicly by people around the world 💐.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {savedNotes
                  .filter((n) => n.isPublic)
                  .map((note, i) => (
                    <NoteCard key={note.id} note={note} index={i} enableHover={enableHover} />
                  ))}
              </div>

              {savedNotes.filter((n) => n.isPublic).length === 0 && (
                <div className="text-center py-20 text-slate-400">
                  <Flower2 size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="font-medium">No public notes yet. Be the first to share!</p>
                </div>
              )}
            </motion.div>
          )}

          {/* -------------------- LANDING HERO -------------------- */}
          {!showGallery && step === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {/* Floating flowers */}
              <FloatingFlowers enabled={showFloating} density={floatingDensity} />

              <div className="flex flex-col items-center justify-center min-h-[70vh] text-center relative z-10">
                {/* Hero icon with parallax - Professional animated illustration */}
                <motion.div style={{ x: heroX, y: heroY }} className="mb-10 relative">
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="relative w-40 h-40 flex items-center justify-center"
                  >
                    {/* Animated pulsing rings */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-[#14b8a6]/40"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-[#0f766e]/25"
                      animate={{ scale: [1.2, 1.5, 1.2] }}
                      transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.2 }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-[#e11d48]/20"
                      animate={{ scale: [0.8, 1.1, 0.8] }}
                      transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut", delay: 0.4 }}
                    />
                    
                    {/* Main card with icon */}
                    <div className="w-32 h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center border border-slate-50 relative z-10">
                      {/* Professional heart icon */}
                      <Heart className="text-[#e11d48] w-16 h-16" fill="#e11d48" />
                    </div>
                  </motion.div>

                  {/* Free badge - professional style */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    className="absolute -top-6 -right-6 bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white text-xs px-3.5 py-1.5 rounded-full shadow-lg font-bold flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 bg-white rounded-full" /> Complimentary
                  </motion.div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight"
                >
                  <span className="bg-gradient-to-r from-[#0f766e] via-[#14b8a6] to-[#0f766e] bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_4s_ease_infinite]">
                    Send Love,
                  </span>
                  <br />
                  <span className="text-[#0f172a]">
                    Beautifully.
                  </span>
                </motion.h1>

                <motion.p
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.35 }}
                   className="text-lg md:text-xl text-slate-500 max-w-xl mx-auto mb-12 leading-relaxed"
                 >
                   Create personalized love notes adorned with beautiful flowers, decorative elements, and your own drawings. Share instantly via a unique <strong className="text-[#0f766e]">QR code</strong>.
                 </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row items-center gap-4"
                >
                  <button
                    onClick={() => setStep("compose")}
                    className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-[#0f766e] to-[#115e59] text-white px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-[#0f766e]/30 hover:-translate-y-1 transition-all overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Create Your Note
                      <Send size={20} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", repeatDelay: 1 }}
                    />
                  </button>

                  <button
                    onClick={() => setShowGallery(true)}
                    className="flex items-center gap-2 text-slate-500 hover:text-[#0f766e] font-semibold transition-colors px-6 py-4"
                  >
                    <Eye size={18} /> Explore Gallery
                  </button>
                </motion.div>

                {/* Feature pills */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-wrap items-center justify-center gap-3 mt-16"
                >
                  {[
                    { label: "Virtual Flowers", icon: Flower2 },
                    { label: "Free Drawing", icon: PenTool },
                    { label: "QR Sharing", icon: Share2 },
                    { label: "Privacy Controls", icon: Lock },
                    { label: "Instant Generation", icon: Sparkles }
                  ].map(
                    (feat, idx) => {
                      const IconComponent = feat.icon;
                      return (
                        <span
                          key={idx}
                          className="bg-white/70 backdrop-blur-sm border border-slate-100 text-slate-600 text-xs font-semibold px-4 py-2.5 rounded-full shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex items-center gap-2"
                        >
                          <IconComponent size={14} className="text-[#14b8a6]" />
                          {feat.label}
                        </span>
                      );
                    }
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ---------------------- COMPOSE ---------------------- */}
          {step === "compose" && (
            <motion.div
              key="compose"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30, filter: "blur(6px)" }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl mx-auto"
            >
              <button
                onClick={resetForm}
                className="flex items-center gap-2 text-slate-400 hover:text-[#0f766e] transition-colors mb-6 font-semibold text-sm"
              >
                <ArrowLeft size={16} /> Back to home
              </button>

              <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-xl shadow-slate-200/50 p-6 md:p-10 border border-white/80">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-gradient-to-br from-[#14b8a6]/10 to-[#0f766e]/10 p-3.5 rounded-2xl">
                    <PenTool className="text-[#0f766e]" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#0f172a]">Compose your note</h2>
                    <p className="text-slate-400 text-sm">Make it personal and special</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-7">
                  {/* Recipient */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 block">Who is this for?</label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="E.g., My amazing partner"
                      className="w-full bg-slate-50/80 border-2 border-slate-100 rounded-xl px-4 py-3.5 outline-none focus:border-[#14b8a6] focus:bg-white focus:shadow-md transition-all text-slate-800 font-medium placeholder:text-slate-300"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 block">Your heartwarming message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your feelings here... let your heart speak"
                      rows={4}
                      className="w-full bg-slate-50/80 border-2 border-slate-100 rounded-xl px-4 py-3.5 outline-none focus:border-[#14b8a6] focus:bg-white focus:shadow-md transition-all text-slate-800 resize-none font-medium placeholder:text-slate-300"
                      required
                    />
                  </div>

                  {/* ── Flower Picker (multi-select bouquet) ── */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-600 flex items-center gap-1">
                        <Flower2 size={14} /> Pick Your Flowers
                      </label>
                      <span className="text-xs text-slate-400 font-medium">
                        {selectedFlowers.length} selected · tap to add/remove
                      </span>
                    </div>

                    {/* Bouquet Preview */}
                     {selectedFlowers.length > 0 && (
                       <div className="bg-gradient-to-br from-pink-50 to-emerald-50 rounded-2xl p-6 border border-slate-100">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Your Bouquet</p>
                         <div className="flex justify-center">
                           <Bouquet 
                             flowers={selectedFlowers} 
                             containerSize="md"
                             interactive={true}
                             onFlowerClick={(_, idx) => removeFlower(idx)}
                             enableHover={enableHover}
                           />
                         </div>
                       </div>
                     )}

                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {FLOWER_OPTIONS.map((f) => (
                        <FlowerButton
                          key={f.value}
                          flower={f}
                          isSelected={selectedFlowers.includes(f.value)}
                          onClick={() => addFlower(f.value)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* ── Decor Sticker ── */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 block flex items-center gap-1">
                      <Sparkles size={14} /> Decor Sticker
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {STAMP_OPTIONS.map((s) => (
                        <StampButton
                          key={s.value}
                          stamp={s}
                          isSelected={stamp === s.value}
                          onClick={() => setStamp(s.value)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* ── Animated Emojis ── */}
                  <div className="space-y-3">
                    <AnimatedEmojiPicker
                      selectedEmojis={animatedEmojis.map((e) => ({ ...e, instanceId: e.id }))}
                      onAddEmoji={handleAddAnimatedEmoji}
                      onRemoveEmoji={handleRemoveAnimatedEmoji}
                      maxEmojis={20}
                    />

                    {animatedEmojis.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 block">Drag emojis on canvas</label>
                        <AnimatedEmojiCanvas
                          emojis={animatedEmojis}
                          onAddEmoji={() => {}}
                          onRemoveEmoji={handleRemoveAnimatedEmoji}
                          onUpdatePosition={handleUpdateEmojiPosition}
                          minHeight={250}
                        />
                      </div>
                    )}
                  </div>

                  {/* ── Drawing Section with Advanced Color Picker ── */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-600 flex items-center gap-1">
                        <PenTool size={14} /> Doodle (Optional)
                      </label>
                      {hasDrawing && (
                        <button
                          type="button"
                          onClick={handleClearDrawing}
                          className="text-xs text-[#e11d48] hover:underline font-bold flex items-center gap-1"
                        >
                          <Eraser size={12} /> Clear
                        </button>
                      )}
                    </div>

                    {/* Advanced Color picker */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <AdvancedColorPicker
                          color={activeTool === "eraser" ? "#ffffff" : penColor}
                          onChange={(c) => {
                            if (activeTool === "pen") setPenColor(c);
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-3 min-w-[140px]">
                        {/* Tool Toggle */}
                        <div className="flex p-1 bg-slate-100 rounded-lg">
                          <button
                            type="button"
                            onClick={() => setActiveTool("pen")}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-bold transition-all ${
                              activeTool === "pen"
                                ? "bg-white shadow-sm text-[#0f172a]"
                                : "text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            <PenTool size={14} /> Pen
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTool("eraser")}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-bold transition-all ${
                              activeTool === "eraser"
                                ? "bg-white shadow-sm text-[#0f172a]"
                                : "text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            <Eraser size={14} /> Eraser
                          </button>
                        </div>

                        {/* Brush Size */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Brush Size
                          </label>
                          <div className="flex items-center gap-2">
                            {[1, 2, 4, 8, 12].map((sz) => (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => setBrushSize(sz)}
                                className={`flex-1 flex items-center justify-center h-8 rounded-lg border-2 transition-all ${
                                  brushSize === sz
                                    ? "border-[#14b8a6] bg-[#14b8a6]/5"
                                    : "border-slate-100 bg-white hover:border-slate-200"
                                }`}
                              >
                                <div
                                  className="bg-slate-800 rounded-full"
                                  style={{ width: Math.max(2, sz), height: Math.max(2, sz) }}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <CanvasWrapper
                      canvasRef={sigCanvas}
                      onEnd={() => setHasDrawing(true)}
                      penColor={activeTool === "eraser" ? "#ffffff" : penColor}
                      brushSize={brushSize}
                    />
                  </div>

                  {/* Public / Private Toggle */}
                  <div className="flex items-center justify-between bg-slate-50/80 border border-slate-100 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      {isPublic ? (
                        <Globe size={20} className="text-[#14b8a6]" />
                      ) : (
                        <Lock size={20} className="text-slate-400" />
                      )}
                      <div>
                        <p className="font-bold text-sm text-slate-700">
                          {isPublic ? "Public Note" : "Private Note"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {isPublic
                            ? "Others can see this in the gallery"
                            : "Only people with the link can view"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPublic(!isPublic)}
                      className={`w-14 h-7 rounded-full transition-all relative ${
                        isPublic ? "bg-[#14b8a6]" : "bg-slate-300"
                      }`}
                    >
                      <motion.div
                        className="w-5 h-5 bg-white rounded-full absolute top-1 shadow-md"
                        animate={{ left: isPublic ? "1.75rem" : "0.25rem" }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  {/* Submit */}
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={!recipient.trim() || !message.trim()}
                      className="w-full bg-gradient-to-r from-[#0f766e] to-[#115e59] disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-[#0f766e]/20 transition-all flex items-center justify-center gap-2"
                    >
                      Package with love <Heart size={20} fill="currentColor" />
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* -------------------- PROCESSING -------------------- */}
          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(12px)" }}
              className="flex flex-col items-center justify-center min-h-[60vh] relative"
            >
              <div className="relative w-36 h-36 mb-10">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="58" stroke="#e2e8f0" strokeWidth="8" fill="none" />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="url(#grad)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="364.4"
                    strokeDashoffset={364.4 - (364.4 * progress) / 100}
                    className="transition-all duration-300 ease-out"
                  />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0f766e" />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                </svg>
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-black text-[#0f766e]"
                  key={progress}
                  initial={{ scale: 1.2, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {progress}%
                </motion.div>
              </div>

              <h3 className="text-2xl font-extrabold bg-gradient-to-r from-[#0f766e] to-[#14b8a6] bg-clip-text text-transparent mb-2">
                Sprinkling magic...
              </h3>
              <p className="text-slate-400 font-medium">Wrapping your note in flowers & generating your QR code</p>

              {/* Floating hearts animation */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {[...Array(processingDecorCount)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -120 - i * 30],
                      x: [0, (i % 2 === 0 ? 60 : -60) * Math.random()],
                      opacity: [0, 0.9, 0],
                      scale: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 2 + Math.random(),
                      repeat: Infinity,
                      delay: i * 0.35,
                      ease: "easeInOut",
                    }}
                    className="absolute"
                  >
                    {i % 3 === 0 ? (
                      <Heart className="text-[#e11d48]" fill="#e11d48" size={14 + i * 3} opacity={0.6} />
                    ) : i % 3 === 1 ? (
                      <span className="text-lg">🌸</span>
                    ) : (
                      <Sparkles className="text-[#14b8a6]" size={14 + i * 2} opacity={0.5} />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ---------------------- RESULT ---------------------- */}
          {step === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="max-w-5xl mx-auto"
            >
              {/* Success header */}
              <div className="text-center mb-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle size={32} />
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f172a] mb-2">Beautiful Note Ready!</h2>
                <p className="text-slate-400 text-lg">Thank you for making someone&apos;s day ✨</p>
              </div>

              <div className="grid md:grid-cols-5 gap-6 bg-white/60 p-4 md:p-8 rounded-3xl backdrop-blur-xl shadow-xl border border-white/80 items-start">
                {/* Note preview / Letter Interaction */}
                <div className="md:col-span-3">
                  <LetterNote
                    recipient={recipient}
                    message={message}
                    flowers={selectedFlowers}
                    stampEmoji={stampEmoji}
                    isPublic={isPublic}
                    drawingUrl={sigCanvas.current?.getTrimmedCanvas()?.toDataURL("image/png")}
                    animatedEmojis={animatedEmojis}
                  />
                </div>

                {/* QR & Sharing */}
                <div className="md:col-span-2 flex flex-col gap-5">
                  <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col items-center text-center">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Share2 size={18} className="text-[#14b8a6]" /> Share your note
                    </h4>

                    <div className="p-4 bg-slate-50 rounded-xl mb-4 shadow-inner">
                      <QRCode
                        value={savedQRUrl}
                        size={150}
                        fgColor="#0f172a"
                        bgColor="transparent"
                        level="Q"
                      />
                    </div>

                    <p className="text-xs text-slate-400 mb-4 max-w-[200px]">
                      Scan this QR code with any phone camera to open the note!
                    </p>

                    <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold flex justify-center items-center gap-2 transition-colors">
                      <Download size={16} /> Save QR Image
                    </button>
                  </div>

                  <div className="bg-[#0f766e]/5 border border-[#0f766e]/10 p-5 rounded-2xl">
                    <p className="text-sm text-slate-500 mb-3 font-semibold">Or share the direct link</p>
                    <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                      <input
                        type="text"
                        readOnly
                        value={savedQRUrl}
                        className="flex-1 bg-transparent px-3 text-xs text-slate-600 outline-none min-w-0"
                      />
                      <button
                        onClick={handleCopy}
                        className="bg-[#14b8a6] hover:bg-[#0d9488] text-white text-xs px-4 py-2 rounded-md font-bold transition-colors flex items-center gap-1 shrink-0"
                      >
                        <Copy size={12} /> Copy
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={resetForm}
                    className="text-[#0f766e] hover:text-[#115e59] font-bold py-3 underline underline-offset-4 transition-colors"
                  >
                    Create another note
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ----------------------- FOOTER ----------------------- */}
      <footer className="text-center py-8 text-xs text-slate-400 border-t border-slate-200/60 mt-16">
        <p>Crafted with care · FlowerNotes</p>
      </footer>

      {/* ------------------------ TOAST ------------------------ */}
      <AnimatePresence>
        {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg("")} />}
      </AnimatePresence>

      {/* --------------- GLOBAL KEYFRAME ANIMATIONS --------------- */}
      <style jsx global>{`
        @keyframes gradient {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}





