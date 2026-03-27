import TagNetwork from "@/components/TagNetwork";

async function getAuthorStats() {
  const { db } = await import("@/lib/db");
  const { processes } = await import("@/lib/schema");
  const { sql } = await import("drizzle-orm");

  return await db
    .select({
      author: processes.author,
      count: sql<number>`count(*)`.as("count"),
      earliest: sql<string>`min(${processes.createdAt})`.as("earliest"),
      latest: sql<string>`max(${processes.updatedAt})`.as("latest"),
    })
    .from(processes)
    .groupBy(processes.author)
    .orderBy(sql`count DESC`);
}

async function getCategoryStats() {
  const { db } = await import("@/lib/db");
  const { processes } = await import("@/lib/schema");
  const { sql } = await import("drizzle-orm");

  return await db
    .select({
      category: processes.category,
      count: sql<number>`count(*)`.as("count"),
    })
    .from(processes)
    .groupBy(processes.category)
    .orderBy(sql`count DESC`);
}

async function getTagStats() {
  const { db } = await import("@/lib/db");
  const { tags, processTags } = await import("@/lib/schema");
  const { eq, sql } = await import("drizzle-orm");

  return await db
    .select({
      id: tags.id,
      name: tags.name,
      count: sql<number>`count(${processTags.processId})`.as("count"),
    })
    .from(tags)
    .leftJoin(processTags, eq(processTags.tagId, tags.id))
    .groupBy(tags.id)
    .orderBy(sql`count DESC`);
}

async function getTagCooccurrences() {
  const { db } = await import("@/lib/db");
  const { tags, processTags } = await import("@/lib/schema");
  const { sql } = await import("drizzle-orm");

  // Find tags that appear together on the same process using raw SQL via Drizzle
  const pt = processTags;
  const t = tags;
  const result = await db.run(sql`
    SELECT t1.name as tag1, t2.name as tag2, count(*) as shared
    FROM ${pt} pt1
    JOIN ${pt} pt2 ON pt1.process_id = pt2.process_id AND pt1.tag_id < pt2.tag_id
    JOIN ${t} t1 ON pt1.tag_id = t1.id
    JOIN ${t} t2 ON pt2.tag_id = t2.id
    GROUP BY t1.name, t2.name
    ORDER BY shared DESC
  `);

  // libsql .run() returns { rows, columns, ... }
  const raw = result as unknown as { columns: string[]; rows: unknown[][] };
  if (raw.columns && raw.rows) {
    return raw.rows.map((row) => ({
      tag1: row[raw.columns.indexOf("tag1")] as string,
      tag2: row[raw.columns.indexOf("tag2")] as string,
      shared: row[raw.columns.indexOf("shared")] as number,
    }));
  }
  return [];
}

export const dynamic = "force-dynamic";

const categoryLabels: Record<string, string> = {
  FOOD_BEV: "Food & Beverage",
  AIRPORT: "Airport",
  GENERAL: "General",
};

const categoryBarColors: Record<string, string> = {
  FOOD_BEV: "bg-green-500",
  AIRPORT: "bg-purple-500",
  GENERAL: "bg-gray-400",
};

export default async function DataPage() {
  const [authorStats, categoryStats, tagStats, tagCooccurrences] = await Promise.all([
    getAuthorStats(),
    getCategoryStats(),
    getTagStats(),
    getTagCooccurrences(),
  ]);

  const totalProcesses = authorStats.reduce((sum, a) => sum + a.count, 0);
  const totalTags = tagStats.length;
  const totalAuthors = authorStats.length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Repository Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Insights into process contributions, tag usage, and relationships.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalProcesses}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Processes</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 text-center">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">{totalAuthors}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Contributors</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 text-center">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalTags}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Unique Tags</div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-2 gap-8 mb-10">
        {/* Processes by Author */}
        <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Processes by Author
          </h2>
          {authorStats.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {authorStats.map((author) => {
                const pct = totalProcesses > 0 ? (author.count / totalProcesses) * 100 : 0;
                return (
                  <div key={author.author}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {author.author}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {author.count} process{author.count !== 1 ? "es" : ""}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Processes by Category */}
        <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Processes by Category
          </h2>
          {categoryStats.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {categoryStats.map((cat) => {
                const pct = totalProcesses > 0 ? (cat.count / totalProcesses) * 100 : 0;
                return (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {categoryLabels[cat.category] || cat.category}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {cat.count} ({Math.round(pct)}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${categoryBarColors[cat.category] || "bg-gray-400"}`}
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Tag Frequency Chart */}
      <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-10">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tag Frequency
        </h2>
        {tagStats.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No tags yet.</p>
        ) : (
          <div className="space-y-2">
            {tagStats.slice(0, 20).map((tag) => {
              const maxCount = tagStats[0]?.count || 1;
              const pct = (tag.count / maxCount) * 100;
              return (
                <div key={tag.id} className="flex items-center gap-3">
                  <span className="text-sm font-mono text-blue-600 dark:text-blue-400 w-32 truncate shrink-0">
                    #{tag.name}
                  </span>
                  <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                    <div
                      className="h-full bg-blue-500 dark:bg-blue-600 rounded transition-all flex items-center justify-end pr-2"
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    >
                      <span className="text-xs text-white font-medium">{tag.count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {tagStats.length > 20 && (
              <p className="text-xs text-gray-400 mt-2">
                Showing top 20 of {tagStats.length} tags.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Tag Relationship Network */}
      <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Tag Relationship Map
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Tags that appear together on the same processes are connected. Larger nodes indicate higher usage.
        </p>
        <TagNetwork
          tags={tagStats.map((t) => ({ name: t.name, count: t.count }))}
          edges={tagCooccurrences.map((e) => ({ source: e.tag1, target: e.tag2, weight: e.shared }))}
        />
      </section>
    </div>
  );
}
