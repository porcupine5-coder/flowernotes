"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";

/**
 * VectorFlower — A client-side wrapper around the `vector-bloom` package.
 *
 * Because VectorBloom relies on `document.createElementNS`, we must:
 *   1. Dynamically import the package inside a `useEffect`.
 *   2. Instead of rendering the raw SVG into the DOM, we serialise it to a
 *      data-URL and display it via an <img> tag. This avoids duplicate SVG
 *      `id` / `class` collisions when multiple flowers share one page AND
 *      it eliminates the scroll-wheel zoom handler that VectorBloom attaches.
 */

// ─── Flower configuration presets ────────────────────────────────────
// We embed simplified configs inline so Next.js doesn't need to resolve
// JSON imports from node_modules at build time.

const ROSE_CONFIG = {
  petals: [
    { geometry: { count: 20, length: 6.78, width: 8.21, innerWidth: 10.34, outerWidth: 4.52, extendOutside: true, balance: 0.52, smoothing: 0.23, angleOffset: 19, radialOffset: -0.36, offsetX: 10.17, offsetY: 7.91 }, fill: { color: [{ offset: 0.41, color: "#c7102e" }, { offset: 0.59, color: "#e34060" }], shadow: { blur: 1.4, opacity: 0.74, color: "#4f222d" }, strokeColor: "#8b1a2b", strokeWidth: 0 } },
    { geometry: { count: 20, length: 11.3, width: 12.27, innerWidth: 13.68, outerWidth: 4.52, extendOutside: true, balance: 0.52, smoothing: 0.23, angleOffset: 19, radialOffset: -0.36, offsetX: 10.17, offsetY: 7.91 }, fill: { color: [{ offset: 0.4, color: "#a01030" }, { offset: 0.77, color: "#d05070" }], shadow: { blur: 3.02, opacity: 0.78, color: "#000000" }, strokeColor: "#8b1a2b", strokeWidth: 0.33 } },
    { geometry: { count: 22, length: 15.82, width: 6.18, innerWidth: 7.2, outerWidth: 2.36, extendOutside: true, balance: 0.52, smoothing: 0.23, angleOffset: 0, radialOffset: -0.13, offsetX: 7.91, offsetY: 5.65 }, fill: { color: [{ offset: 0.32, color: "#f46080" }, { offset: 0.73, color: "#e090a0" }], shadow: { blur: 1.05, opacity: 1, color: "#891a29" }, strokeColor: "#000000", strokeWidth: 0 } },
    { geometry: { count: 22, length: 22.6, width: 12.27, innerWidth: 14.53, outerWidth: 6.63, extendOutside: true, balance: 0.66, smoothing: 0.29, angleOffset: 0, radialOffset: -0.2, offsetX: 5.65, offsetY: 5.65 }, fill: { color: [{ offset: 0.48, color: "#c03040" }, { offset: 0.59, color: "#d06080" }], shadow: { blur: 1.4, opacity: 0.56 }, strokeColor: "#883a3b", strokeWidth: 0.39 } },
    { geometry: { count: 20, length: 15.82, width: 8.21, innerWidth: 7.2, outerWidth: 2.36, extendOutside: true, balance: 0.52, smoothing: 0.25, angleOffset: 4, radialOffset: 0.05, offsetX: 0, offsetY: 0 }, fill: { color: [{ offset: 0.23, color: "#e04060" }, { offset: 0.88, color: "#e090a0" }], shadow: { blur: 1.05, opacity: 1, color: "#891a29" }, strokeColor: "#000000", strokeWidth: 0 } },
    { geometry: { count: 20, length: 20.34, width: 14.29, innerWidth: 8.25, outerWidth: 6.63, extendOutside: true, balance: 0.52, smoothing: 0.32, angleOffset: 5, radialOffset: 0, offsetX: 0, offsetY: 0 }, fill: { color: [{ offset: 0.38, color: "#d05050" }, { offset: 0.54, color: "#d03030" }, { offset: 0.73, color: "#e080a0" }], shadow: { blur: 1.4, opacity: 0.66 }, strokeColor: "#682c2c", strokeWidth: 0.14 } },
    { geometry: { count: 20, length: 27.12, width: 8.21, innerWidth: 7.2, outerWidth: 2.36, extendOutside: true, balance: 0.52, smoothing: 0.33, angleOffset: 0, radialOffset: 0.06, offsetX: 0, offsetY: 0 }, fill: { color: [{ offset: 0.23, color: "#e04060" }, { offset: 0.8, color: "#e090a0" }], shadow: { blur: 1.05, opacity: 1, color: "#891a29" }, strokeColor: "#000000", strokeWidth: 0 } },
    { geometry: { count: 20, length: 31.64, width: 16.32, innerWidth: 13.68, outerWidth: 6.63, extendOutside: true, balance: 0.52, smoothing: 0.32, angleOffset: 0, radialOffset: 0, offsetX: 0, offsetY: 0 }, fill: { color: [{ offset: 0.34, color: "#f8e0e0" }, { offset: 0.5, color: "#d05050" }, { offset: 0.73, color: "#e080a0" }], shadow: { blur: 1.4, opacity: 0.5 }, strokeColor: "#c33737", strokeWidth: 0.2 } },
    { geometry: { count: 20, length: 27.12, width: 8.21, innerWidth: 7.2, outerWidth: 2.36, extendOutside: true, balance: 0.52, smoothing: 0.33, angleOffset: 9.5, radialOffset: 0.25, offsetX: 0, offsetY: 0 }, fill: { color: [{ offset: 0.23, color: "#e04060" }, { offset: 0.8, color: "#e090a0" }], shadow: { blur: 1.05, opacity: 1, color: "#c2707b", offsetX: 1.28, offsetY: 0.35 }, strokeColor: "#000000", strokeWidth: 0 } },
    { geometry: { count: 20, length: 31.64, width: 16.32, innerWidth: 13.68, outerWidth: 4.52, extendOutside: true, balance: 0.52, smoothing: 0.23, angleOffset: 9.5, radialOffset: 0.22, offsetX: 0, offsetY: 0 }, fill: { color: [{ offset: 0.5, color: "#d05050" }, { offset: 0.83, color: "#e070a0" }], shadow: { blur: 0.81, opacity: 0.29 }, strokeColor: "#dbb8b8", strokeWidth: 0 } },
    { geometry: { count: 20, length: 33.9, width: 10.24, innerWidth: 10.34, outerWidth: 4.52, extendOutside: true, balance: 0.52, smoothing: 0.23, angleOffset: 19, radialOffset: 0.22, offsetX: 0, offsetY: 0 }, fill: { color: [{ offset: 0.53, color: "#d05050" }, { offset: 0.9, color: "#f0c0c0" }], shadow: { blur: 0.81, opacity: 0.24, color: "#be4b66", offsetX: 0.93, offsetY: 0.58 }, strokeColor: "#dbb8b8", strokeWidth: 0 } },
    { geometry: { count: 20, length: 38.42, width: 16.32, innerWidth: 13.68, outerWidth: 4.52, extendOutside: true, balance: 0.52, smoothing: 0.23, angleOffset: 19, radialOffset: 0.22, offsetX: 0, offsetY: 0 }, fill: { color: [{ offset: 0.53, color: "#d05050" }, { offset: 0.78, color: "#da6080" }], shadow: { blur: 2.79, opacity: 1, color: "#e0b0b0" }, strokeColor: "#dbb8b8", strokeWidth: 0.26 } },
  ],
  center: { radius: 51.97, arrangement: [
    { geometry: { range: [0.74, 0.88], age: [0.58, 0.97], size: [2.6, 4.26], density: 4.38 }, fill: { base: { color: [{ offset: 0.3, color: "#801020" }, { offset: 1, color: "#a01830" }], shadow: { opacity: 0.43, blur: 1.48, color: "#000000" }, strokeColor: "#4e1d1d", strokeWidth: 0.31 }, tip: { color: [{ offset: 0.58, color: "#c02020" }, { offset: 0.9, color: "#ff9090" }], shadow: { blur: 0 }, strokeColor: "#000000", strokeWidth: 0 } } },
    { geometry: { range: [0.25, 0.75], age: [0.01, 0.43], size: [2.6, 4.48], density: 2.88 }, fill: { base: { color: [{ offset: 0.14, color: "#801020" }, { offset: 0.29, color: "#b02030" }, { offset: 0.58, color: "#a01830" }, { offset: 0.76, color: "#600010" }], shadow: { opacity: 0.54, blur: 1.36, color: "#9f5656" }, strokeColor: "#715b5b", strokeWidth: 0.09 }, tip: { color: [{ offset: 0.5, color: "#cccccc" }], shadow: {}, strokeColor: "#000000", strokeWidth: 0 } } },
  ] },
};

const CHERRY_BLOSSOM_CONFIG = {
  petals: [
    { geometry: { count: 5, length: 65.54, width: 40, innerWidth: 35, outerWidth: 12, extendOutside: true, balance: 0.6, smoothing: 0.33, angleOffset: 19, radialOffset: -0.1, offsetX: 0, offsetY: 0 }, fill: { color: [{ offset: 0.3, color: "#f9c6d0" }, { offset: 0.85, color: "#ffebef" }], shadow: { blur: 2.21, opacity: 0.23, color: "#d4768a", offsetX: 0.81, offsetY: 0.93 }, strokeColor: "#eea0b0", strokeWidth: 0.82 } },
    { geometry: { count: 5, length: 60, width: 38, innerWidth: 32, outerWidth: 10, extendOutside: true, balance: 0.58, smoothing: 0.3, angleOffset: 55, radialOffset: -0.1, offsetX: 0, offsetY: 0 }, fill: { color: [{ offset: 0.4, color: "#f5b0c0" }, { offset: 0.9, color: "#fce0e8" }], shadow: { blur: 0, opacity: 0 }, strokeColor: "#eea0b0", strokeWidth: 0 } },
  ],
  center: { radius: 50, arrangement: [
    { geometry: { range: [0.01, 0.5], density: 3, age: [0.4, 0.42], size: [3, 5] }, fill: { base: { color: [{ offset: 0.15, color: "#f5d060" }, { offset: 0.5, color: "#f2c018" }, { offset: 0.71, color: "#e8b017" }], shadow: { blur: 0.49, opacity: 0.78, color: "#9c0d0d" }, strokeColor: "#bd8d00", strokeWidth: 0.41 }, tip: { color: [{ offset: 0.5, color: "#cccccc" }], shadow: { blur: 0, opacity: 0 }, strokeWidth: 0, strokeColor: "#000000" } } },
  ] },
};

const HIBISCUS_CONFIG = {
  petals: [
    { geometry: { count: 5, length: 100, width: 55, innerWidth: 50, outerWidth: 15, extendOutside: true, balance: 0.55, smoothing: 0.3, angleOffset: 10, radialOffset: -0.2, offsetX: 0, offsetY: 0 }, fill: { color: [{ offset: 0.2, color: "#e02050" }, { offset: 0.7, color: "#f05070" }], shadow: { blur: 4, opacity: 0.5, color: "#901030" }, strokeColor: "#c01830", strokeWidth: 0.5 } },
    { geometry: { count: 5, length: 90, width: 50, innerWidth: 45, outerWidth: 12, extendOutside: true, balance: 0.5, smoothing: 0.28, angleOffset: 46, radialOffset: -0.15, offsetX: 0, offsetY: 0 }, fill: { color: [{ offset: 0.3, color: "#f04060" }, { offset: 0.8, color: "#f08090" }], shadow: { blur: 2, opacity: 0.4 }, strokeColor: "#d02040", strokeWidth: 0 } },
  ],
  center: { radius: 40, arrangement: [
    { geometry: { range: [0.01, 0.8], density: 2.5, age: [0.7, 1], size: [2, 4] }, fill: { base: { color: [{ offset: 0.3, color: "#f5d060" }, { offset: 0.7, color: "#f2c018" }], shadow: { blur: 0.5, opacity: 0.5 }, strokeColor: "#a06000", strokeWidth: 0.3 }, tip: { color: [{ offset: 0.5, color: "#ff4040" }], shadow: { blur: 2, opacity: 0.5 }, strokeColor: "#ff0000", strokeWidth: 0 } } },
  ] },
};

const TULIP_CONFIG = {
  petals: [
    { geometry: { count: 6, length: 140, width: 55, innerWidth: 50, outerWidth: 3, extendOutside: true, balance: 0.7, smoothing: 0.3, angleOffset: 0, radialOffset: -0.5, offsetX: 0, offsetY: 0 }, fill: { color: [{ offset: 0.1, color: "#c020d0" }, { offset: 0.65, color: "#e060f0" }], shadow: { blur: 5, opacity: 0.3, color: "#601070" }, strokeColor: "#a010c0", strokeWidth: 0.3 } },
    { geometry: { count: 6, length: 120, width: 45, innerWidth: 40, outerWidth: 2, extendOutside: true, balance: 0.65, smoothing: 0.25, angleOffset: 30, radialOffset: -0.4, offsetX: 0, offsetY: 0 }, fill: { color: [{ offset: 0.2, color: "#d050e0" }, { offset: 0.8, color: "#f0a0ff" }], shadow: { blur: 3, opacity: 0.2 }, strokeColor: "#b020d0", strokeWidth: 0 } },
  ],
  center: { radius: 35, arrangement: [
    { geometry: { range: [0.01, 0.6], density: 3, age: [0.3, 0.5], size: [2.5, 4.5] }, fill: { base: { color: [{ offset: 0.2, color: "#90a010" }, { offset: 0.6, color: "#c0d020" }], shadow: { blur: 0.5, opacity: 0.6, color: "#505000" }, strokeColor: "#607000", strokeWidth: 0.3 }, tip: { color: [{ offset: 0.5, color: "#e0e060" }], shadow: { blur: 0 }, strokeColor: "#000", strokeWidth: 0 } } },
  ] },
};

const LILY_CONFIG = {
  petals: [
    { geometry: { count: 6, length: 130, width: 35, innerWidth: 30, outerWidth: 5, extendOutside: true, balance: 0.6, smoothing: 0.25, angleOffset: 0, radialOffset: -0.3, offsetX: 0, offsetY: 0 }, fill: { color: [{ offset: 0.15, color: "#ffffff" }, { offset: 0.7, color: "#fce0e8" }], shadow: { blur: 4, opacity: 0.2, color: "#c08090" }, strokeColor: "#e0a0b0", strokeWidth: 0.5 } },
    { geometry: { count: 6, length: 115, width: 30, innerWidth: 28, outerWidth: 4, extendOutside: true, balance: 0.55, smoothing: 0.22, angleOffset: 30, radialOffset: -0.25, offsetX: 0, offsetY: 0 }, fill: { color: [{ offset: 0.2, color: "#fff5f8" }, { offset: 0.8, color: "#f5c0d0" }], shadow: { blur: 2, opacity: 0.15 }, strokeColor: "#e8b0c0", strokeWidth: 0 } },
  ],
  center: { radius: 30, arrangement: [
    { geometry: { range: [0.01, 0.7], density: 2.5, age: [0.6, 0.95], size: [2, 3.5] }, fill: { base: { color: [{ offset: 0.3, color: "#90c060" }, { offset: 0.7, color: "#b0e080" }], shadow: { blur: 0.5, opacity: 0.5 }, strokeColor: "#608030", strokeWidth: 0.2 }, tip: { color: [{ offset: 0.5, color: "#d0a020" }], shadow: { blur: 1.5, opacity: 0.5 }, strokeColor: "#a07010", strokeWidth: 0 } } },
  ] },
};

const LAVENDER_CONFIG = {
  petals: [
    { geometry: { count: 8, length: 80, width: 20, innerWidth: 18, outerWidth: 5, extendOutside: true, balance: 0.6, smoothing: 0.28, angleOffset: 0, radialOffset: -0.15, offsetX: 0, offsetY: 0 }, fill: { color: [{ offset: 0.2, color: "#9060c0" }, { offset: 0.8, color: "#c0a0e0" }], shadow: { blur: 3, opacity: 0.3, color: "#503080" }, strokeColor: "#8050b0", strokeWidth: 0.4 } },
    { geometry: { count: 8, length: 70, width: 18, innerWidth: 16, outerWidth: 4, extendOutside: true, balance: 0.55, smoothing: 0.25, angleOffset: 22, radialOffset: -0.1, offsetX: 0, offsetY: 0 }, fill: { color: [{ offset: 0.3, color: "#a070d0" }, { offset: 0.85, color: "#d0b0f0" }], shadow: { blur: 1, opacity: 0.2 }, strokeColor: "#9060c0", strokeWidth: 0 } },
  ],
  center: { radius: 40, arrangement: [
    { geometry: { range: [0.01, 0.6], density: 3.5, age: [0.35, 0.5], size: [2.5, 4] }, fill: { base: { color: [{ offset: 0.2, color: "#e0d040" }, { offset: 0.6, color: "#f0e060" }], shadow: { blur: 0.5, opacity: 0.5 }, strokeColor: "#a09010", strokeWidth: 0.25 }, tip: { color: [{ offset: 0.5, color: "#cccccc" }], shadow: { blur: 0 }, strokeColor: "#000", strokeWidth: 0 } } },
  ] },
};

const CLOVER_CONFIG = {
  petals: [
    { geometry: { count: 4, length: 90, width: 60, innerWidth: 55, outerWidth: 20, extendOutside: true, balance: 0.6, smoothing: 0.35, angleOffset: 0, radialOffset: -0.3, offsetX: 0, offsetY: 0 }, fill: { color: [{ offset: 0.2, color: "#208040" }, { offset: 0.7, color: "#40c060" }], shadow: { blur: 3, opacity: 0.3, color: "#104020" }, strokeColor: "#206030", strokeWidth: 0.5 } },
    { geometry: { count: 4, length: 75, width: 50, innerWidth: 45, outerWidth: 15, extendOutside: true, balance: 0.55, smoothing: 0.3, angleOffset: 45, radialOffset: -0.25, offsetX: 0, offsetY: 0 }, fill: { color: [{ offset: 0.3, color: "#30a050" }, { offset: 0.8, color: "#60d080" }], shadow: { blur: 1, opacity: 0.2 }, strokeColor: "#308040", strokeWidth: 0 } },
  ],
  center: { radius: 25, arrangement: [
    { geometry: { range: [0.01, 0.7], density: 2, age: [0.3, 0.5], size: [2, 3.5] }, fill: { base: { color: [{ offset: 0.3, color: "#d0e010" }, { offset: 0.6, color: "#e0f030" }], shadow: { blur: 0.5, opacity: 0.5 }, strokeColor: "#808000", strokeWidth: 0.2 }, tip: { color: [{ offset: 0.5, color: "#cccccc" }], shadow: { blur: 0 }, strokeColor: "#000", strokeWidth: 0 } } },
  ] },
};

const HERB_CONFIG = {
  petals: [
    { geometry: { count: 12, length: 70, width: 8, innerWidth: 7, outerWidth: 2, extendOutside: true, balance: 0.6, smoothing: 0.2, angleOffset: 0, radialOffset: -0.1, offsetX: 0, offsetY: 0 }, fill: { color: [{ offset: 0.2, color: "#3a7a50" }, { offset: 0.8, color: "#60b080" }], shadow: { blur: 2, opacity: 0.2, color: "#204030" }, strokeColor: "#308050", strokeWidth: 0.3 } },
    { geometry: { count: 12, length: 55, width: 7, innerWidth: 6, outerWidth: 2, extendOutside: true, balance: 0.55, smoothing: 0.18, angleOffset: 15, radialOffset: -0.05, offsetX: 0, offsetY: 0 }, fill: { color: [{ offset: 0.3, color: "#50906a" }, { offset: 0.85, color: "#80c0a0" }], shadow: { blur: 0, opacity: 0 }, strokeColor: "#408060", strokeWidth: 0 } },
  ],
  center: { radius: 30, arrangement: [
    { geometry: { range: [0.01, 0.6], density: 3, age: [0.3, 0.45], size: [2, 3.5] }, fill: { base: { color: [{ offset: 0.3, color: "#90a060" }, { offset: 0.6, color: "#c0d080" }], shadow: { blur: 0.4, opacity: 0.4 }, strokeColor: "#607020", strokeWidth: 0.2 }, tip: { color: [{ offset: 0.5, color: "#dddddd" }], shadow: { blur: 0 }, strokeColor: "#000", strokeWidth: 0 } } },
  ] },
};

const PALM_CONFIG = {
  petals: [
    { geometry: { count: 7, length: 130, width: 25, innerWidth: 22, outerWidth: 3, extendOutside: true, balance: 0.7, smoothing: 0.2, angleOffset: 0, radialOffset: -0.2, offsetX: 0, offsetY: 0 }, fill: { color: [{ offset: 0.15, color: "#2a6a30" }, { offset: 0.7, color: "#40a050" }], shadow: { blur: 4, opacity: 0.25, color: "#103010" }, strokeColor: "#205020", strokeWidth: 0.4 } },
    { geometry: { count: 7, length: 110, width: 20, innerWidth: 18, outerWidth: 2, extendOutside: true, balance: 0.65, smoothing: 0.18, angleOffset: 26, radialOffset: -0.15, offsetX: 0, offsetY: 0 }, fill: { color: [{ offset: 0.2, color: "#358040" }, { offset: 0.8, color: "#60b070" }], shadow: { blur: 2, opacity: 0.15 }, strokeColor: "#306040", strokeWidth: 0 } },
  ],
  center: { radius: 25, arrangement: [
    { geometry: { range: [0.01, 0.5], density: 2.5, age: [0.35, 0.5], size: [2, 3] }, fill: { base: { color: [{ offset: 0.3, color: "#806020" }, { offset: 0.6, color: "#a08040" }], shadow: { blur: 0.4, opacity: 0.4 }, strokeColor: "#604010", strokeWidth: 0.2 }, tip: { color: [{ offset: 0.5, color: "#cccccc" }], shadow: { blur: 0 }, strokeColor: "#000", strokeWidth: 0 } } },
  ] },
};

const SEEDLING_CONFIG = {
  petals: [
    { geometry: { count: 4, length: 60, width: 30, innerWidth: 28, outerWidth: 8, extendOutside: true, balance: 0.6, smoothing: 0.3, angleOffset: 0, radialOffset: -0.2, offsetX: 0, offsetY: 0 }, fill: { color: [{ offset: 0.15, color: "#50b060" }, { offset: 0.7, color: "#90e0a0" }], shadow: { blur: 2, opacity: 0.2, color: "#205030" }, strokeColor: "#40804a", strokeWidth: 0.4 } },
    { geometry: { count: 4, length: 50, width: 25, innerWidth: 22, outerWidth: 6, extendOutside: true, balance: 0.55, smoothing: 0.25, angleOffset: 45, radialOffset: -0.15, offsetX: 0, offsetY: 0 }, fill: { color: [{ offset: 0.25, color: "#60c070" }, { offset: 0.8, color: "#a0f0b0" }], shadow: { blur: 1, opacity: 0.15 }, strokeColor: "#50905a", strokeWidth: 0 } },
  ],
  center: { radius: 20, arrangement: [
    { geometry: { range: [0.01, 0.6], density: 2, age: [0.3, 0.45], size: [1.5, 3] }, fill: { base: { color: [{ offset: 0.3, color: "#d0c040" }, { offset: 0.6, color: "#e0d060" }], shadow: { blur: 0.4, opacity: 0.4 }, strokeColor: "#908010", strokeWidth: 0.2 }, tip: { color: [{ offset: 0.5, color: "#dddddd" }], shadow: { blur: 0 }, strokeColor: "#000", strokeWidth: 0 } } },
  ] },
};

// We import sunflower, daisy, lotus, water-lily from the examples that ship
// with vector-bloom. Simplified here for stability.
const SUNFLOWER_CONFIG = {"petals":[{"geometry":{"width":18.2,"count":18,"outerWidth":2.36,"innerWidth":13.68,"length":241.51,"balance":0.53,"smoothing":0.19,"angleOffset":87.17,"extendOutside":true},"fill":{"color":[{"color":"#d79f4b","offset":0.206},{"color":"#f5f159","offset":0.474}],"strokeColor":"#000000","strokeWidth":0,"shadow":{"blur":10.31,"offsetX":0,"offsetY":0,"color":"#000","opacity":0.11}}},{"geometry":{"width":18.2,"count":18,"outerWidth":0.1,"innerWidth":10.28,"length":261.64,"balance":0.44,"smoothing":0.37,"angleOffset":56.6,"extendOutside":true},"fill":{"color":[{"offset":0.354,"color":"#bb743f"},{"color":"#f5eb57","offset":0.68}],"strokeColor":"#000000","strokeWidth":0,"shadow":{"blur":0,"offsetX":0,"offsetY":0,"color":"#000","opacity":1}}}],"center":{"radius":181.13,"arrangement":[{"geometry":{"density":5.08,"range":[0.513,0.983],"size":[4.9,4.91],"age":[0.4,0.897]},"fill":{"base":{"color":[{"color":"#895634","offset":0.497},{"offset":0.669,"color":"#3f2413"}],"strokeColor":"#000000","strokeWidth":0.25,"shadow":{"blur":0,"offsetX":0,"offsetY":0,"color":"#000000","opacity":0.55}},"tip":{"color":[{"offset":0.6,"color":"#9d6b15"},{"color":"#e3d21c","offset":0.783}],"strokeColor":"#000000","strokeWidth":0,"shadow":{"blur":4.65,"offsetX":0,"offsetY":0,"color":"#000000","opacity":0.74}},"background":"#5e4231"}},{"geometry":{"density":5.08,"range":[0.095,0.525],"size":[4.9,4.91],"age":[0.04,0.486]},"fill":{"base":{"color":[{"offset":0.04,"color":"#4e6e49"},{"offset":0.406,"color":"#958c28"},{"color":"#895634","offset":0.566}],"strokeColor":"#000000","strokeWidth":0,"shadow":{"blur":1.26,"offsetX":0,"offsetY":0,"color":"#000000","opacity":0.89}},"tip":{"color":[{"offset":0.709,"color":"#9d6b15"},{"color":"#e3d21c","offset":0.869}],"strokeColor":"#000000","strokeWidth":0,"shadow":{"blur":0,"offsetX":0,"offsetY":0,"color":"#e1cf1c","opacity":0.67}},"background":"#5e4231"}}]}};

const DAISY_CONFIG = {"petals":[{"geometry":{"count":25,"length":65.54,"width":6.18,"innerWidth":7.2,"outerWidth":2.41,"extendOutside":true,"balance":0.6,"smoothing":0.18,"angleOffset":19,"radialOffset":-0.1},"fill":{"color":[{"offset":0.53,"color":"#7fb3cc"},{"offset":1,"color":"#ffffff"}],"shadow":{"blur":2.21,"opacity":0.23,"color":"#4185a4","offsetX":0.81,"offsetY":0.93},"strokeColor":"#92bfd3","strokeWidth":0.82}},{"geometry":{"count":25,"length":65.54,"width":8.21,"innerWidth":7.2,"outerWidth":2.41,"extendOutside":true,"balance":0.58,"smoothing":0.33,"angleOffset":21.5,"radialOffset":-0.1},"fill":{"color":[{"offset":0.562,"color":"#7fb3cc"},{"offset":0.978,"color":"#135bec"}],"shadow":{"blur":0,"opacity":0},"strokeColor":"#b5c2e8","strokeWidth":0}},{"geometry":{"count":25,"length":65.54,"width":8.21,"innerWidth":7.2,"outerWidth":2.41,"extendOutside":true,"balance":0.5,"smoothing":0.3,"angleOffset":31,"radialOffset":-0.1},"fill":{"color":[{"offset":0.53,"color":"#7fb3cc"}],"shadow":{"blur":0,"opacity":0},"strokeColor":"#b5c2e8","strokeWidth":0.33}}],"center":{"radius":104.82,"arrangement":[{"geometry":{"range":[0.016,0.75],"density":5.65,"age":[0.4,0.417],"size":[4.15,5.7]},"fill":{"base":{"color":[{"offset":0.154,"color":"#bbd071"},{"offset":0.503,"color":"#f2c018"},{"offset":0.714,"color":"#e8b017"}],"shadow":{"blur":0.49,"opacity":0.78,"color":"#9c0d0d"},"strokeColor":"#bd8d00","strokeWidth":0.41},"tip":{"color":[{"offset":0.503,"color":"#cccccc"}],"shadow":{"blur":0,"opacity":0},"strokeWidth":0,"strokeColor":"#000000"},"background":"#c4d355"}},{"geometry":{"range":[0.709,0.852],"density":4.38,"age":[0.306,1],"size":[3.15,5.7]},"fill":{"base":{"color":[{"offset":0.154,"color":"#bbd071"},{"offset":0.503,"color":"#f2c018"},{"offset":0.714,"color":"#e8b017"}],"shadow":{"blur":0.49,"opacity":0.78,"color":"#9c0d0d"},"strokeColor":"#000000","strokeWidth":0},"tip":{"color":[{"offset":0.503,"color":"#be633c"}],"shadow":{"blur":0,"opacity":0},"strokeWidth":0,"strokeColor":"#000000"},"background":"#509f64"}}]}};

const LOTUS_CONFIG = {"petals":[{"geometry":{"width":62.33,"count":9,"outerWidth":47.03,"innerWidth":70.25,"length":60.38,"balance":0.64,"smoothing":0.16,"angleOffset":24,"extendOutside":false,"radialOffset":-0.99},"fill":{"color":[{"color":"#bbaf2a","offset":0.08},{"offset":0.6,"color":"#ddc72e"}],"strokeColor":"#c7bb23","strokeWidth":0,"shadow":{"blur":2.01,"color":"#000","opacity":0.85}}},{"geometry":{"width":1.23,"count":12,"outerWidth":2.36,"innerWidth":1.66,"length":5.03,"balance":0.79,"smoothing":0.47,"angleOffset":51,"extendOutside":true,"radialOffset":-0.21,"offsetX":5.03,"offsetY":7.55},"fill":{"color":[{"color":"#cb9d62","offset":0.526},{"offset":0.566,"color":"#ffe2b8"}],"strokeColor":"#d0961b","strokeWidth":0.31,"shadow":{"blur":13.08,"color":"#000","opacity":0.22}}},{"geometry":{"width":5.76,"count":3,"outerWidth":0.1,"innerWidth":53.28,"length":138.36,"balance":0.79,"smoothing":0.36,"angleOffset":36.23,"extendOutside":true,"radialOffset":-0.14},"fill":{"color":[{"offset":0.074,"color":"#d9c4c4"},{"color":"#d2849c","offset":0.429},{"offset":0.629,"color":"#900e3a"}],"shadow":{"blur":13.08,"color":"#000","opacity":0.22},"strokeColor":"#000000","strokeWidth":0}},{"geometry":{"width":43.09,"count":5,"outerWidth":0.1,"innerWidth":66.86,"length":241.51,"balance":0.53,"smoothing":0.31,"angleOffset":105.28,"extendOutside":true,"radialOffset":-0.22},"fill":{"color":[{"offset":0,"color":"#c3bbbf"},{"offset":0.571,"color":"#bd476c"},{"offset":0.731,"color":"#a93d5f"}],"shadow":{"blur":8.55,"color":"#000","opacity":0.21},"strokeColor":"#000000","strokeWidth":0}},{"geometry":{"width":45.36,"count":5,"outerWidth":0.1,"innerWidth":23.86,"length":213.84,"balance":0.6,"smoothing":0.27,"angleOffset":65.66,"extendOutside":true,"radialOffset":-0.11},"fill":{"color":[{"offset":0.011,"color":"#ffffff"},{"color":"#bd466c","offset":0.451}],"shadow":{"blur":10.31,"color":"#000","opacity":0.11},"strokeColor":"#000000","strokeWidth":0}}],"center":{"radius":79.25,"arrangement":[{"geometry":{"density":12.49,"range":[0.151,0.615],"size":[3.7,4.15],"age":[0.503,0.503]},"fill":{"base":{"color":[{"offset":0.629,"color":"#5f3d00"}],"strokeColor":"#fffafa","strokeWidth":0.5,"shadow":{"blur":1.51,"color":"#ffffff","opacity":1}},"tip":{"color":[{"offset":0.6,"color":"#9d6b15"},{"color":"#e3d21c","offset":0.783}],"strokeColor":"#000000","strokeWidth":0,"shadow":{"blur":4.65,"color":"#000000","opacity":0.74}}}}]}};

const WATER_LILY_CONFIG = {"petals":[{"geometry":{"width":162.62,"count":22,"outerWidth":15.9,"innerWidth":10.28,"length":25.16,"balance":0.39,"smoothing":0.18,"angleOffset":88.5,"extendOutside":true,"radialOffset":-0.94,"offsetX":0.61,"offsetY":0.45},"fill":{"color":[{"offset":0.6,"color":"#d38402"}],"strokeColor":"#e8e8e8","strokeWidth":0,"shadow":{"blur":11.7,"color":"#cf841f","opacity":1}}},{"geometry":{"width":0.1,"count":9,"outerWidth":0.1,"innerWidth":8.02,"length":40.25,"balance":0.32,"smoothing":0.18,"angleOffset":88.5,"extendOutside":true,"radialOffset":-0.85,"offsetX":1.26},"fill":{"color":[{"offset":0.051,"color":"#999999"},{"offset":0.491,"color":"#ffffff"}],"strokeColor":"#e8e8e8","strokeWidth":0,"shadow":{"blur":11.57,"color":"#5b5f53","opacity":0.95}}},{"geometry":{"width":36.22,"count":9,"outerWidth":4.61,"innerWidth":10.28,"length":85.53,"balance":0.39,"smoothing":0.18,"angleOffset":88.5,"extendOutside":true,"radialOffset":-0.85,"offsetX":1.26},"fill":{"color":[{"offset":0.257,"color":"#daddd2"},{"offset":0.909,"color":"#90c9fe"}],"strokeColor":"#e8e8e8","strokeWidth":0.69,"shadow":{"blur":6.79,"color":"#5b5f53","opacity":0.95}}},{"geometry":{"width":36.22,"count":9,"outerWidth":4.61,"innerWidth":10.28,"length":108.18,"balance":0.39,"smoothing":0.18,"angleOffset":104,"extendOutside":true,"radialOffset":-0.85,"offsetX":-1.26},"fill":{"color":[{"offset":0.326,"color":"#daddd2"},{"offset":0.646,"color":"#90c9fe"}],"strokeColor":"#e8e8e8","strokeWidth":0.69,"shadow":{"blur":6.79,"color":"#5b5f53","opacity":0.95}}},{"geometry":{"width":36.22,"count":9,"outerWidth":4.61,"innerWidth":10.28,"length":118.24,"balance":0.39,"smoothing":0.27,"angleOffset":88.5,"extendOutside":true,"radialOffset":-0.85,"offsetX":3.82},"fill":{"color":[{"offset":0.343,"color":"#daddd2"},{"offset":0.486,"color":"#90c9fe"}],"strokeColor":"#e8e8e8","strokeWidth":0.69,"shadow":{"blur":6.79,"color":"#5b5f53","opacity":0.95}}}],"center":{"radius":79.25,"arrangement":[{"geometry":{"density":1.73,"range":[0.276,0.417],"size":[0.96,2.67],"age":[0.463,0.731]},"fill":{"base":{"color":[{"offset":0.429,"color":"#ffffff"},{"offset":0.56,"color":"#edde93"}],"strokeColor":"#ffffff","strokeWidth":0.15,"shadow":{"blur":0.5,"color":"#d28e09","opacity":1}},"tip":{"color":[{"color":"#dbdbdb","offset":0.783}],"strokeColor":"#ffffff","strokeWidth":0.15,"shadow":{"blur":4.65,"color":"#000000","opacity":0.74}}}}]}};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FLOWER_CONFIGS: Record<string, any> = {
  rose: ROSE_CONFIG,
  sunflower: SUNFLOWER_CONFIG,
  tulip: TULIP_CONFIG,
  cherry: CHERRY_BLOSSOM_CONFIG,
  hibiscus: HIBISCUS_CONFIG,
  daisy: DAISY_CONFIG,
  lily: LILY_CONFIG,
  lavender: LAVENDER_CONFIG,
  clover: CLOVER_CONFIG,
  herb: HERB_CONFIG,
  palm: PALM_CONFIG,
  seedling: SEEDLING_CONFIG,
  lotus: LOTUS_CONFIG,
  "water-lily": WATER_LILY_CONFIG,
};

interface VectorFlowerProps {
  type: string;
  /** CSS classes forwarded to the wrapper div */
  className?: string;
  /** Flower size in px (the img will be this wide/tall) */
  size?: number;
}

/**
 * Renders a single 2D flower generated by `vector-bloom`.
 * Safe for SSR (does nothing on the server; renders on mount).
 */
export const VectorFlower = ({ type, className = "", size = 150 }: VectorFlowerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const configRef = useRef<unknown>(null);

  // Stable config reference - only update when type changes
  const config = useMemo(() => {
    const base = FLOWER_CONFIGS[type] || FLOWER_CONFIGS.rose;
    // Deep clone so VectorBloom's mutation doesn't affect our constants
    const cloned = JSON.parse(JSON.stringify(base));
    configRef.current = cloned;
    return cloned;
  }, [type]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Dynamic import — only runs in the browser
        const { VectorBloom } = await import("vector-bloom");
        if (cancelled) return;

        const flower = new VectorBloom(config);
        flower.updateDrawingSize();

        // Serialise to data URL so we avoid duplicate SVG IDs
        const url = flower.export("imageURL");
        if (!cancelled) setImgSrc(url);
      } catch (err) {
        console.error("VectorFlower: failed to render", err);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]); // Only re-run when type changes, not when config object reference changes

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={`${type} flower`}
          width={size}
          height={size}
          style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }}
          draggable={false}
        />
      ) : (
        // Tiny loading placeholder
        <div
          style={{
            width: size * 0.4,
            height: size * 0.4,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%)",
          }}
        />
      )}
    </div>
  );
};

export default VectorFlower;
