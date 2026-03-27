"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface TagNode {
  name: string;
  count: number;
}

interface TagEdge {
  source: string;
  target: string;
  weight: number;
}

interface SimNode extends TagNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export default function TagNetwork({
  tags,
  edges,
}: {
  tags: TagNode[];
  edges: TagEdge[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const animRef = useRef<number>(0);

  const getNodeColor = useCallback((count: number, maxCount: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.6) return "#3b82f6"; // blue-500
    if (ratio > 0.3) return "#8b5cf6"; // violet-500
    return "#6b7280"; // gray-500
  }, []);

  useEffect(() => {
    if (!tags.length) return;

    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const canvas = canvasEl;
    const ctx = canvas.getContext("2d")!;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const W = rect.width;
    const H = 400;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    const maxCount = Math.max(...tags.map((t) => t.count), 1);

    // Initialize nodes in a circle
    const nodes: SimNode[] = tags.slice(0, 40).map((t, i, arr) => {
      const angle = (2 * Math.PI * i) / arr.length;
      const r = Math.min(W, H) * 0.38;
      return {
        ...t,
        x: W / 2 + r * Math.cos(angle) + (Math.random() - 0.5) * 20,
        y: H / 2 + r * Math.sin(angle) + (Math.random() - 0.5) * 20,
        vx: 0,
        vy: 0,
        radius: 8 + (t.count / maxCount) * 20,
      };
    });
    nodesRef.current = nodes;

    const nodeMap = new Map(nodes.map((n) => [n.name, n]));

    // Filter edges to only include nodes we're rendering
    const validEdges = edges.filter(
      (e) => nodeMap.has(e.source) && nodeMap.has(e.target)
    );

    // Simple force simulation
    let iteration = 0;
    const maxIterations = 300;

    function simulate() {
      const damping = 0.92;
      const repulsion = 3000;
      const attraction = 0.002;
      const centerPull = 0.005;

      // Repulsion between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = repulsion / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          nodes[i].vx -= fx;
          nodes[i].vy -= fy;
          nodes[j].vx += fx;
          nodes[j].vy += fy;
        }
      }

      // Attraction along edges
      for (const edge of validEdges) {
        const s = nodeMap.get(edge.source)!;
        const t = nodeMap.get(edge.target)!;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = dist * attraction * edge.weight;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        s.vx += fx;
        s.vy += fy;
        t.vx -= fx;
        t.vy -= fy;
      }

      // Center gravity
      for (const node of nodes) {
        node.vx += (W / 2 - node.x) * centerPull;
        node.vy += (H / 2 - node.y) * centerPull;
      }

      // Apply velocity
      for (const node of nodes) {
        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;

        // Boundary constraints
        const pad = node.radius + 5;
        node.x = Math.max(pad, Math.min(W - pad, node.x));
        node.y = Math.max(pad, Math.min(H - pad, node.y));
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Detect dark mode
      const isDark = document.documentElement.classList.contains("dark");

      // Draw edges
      for (const edge of validEdges) {
        const s = nodeMap.get(edge.source)!;
        const t = nodeMap.get(edge.target)!;
        const isHighlighted =
          hoveredTag && (edge.source === hoveredTag || edge.target === hoveredTag);

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = isHighlighted
          ? (isDark ? "rgba(96, 165, 250, 0.6)" : "rgba(59, 130, 246, 0.6)")
          : (isDark ? "rgba(75, 85, 99, 0.3)" : "rgba(209, 213, 219, 0.6)");
        ctx.lineWidth = isHighlighted ? 2 : Math.max(1, edge.weight * 0.8);
        ctx.stroke();
      }

      // Draw nodes
      for (const node of nodes) {
        const isHovered = node.name === hoveredTag;
        const isConnected =
          hoveredTag &&
          validEdges.some(
            (e) =>
              (e.source === hoveredTag && e.target === node.name) ||
              (e.target === hoveredTag && e.source === node.name)
          );

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

        const color = getNodeColor(node.count, maxCount);
        const alpha = hoveredTag && !isHovered && !isConnected ? 0.3 : 1;
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.fill();

        if (isHovered) {
          ctx.strokeStyle = isDark ? "#fff" : "#1f2937";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.globalAlpha = 1;

        // Label
        if (node.radius > 12 || isHovered || isConnected) {
          ctx.font = `${isHovered ? "bold " : ""}${Math.max(10, node.radius * 0.7)}px system-ui, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillStyle = isDark ? "#e5e7eb" : "#374151";
          ctx.globalAlpha = hoveredTag && !isHovered && !isConnected ? 0.3 : 1;
          ctx.fillText(`#${node.name}`, node.x, node.y + node.radius + 3);
          ctx.globalAlpha = 1;
        }
      }

      // Tooltip for hovered
      if (hoveredTag) {
        const node = nodeMap.get(hoveredTag);
        if (node) {
          const connections = validEdges.filter(
            (e) => e.source === hoveredTag || e.target === hoveredTag
          );
          const tooltip = `#${node.name}: ${node.count} process${node.count !== 1 ? "es" : ""}, ${connections.length} connection${connections.length !== 1 ? "s" : ""}`;
          ctx.font = "12px system-ui, sans-serif";
          const tw = ctx.measureText(tooltip).width + 16;
          const tx = Math.min(node.x - tw / 2, W - tw - 5);
          const ty = node.y - node.radius - 28;

          ctx.fillStyle = isDark ? "rgba(31, 41, 55, 0.95)" : "rgba(255, 255, 255, 0.95)";
          ctx.strokeStyle = isDark ? "#4b5563" : "#d1d5db";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(Math.max(5, tx), Math.max(5, ty), tw, 22, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = isDark ? "#e5e7eb" : "#374151";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(tooltip, Math.max(5, tx) + tw / 2, Math.max(5, ty) + 11);
        }
      }
    }

    function animate() {
      if (iteration < maxIterations) {
        simulate();
        iteration++;
      }
      draw();
      animRef.current = requestAnimationFrame(animate);
    }

    animate();

    // Mouse hover detection
    function handleMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      let found: string | null = null;
      for (const node of nodes) {
        const dx = mx - node.x;
        const dy = my - node.y;
        if (dx * dx + dy * dy < node.radius * node.radius) {
          found = node.name;
          break;
        }
      }
      setHoveredTag(found);
      canvas.style.cursor = found ? "pointer" : "default";
    }

    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [tags, edges, hoveredTag, getNodeColor]);

  if (!tags.length) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
        No tag data available yet. Add tags to processes to see relationships.
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-lg bg-gray-50 dark:bg-gray-900/50"
      style={{ height: 400 }}
    />
  );
}
