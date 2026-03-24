import SearchBar from "@/components/SearchBar";
import TagCloud from "@/components/TagCloud";
import ProcessCard from "@/components/ProcessCard";

async function getRecentProcesses() {
  try {
    const { db } = await import("@/lib/db");
    const { processes, tags, processTags } = await import("@/lib/schema");
    const { desc, eq } = await import("drizzle-orm");

    const results = await db
      .select({
        id: processes.id,
        title: processes.title,
        author: processes.author,
        category: processes.category,
        createdAt: processes.createdAt,
        updatedAt: processes.updatedAt,
      })
      .from(processes)
      .orderBy(desc(processes.updatedAt))
      .limit(12);

    const withTags = await Promise.all(
      results.map(async (p) => {
        const pTags = await db
          .select({ name: tags.name })
          .from(tags)
          .innerJoin(processTags, eq(processTags.tagId, tags.id))
          .where(eq(processTags.processId, p.id));
        return { ...p, tags: pTags.map((t) => t.name) };
      })
    );

    return withTags;
  } catch {
    return [];
  }
}

async function getPopularTags() {
  try {
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
      .orderBy(sql`count DESC`)
      .limit(30);
  } catch {
    return [];
  }
}

export const dynamic = "force-dynamic";

export default async function Home() {
  const [recentProcesses, popularTags] = await Promise.all([
    getRecentProcesses(),
    getPopularTags(),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Industrial Systems Process Repository
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Document, share, and discover processes and lessons learned across
          Food &amp; Beverage and Airport projects.
        </p>
        <SearchBar />
      </div>

      {/* Tag Cloud */}
      {popularTags.length > 0 && (
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Popular Tags
          </h2>
          <TagCloud tags={popularTags} />
        </section>
      )}

      {/* Recent Processes */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {recentProcesses.length > 0 ? "Recent Processes" : "Getting Started"}
        </h2>
        {recentProcesses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentProcesses.map((p) => (
              <ProcessCard key={p.id} {...p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No processes documented yet. Be the first to share your knowledge!
            </p>
            <a
              href="/process/new"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Create First Process
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
