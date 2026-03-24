import Link from "next/link";

interface ProcessCardProps {
  id: number;
  title: string;
  author: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const categoryLabels: Record<string, string> = {
  FOOD_BEV: "Food & Beverage",
  AIRPORT: "Airport",
  GENERAL: "General",
};

const categoryColors: Record<string, string> = {
  FOOD_BEV: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  AIRPORT: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  GENERAL: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

export default function ProcessCard({
  id,
  title,
  author,
  category,
  tags,
  updatedAt,
}: ProcessCardProps) {
  return (
    <Link href={`/process/${id}`} className="block">
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all bg-white dark:bg-gray-800">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
            {title}
          </h3>
          <span
            className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${categoryColors[category] || categoryColors.GENERAL}`}
          >
            {categoryLabels[category] || category}
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          by {author} &middot; Updated{" "}
          {new Date(updatedAt).toLocaleDateString()}
        </p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
