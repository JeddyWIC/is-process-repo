"use client";

import { useState } from "react";
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

export default function CategoryFilter({ processes }: { processes: Process[] }) {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [groupByCategory, setGroupByCategory] = useState(false);

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

      {/* Process Grid */}
      {sorted.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No processes in this category yet.
        </div>
      ) : groupByCategory && grouped ? (
        <div className="space-y-8">
          {grouped.map(([category, procs]) => (
            <div key={category}>
              <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded text-xs font-medium ${categoryColors[category] || categoryColors.GENERAL}`}
                >
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
      )}
    </div>
  );
}
