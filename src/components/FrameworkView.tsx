"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";

interface RiskItem {
  id: number;
  type: string;
  title: string;
  description: string | null;
  effects: string[];
  phases: string[];
  tags: string[];
  notes: string | null;
}

interface ProcessHit {
  id: number;
  title: string;
  author: string;
  category: string;
  updatedAt: string;
}

const PHASES = [
  {
    key: "BID",
    label: "Bid",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
    border: "border-blue-400 dark:border-blue-700",
    dot: "bg-blue-500",
    band: "from-blue-500 to-blue-400",
  },
  {
    key: "PRECON",
    label: "Preconstruction",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200",
    border: "border-purple-400 dark:border-purple-700",
    dot: "bg-purple-500",
    band: "from-purple-500 to-purple-400",
  },
  {
    key: "CONSTRUCTION",
    label: "Construction",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    border: "border-amber-400 dark:border-amber-700",
    dot: "bg-amber-500",
    band: "from-amber-500 to-amber-400",
  },
  {
    key: "COMMISSIONING",
    label: "Commissioning",
    color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
    border: "border-green-400 dark:border-green-700",
    dot: "bg-green-500",
    band: "from-green-500 to-green-400",
  },
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

function highlight(text: string | null, q: string): React.ReactNode {
  if (!text) return null;
  if (!q.trim()) return text;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(re);
  return parts.map((p, i) =>
    re.test(p) ? (
      <mark
        key={i}
        className="bg-yellow-200 dark:bg-yellow-700/50 text-inherit rounded px-0.5"
      >
        {p}
      </mark>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

export default function FrameworkView({ items }: { items: RiskItem[] }) {
  const [search, setSearch] = useState("");
  const [activePhase, setActivePhase] = useState<string>("ALL");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [processHits, setProcessHits] = useState<ProcessHit[]>([]);
  const [searching, setSearching] = useState(false);

  // All unique tags across items, ranked by frequency
  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      for (const tag of item.tags) {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);

  const fetchProcesses = useCallback(async (q: string) => {
    if (!q.trim()) {
      setProcessHits([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `/api/framework/search?q=${encodeURIComponent(q)}`
      );
      if (res.ok) {
        const data = await res.json();
        setProcessHits(data.processes || []);
      }
    } catch {
      // ignore
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const handle = setTimeout(() => fetchProcesses(search), 300);
    return () => clearTimeout(handle);
  }, [search, fetchProcesses]);

  const filtered = useMemo(() => {
    let out = items;
    if (activePhase !== "ALL") {
      out = out.filter((i) => i.phases.includes(activePhase));
    }
    if (activeTag) {
      out = out.filter((i) => i.tags.includes(activeTag));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q) ||
          (i.description?.toLowerCase().includes(q) ?? false) ||
          i.tags.some((t) => t.toLowerCase().includes(q)) ||
          (i.notes?.toLowerCase().includes(q) ?? false)
      );
    }
    return out;
  }, [items, activePhase, activeTag, search]);

  // Items grouped by phase, preserving order within each phase
  const byPhase = useMemo(() => {
    const map: Record<string, RiskItem[]> = {};
    for (const phase of PHASES) {
      map[phase.key] = filtered.filter((i) => i.phases.includes(phase.key));
    }
    return map;
  }, [filtered]);

  return (
    <div>
      {/* Big search bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search risks, tags, or topics (e.g. "bag tags", "RFIs", "punch list")...'
            className="w-full px-4 py-3 pl-11 text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔎
          </span>
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setActiveTag(null);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl"
              aria-label="Clear"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Phase filter chips */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
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
        {activeTag && (
          <button
            onClick={() => setActiveTag(null)}
            className="ml-auto px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
            title="Clear tag filter"
          >
            Tag: #{activeTag} ×
          </button>
        )}
      </div>

      {/* Top tags hint */}
      {!search && !activeTag && allTags.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Common tags:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {allTags.slice(0, 18).map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60"
              >
                #{tag}
                <span className="ml-1 opacity-60">({count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search results from SOPs (only when searching) */}
      {search.trim() && (
        <section className="mb-8 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Related SOPs / Processes
            {searching && (
              <span className="ml-2 text-xs text-gray-400">searching...</span>
            )}
          </h2>
          {processHits.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              No matching SOPs found for &ldquo;{search}&rdquo;.
            </p>
          ) : (
            <ul className="space-y-2">
              {processHits.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/process/${p.id}`}
                    className="block px-3 py-2 rounded hover:bg-white dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="font-medium text-blue-700 dark:text-blue-300">
                      {highlight(p.title, search)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      by {p.author} · {p.category}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* The Roadmap — single column, phase by phase */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No framework items match.
        </div>
      ) : (
        <div className="relative">
          {/* Vertical track line */}
          <div
            className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-400 via-purple-400 via-amber-400 to-green-400 hidden sm:block"
            aria-hidden
          />
          <div className="space-y-6">
            {PHASES.map((phase) => {
              const phaseItems = byPhase[phase.key];
              if (!phaseItems || phaseItems.length === 0) return null;
              return (
                <section key={phase.key} className="relative sm:pl-12">
                  {/* Phase marker dot on the timeline */}
                  <span
                    className={`hidden sm:flex absolute left-2.5 top-2 w-3 h-3 rounded-full ${phase.dot} ring-2 ring-white dark:ring-gray-900 shadow`}
                    aria-hidden
                  />
                  <div className="mb-2">
                    <h2
                      className={`inline-block text-base font-bold px-3 py-1 rounded ${phase.color}`}
                    >
                      {phase.label}
                    </h2>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {phaseItems.length} item{phaseItems.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <ol className="space-y-1.5">
                    {phaseItems.map((item, idx) => (
                      <RiskRow
                        key={item.id}
                        item={item}
                        index={idx + 1}
                        phase={phase}
                        search={search}
                        onTagClick={setActiveTag}
                      />
                    ))}
                  </ol>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function RiskRow({
  item,
  index,
  phase,
  search,
  onTagClick,
}: {
  item: RiskItem;
  index: number;
  phase: (typeof PHASES)[number];
  search: string;
  onTagClick: (t: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <li
      className={`bg-white dark:bg-gray-800 rounded-lg border-l-4 ${phase.border} border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow`}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left px-3 py-2.5 flex items-center gap-3"
      >
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-semibold flex items-center justify-center">
          {index}
        </span>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 dark:text-white text-base flex-shrink-0">
          {highlight(item.title, search)}
        </h3>

        {/* Risks — always visible, the headline scan target */}
        {item.effects.length > 0 && (
          <div className="flex flex-wrap gap-1 items-center min-w-0">
            {item.effects.map((e) => (
              <span
                key={e}
                className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-medium ${
                  EFFECT_COLORS[e] ||
                  "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {e}
              </span>
            ))}
          </div>
        )}

        {/* Cross-phase indicator (only if item spans more than this phase) */}
        {item.phases.length > 1 && (
          <div className="hidden sm:flex flex-wrap gap-1 ml-auto">
            {PHASES.filter(
              (p) => item.phases.includes(p.key) && p.key !== phase.key
            ).map((p) => (
              <span
                key={p.key}
                className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${p.color}`}
                title={`Also relevant in ${p.label}`}
              >
                +{p.label.slice(0, 4)}
              </span>
            ))}
          </div>
        )}

        <span className="text-xs text-gray-400 ml-auto sm:ml-2 flex-shrink-0">
          {open ? "▴" : "▾"}
        </span>
      </button>

      {/* Expanded details */}
      {open && (
        <div className="px-3 pb-3 pt-1 border-t border-gray-100 dark:border-gray-700">
          {item.description && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
              {highlight(item.description, search)}
            </p>
          )}

          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.map((t) => (
                <span
                  key={t}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTagClick(t);
                  }}
                  className="text-[11px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 cursor-pointer"
                >
                  #{highlight(t, search)}
                </span>
              ))}
            </div>
          )}

          {item.notes && (
            <p className="text-xs italic text-gray-500 dark:text-gray-400 mt-2">
              {highlight(item.notes, search)}
            </p>
          )}

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50 dark:border-gray-700/50">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">
              {item.type}
            </span>
            <Link
              href={`/framework/${item.id}/edit`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Edit →
            </Link>
          </div>
        </div>
      )}
    </li>
  );
}
