"use client";

import React, { useMemo, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { VectorFlower } from "./VectorFlower";

export interface FlowerType {
  value: string;
  label: string;
  color: string;
}

const FLOWER_META: Record<string, FlowerType> = {
  rose:       { value: "rose",       label: "Rose",            color: "#be123c" },
  sunflower:  { value: "sunflower",  label: "Sunflower",       color: "#eab308" },
  tulip:      { value: "tulip",      label: "Tulip",           color: "#d946ef" },
  cherry:     { value: "cherry",     label: "Cherry Blossom",  color: "#ec4899" },
  hibiscus:   { value: "hibiscus",   label: "Hibiscus",        color: "#f43f5e" },
  daisy:      { value: "daisy",      label: "Daisy",           color: "#fbbf24" },
  lily:       { value: "lily",       label: "Lily",            color: "#fda4af" },
  lavender:   { value: "lavender",   label: "Lavender",        color: "#c084fc" },
  clover:     { value: "clover",     label: "Clover",          color: "#22c55e" },
  herb:       { value: "herb",       label: "Eucalyptus",      color: "#10b981" },
  palm:       { value: "palm",       label: "Palm Leaf",       color: "#14b8a6" },
  seedling:   { value: "seedling",   label: "Seedling",        color: "#4ade80" },
  lotus:      { value: "lotus",      label: "Lotus",           color: "#f472b6" },
  "water-lily": { value: "water-lily", label: "Water Lily",    color: "#38bdf8" },
};

interface BouquetProps {
  flowers: string[];
  containerSize?: "sm" | "md" | "lg" | "xl";
  interactive?: boolean;
  onFlowerClick?: (flowerValue: string, index: number) => void;
  enableHover?: boolean;
}

/**
 * Bouquet Component — Renders vector-bloom 2D flowers in a stacked,
 * overlapping top-down bouquet arrangement inspired by digibouquet.vercel.app.
 *
 * Each flower is placed in an organic cluster with slight rotation,
 * scale variation, and radial offsets, giving the appearance of a real
 * bouquet viewed from above.
 */
export const Bouquet = React.memo(({
  flowers,
  containerSize = "md",
  interactive = false,
  onFlowerClick,
  enableHover = true,
}: BouquetProps) => {
  const reduceMotion = useReducedMotion();
  const allowHover = enableHover && !reduceMotion;

  const containerSizes = {
    sm:  { wrapper: "h-32 w-32",  flowerSize: 55 },
    md:  { wrapper: "h-56 w-56",  flowerSize: 90 },
    lg:  { wrapper: "h-80 w-80",  flowerSize: 125 },
    xl:  { wrapper: "h-[28rem] w-[28rem]", flowerSize: 160 },
  };

  const sizes = containerSizes[containerSize];

  // Deterministic placement using a seeded-style approach (index-based)
  // Memoized with stringified flowers to avoid recalculation on parent re-renders
  const flowerPositions = useMemo(() => {
    const total = flowers.length;
    if (total === 0) return [];

    return flowers.map((_, index) => {
      // Create a vertical, stacked bouquet shape where flowers are bundled
      const zIndex = index;

      // Pseudo-random deterministic values
      const seedX = ((index * 37) % 100) / 100;
      const seedY = ((index * 59) % 100) / 100;

      const layerProgress = total > 1 ? index / (total - 1) : 0; // 0 to 1

      const maxSpreadX = 70 + Math.min(total * 6, 60);
      const maxSpreadY = 60 + Math.min(total * 8, 80);

      // Y positioning: stagger vertically from top to bottom
      const yBase = -maxSpreadY / 2 + layerProgress * maxSpreadY;
      const y = yBase + (seedY - 0.5) * 25;

      // X positioning: wider at the top, narrower at the bottom to form a bouquet
      const widthFactor = 1.0 - layerProgress * 0.2; // 1.0 at back/top, 0.8 at front/bottom
      const xBase = (seedX - 0.5) * maxSpreadX * 2 * widthFactor;
      
      // Let's add an alternating pattern to reduce heavy overlap on the same X line
      const alternatingXPos = xBase + (index % 2 === 0 ? 15 : -15);
      const x = total === 1 ? 0 : alternatingXPos;

      // Rotation outwards based on X position
      const rotation = (x / maxSpreadX) * 35 + (seedX - 0.5) * 20;

      // Scale: size variability for organic feel
      const scale = 0.85 + seedY * 0.2;

      return { x, y: y * 0.9, rotation, scale, zIndex };
    });
  }, [flowers.join(",")]);



  if (flowers.length === 0) {
    return (
      <div
        className={`${sizes.wrapper} flex items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200`}
      >
        <p className="text-xs text-slate-400">No flowers selected</p>
      </div>
    );
  }

  return (
    <div
      className={`${sizes.wrapper} relative mx-auto flex items-center justify-center rounded-3xl overflow-visible`}
      style={{ perspective: "600px" }}
    >
      {/* Soft circular glow behind the bouquet */}
      <div
        className="absolute rounded-full opacity-30 blur-2xl"
        style={{
          width: "75%",
          height: "75%",
          background: "radial-gradient(circle, rgba(20,184,166,0.25) 0%, rgba(236,72,153,0.12) 50%, transparent 80%)",
        }}
      />

      {/* Stacked flower cluster */}
      {flowers.map((flowerValue, index) => {
        const pos = flowerPositions[index];
        const meta = FLOWER_META[flowerValue];
        if (!pos || !meta) return null;

        return (
          <motion.div
            key={`${flowerValue}-${index}`}
            className={`absolute ${interactive ? "cursor-pointer" : "cursor-default"}`}
            style={{
              zIndex: pos.zIndex,
              width: sizes.flowerSize,
              height: sizes.flowerSize,
            }}
            initial={
              reduceMotion
                ? false
                : { scale: 0, rotate: pos.rotation - 40, opacity: 0 }
            }
            animate={{
              scale: pos.scale,
              rotate: pos.rotation,
              x: pos.x,
              y: pos.y,
              opacity: 1,
            }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    type: "spring",
                    bounce: 0.45,
                    delay: index * 0.07,
                  }
            }
            whileHover={
              interactive && allowHover
                ? { scale: pos.scale * 1.18, zIndex: 100 }
                : undefined
            }
            onClick={() => {
              if (interactive && onFlowerClick) {
                onFlowerClick(flowerValue, index);
              }
            }}
            title={
              interactive
                ? `Click to remove ${meta.label}`
                : meta.label
            }
          >
            <VectorFlower
              type={flowerValue}
              size={sizes.flowerSize}
              className="drop-shadow-lg"
            />
          </motion.div>
        );
      })}

      {/* Decorative wrapping ribbon at bottom */}
      <div
        className="absolute rounded-full opacity-20 blur-md pointer-events-none"
        style={{
          bottom: "8%",
          width: "20%",
          height: "35%",
          background: "linear-gradient(to top, #86efac, #a7f3d0 50%, transparent)",
        }}
      />
    </div>
  );
}, (prev, next) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prev.flowers === next.flowers &&
    prev.containerSize === next.containerSize &&
    prev.interactive === next.interactive &&
    prev.onFlowerClick === next.onFlowerClick &&
    prev.enableHover === next.enableHover
  );
});

export default Bouquet;
