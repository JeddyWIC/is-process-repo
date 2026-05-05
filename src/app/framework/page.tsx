import Link from "next/link";
import FrameworkView from "@/components/FrameworkView";

async function getRiskItems() {
  try {
    const { db } = await import("@/lib/db");
    const { riskItems } = await import("@/lib/schema");
    const { asc } = await import("drizzle-orm");
    const rows = await db
      .select()
      .from(riskItems)
      .orderBy(asc(riskItems.sortOrder), asc(riskItems.id));
    return rows.map((r) => ({
      ...r,
      phases: r.phases ? (JSON.parse(r.phases) as string[]) : [],
      effects: r.effects ? (JSON.parse(r.effects) as string[]) : [],
    }));
  } catch {
    return [];
  }
}

export const dynamic = "force-dynamic";

export default async function FrameworkPage() {
  const items = await getRiskItems();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Project Risk Framework
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
            A phased framework that helps PMs and engineers foresee issues at
            the right time. Each item is mapped to the project lifecycle
            phase(s) where it should be addressed.
          </p>
        </div>
        <Link
          href="/framework/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors whitespace-nowrap"
        >
          + Add Item
        </Link>
      </div>

      {/* Lifecycle visual */}
      <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between gap-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 overflow-x-auto">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="px-3 py-1.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200">
              Bid
            </span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200">
              Preconstruction
            </span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">
              Construction
            </span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1.5 rounded bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200">
              Commissioning
            </span>
          </div>
          <span className="text-gray-400 hidden sm:inline">
            {items.length} item{items.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No risk items yet. Seed the database or add your first item.
          </p>
          <Link
            href="/framework/new"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Add First Item
          </Link>
        </div>
      ) : (
        <FrameworkView items={items} />
      )}
    </div>
  );
}
