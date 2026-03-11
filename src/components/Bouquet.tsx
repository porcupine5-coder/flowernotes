"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  NaturalRose,
  NaturalSunflower,
  NaturalTulip,
  NaturalLily,
} from "./NaturalFlowers";

export interface FlowerType {
  value: string;
  label: string;
  Component: React.ComponentType<{ className?: string }>;
  color: string;
}

const FLOWER_COMPONENTS: Record<string, FlowerType> = {
  rose: {
    value: "rose",
    label: "Rose",
    Component: NaturalRose,
    color: "#be123c",
  },
  sunflower: {
    value: "sunflower",
    label: "Sunflower",
    Component: NaturalSunflower,
    color: "#eab308",
  },
  tulip: {
    value: "tulip",
    label: "Tulip",
    Component: NaturalTulip,
    color: "#d946ef",
  },
  cherry: {
    value: "cherry",
    label: "Cherry Blossom",
    Component: NaturalRose,
    color: "#ec4899",
  },
  hibiscus: {
    value: "hibiscus",
    label: "Hibiscus",
    Component: NaturalRose,
    color: "#f43f5e",
  },
  daisy: {
    value: "daisy",
    label: "Daisy",
    Component: NaturalSunflower,
    color: "#fbbf24",
  },
  lily: {
    value: "lily",
    label: "Lily",
    Component: NaturalLily,
    color: "#fda4af",
  },
  lavender: {
    value: "lavender",
    label: "Lavender",
    Component: NaturalTulip,
    color: "#c084fc",
  },
  clover: {
    value: "clover",
    label: "Clover",
    Component: NaturalSunflower,
    color: "#22c55e",
  },
  herb: {
    value: "herb",
    label: "Eucalyptus",
    Component: NaturalSunflower,
    color: "#10b981",
  },
  palm: {
    value: "palm",
    label: "Palm Leaf",
    Component: NaturalTulip,
    color: "#14b8a6",
  },
  seedling: {
    value: "seedling",
    label: "Seedling",
    Component: NaturalRose,
    color: "#4ade80",
  },
};

interface BouquetProps {
  flowers: string[];
  containerSize?: "sm" | "md" | "lg" | "xl";
  interactive?: boolean;
  onFlowerClick?: (flowerValue: string, index: number) => void;
}

/**
 * Bouquet Component - Renders SVG flowers in a realistic bouquet arrangement
 * Flowers are stacked with depth, rotation, and overlap to create a 3D effect
 */
export const Bouquet = ({
  flowers,
  containerSize = "md",
  interactive = false,
  onFlowerClick,
}: BouquetProps) => {
  const containerSizes = {
    sm: { wrapper: "h-32 w-24", flower: "w-16 h-20" },
    md: { wrapper: "h-56 w-40", flower: "w-28 h-36" },
    lg: { wrapper: "h-80 w-56", flower: "w-40 h-52" },
    xl: { wrapper: "h-[28rem] w-64", flower: "w-48 h-64" },
  };

  const sizes = containerSizes[containerSize];

  // Calculate flower positions for bouquet arrangement
  const flowerPositions = useMemo(() => {
    const positions = flowers.map((_, index) => {
      const total = flowers.length;
      const angleRange = Math.min(90, total * 12); // Max spread angle
      const baseAngle = total === 1 ? 0 : -angleRange / 2 + (index / (total - 1)) * angleRange;
      
      // Create depth by varying z-index and slight position shifts
      const depthOffset = (index / total) * 8;
      const xOffset = Math.sin((baseAngle * Math.PI) / 180) * 15;
      const yOffset = Math.cos((baseAngle * Math.PI) / 180) * 5;
      
      return {
        rotation: baseAngle,
        x: xOffset,
        y: yOffset,
        zIndex: total - index,
        scaleX: 1 + (index % 2) * 0.05, // Slight scale variation for natural look
      };
    });

    return positions;
  }, [flowers.length]);

  if (flowers.length === 0) {
    return (
      <div className={`${sizes.wrapper} flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200`}>
        <p className="text-xs text-slate-400">No flowers selected</p>
      </div>
    );
  }

  return (
    <div
      className={`${sizes.wrapper} relative mx-auto flex items-end justify-center bg-gradient-to-b from-transparent via-emerald-50/30 to-emerald-100/20 rounded-3xl border-2 border-emerald-100/50 overflow-hidden`}
    >
      {/* Bouquet stem container */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-1/3 bg-gradient-to-t from-green-600 to-green-400 rounded-t-full opacity-70" />

      {/* Flowers in 3D arrangement */}
      <div className="relative w-full h-full flex items-end justify-center">
        {flowers.map((flowerValue, index) => {
          const flowerType = FLOWER_COMPONENTS[flowerValue];
          const position = flowerPositions[index];

          if (!flowerType) {
            console.warn(`Flower type '${flowerValue}' not found`);
            return null;
          }

          const FlowerComponent = flowerType.Component;

          return (
            <motion.div
              key={`${flowerValue}-${index}`}
              className={`absolute ${sizes.flower} flex items-center justify-center cursor-pointer transition-transform hover:scale-110`}
              style={{
                zIndex: position.zIndex,
              }}
              initial={{ scale: 0, rotate: position.rotation - 30 }}
              animate={{
                scale: 1,
                rotate: position.rotation,
                x: position.x,
                y: position.y,
              }}
              transition={{
                type: "spring",
                bounce: 0.5,
                delay: index * 0.08,
              }}
              whileHover={interactive ? { scale: 1.15 } : undefined}
              onClick={() => {
                if (interactive && onFlowerClick) {
                  onFlowerClick(flowerValue, index);
                }
              }}
              title={interactive ? `Click to remove ${flowerType.label}` : flowerType.label}
            >
              <FlowerComponent className="w-full h-full drop-shadow-md" />
            </motion.div>
          );
        })}
      </div>

      {/* Decorative ribbon/wrap effect */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-6 h-12 bg-gradient-to-b from-pink-200 to-pink-100 rounded-full opacity-40 blur-sm" />
    </div>
  );
};

export default Bouquet;
