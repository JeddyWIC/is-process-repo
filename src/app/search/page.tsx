"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import ProcessCard from "@/components/ProcessCard";
import { Suspense } from "react";

interface ProcessResult {
  id: number;
  title: string;
  author: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const tag = searchParams.get("tag") || "";
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("ALL");

  useEffect(() => {
    if (!q && !tag) {
      setResults([]);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (tag) params.set("tag", tag);
    if (category !== "ALL") params.set("category", category);

    fetch(`/api/processes?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setResults(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setResults([]);
        setLoading(false);
      });
  }, [q, tag, category]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <SearchBar initialQuery={q || tag} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm text-gray-500 dark:text-gray-400">Filter:</span>
        {["ALL", "FOOD_BEV", "AIRPORT", "GENERAL"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              category === cat
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {cat === "ALL"
              ? "All"
              : cat === "FOOD_BEV"
                ? "Food & Bev"
                : cat === "AIRPORT"
                  ? "Airport"
                  : "General"}
          </button>
        ))}
      </div>

      {/* Results */}
      {(q || tag) && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {loading
            ? "Searching..."
            : `${results.length} result${results.length !== 1 ? "s" : ""} for "${q || `#${tag}`}"`}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : results.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => (
            <ProcessCard key={p.id} {...p} />
          ))}
        </div>
      ) : q || tag ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            No processes found. Try different keywords or tags.
          </p>
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            Enter a search term or click a tag to find processes.
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
