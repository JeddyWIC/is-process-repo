const DASHBOARD_URL = "https://happy-water-0ea27651e.7.azurestaticapps.net";

export const dynamic = "force-static";

export default function Home() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-xl w-full text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-10 shadow-sm">
        <div className="inline-flex w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 items-center justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-600 dark:text-blue-300"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          We&rsquo;ve moved
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          The Industrial Systems Process Repository, Meeting Notes, and Project
          Lifecycles are now part of the&nbsp;
          <strong>Industrial Systems Dashboard</strong>. Bookmark this new home
          base for everything in one place.
        </p>
        <a
          href={DASHBOARD_URL}
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Go to Industrial Systems Dashboard →
        </a>
        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
          <a
            href={DASHBOARD_URL}
            className="font-mono break-all hover:underline"
          >
            {DASHBOARD_URL.replace("https://", "")}
          </a>
        </p>
      </div>
    </div>
  );
}
