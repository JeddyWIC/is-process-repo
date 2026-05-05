"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface RiskItem {
  id: number;
  type: string;
  title: string;
  description: string | null;
  effects: string[];
  phases: string[];
  notes: string | null;
}

const PHASES = [
  { key: "BID", label: "Bid", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200", border: "border-blue-300 dark:border-blue-700" },
  { key: "PRECON", label: "Preconstruction", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200", border: "border-purple-300 dark:border-purple-700" },
  { key: "CONSTRUCTION", label: "Construction", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200", border: "border-amber-300 dark:border-amber-700" },
  { key: "COMMISSIONING", label: "Commissioning", color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200", border: "border-green-300 dark:border-green-700" },
];

const EFFECT_COLORS: Record<string, string> = {
  Delays: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  Efficiency: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  Rework: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  Material: "bg-lime-50 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300",
  Time: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  Cost: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  Risk: "bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
};

type ViewMode = "phase" | "type";

export default function FrameworkView({ items }: { items: RiskItem[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>("phase");
  const [activePhase, setActivePhase] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let out = items;
    if (activePhase !== "ALL") {
      out = out.filter((i) => i.phases.includes(activePhase));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q) ||
          (i.description?.toLowerCase().includes(q) ?? false)
      );
    }
    return out;
  }, [items, activePhase, search]);

  const byPhase = useMemo(() => {
    const map: Record<string, RiskItem[]> = {};
    for (const phase of PHASES) {
      map[phase.key] = filtered.filter((i) => i.phases.includes(phase.key));
    }
    return map;
  }, [filtered]);

  const byType = useMemo(() => {
    const map: Record<string, RiskItem[]> = {};
    for (const item of filtered) {
      if (!map[item.type]) map[item.type] = [];
      map[item.type].push(item);
    }
    return map;
  }, [filtered]);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* View Toggle */}
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
          <button
            onClick={() => setViewMode("phase")}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              viewMode === "phase"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            By Phase
          </button>
          <button
            onClick={() => setViewMode("type")}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              viewMode === "type"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            By Type
          </button>
        </div>

        {/* Phase Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActivePhase("ALL")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activePhase === "ALL"
                ? "bg-gray-700 text-white dark:bg-gray-200 dark:text-gray-900"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            All Phases
          </button>
          {PHASES.map((p) => (
            <button
              key={p.key}
              onClick={() => setActivePhase(p.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activePhase === p.key
                  ? `${p.color} ring-2 ring-offset-1 dark:ring-offset-gray-900`
                  : `${p.color} opacity-70 hover:opacity-100`
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items..."
          className="ml-auto px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No items match this filter.
        </div>
      ) : viewMode === "phase" ? (
        <div className="space-y-8">
          {PHASES.map((phase) => {
            const phaseItems = byPhase[phase.key];
            if (!phaseItems || phaseItems.length === 0) return null;
            return (
              <section key={phase.key}>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`inline-block px-3 py-1 rounded text-sm font-semibold ${phase.color}`}>
                    {phase.label}
                  </span>
                  <span className="text-sm text-gray-400">
                    {phaseItems.length} item{phaseItems.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className={`grid gap-3 md:grid-cols-2 border-l-4 ${phase.border} pl-4`}>
                  {phaseItems.map((item) => (
                    <RiskCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byType)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([type, typeItems]) => (
              <section key={type}>
                <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  {type}
                  <span className="text-sm text-gray-400">({typeItems.length})</span>
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {typeItems.map((item) => (
                    <RiskCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}

function RiskCard({ item }: { item: RiskItem }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            {item.type}
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {item.title}
          </h4>
        </div>
        <Link
          href={`/framework/${item.id}/edit`}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
        >
          Edit
        </Link>
      </div>

      {/* Phase chips */}
      <div className="flex flex-wrap gap-1 mb-2">
        {PHASES.filter((p) => item.phases.includes(p.key)).map((p) => (
          <span
            key={p.key}
            className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${p.color}`}
          >
            {p.label}
          </span>
        ))}
      </div>

      {/* Description */}
      {item.description && (
        <p
          className={`text-sm text-gray-600 dark:text-gray-300 ${
            expanded ? "" : "line-clamp-3"
          }`}
        >
          {item.description}
        </p>
      )}
      {item.description && item.description.length > 200 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}

      {/* Effects */}
      {item.effects.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">Risks:</span>
          {item.effects.map((e) => (
            <span
              key={e}
              className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                EFFECT_COLORS[e] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {e}
            </span>
          ))}
        </div>
      )}

      {/* Notes */}
      {item.notes && (
        <p className="text-xs italic text-gray-500 dark:text-gray-400 mt-2">
          {item.notes}
        </p>
      )}
    </div>
  );
}
