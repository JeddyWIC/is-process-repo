import Link from "next/link";
import { db } from "@/lib/db";
import { meetings } from "@/lib/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  const allMeetings = await db
    .select({
      id: meetings.id,
      date: meetings.date,
      time: meetings.time,
      facilitator: meetings.facilitator,
      attendees: meetings.attendees,
    })
    .from(meetings)
    .orderBy(desc(meetings.date))
    .limit(50);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          IS Weekly Meeting
        </h1>
        <Link
          href="/meetings/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
        >
          + New Meeting
        </Link>
      </div>

      {allMeetings.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-12">
          No meeting notes yet.
        </p>
      ) : (
        <div className="space-y-3">
          {allMeetings.map((m) => {
            const attendeeList = m.attendees ? JSON.parse(m.attendees) : [];
            const dateObj = new Date(m.date + "T12:00:00");
            const formatted = dateObj.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            return (
              <Link
                key={m.id}
                href={`/meetings/${m.id}`}
                className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {formatted}
                    </h2>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {m.time && <span>{m.time}</span>}
                      {m.facilitator && (
                        <>
                          <span>&middot;</span>
                          <span>Led by {m.facilitator}</span>
                        </>
                      )}
                      {attendeeList.length > 0 && (
                        <>
                          <span>&middot;</span>
                          <span>{attendeeList.length} attendees</span>
                        </>
                      )}
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
