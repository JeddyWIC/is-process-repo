import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { processes, tags, processTags, attachments } from "@/lib/schema";
import { eq, ne, inArray, sql, and } from "drizzle-orm";

const categoryLabels: Record<string, string> = {
  FOOD_BEV: "Food & Beverage",
  AIRPORT: "Airport",
  GENERAL: "General",
};

export const dynamic = "force-dynamic";

export default async function ProcessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const processId = parseInt(id);

  const [process] = await db
    .select()
    .from(processes)
    .where(eq(processes.id, processId));

  if (!process) {
    notFound();
  }

  const pTags = await db
    .select({ name: tags.name })
    .from(tags)
    .innerJoin(processTags, eq(processTags.tagId, tags.id))
    .where(eq(processTags.processId, processId));

  const tagNames = pTags.map((t) => t.name);

  const pAttachments = await db
    .select({
      id: attachments.id,
      filename: attachments.filename,
      mimeType: attachments.mimeType,
      size: attachments.size,
    })
    .from(attachments)
    .where(eq(attachments.processId, processId));

  // Find related processes that share tags with this one
  const tagIds = tagNames.length > 0
    ? await db
        .select({ id: tags.id })
        .from(tags)
        .where(inArray(tags.name, tagNames))
    : [];

  const relatedProcesses = tagIds.length > 0
    ? await db
        .select({
          id: processes.id,
          title: processes.title,
          author: processes.author,
          category: processes.category,
          updatedAt: processes.updatedAt,
          sharedTagCount: sql<number>`count(${processTags.tagId})`.as("shared_tag_count"),
        })
        .from(processes)
        .innerJoin(processTags, eq(processTags.processId, processes.id))
        .where(
          and(
            ne(processes.id, processId),
            inArray(processTags.tagId, tagIds.map((t) => t.id))
          )
        )
        .groupBy(processes.id)
        .orderBy(sql`shared_tag_count DESC`)
        .limit(5)
    : [];

  // Fetch tags for related processes
  const relatedWithTags = await Promise.all(
    relatedProcesses.map(async (rp) => {
      const rpTags = await db
        .select({ name: tags.name })
        .from(tags)
        .innerJoin(processTags, eq(processTags.tagId, tags.id))
        .where(eq(processTags.processId, rp.id));
      return { ...rp, tags: rpTags.map((t) => t.name) };
    })
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-blue-600">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">{process.title}</span>
      </nav>

      <article className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {process.title}
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span>by {process.author}</span>
                <span>&middot;</span>
                <span>
                  {categoryLabels[process.category] || process.category}
                </span>
                <span>&middot;</span>
                <span>
                  Created {new Date(process.createdAt).toLocaleDateString()}
                </span>
                {process.updatedAt !== process.createdAt && (
                  <>
                    <span>&middot;</span>
                    <span>
                      Updated{" "}
                      {new Date(process.updatedAt).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>
            <Link
              href={`/process/${processId}/edit`}
              className="shrink-0 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            >
              Edit
            </Link>
          </div>

          {/* Tags */}
          {tagNames.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {tagNames.map((tag) => (
                <Link
                  key={tag}
                  href={`/search?tag=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 text-sm rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/70 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none p-6"
          dangerouslySetInnerHTML={{ __html: process.content }}
        />

        {/* Attachments */}
        {pAttachments.length > 0 && (
          <div className="p-6 border-t border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Attachments ({pAttachments.length})
            </h2>
            <div className="space-y-2">
              {pAttachments.map((att) => (
                <a
                  key={att.id}
                  href={`/api/attachments/${att.id}`}
                  download={att.filename}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                >
                  <span className="text-xl shrink-0">
                    {att.mimeType.startsWith("image/")
                      ? "\ud83d\uddbc\ufe0f"
                      : att.mimeType === "application/pdf"
                      ? "\ud83d\udcc4"
                      : att.mimeType.includes("spreadsheet") || att.mimeType.includes("excel")
                      ? "\ud83d\udcca"
                      : att.mimeType.includes("document") || att.mimeType.includes("word")
                      ? "\ud83d\udcdd"
                      : "\ud83d\udcce"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {att.filename}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {att.size < 1024
                        ? att.size + " B"
                        : att.size < 1024 * 1024
                        ? (att.size / 1024).toFixed(1) + " KB"
                        : (att.size / (1024 * 1024)).toFixed(1) + " MB"}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Related Processes */}
      {relatedWithTags.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Related Processes
          </h2>
          <div className="grid gap-3">
            {relatedWithTags.map((rp) => (
              <Link
                key={rp.id}
                href={`/process/${rp.id}`}
                className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all bg-white dark:bg-gray-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {rp.title}
                  </h3>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${
                      rp.category === "FOOD_BEV"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : rp.category === "AIRPORT"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {categoryLabels[rp.category] || rp.category}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  by {rp.author} &middot; {rp.sharedTagCount} shared{" "}
                  {rp.sharedTagCount === 1 ? "tag" : "tags"}
                </p>
                {rp.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {rp.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          tagNames.includes(tag)
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/70 dark:text-blue-300"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
