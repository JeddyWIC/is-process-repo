"use client";

import { useState } from "react";
import Link from "next/link";
import ProcessCard from "./ProcessCard";

interface Process {
  id: number;
  title: string;
  author: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const categoryLabels: Record<string, string> = {
  ALL: "All",
  FOOD_BEV: "Food & Beverage",
  AIRPORT: "Airport",
  GENERAL: "General",
};

const categoryColors: Record<string, string> = {
  ALL: "bg-blue-600 text-white",
  FOOD_BEV: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  AIRPORT: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  GENERAL: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

const categoryActiveColors: Record<string, string> = {
  ALL: "bg-blue-600 text-white ring-2 ring-blue-400",
  FOOD_BEV: "bg-green-600 text-white ring-2 ring-green-400",
  AIRPORT: "bg-purple-600 text-white ring-2 ring-purple-400",
  GENERAL: "bg-gray-600 text-white ring-2 ring-gray-400",
};

type SortOption = "recent" | "oldest" | "title";
type ViewMode = "cards" | "list";

export default function CategoryFilter({ processes }: { processes: Process[] }) {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  const filtered = activeCategory === "ALL"
    ? processes
    : processes.filter((p) => p.category === activeCategory);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "recent") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (sortBy === "oldest") return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    return a.title.localeCompare(b.title);
  });

  const grouped = groupByCategory
    ? Object.entries(
        sorted.reduce<Record<string, Process[]>>((acc, p) => {
          const cat = p.category || "GENERAL";
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(p);
          return acc;
        }, {})
      ).sort(([a], [b]) => a.localeCompare(b))
    : null;

  return (
    <div>
      {/* Filter & Sort Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Category Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeCategory === key
                  ? categoryActiveColors[key]
                  : `${categoryColors[key]} hover:opacity-80`
              }`}
            >
              {label}
              {key !== "ALL" && (
                <span className="ml-1.5 opacity-70">
                  ({processes.filter((p) => p.category === key).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* View Toggle */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
            <button
              onClick={() => setViewMode("cards")}
              className={`px-2.5 py-1.5 text-sm transition-colors ${
                viewMode === "cards"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              title="Card view"
            >
              ▦
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-2.5 py-1.5 text-sm transition-colors ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              title="List view"
            >
              ☰
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <option value="recent">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">A-Z by Title</option>
          </select>

          {/* Group Toggle */}
          <button
            onClick={() => setGroupByCategory(!groupByCategory)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              groupByCategory
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600"
                : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300"
            }`}
          >
            Group by Category
          </button>
        </div>
      </div>

      {/* Showing count */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Showing {sorted.length} of {processes.length} processes
      </p>

      {/* Process Display */}
      {sorted.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No processes in this category yet.
        </div>
      ) : viewMode === "list" ? (
        /* LIST / TABLE VIEW */
        groupByCategory && grouped ? (
          <div className="space-y-6">
            {grouped.map(([category, procs]) => (
              <div key={category}>
                <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-medium ${categoryColors[category] || categoryColors.GENERAL}`}>
                    {categoryLabels[category] || category}
                  </span>
                  <span className="text-sm text-gray-400">({procs.length})</span>
                </h3>
                <ProcessTable processes={procs} />
              </div>
            ))}
          </div>
        ) : (
          <ProcessTable processes={sorted} />
        )
      ) : (
        /* CARD VIEW */
        groupByCategory && grouped ? (
          <div className="space-y-8">
            {grouped.map(([category, procs]) => (
              <div key={category}>
                <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-medium ${categoryColors[category] || categoryColors.GENERAL}`}>
                    {categoryLabels[category] || category}
                  </span>
                  <span className="text-sm text-gray-400">({procs.length})</span>
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {procs.map((p) => (
                    <ProcessCard key={p.id} {...p} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sorted.map((p) => (
              <ProcessCard key={p.id} {...p} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

/* Compact table view for scanning many SOPs quickly */
function ProcessTable({ processes }: { processes: Process[] }) {
  const catBadge: Record<string, string> = {
    FOOD_BEV: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    AIRPORT: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    GENERAL: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  };
  const catLabel: Record<string, string> = {
    FOOD_BEV: "F&B",
    AIRPORT: "Airport",
    GENERAL: "General",
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <th className="text-left px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-300">Title</th>
            <th className="text-left px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-300 hidden sm:table-cell">Category</th>
            <th className="text-left px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-300 hidden md:table-cell">Author</th>
            <th className="text-left px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-300">Updated</th>
            <th className="text-left px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-300 hidden lg:table-cell">Tags</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((p, i) => (
            <tr
              key={p.id}
              className={`border-b border-gray-100 dark:border-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-800/50"
              }`}
            >
              <td className="px-4 py-2.5">
                <Link href={`/process/${p.id}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  {p.title}
                </Link>
              </td>
              <td className="px-4 py-2.5 hidden sm:table-cell">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${catBadge[p.category] || catBadge.GENERAL}`}>
                  {catLabel[p.category] || p.category}
                </span>
              </td>
              <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400 hidden md:table-cell">
                {p.author}
              </td>
              <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">
                {new Date(p.updatedAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-2.5 hidden lg:table-cell">
                <div className="flex flex-wrap gap-1">
                  {p.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-1.5 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
                      #{tag}
                    </span>
                  ))}
                  {p.tags.length > 3 && (
                    <span className="text-xs text-gray-400">+{p.tags.length - 3}</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
