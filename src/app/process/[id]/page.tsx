import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { processes, tags, processTags } from "@/lib/schema";
import { eq } from "drizzle-orm";

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
      </article>
    </div>
  );
}
