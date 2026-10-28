"use client";

import React, {
  useRef,
  useEffect,
  useState,
  useId,
} from "react";
import {
  motion,
  useMotionValue,
  useAnimationFrame,
} from "motion/react";
import { useTheme } from "@/lib/theme/ThemeProvider";

/* -------------------------------------------------------------------------
 * GEOMETRY SPECIFICATION (viewBox 0 0 1376 700)
 * High-legibility technical AI architecture diagram
 * ------------------------------------------------------------------------- */

interface Point {
  x: number;
  y: number;
}

// 4 Columns of Neural Network Nodes (Center Y = 350)
// Layer 0: Input (6 nodes)
const LAYER_0_NODES: Point[] = [
  { x: 130, y: 180 },
  { x: 130, y: 248 },
  { x: 130, y: 316 },
  { x: 130, y: 384 },
  { x: 130, y: 452 },
  { x: 130, y: 520 },
];

// Layer 1: Hidden 1 (8 nodes) - Top & Bottom nodes are prominent accents (r=22)
const LAYER_1_NODES: Point[] = [
  { x: 310, y: 115 }, // Top accent
  { x: 310, y: 182 },
  { x: 310, y: 249 },
  { x: 310, y: 316 },
  { x: 310, y: 384 },
  { x: 310, y: 451 },
  { x: 310, y: 518 },
  { x: 310, y: 585 }, // Bottom accent
];

// Layer 2: Hidden 2 (8 nodes) - Top & Bottom nodes are prominent accents (r=22)
const LAYER_2_NODES: Point[] = [
  { x: 490, y: 115 }, // Top accent
  { x: 490, y: 182 },
  { x: 490, y: 249 },
  { x: 490, y: 316 },
  { x: 490, y: 384 },
  { x: 490, y: 451 },
  { x: 490, y: 518 },
  { x: 490, y: 585 }, // Bottom accent
];

// Layer 3: Output (5 nodes)
const LAYER_3_NODES: Point[] = [
  { x: 670, y: 214 },
  { x: 670, y: 282 },
  { x: 670, y: 350 },
  { x: 670, y: 418 },
  { x: 670, y: 486 },
];

// Convergence & Data Bus Coordinates
const CONVERGENCE_PT: Point = { x: 715, y: 350 };
const BUS_ENTRY_PT: Point = { x: 820, y: 350 };

// DOC / VECTOR STORE Box (Enlarged with generous padding for large font)
const VECTOR_STORE = {
  x: 820,
  y: 305,
  width: 168,
  height: 90,
  center: { x: 904, y: 350 },
  topExit: { x: 904, y: 305 },
  bottomExit: { x: 904, y: 395 },
  rightExit: { x: 988, y: 350 },
};

// Execution Pipeline Panel & Blocks (Enlarged for crisp 100% zoom reading)
const PIPELINE_PANEL = {
  x: 1040,
  y: 100,
  width: 300,
  height: 500,
};

interface PipelineBlock {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  center: Point;
  top: Point;
  bottom: Point;
  right: Point;
  left: Point;
}

const BLOCK_W = 168;
const BLOCK_H = 48;
const BLOCK_X = 1106;

const PIPELINE_BLOCKS: PipelineBlock[] = [
  {
    id: "doc",
    label: "DOC",
    x: BLOCK_X,
    y: 152,
    width: BLOCK_W,
    height: BLOCK_H,
    center: { x: BLOCK_X + BLOCK_W / 2, y: 152 + BLOCK_H / 2 },
    top: { x: BLOCK_X + BLOCK_W / 2, y: 152 },
    bottom: { x: BLOCK_X + BLOCK_W / 2, y: 152 + BLOCK_H },
    right: { x: BLOCK_X + BLOCK_W, y: 152 + BLOCK_H / 2 },
    left: { x: BLOCK_X, y: 152 + BLOCK_H / 2 },
  },
  {
    id: "rag",
    label: "RAG / EMBED",
    x: BLOCK_X,
    y: 226,
    width: BLOCK_W,
    height: BLOCK_H,
    center: { x: BLOCK_X + BLOCK_W / 2, y: 226 + BLOCK_H / 2 },
    top: { x: BLOCK_X + BLOCK_W / 2, y: 226 },
    bottom: { x: BLOCK_X + BLOCK_W / 2, y: 226 + BLOCK_H },
    right: { x: BLOCK_X + BLOCK_W, y: 226 + BLOCK_H / 2 },
    left: { x: BLOCK_X, y: 226 + BLOCK_H / 2 },
  },
  {
    id: "llm",
    label: "LLM",
    x: BLOCK_X,
    y: 300,
    width: BLOCK_W,
    height: BLOCK_H,
    center: { x: BLOCK_X + BLOCK_W / 2, y: 300 + BLOCK_H / 2 },
    top: { x: BLOCK_X + BLOCK_W / 2, y: 300 },
    bottom: { x: BLOCK_X + BLOCK_W / 2, y: 300 + BLOCK_H },
    right: { x: BLOCK_X + BLOCK_W, y: 300 + BLOCK_H / 2 },
    left: { x: BLOCK_X, y: 300 + BLOCK_H / 2 },
  },
  {
    id: "nodes",
    label: "NODES",
    x: BLOCK_X,
    y: 374,
    width: BLOCK_W,
    height: BLOCK_H,
    center: { x: BLOCK_X + BLOCK_W / 2, y: 374 + BLOCK_H / 2 },
    top: { x: BLOCK_X + BLOCK_W / 2, y: 374 },
    bottom: { x: BLOCK_X + BLOCK_W / 2, y: 374 + BLOCK_H },
    right: { x: BLOCK_X + BLOCK_W, y: 374 + BLOCK_H / 2 },
    left: { x: BLOCK_X, y: 374 + BLOCK_H / 2 },
  },
  {
    id: "output",
    label: "OUTPUT",
    x: BLOCK_X,
    y: 448,
    width: BLOCK_W,
    height: BLOCK_H,
    center: { x: BLOCK_X + BLOCK_W / 2, y: 448 + BLOCK_H / 2 },
    top: { x: BLOCK_X + BLOCK_W / 2, y: 448 },
    bottom: { x: BLOCK_X + BLOCK_W / 2, y: 448 + BLOCK_H },
    right: { x: BLOCK_X + BLOCK_W, y: 448 + BLOCK_H / 2 },
    left: { x: BLOCK_X, y: 448 + BLOCK_H / 2 },
  },
];

/* -------------------------------------------------------------------------
 * DETERMINISTIC CAUSAL ROUTES (8 Concurrent Streams)
 * ------------------------------------------------------------------------- */

interface PolylinePath {
  points: Point[];
  cumDist: number[];
  totalLength: number;
  vectorStoreDist: number;
}

function buildPolylinePath(points: Point[], vsIndex: number): PolylinePath {
  const cumDist: number[] = [0];
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    totalLength += Math.sqrt(dx * dx + dy * dy);
    cumDist.push(totalLength);
  }
  return {
    points,
    cumDist,
    totalLength,
    vectorStoreDist: cumDist[Math.min(vsIndex, cumDist.length - 1)],
  };
}

const ROUTES_DATA: PolylinePath[] = [
  // Route 0: Middle -> Main Pipeline
  buildPolylinePath(
    [
      LAYER_0_NODES[1], // (130, 248)
      LAYER_1_NODES[2], // (310, 249)
      LAYER_2_NODES[3], // (490, 316)
      LAYER_3_NODES[2], // (670, 350)
      CONVERGENCE_PT, // (715, 350)
      BUS_ENTRY_PT, // (820, 350)
      VECTOR_STORE.center, // (904, 350)
      VECTOR_STORE.rightExit, // (988, 350)
      { x: 1070, y: 350 },
      { x: 1070, y: 176 },
      PIPELINE_BLOCKS[0].left, // DOC
      PIPELINE_BLOCKS[0].center,
      PIPELINE_BLOCKS[1].center, // RAG
      PIPELINE_BLOCKS[2].center, // LLM
      PIPELINE_BLOCKS[3].center, // NODES
      PIPELINE_BLOCKS[4].center, // OUTPUT
    ],
    5
  ),

  // Route 1: Lower -> RAG Bypass Loop -> NODES -> OUTPUT
  buildPolylinePath(
    [
      LAYER_0_NODES[4], // (130, 452)
      LAYER_1_NODES[5], // (310, 451)
      LAYER_2_NODES[4], // (490, 384)
      LAYER_3_NODES[3], // (670, 418)
      CONVERGENCE_PT,
      BUS_ENTRY_PT,
      VECTOR_STORE.center,
      VECTOR_STORE.rightExit,
      { x: 1070, y: 350 },
      { x: 1070, y: 176 },
      PIPELINE_BLOCKS[0].left,
      PIPELINE_BLOCKS[0].center,
      PIPELINE_BLOCKS[1].center, // RAG
      PIPELINE_BLOCKS[1].right, // Exits right (1274, 250)
      { x: 1308, y: 250 },
      { x: 1308, y: 398 },
      PIPELINE_BLOCKS[3].right, // Enters NODES right (1274, 398)
      PIPELINE_BLOCKS[3].center,
      PIPELINE_BLOCKS[4].center, // OUTPUT
    ],
    5
  ),

  // Route 2: Upper -> Top TOKEN_STREAM -> DOC -> LLM -> OUTPUT
  buildPolylinePath(
    [
      LAYER_0_NODES[0], // (130, 180)
      LAYER_1_NODES[0], // Top Accent (310, 115)
      LAYER_2_NODES[0], // Top Accent (490, 115)
      LAYER_3_NODES[0], // (670, 214)
      CONVERGENCE_PT,
      BUS_ENTRY_PT,
      VECTOR_STORE.center,
      VECTOR_STORE.topExit, // (904, 305)
      { x: 904, y: 205 },
      { x: 1040, y: 205 },
      { x: 1070, y: 205 },
      { x: 1070, y: 176 },
      PIPELINE_BLOCKS[0].left,
      PIPELINE_BLOCKS[0].center,
      PIPELINE_BLOCKS[1].center,
      PIPELINE_BLOCKS[2].center,
      PIPELINE_BLOCKS[4].center,
    ],
    5
  ),

  // Route 3: Bottom -> Bottom TOKEN_STREAM -> OUTPUT
  buildPolylinePath(
    [
      LAYER_0_NODES[5], // (130, 520)
      LAYER_1_NODES[7], // Bottom Accent (310, 585)
      LAYER_2_NODES[7], // Bottom Accent (490, 585)
      LAYER_3_NODES[4], // (670, 486)
      CONVERGENCE_PT,
      BUS_ENTRY_PT,
      VECTOR_STORE.center,
      VECTOR_STORE.bottomExit, // (904, 395)
      { x: 904, y: 495 },
      { x: 1040, y: 495 },
      { x: 1106, y: 495 },
      PIPELINE_BLOCKS[4].left,
      PIPELINE_BLOCKS[4].center,
    ],
    5
  ),

  // Route 4: Middle-High -> Direct LLM -> NODES -> OUTPUT
  buildPolylinePath(
    [
      LAYER_0_NODES[2], // (130, 316)
      LAYER_1_NODES[3], // (310, 316)
      LAYER_2_NODES[1], // (490, 182)
      LAYER_3_NODES[1], // (670, 282)
      CONVERGENCE_PT,
      BUS_ENTRY_PT,
      VECTOR_STORE.center,
      VECTOR_STORE.rightExit,
      { x: 1070, y: 350 },
      { x: 1070, y: 324 },
      PIPELINE_BLOCKS[2].left, // Direct LLM
      PIPELINE_BLOCKS[2].center,
      PIPELINE_BLOCKS[3].center,
      PIPELINE_BLOCKS[4].center,
    ],
    5
  ),

  // Route 5: Middle-Low -> Cascading Pipeline
  buildPolylinePath(
    [
      LAYER_0_NODES[3], // (130, 384)
      LAYER_1_NODES[4], // (310, 384)
      LAYER_2_NODES[5], // (490, 451)
      LAYER_3_NODES[2], // (670, 350)
      CONVERGENCE_PT,
      BUS_ENTRY_PT,
      VECTOR_STORE.center,
      VECTOR_STORE.rightExit,
      { x: 1070, y: 350 },
      { x: 1070, y: 176 },
      PIPELINE_BLOCKS[0].left,
      PIPELINE_BLOCKS[0].center,
      PIPELINE_BLOCKS[1].center,
      PIPELINE_BLOCKS[2].center,
      PIPELINE_BLOCKS[3].center,
      PIPELINE_BLOCKS[4].center,
    ],
    5
  ),

  // Route 6: High -> Top TOKEN_STREAM -> RAG Bypass
  buildPolylinePath(
    [
      LAYER_0_NODES[1], // (130, 248)
      LAYER_1_NODES[1], // (310, 182)
      LAYER_2_NODES[2], // (490, 249)
      LAYER_3_NODES[0], // (670, 214)
      CONVERGENCE_PT,
      BUS_ENTRY_PT,
      VECTOR_STORE.center,
      VECTOR_STORE.topExit,
      { x: 904, y: 205 },
      { x: 1040, y: 205 },
      PIPELINE_BLOCKS[1].left, // RAG
      PIPELINE_BLOCKS[1].center,
      PIPELINE_BLOCKS[1].right,
      { x: 1308, y: 250 },
      { x: 1308, y: 398 },
      PIPELINE_BLOCKS[3].right,
      PIPELINE_BLOCKS[3].center,
      PIPELINE_BLOCKS[4].center,
    ],
    5
  ),

  // Route 7: Low -> Bottom TOKEN_STREAM -> NODES
  buildPolylinePath(
    [
      LAYER_0_NODES[4], // (130, 452)
      LAYER_1_NODES[6], // (310, 518)
      LAYER_2_NODES[6], // (490, 518)
      LAYER_3_NODES[4], // (670, 486)
      CONVERGENCE_PT,
      BUS_ENTRY_PT,
      VECTOR_STORE.center,
      VECTOR_STORE.bottomExit,
      { x: 904, y: 495 },
      { x: 1040, y: 495 },
      PIPELINE_BLOCKS[3].left, // NODES
      PIPELINE_BLOCKS[3].center,
      PIPELINE_BLOCKS[4].center,
    ],
    5
  ),
];

function getPointOnPolyline(
  path: PolylinePath,
  dist: number
): { point: Point; isGreen: boolean } {
  const { points, cumDist, totalLength, vectorStoreDist } = path;
  const clampedDist = Math.max(0, Math.min(dist, totalLength));
  const isGreen = clampedDist >= vectorStoreDist;

  for (let i = 0; i < cumDist.length - 1; i++) {
    if (clampedDist <= cumDist[i + 1]) {
      const segLength = cumDist[i + 1] - cumDist[i];
      const t = segLength > 0 ? (clampedDist - cumDist[i]) / segLength : 0;
      return {
        point: {
          x: points[i].x + t * (points[i + 1].x - points[i].x),
          y: points[i].y + t * (points[i + 1].y - points[i].y),
        },
        isGreen,
      };
    }
  }

  return {
    point: points[points.length - 1],
    isGreen,
  };
}

/* -------------------------------------------------------------------------
 * COMPONENT
 * ------------------------------------------------------------------------- */

export function AIArchitectureHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId();

  // Theme integration
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  // Reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // 8 Concurrent Particle MotionValues
  const p0X = useMotionValue(ROUTES_DATA[0].points[0].x);
  const p0Y = useMotionValue(ROUTES_DATA[0].points[0].y);
  const p0OrangeOp = useMotionValue(0);
  const p0GreenOp = useMotionValue(0);

  const p1X = useMotionValue(ROUTES_DATA[1].points[0].x);
  const p1Y = useMotionValue(ROUTES_DATA[1].points[0].y);
  const p1OrangeOp = useMotionValue(0);
  const p1GreenOp = useMotionValue(0);

  const p2X = useMotionValue(ROUTES_DATA[2].points[0].x);
  const p2Y = useMotionValue(ROUTES_DATA[2].points[0].y);
  const p2OrangeOp = useMotionValue(0);
  const p2GreenOp = useMotionValue(0);

  const p3X = useMotionValue(ROUTES_DATA[3].points[0].x);
  const p3Y = useMotionValue(ROUTES_DATA[3].points[0].y);
  const p3OrangeOp = useMotionValue(0);
  const p3GreenOp = useMotionValue(0);

  const p4X = useMotionValue(ROUTES_DATA[4].points[0].x);
  const p4Y = useMotionValue(ROUTES_DATA[4].points[0].y);
  const p4OrangeOp = useMotionValue(0);
  const p4GreenOp = useMotionValue(0);

  const p5X = useMotionValue(ROUTES_DATA[5].points[0].x);
  const p5Y = useMotionValue(ROUTES_DATA[5].points[0].y);
  const p5OrangeOp = useMotionValue(0);
  const p5GreenOp = useMotionValue(0);

  const p6X = useMotionValue(ROUTES_DATA[6].points[0].x);
  const p6Y = useMotionValue(ROUTES_DATA[6].points[0].y);
  const p6OrangeOp = useMotionValue(0);
  const p6GreenOp = useMotionValue(0);

  const p7X = useMotionValue(ROUTES_DATA[7].points[0].x);
  const p7Y = useMotionValue(ROUTES_DATA[7].points[0].y);
  const p7OrangeOp = useMotionValue(0);
  const p7GreenOp = useMotionValue(0);

  // Pulse intensities for key nodes and blocks
  const pulseVectorStore = useMotionValue(0);
  const pulsePipeline = useMotionValue(0);
  const pulseDoc = useMotionValue(0);
  const pulseLlm = useMotionValue(0);
  const pulseOutput = useMotionValue(0);

  // Monotonic simulated clock
  const simTimeRef = useRef(0);
  const lastVsPulseRef = useRef<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);

  // Reduced motion & visibility
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.08 }
    );
    const container = containerRef.current;
    if (container) observer.observe(container);

    const onVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      mq.removeEventListener("change", handler);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  // Frame Loop (Native 60-120fps with zero React re-renders)
  const CYCLE_DURATION = 7200; // 7.2s cycle
  const STAGGER_INTERVAL = 900; // 0.9s stagger for 8 requests

  useAnimationFrame((_, delta) => {
    if (prefersReducedMotion || !isVisible) return;

    const clampedDelta = Math.min(delta, 80);
    simTimeRef.current += clampedDelta;
    const simTime = simTimeRef.current;

    // Decay pulses
    pulseVectorStore.set(Math.max(0, pulseVectorStore.get() - clampedDelta * 0.0035));
    pulsePipeline.set(Math.max(0, pulsePipeline.get() - clampedDelta * 0.0035));
    pulseDoc.set(Math.max(0, pulseDoc.get() - clampedDelta * 0.004));
    pulseLlm.set(Math.max(0, pulseLlm.get() - clampedDelta * 0.004));
    pulseOutput.set(Math.max(0, pulseOutput.get() - clampedDelta * 0.004));

    const particles = [
      { path: ROUTES_DATA[0], x: p0X, y: p0Y, orangeOp: p0OrangeOp, greenOp: p0GreenOp, idx: 0 },
      { path: ROUTES_DATA[1], x: p1X, y: p1Y, orangeOp: p1OrangeOp, greenOp: p1GreenOp, idx: 1 },
      { path: ROUTES_DATA[2], x: p2X, y: p2Y, orangeOp: p2OrangeOp, greenOp: p2GreenOp, idx: 2 },
      { path: ROUTES_DATA[3], x: p3X, y: p3Y, orangeOp: p3OrangeOp, greenOp: p3GreenOp, idx: 3 },
      { path: ROUTES_DATA[4], x: p4X, y: p4Y, orangeOp: p4OrangeOp, greenOp: p4GreenOp, idx: 4 },
      { path: ROUTES_DATA[5], x: p5X, y: p5Y, orangeOp: p5OrangeOp, greenOp: p5GreenOp, idx: 5 },
      { path: ROUTES_DATA[6], x: p6X, y: p6Y, orangeOp: p6OrangeOp, greenOp: p6GreenOp, idx: 6 },
      { path: ROUTES_DATA[7], x: p7X, y: p7Y, orangeOp: p7OrangeOp, greenOp: p7GreenOp, idx: 7 },
    ];

    particles.forEach(({ path, x, y, orangeOp, greenOp, idx }) => {
      const localTime = (simTime + idx * STAGGER_INTERVAL) % CYCLE_DURATION;
      const progress = localTime / CYCLE_DURATION;
      const dist = progress * path.totalLength;

      const { point, isGreen } = getPointOnPolyline(path, dist);

      // Vector store pulse
      if (dist >= path.vectorStoreDist && lastVsPulseRef.current[idx] < path.vectorStoreDist) {
        pulseVectorStore.set(1);
        pulsePipeline.set(0.6);
      }
      lastVsPulseRef.current[idx] = dist;

      // Pipeline block pulses
      if (progress > 0.65 && progress < 0.72) pulseDoc.set(0.9);
      if (progress > 0.75 && progress < 0.82) pulseLlm.set(0.9);
      if (progress > 0.90 && progress < 0.98) pulseOutput.set(1.0);

      let alpha = 1.0;
      if (progress < 0.04) alpha = progress / 0.04;
      else if (progress > 0.94) alpha = (1.0 - progress) / 0.06;

      x.set(point.x);
      y.set(point.y);

      if (isGreen) {
        orangeOp.set(0);
        greenOp.set(alpha);
      } else {
        orangeOp.set(alpha);
        greenOp.set(0);
      }
    });
  });

  // Dynamic Theme Colors (Light Mode high-contrast vs Dark Mode charcoal terminal)
  const colors = isDark
    ? {
        bg: "#0A0A0C",
        grid: "#10B981",
        gridOpacity: 0.07,
        hudBg: "#0A0A0C",
        hudBorder: "#10B981",
        hudBorderOpacity: 0.6,
        hudText: "#10B981",
        edgeL0L1: "#F97316",
        edgeL0L1Opacity: 0.32,
        edgeL2L3: "#10B981",
        edgeL2L3Opacity: 0.34,
        gradStart: "#F97316",
        gradMid: "#2DD4BF",
        gradEnd: "#10B981",
        nodeL0Fill: "#0D0907",
        nodeL0Stroke: "#F97316",
        nodeL1Fill: "#0E0D0A",
        nodeL1Stroke: "#F59E0B",
        nodeL1AccentStroke: "#F97316",
        nodeL2Fill: "#08140F",
        nodeL2Stroke: "#10B981",
        nodeL3Fill: "#071510",
        nodeL3Stroke: "#10B981",
        busStroke: "#10B981",
        busText: "#10B981",
        vsBg: "#081611",
        vsBorder: "#10B981",
        vsTextTop: "#E2E8F0",
        vsTextBot: "#10B981",
        tokenStream: "#10B981",
        pipePanelBg: "#06140E",
        pipePanelBorder: "#10B981",
        pipePanelTitle: "#10B981",
        pipeBlockBg: "#081A12",
        pipeBlockBorder: "#10B981",
        pipeBlockText: "#E2E8F0",
        pipeArrow: "#10B981",
        particleOrangeCore: "#FFFFFF",
        particleOrangeHalo: "#F97316",
        particleGreenCore: "#FFFFFF",
        particleGreenHalo: "#10B981",
        pulseStroke: "#34D399",
      }
    : {
        bg: "#F8F7F4", // Light theme Swiss Ivory
        grid: "#059669",
        gridOpacity: 0.08,
        hudBg: "#FFFFFF",
        hudBorder: "#059669",
        hudBorderOpacity: 0.45,
        hudText: "#047857",
        edgeL0L1: "#EA580C",
        edgeL0L1Opacity: 0.45,
        edgeL2L3: "#059669",
        edgeL2L3Opacity: 0.45,
        gradStart: "#EA580C",
        gradMid: "#0D9488",
        gradEnd: "#059669",
        nodeL0Fill: "#FFFFFF",
        nodeL0Stroke: "#EA580C",
        nodeL1Fill: "#FFFFFF",
        nodeL1Stroke: "#D97706",
        nodeL1AccentStroke: "#EA580C",
        nodeL2Fill: "#FFFFFF",
        nodeL2Stroke: "#059669",
        nodeL3Fill: "#FFFFFF",
        nodeL3Stroke: "#059669",
        busStroke: "#059669",
        busText: "#047857",
        vsBg: "#FFFFFF",
        vsBorder: "#059669",
        vsTextTop: "#0F172A", // Crisp dark slate
        vsTextBot: "#047857",
        tokenStream: "#047857",
        pipePanelBg: "#F0FDF4",
        pipePanelBorder: "#059669",
        pipePanelTitle: "#047857",
        pipeBlockBg: "#FFFFFF",
        pipeBlockBorder: "#059669",
        pipeBlockText: "#0F172A", // Crisp dark slate
        pipeArrow: "#059669",
        particleOrangeCore: "#EA580C",
        particleOrangeHalo: "#FB923C",
        particleGreenCore: "#047857",
        particleGreenHalo: "#34D399",
        pulseStroke: "#059669",
      };

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-xs border border-border/80 bg-[#F8F7F4] dark:bg-[#0A0A0C] shadow-lg dark:shadow-2xl overflow-hidden select-none transition-colors duration-200"
      role="img"
      aria-label="Interactive AI Architecture Diagram: Neural network feedforward layers converging into Vector Store and Execution Pipeline with simulated causal data streams"
    >
      <div className="relative w-full aspect-[1376/700]">
        <svg
          viewBox="0 0 1376 700"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full block"
          aria-hidden="true"
        >
          {/* SVG Definitions */}
          <defs>
            <pattern
              id={`tech-grid-${id}`}
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 32 0 L 0 0 0 32"
                fill="none"
                stroke={colors.grid}
                strokeWidth="0.6"
                strokeOpacity={colors.gridOpacity}
              />
            </pattern>

            {/* Glow Filters */}
            <filter
              id={`glow-orange-${id}`}
              x="-40%"
              y="-40%"
              width="180%"
              height="180%"
            >
              <feGaussianBlur
                stdDeviation={isDark ? "3.5" : "1.5"}
                result="blur"
              />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter
              id={`glow-green-${id}`}
              x="-40%"
              y="-40%"
              width="180%"
              height="180%"
            >
              <feGaussianBlur
                stdDeviation={isDark ? "3.5" : "1.5"}
                result="blur"
              />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter
              id={`glow-strong-green-${id}`}
              x="-60%"
              y="-60%"
              width="220%"
              height="220%"
            >
              <feGaussianBlur
                stdDeviation={isDark ? "5" : "2"}
                result="blur1"
              />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Inter-layer Transition Gradient */}
            <linearGradient
              id={`grad-transition-${id}`}
              x1="310"
              y1="0"
              x2="490"
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor={colors.gradStart} stopOpacity="0.45" />
              <stop offset="50%" stopColor={colors.gradMid} stopOpacity="0.4" />
              <stop offset="100%" stopColor={colors.gradEnd} stopOpacity="0.45" />
            </linearGradient>

            {/* Arrowhead Markers */}
            <marker
              id={`arrow-right-${id}`}
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
            >
              <path d="M0,1.5 L7,4 L0,6.5 Z" fill={colors.busStroke} />
            </marker>
            <marker
              id={`arrow-down-${id}`}
              markerWidth="8"
              markerHeight="8"
              refX="4"
              refY="7"
              orient="auto"
            >
              <path d="M1.5,0 L4,7 L6.5,0 Z" fill={colors.pipeArrow} />
            </marker>
            <marker
              id={`arrow-left-${id}`}
              markerWidth="8"
              markerHeight="8"
              refX="1"
              refY="4"
              orient="auto"
            >
              <path d="M7,1.5 L0,4 L7,6.5 Z" fill={colors.pipeArrow} />
            </marker>
          </defs>

          {/* Background & Grid */}
          <rect width="1376" height="700" fill={colors.bg} />
          <rect width="1376" height="700" fill={`url(#tech-grid-${id})`} />

          {/* =============================================================
              STATUS HUD PANELS (Top-Left, Bottom-Left, Bottom-Right)
             ============================================================= */}
          {/* Top-Left HUD Card */}
          <g transform="translate(24, 20)">
            <rect
              width="224"
              height="84"
              rx="4"
              fill={colors.hudBg}
              fillOpacity={isDark ? "0.85" : "0.95"}
              stroke={colors.hudBorder}
              strokeWidth="1.2"
              strokeOpacity={colors.hudBorderOpacity}
            />
            <text
              x="14"
              y="26"
              fill={colors.hudText}
              fontFamily="monospace"
              fontSize="13"
              fontWeight="700"
              letterSpacing="0.05em"
            >
              SYSTEM: APPLIED_AI
            </text>
            <text
              x="14"
              y="49"
              fill={colors.hudText}
              fontFamily="monospace"
              fontSize="13"
              fontWeight="700"
              letterSpacing="0.05em"
            >
              STACK: TS + PY
            </text>
            <text
              x="14"
              y="72"
              fill={colors.hudText}
              fontFamily="monospace"
              fontSize="13"
              fontWeight="700"
              letterSpacing="0.05em"
              fillOpacity="0.85"
            >
              LATENCY: 12ms [SIM]
            </text>
          </g>

          {/* Bottom-Left HUD Card */}
          <g transform="translate(24, 596)">
            <rect
              width="224"
              height="84"
              rx="4"
              fill={colors.hudBg}
              fillOpacity={isDark ? "0.85" : "0.95"}
              stroke={colors.hudBorder}
              strokeWidth="1.2"
              strokeOpacity={colors.hudBorderOpacity}
            />
            <text
              x="14"
              y="26"
              fill={colors.hudText}
              fontFamily="monospace"
              fontSize="13"
              fontWeight="700"
              letterSpacing="0.05em"
            >
              SYSTEM: APPLIED_AI
            </text>
            <text
              x="14"
              y="49"
              fill={colors.hudText}
              fontFamily="monospace"
              fontSize="13"
              fontWeight="700"
              letterSpacing="0.05em"
            >
              STACK: TS + PY
            </text>
            <text
              x="14"
              y="72"
              fill={colors.hudText}
              fontFamily="monospace"
              fontSize="13"
              fontWeight="700"
              letterSpacing="0.05em"
              fillOpacity="0.85"
            >
              LATENCY: 12ms [SIM]
            </text>
          </g>

          {/* Bottom-Right HUD Card */}
          <g transform="translate(1128, 596)">
            <rect
              width="224"
              height="84"
              rx="4"
              fill={colors.hudBg}
              fillOpacity={isDark ? "0.85" : "0.95"}
              stroke={colors.hudBorder}
              strokeWidth="1.2"
              strokeOpacity={colors.hudBorderOpacity}
            />
            <text
              x="14"
              y="26"
              fill={colors.hudText}
              fontFamily="monospace"
              fontSize="13"
              fontWeight="700"
              letterSpacing="0.05em"
            >
              SYSTEM: APPLIED_AI
            </text>
            <text
              x="14"
              y="49"
              fill={colors.hudText}
              fontFamily="monospace"
              fontSize="13"
              fontWeight="700"
              letterSpacing="0.05em"
            >
              STACK: TS + PY
            </text>
            <text
              x="14"
              y="72"
              fill={colors.hudText}
              fontFamily="monospace"
              fontSize="13"
              fontWeight="700"
              letterSpacing="0.05em"
              fillOpacity="0.85"
            >
              LATENCY: 12ms [SIM]
            </text>
          </g>

          {/* =============================================================
              NEURAL NETWORK CONNECTIONS (Edges)
             ============================================================= */}
          <g id="neural-network-edges">
            {LAYER_0_NODES.map((n0, i) =>
              LAYER_1_NODES.map((n1, j) => (
                <line
                  key={`l0-l1-${i}-${j}`}
                  x1={n0.x}
                  y1={n0.y}
                  x2={n1.x}
                  y2={n1.y}
                  stroke={colors.edgeL0L1}
                  strokeWidth="0.95"
                  strokeOpacity={colors.edgeL0L1Opacity}
                />
              ))
            )}

            {LAYER_1_NODES.map((n1, i) =>
              LAYER_2_NODES.map((n2, j) => (
                <line
                  key={`l1-l2-${i}-${j}`}
                  x1={n1.x}
                  y1={n1.y}
                  x2={n2.x}
                  y2={n2.y}
                  stroke={`url(#grad-transition-${id})`}
                  strokeWidth="0.95"
                  strokeOpacity="0.36"
                />
              ))
            )}

            {LAYER_2_NODES.map((n2, i) =>
              LAYER_3_NODES.map((n3, j) => (
                <line
                  key={`l2-l3-${i}-${j}`}
                  x1={n2.x}
                  y1={n2.y}
                  x2={n3.x}
                  y2={n3.y}
                  stroke={colors.edgeL2L3}
                  strokeWidth="0.95"
                  strokeOpacity={colors.edgeL2L3Opacity}
                />
              ))
            )}
          </g>

          {/* =============================================================
              NEURAL NETWORK NODES
             ============================================================= */}
          <g id="neural-network-nodes">
            {/* Column 0: Input (6 nodes) */}
            {LAYER_0_NODES.map((node, i) => (
              <g key={`col0-node-${i}`} transform={`translate(${node.x}, ${node.y})`}>
                <circle
                  r="18"
                  fill={colors.nodeL0Fill}
                  stroke={colors.nodeL0Stroke}
                  strokeWidth="2"
                  filter={`url(#glow-orange-${id})`}
                />
                <circle r="7" fill={colors.nodeL0Stroke} fillOpacity="0.25" />
              </g>
            ))}

            {/* Column 1: Hidden 1 (8 nodes) */}
            {LAYER_1_NODES.map((node, i) => {
              const isAccent = i === 0 || i === 7;
              return (
                <g key={`col1-node-${i}`} transform={`translate(${node.x}, ${node.y})`}>
                  {isAccent ? (
                    <>
                      <circle
                        r="22"
                        fill={colors.nodeL1Fill}
                        stroke={colors.nodeL1AccentStroke}
                        strokeWidth="2.4"
                        filter={`url(#glow-orange-${id})`}
                      />
                      <circle r="12" fill={colors.nodeL1AccentStroke} fillOpacity="0.2" />
                      <circle r="5" fill={colors.nodeL1AccentStroke} />
                    </>
                  ) : (
                    <>
                      <circle
                        r="16"
                        fill={colors.nodeL1Fill}
                        stroke={colors.nodeL1Stroke}
                        strokeWidth="1.8"
                      />
                      <circle r="5" fill={colors.nodeL1Stroke} fillOpacity="0.3" />
                    </>
                  )}
                </g>
              );
            })}

            {/* Column 2: Hidden 2 (8 nodes) */}
            {LAYER_2_NODES.map((node, i) => {
              const isAccent = i === 0 || i === 7;
              return (
                <g key={`col2-node-${i}`} transform={`translate(${node.x}, ${node.y})`}>
                  {isAccent ? (
                    <>
                      <circle
                        r="22"
                        fill={colors.nodeL2Fill}
                        stroke={colors.nodeL2Stroke}
                        strokeWidth="2.4"
                        filter={`url(#glow-green-${id})`}
                      />
                      <circle r="12" fill={colors.nodeL2Stroke} fillOpacity="0.2" />
                      <circle r="5" fill={colors.nodeL2Stroke} />
                    </>
                  ) : (
                    <>
                      <circle
                        r="16"
                        fill={colors.nodeL2Fill}
                        stroke={colors.nodeL2Stroke}
                        strokeWidth="1.8"
                      />
                      <circle r="5" fill={colors.nodeL2Stroke} fillOpacity="0.3" />
                    </>
                  )}
                </g>
              );
            })}

            {/* Column 3: Output (5 nodes) */}
            {LAYER_3_NODES.map((node, i) => (
              <g key={`col3-node-${i}`} transform={`translate(${node.x}, ${node.y})`}>
                <circle
                  r="17"
                  fill={colors.nodeL3Fill}
                  stroke={colors.nodeL3Stroke}
                  strokeWidth="2"
                  filter={`url(#glow-green-${id})`}
                />
                <circle r="6" fill={colors.nodeL3Stroke} fillOpacity="0.3" />
              </g>
            ))}
          </g>

          {/* =============================================================
              DATA BUS & CONVERGENCE
             ============================================================= */}
          <g id="data-bus">
            {LAYER_3_NODES.map((node, i) => (
              <line
                key={`conv-${i}`}
                x1={node.x}
                y1={node.y}
                x2={CONVERGENCE_PT.x}
                y2={CONVERGENCE_PT.y}
                stroke={colors.busStroke}
                strokeWidth="1.4"
                strokeOpacity="0.75"
              />
            ))}

            <line
              x1={CONVERGENCE_PT.x}
              y1={CONVERGENCE_PT.y}
              x2={BUS_ENTRY_PT.x}
              y2={BUS_ENTRY_PT.y}
              stroke={colors.busStroke}
              strokeWidth="2.4"
              markerEnd={`url(#arrow-right-${id})`}
            />

            {/* High-legibility Data Bus Labels */}
            <text
              x="767"
              y="332"
              textAnchor="middle"
              fill={colors.busText}
              fontFamily="monospace"
              fontSize="14"
              fontWeight="800"
              letterSpacing="0.08em"
            >
              DATA BUS
            </text>
            <text
              x="767"
              y="372"
              textAnchor="middle"
              fill={colors.busText}
              fontFamily="monospace"
              fontSize="12.5"
              fontWeight="700"
              fillOpacity="0.85"
            >
              +2.8ms (sim)
            </text>
          </g>

          {/* =============================================================
              DOC / VECTOR STORE BOX
             ============================================================= */}
          <g id="vector-store-box">
            <rect
              x={VECTOR_STORE.x}
              y={VECTOR_STORE.y}
              width={VECTOR_STORE.width}
              height={VECTOR_STORE.height}
              rx="4"
              fill={colors.vsBg}
              stroke={colors.vsBorder}
              strokeWidth="2"
              filter={`url(#glow-green-${id})`}
            />

            <motion.rect
              x={VECTOR_STORE.x}
              y={VECTOR_STORE.y}
              width={VECTOR_STORE.width}
              height={VECTOR_STORE.height}
              rx="4"
              fill="none"
              stroke={colors.pulseStroke}
              strokeWidth="3.5"
              style={{ opacity: pulseVectorStore }}
              filter={`url(#glow-strong-green-${id})`}
            />

            <text
              x={VECTOR_STORE.center.x}
              y={VECTOR_STORE.center.y - 10}
              textAnchor="middle"
              fill={colors.vsTextTop}
              fontFamily="monospace"
              fontSize="17"
              fontWeight="800"
              letterSpacing="0.05em"
            >
              DOC /
            </text>
            <text
              x={VECTOR_STORE.center.x}
              y={VECTOR_STORE.center.y + 18}
              textAnchor="middle"
              fill={colors.vsTextBot}
              fontFamily="monospace"
              fontSize="14"
              fontWeight="800"
              letterSpacing="0.06em"
            >
              VECTOR STORE
            </text>
          </g>

          {/* =============================================================
              TOKEN STREAMS & OUTLETS
             ============================================================= */}
          <g id="token-streams">
            {/* Top Token Stream */}
            <path
              d={`M ${VECTOR_STORE.topExit.x} ${VECTOR_STORE.topExit.y} V 205 H ${PIPELINE_PANEL.x}`}
              fill="none"
              stroke={colors.tokenStream}
              strokeWidth="1.5"
              strokeOpacity="0.85"
              markerEnd={`url(#arrow-right-${id})`}
            />
            <text
              x="918"
              y="255"
              fill={colors.tokenStream}
              fontFamily="monospace"
              fontSize="13"
              fontWeight="700"
              letterSpacing="0.06em"
            >
              TOKEN_STREAM
            </text>

            {/* Bottom Token Stream */}
            <path
              d={`M ${VECTOR_STORE.bottomExit.x} ${VECTOR_STORE.bottomExit.y} V 495 H ${PIPELINE_PANEL.x}`}
              fill="none"
              stroke={colors.tokenStream}
              strokeWidth="1.5"
              strokeOpacity="0.85"
              markerEnd={`url(#arrow-right-${id})`}
            />
            <text
              x="918"
              y="450"
              fill={colors.tokenStream}
              fontFamily="monospace"
              fontSize="13"
              fontWeight="700"
              letterSpacing="0.06em"
            >
              TOKEN_STREAM
            </text>

            {/* Mid outlet from Vector Store -> DOC & LLM */}
            <path
              d={`M ${VECTOR_STORE.rightExit.x} ${VECTOR_STORE.rightExit.y} H 1070 V 176 H ${PIPELINE_BLOCKS[0].left.x}`}
              fill="none"
              stroke={colors.tokenStream}
              strokeWidth="1.5"
              strokeOpacity="0.85"
              markerEnd={`url(#arrow-right-${id})`}
            />
            <line
              x1="1070"
              y1="350"
              x2={PIPELINE_BLOCKS[2].left.x}
              y2="350"
              stroke={colors.tokenStream}
              strokeWidth="1.5"
              strokeOpacity="0.85"
              markerEnd={`url(#arrow-right-${id})`}
            />
          </g>

          {/* =============================================================
              EXECUTION PIPELINE (Right Panel & Vertical Stack)
             ============================================================= */}
          <g id="execution-pipeline">
            {/* Outer Frame */}
            <rect
              x={PIPELINE_PANEL.x}
              y={PIPELINE_PANEL.y}
              width={PIPELINE_PANEL.width}
              height={PIPELINE_PANEL.height}
              rx="6"
              fill={colors.pipePanelBg}
              fillOpacity={isDark ? "0.55" : "0.85"}
              stroke={colors.pipePanelBorder}
              strokeWidth="1.6"
              strokeOpacity="0.9"
            />

            <motion.rect
              x={PIPELINE_PANEL.x}
              y={PIPELINE_PANEL.y}
              width={PIPELINE_PANEL.width}
              height={PIPELINE_PANEL.height}
              rx="6"
              fill="none"
              stroke={colors.pulseStroke}
              strokeWidth="2.8"
              style={{ opacity: pulsePipeline }}
              filter={`url(#glow-green-${id})`}
            />

            {/* Title */}
            <text
              x={PIPELINE_PANEL.x + PIPELINE_PANEL.width / 2}
              y={PIPELINE_PANEL.y + 28}
              textAnchor="middle"
              fill={colors.pipePanelTitle}
              fontFamily="monospace"
              fontSize="14.5"
              fontWeight="800"
              letterSpacing="0.12em"
            >
              EXECUTION PIPELINE
            </text>

            {/* Vertical Flow Arrows */}
            {PIPELINE_BLOCKS.slice(0, 4).map((blk, idx) => (
              <line
                key={`pipe-arrow-${idx}`}
                x1={blk.bottom.x}
                y1={blk.bottom.y}
                x2={PIPELINE_BLOCKS[idx + 1].top.x}
                y2={PIPELINE_BLOCKS[idx + 1].top.y}
                stroke={colors.pipeArrow}
                strokeWidth="1.6"
                markerEnd={`url(#arrow-down-${id})`}
              />
            ))}

            {/* Lateral Bypass Loop: RAG / EMBED -> NODES */}
            <path
              d={`M ${PIPELINE_BLOCKS[1].right.x} ${PIPELINE_BLOCKS[1].right.y} H 1308 V ${PIPELINE_BLOCKS[3].right.y} H ${PIPELINE_BLOCKS[3].right.x}`}
              fill="none"
              stroke={colors.pipeArrow}
              strokeWidth="1.5"
              strokeOpacity="0.9"
              markerEnd={`url(#arrow-left-${id})`}
            />

            {/* 5 High-Legibility Pipeline Blocks */}
            {PIPELINE_BLOCKS.map((blk) => {
              const pulseValue =
                blk.id === "doc"
                  ? pulseDoc
                  : blk.id === "llm"
                  ? pulseLlm
                  : blk.id === "output"
                  ? pulseOutput
                  : undefined;

              return (
                <g key={`block-${blk.id}`}>
                  <rect
                    x={blk.x}
                    y={blk.y}
                    width={blk.width}
                    height={blk.height}
                    rx="4"
                    fill={colors.pipeBlockBg}
                    stroke={colors.pipeBlockBorder}
                    strokeWidth="1.6"
                    filter={`url(#glow-green-${id})`}
                  />

                  {pulseValue && (
                    <motion.rect
                      x={blk.x}
                      y={blk.y}
                      width={blk.width}
                      height={blk.height}
                      rx="4"
                      fill="none"
                      stroke={colors.pulseStroke}
                      strokeWidth="2.8"
                      style={{ opacity: pulseValue }}
                      filter={`url(#glow-strong-green-${id})`}
                    />
                  )}

                  <text
                    x={blk.center.x}
                    y={blk.center.y + 5}
                    textAnchor="middle"
                    fill={colors.pipeBlockText}
                    fontFamily="monospace"
                    fontSize={blk.id === "rag" ? "14" : "15"}
                    fontWeight="800"
                    letterSpacing="0.05em"
                  >
                    {blk.label}
                  </text>
                </g>
              );
            })}
          </g>

          {/* =============================================================
              8 CONTINUOUS CAUSAL LIGHT REQUEST PARTICLES
             ============================================================= */}
          {!prefersReducedMotion && (
            <g id="animated-causal-particles">
              {[
                { x: p0X, y: p0Y, orangeOp: p0OrangeOp, greenOp: p0GreenOp, key: "p0" },
                { x: p1X, y: p1Y, orangeOp: p1OrangeOp, greenOp: p1GreenOp, key: "p1" },
                { x: p2X, y: p2Y, orangeOp: p2OrangeOp, greenOp: p2GreenOp, key: "p2" },
                { x: p3X, y: p3Y, orangeOp: p3OrangeOp, greenOp: p3GreenOp, key: "p3" },
                { x: p4X, y: p4Y, orangeOp: p4OrangeOp, greenOp: p4GreenOp, key: "p4" },
                { x: p5X, y: p5Y, orangeOp: p5OrangeOp, greenOp: p5GreenOp, key: "p5" },
                { x: p6X, y: p6Y, orangeOp: p6OrangeOp, greenOp: p6GreenOp, key: "p6" },
                { x: p7X, y: p7Y, orangeOp: p7OrangeOp, greenOp: p7GreenOp, key: "p7" },
              ].map(({ x, y, orangeOp, greenOp, key }) => (
                <g key={key}>
                  {/* Orange Phase */}
                  <motion.circle
                    cx={x}
                    cy={y}
                    r="4.8"
                    fill={colors.particleOrangeCore}
                    style={{
                      opacity: orangeOp,
                      filter: `url(#glow-orange-${id})`,
                    }}
                  />
                  <motion.circle
                    cx={x}
                    cy={y}
                    r="10"
                    fill={colors.particleOrangeHalo}
                    style={{
                      opacity: orangeOp,
                      fillOpacity: isDark ? 0.45 : 0.35,
                    }}
                  />
                  {/* Green Phase */}
                  <motion.circle
                    cx={x}
                    cy={y}
                    r="4.8"
                    fill={colors.particleGreenCore}
                    style={{
                      opacity: greenOp,
                      filter: `url(#glow-strong-green-${id})`,
                    }}
                  />
                  <motion.circle
                    cx={x}
                    cy={y}
                    r="10"
                    fill={colors.particleGreenHalo}
                    style={{
                      opacity: greenOp,
                      fillOpacity: isDark ? 0.45 : 0.35,
                    }}
                  />
                </g>
              ))}
            </g>
          )}
        </svg>
      </div>

      {/* CAD Terminal Corner Markers */}
      <div
        className={`absolute top-2 left-2 pointer-events-none font-mono text-[11px] select-none ${
          isDark ? "text-emerald-500/50" : "text-emerald-700/60"
        }`}
      >
        ┌
      </div>
      <div
        className={`absolute top-2 right-2 pointer-events-none font-mono text-[11px] select-none ${
          isDark ? "text-emerald-500/50" : "text-emerald-700/60"
        }`}
      >
        ┐
      </div>
      <div
        className={`absolute bottom-2 left-2 pointer-events-none font-mono text-[11px] select-none ${
          isDark ? "text-emerald-500/50" : "text-emerald-700/60"
        }`}
      >
        └
      </div>
      <div
        className={`absolute bottom-2 right-2 pointer-events-none font-mono text-[11px] select-none ${
          isDark ? "text-emerald-500/50" : "text-emerald-700/60"
        }`}
      >
        ┘
      </div>

      {/* Discreet Live State Badge */}
      <div
        className={`absolute top-2.5 right-6 pointer-events-none flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-xs border ${
          isDark
            ? "bg-emerald-950/40 text-emerald-400/80 border-emerald-500/20"
            : "bg-emerald-50 text-emerald-800 border-emerald-200"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full animate-pulse ${
            isDark ? "bg-emerald-400" : "bg-emerald-600"
          }`}
        />
        <span>SIMULATED PIPELINE</span>
      </div>
    </div>
  );
}
