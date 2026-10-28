"use client";

import React, { useEffect, useRef } from "react";

interface Vertex3D {
  baseX: number;
  baseY: number;
  baseZ: number;
  phaseX: number;
  phaseY: number;
  phaseZ: number;
  speed: number;
  amp: number;
}

interface Face3D {
  indices: number[];
  type: "terracotta" | "graphite" | "emerald" | "slate";
  strokeColor?: string;
  wireOnly?: boolean;
}

interface Edge {
  u: number;
  v: number;
}

interface DataPulse {
  edgeIndex: number;
  progress: number;
  speed: number;
  color: string;
}

interface VertexRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export function NetworkMesh() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Mouse coordinates & smoothed tilt
    let mouseX = 0;
    let mouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0;
    let curRotY = 0;
    let curRotX = 0;

    // Define 3D architectural vertices of the sculpture
    // Coordinates normalized around (0, 0, 0), span approx -1.8 to +1.8
    const rawVertices: Vertex3D[] = [
      // Central spine & core vertices
      { baseX: 0.0, baseY: -1.75, baseZ: 0.2, phaseX: 0.0, phaseY: 0.5, phaseZ: 0.2, speed: 0.015, amp: 0.06 }, // 0: Top apex
      { baseX: -0.85, baseY: -0.95, baseZ: 0.55, phaseX: 1.1, phaseY: 0.8, phaseZ: 0.6, speed: 0.018, amp: 0.08 }, // 1: Upper left front
      { baseX: 0.45, baseY: -0.85, baseZ: 0.75, phaseX: 2.2, phaseY: 1.4, phaseZ: 1.1, speed: 0.02, amp: 0.07 }, // 2: Upper right front
      { baseX: -0.2, baseY: -0.4, baseZ: 1.1, phaseX: 0.7, phaseY: 2.1, phaseZ: 1.8, speed: 0.017, amp: 0.09 }, // 3: Mid prominent nose
      { baseX: 1.15, baseY: -0.25, baseZ: 0.3, phaseX: 1.9, phaseY: 0.3, phaseZ: 2.4, speed: 0.016, amp: 0.08 }, // 4: Right wing upper
      { baseX: -1.35, baseY: -0.15, baseZ: 0.25, phaseX: 3.1, phaseY: 1.9, phaseZ: 0.5, speed: 0.019, amp: 0.08 }, // 5: Left wing peak
      { baseX: -0.7, baseY: 0.55, baseZ: 0.85, phaseX: 2.5, phaseY: 2.8, phaseZ: 1.2, speed: 0.018, amp: 0.07 }, // 6: Mid-lower left
      { baseX: 0.35, baseY: 0.65, baseZ: 0.95, phaseX: 0.4, phaseY: 3.2, phaseZ: 2.1, speed: 0.016, amp: 0.09 }, // 7: Mid-lower right
      { baseX: 1.05, baseY: 0.85, baseZ: 0.15, phaseX: 1.8, phaseY: 0.9, phaseZ: 1.5, speed: 0.021, amp: 0.07 }, // 8: Lower right edge
      { baseX: -0.95, baseY: 1.15, baseZ: 0.35, phaseX: 2.9, phaseY: 1.5, phaseZ: 0.9, speed: 0.017, amp: 0.08 }, // 9: Lower left edge
      { baseX: 0.05, baseY: 1.8, baseZ: 0.4, phaseX: 0.2, phaseY: 2.5, phaseZ: 1.7, speed: 0.014, amp: 0.06 }, // 10: Bottom prow
      
      // Backing structural plates (graphite / deep depth)
      { baseX: -0.4, baseY: -1.25, baseZ: -0.7, phaseX: 1.5, phaseY: 0.2, phaseZ: 0.8, speed: 0.013, amp: 0.05 }, // 11: Rear top left
      { baseX: 0.6, baseY: -1.05, baseZ: -0.6, phaseX: 0.9, phaseY: 1.1, phaseZ: 1.9, speed: 0.015, amp: 0.05 }, // 12: Rear top right
      { baseX: -1.1, baseY: 0.1, baseZ: -0.65, phaseX: 2.1, phaseY: 2.0, phaseZ: 0.4, speed: 0.012, amp: 0.06 }, // 13: Rear mid left
      { baseX: 0.9, baseY: 0.2, baseZ: -0.55, phaseX: 3.0, phaseY: 0.7, phaseZ: 2.2, speed: 0.014, amp: 0.05 }, // 14: Rear mid right
      { baseX: -0.3, baseY: 1.45, baseZ: -0.6, phaseX: 0.8, phaseY: 1.7, phaseZ: 1.1, speed: 0.016, amp: 0.06 }, // 15: Rear lower left
      { baseX: 0.5, baseY: 1.35, baseZ: -0.5, phaseX: 1.4, phaseY: 2.9, phaseZ: 0.3, speed: 0.013, amp: 0.05 }, // 16: Rear lower right
      
      // Floating technical satellite vertices (schematic anchor points)
      { baseX: -1.7, baseY: -0.7, baseZ: 0.1, phaseX: 0.5, phaseY: 0.8, phaseZ: 1.4, speed: 0.02, amp: 0.07 }, // 17: Sat left
      { baseX: 1.6, baseY: -0.5, baseZ: 0.2, phaseX: 1.2, phaseY: 1.6, phaseZ: 0.9, speed: 0.02, amp: 0.07 }, // 18: Sat right
      { baseX: 0.0, baseY: -2.1, baseZ: -0.2, phaseX: 2.0, phaseY: 0.4, phaseZ: 1.7, speed: 0.015, amp: 0.05 }, // 19: High mast
    ];

    // Define polygonal faces (triangles & trapezoids) with distinct material layers
    const faces: Face3D[] = [
      // Deep Rear Graphite Plates (foundation)
      { indices: [11, 12, 14, 13], type: "graphite" },
      { indices: [13, 14, 16, 15], type: "graphite" },
      { indices: [0, 11, 12], type: "slate" },
      { indices: [15, 16, 10], type: "slate" },

      // Prominent Terracotta / Rust Front Facets
      { indices: [0, 1, 3], type: "terracotta", strokeColor: "#F97316" },
      { indices: [0, 3, 2], type: "terracotta", strokeColor: "#EA580C" },
      { indices: [1, 5, 6], type: "terracotta", strokeColor: "#C2410C" },
      { indices: [1, 6, 3], type: "terracotta", strokeColor: "#FB923C" },
      { indices: [3, 6, 7], type: "terracotta", strokeColor: "#F97316" },
      { indices: [6, 9, 7], type: "terracotta", strokeColor: "#EA580C" },
      { indices: [7, 9, 10], type: "terracotta", strokeColor: "#C2410C" },

      // Slate & Charcoal Structural Transition Facets
      { indices: [2, 4, 7], type: "slate", strokeColor: "#52525B" },
      { indices: [3, 2, 7], type: "slate", strokeColor: "#71717A" },
      { indices: [7, 8, 10], type: "slate", strokeColor: "#3F3F46" },
      { indices: [4, 8, 7], type: "graphite", strokeColor: "#3F3F46" },

      // Emerald Highlight Accents
      { indices: [2, 0, 4], type: "emerald", strokeColor: "#10B981" },
      { indices: [7, 10, 8], type: "emerald", strokeColor: "#34D399" },
    ];

    // Build unique edge list from faces + extra construction lines
    const edgeMap = new Map<string, Edge>();
    const addEdge = (u: number, v: number) => {
      const a = Math.min(u, v);
      const b = Math.max(u, v);
      const key = `${a}_${b}`;
      if (!edgeMap.has(key)) {
        edgeMap.set(key, { u: a, v: b });
      }
    };

    faces.forEach((f) => {
      for (let i = 0; i < f.indices.length; i++) {
        const u = f.indices[i];
        const v = f.indices[(i + 1) % f.indices.length];
        addEdge(u, v);
      }
    });

    // Extra architectural construction wireframe struts
    addEdge(0, 19);
    addEdge(1, 17);
    addEdge(5, 17);
    addEdge(2, 18);
    addEdge(4, 18);
    addEdge(0, 11);
    addEdge(0, 12);
    addEdge(10, 15);
    addEdge(10, 16);

    const edges: Edge[] = Array.from(edgeMap.values());

    // Data pulses traveling along edges
    const pulses: DataPulse[] = [];
    const ripples: VertexRipple[] = [];
    let pulseCycle = 0;

    const spawnPulse = () => {
      if (pulses.length >= 7) return;
      const edgeIdx = Math.floor(Math.random() * edges.length);
      const color = pulseCycle % 2 === 0 ? "#F97316" : "#10B981";
      pulseCycle++;
      pulses.push({
        edgeIndex: edgeIdx,
        progress: 0,
        speed: 0.014 + Math.random() * 0.012,
        color,
      });
    };

    // Resize handling
    const handleResize = () => {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);
    handleResize();

    // Mouse parallax tracking
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      // Convert to normalized tilt between -0.3 and +0.3 rad
      targetRotY = ((mouseX / width) - 0.5) * 0.45;
      targetRotX = -((mouseY / height) - 0.5) * 0.35;
    };

    const onPointerLeave = () => {
      targetRotY = 0;
      targetRotX = 0;
    };

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);

    let time = 0;

    // Render loop
    const render = () => {
      time += 0.018;
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains("dark");

      // Smooth camera interpolation
      curRotY += (targetRotY - curRotY) * 0.06;
      curRotX += (targetRotX - curRotX) * 0.06;

      // Base breathing rotation
      const totalRotY = curRotY + (prefersReducedMotion ? 0 : Math.sin(time * 0.4) * 0.06);
      const totalRotX = curRotX + (prefersReducedMotion ? 0 : Math.cos(time * 0.3) * 0.04);

      const cosY = Math.cos(totalRotY);
      const sinY = Math.sin(totalRotY);
      const cosX = Math.cos(totalRotX);
      const sinX = Math.sin(totalRotX);

      // Coordinate scaling to fill ~75% of container height
      const sculptureScale = Math.min(width, height) * 0.26;
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const fov = 4.2;

      // 1. Compute animated 3D vertex positions and project to 2D
      const projVertices: { x: number; y: number; z: number }[] = [];

      for (let i = 0; i < rawVertices.length; i++) {
        const v = rawVertices[i];

        // Organic respiration wave on vertices
        let ox = v.baseX;
        let oy = v.baseY;
        let oz = v.baseZ;

        if (!prefersReducedMotion) {
          ox += Math.sin(time * v.speed * 60 + v.phaseX) * v.amp;
          oy += Math.cos(time * v.speed * 60 + v.phaseY) * v.amp;
          oz += Math.sin(time * v.speed * 60 + v.phaseZ) * v.amp;
        }

        // Apply Y-axis rotation
        const x1 = ox * cosY + oz * sinY;
        const z1 = -ox * sinY + oz * cosY;

        // Apply X-axis rotation
        const y2 = oy * cosX - z1 * sinX;
        const z2 = oy * sinX + z1 * cosX;

        // Perspective projection
        const depth = fov / (fov + z2);
        const px = centerX + x1 * sculptureScale * depth;
        const py = centerY + y2 * sculptureScale * depth;

        projVertices.push({ x: px, y: py, z: z2 });
      }

      // 2. Draw Architectural Grid & Construction Guidelines
      ctx.save();
      const gridColor = isDark ? "rgba(63, 63, 70, 0.22)" : "rgba(148, 163, 184, 0.28)";
      const axisColor = isDark ? "rgba(249, 115, 22, 0.25)" : "rgba(234, 88, 12, 0.3)";

      ctx.lineWidth = 1;
      ctx.strokeStyle = gridColor;

      // Horizontal and vertical architectural cross-axes passing through sculpture center
      ctx.beginPath();
      // Horizontal guideline
      ctx.setLineDash([4, 6]);
      ctx.moveTo(16, centerY);
      ctx.lineTo(width - 16, centerY);
      // Vertical guideline
      ctx.moveTo(centerX, 16);
      ctx.lineTo(centerX, height - 16);
      ctx.stroke();

      // Extended projection rays from outer nodes to edges (CAD style)
      ctx.setLineDash([2, 8]);
      ctx.strokeStyle = axisColor;
      ctx.beginPath();
      const topNode = projVertices[0];
      const botNode = projVertices[10];
      const leftNode = projVertices[5];
      const rightNode = projVertices[4];

      if (topNode) {
        ctx.moveTo(topNode.x, topNode.y);
        ctx.lineTo(topNode.x, 12);
      }
      if (botNode) {
        ctx.moveTo(botNode.x, botNode.y);
        ctx.lineTo(botNode.x, height - 12);
      }
      if (leftNode) {
        ctx.moveTo(leftNode.x, leftNode.y);
        ctx.lineTo(12, leftNode.y);
      }
      if (rightNode) {
        ctx.moveTo(rightNode.x, rightNode.y);
        ctx.lineTo(width - 12, rightNode.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 3. Sort faces by average depth (Painter's algorithm: farthest Z first)
      const sortedFaces = faces
        .map((f) => {
          let avgZ = 0;
          f.indices.forEach((idx) => {
            avgZ += projVertices[idx].z;
          });
          avgZ /= f.indices.length;
          return { face: f, avgZ };
        })
        .sort((a, b) => a.avgZ - b.avgZ);

      // 4. Render Polygonal Facets (Facies 3D with layered transparency)
      sortedFaces.forEach(({ face }) => {
        const pts = face.indices.map((idx) => projVertices[idx]);
        if (pts.length < 3) return;

        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.closePath();

        // Calculate material fill styling
        ctx.save();
        if (face.type === "terracotta") {
          // Warm Terracotta / Rust gradient fill
          const grad = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[2].x, pts[2].y);
          if (isDark) {
            grad.addColorStop(0, "rgba(234, 88, 12, 0.42)"); // #EA580C
            grad.addColorStop(1, "rgba(194, 65, 12, 0.22)"); // #C2410C
          } else {
            grad.addColorStop(0, "rgba(234, 88, 12, 0.28)");
            grad.addColorStop(1, "rgba(194, 65, 12, 0.15)");
          }
          ctx.fillStyle = grad;
          ctx.fill();
        } else if (face.type === "graphite") {
          // Technical deep graphite
          ctx.fillStyle = isDark
            ? "rgba(24, 24, 28, 0.68)"
            : "rgba(226, 232, 240, 0.65)";
          ctx.fill();
        } else if (face.type === "slate") {
          // Translucent charcoal slate
          ctx.fillStyle = isDark
            ? "rgba(39, 39, 42, 0.45)"
            : "rgba(203, 213, 225, 0.45)";
          ctx.fill();
        } else if (face.type === "emerald") {
          // High-tech emerald accent plate
          const grad = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[1].x, pts[1].y);
          grad.addColorStop(0, isDark ? "rgba(16, 185, 129, 0.28)" : "rgba(16, 185, 129, 0.2)");
          grad.addColorStop(1, "rgba(5, 150, 105, 0.1)");
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // Draw facet border with precise 1px hairline
        ctx.lineWidth = 1;
        ctx.strokeStyle = face.strokeColor
          ? face.strokeColor
          : isDark
          ? "rgba(82, 82, 91, 0.55)"
          : "rgba(100, 116, 139, 0.45)";
        ctx.stroke();
        ctx.restore();
      });

      // 5. Draw Structural Wireframe Edges
      ctx.save();
      ctx.lineWidth = 1;
      edges.forEach((edge) => {
        const p1 = projVertices[edge.u];
        const p2 = projVertices[edge.v];
        if (!p1 || !p2) return;

        ctx.strokeStyle = isDark ? "rgba(63, 63, 70, 0.45)" : "rgba(148, 163, 184, 0.45)";
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });
      ctx.restore();

      // 6. Spawn and Animate Data Pulses (Request flows along edges)
      if (!prefersReducedMotion && Math.random() < 0.055) {
        spawnPulse();
      }

      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.progress += pulse.speed;

        const edge = edges[pulse.edgeIndex];
        if (!edge) {
          pulses.splice(i, 1);
          continue;
        }

        const p1 = projVertices[edge.u];
        const p2 = projVertices[edge.v];

        if (pulse.progress >= 1) {
          // Arrived at destination: trigger micro-glow ripple at vertex
          ripples.push({
            x: p2.x,
            y: p2.y,
            radius: 2,
            maxRadius: 16,
            alpha: 0.9,
            color: pulse.color,
          });
          pulses.splice(i, 1);
          continue;
        }

        // Current photon coordinate along 3D edge
        const curX = p1.x + (p2.x - p1.x) * pulse.progress;
        const curY = p1.y + (p2.y - p1.y) * pulse.progress;

        // Render glowing photon
        ctx.save();
        ctx.shadowColor = pulse.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = pulse.color;
        ctx.beginPath();
        ctx.arc(curX, curY, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 7. Update and Draw Vertex Impact Ripples
      for (let rIdx = ripples.length - 1; rIdx >= 0; rIdx--) {
        const r = ripples[rIdx];
        r.radius += 0.55;
        r.alpha -= 0.035;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(rIdx, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = r.color;
        ctx.globalAlpha = Math.max(0, r.alpha);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 8. Draw Technical Vertex Joint Markers
      ctx.save();
      for (let i = 0; i < projVertices.length; i++) {
        const p = projVertices[i];
        const isCoreVertex = i <= 10;

        ctx.fillStyle = isCoreVertex
          ? isDark
            ? "#EDEDED"
            : "#0A0A0C"
          : isDark
          ? "rgba(113, 113, 122, 0.7)"
          : "rgba(148, 163, 184, 0.8)";

        ctx.beginPath();
        ctx.arc(p.x, p.y, isCoreVertex ? 2.2 : 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Architectural crosshair at apex and prow
        if (i === 0 || i === 10 || i === 5 || i === 4) {
          ctx.strokeStyle = isDark ? "rgba(249, 115, 22, 0.5)" : "rgba(234, 88, 12, 0.6)";
          ctx.lineWidth = 1;
          const s = 4.5;
          ctx.beginPath();
          ctx.moveTo(p.x - s, p.y);
          ctx.lineTo(p.x + s, p.y);
          ctx.moveTo(p.x, p.y - s);
          ctx.lineTo(p.x, p.y + s);
          ctx.stroke();
        }
      }
      ctx.restore();

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] sm:aspect-[16/11] lg:aspect-[5/4] max-w-lg mx-auto rounded-xs border border-border bg-[var(--surface)]/20 backdrop-blur-xs overflow-hidden select-none"
      aria-label="Interactive 3D geometric architectural sculpture with data pulses"
    >
      <canvas ref={canvasRef} className="block w-full h-full cursor-crosshair" />

      {/* Subtle CAD corner markers */}
      <div className="absolute top-2 left-2 pointer-events-none text-text-muted/40 font-mono text-[9px] select-none">
        ┌
      </div>
      <div className="absolute top-2 right-2 pointer-events-none text-text-muted/40 font-mono text-[9px] select-none">
        ┐
      </div>
      <div className="absolute bottom-2 left-2 pointer-events-none text-text-muted/40 font-mono text-[9px] select-none">
        └
      </div>
      <div className="absolute bottom-2 right-2 pointer-events-none text-text-muted/40 font-mono text-[9px] select-none">
        ┘
      </div>
    </div>
  );
}
