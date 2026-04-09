"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Meeting {
  id: number;
  date: string;
  time: string | null;
  location: string | null;
  facilitator: string | null;
  attendees: string[];
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function MeetingViewPage() {
  const params = useParams();
  const id = params.id as string;
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/meetings/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setMeeting(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(String(err));
        setLoading(false);
      });
  }, [id]);

  // Handle checkbox clicks in the rendered HTML
  const handleContentClick = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" && target.getAttribute("type") === "checkbox") {
        e.preventDefault();
        if (!meeting) return;

        const container = (e.currentTarget as HTMLElement);
        const checkboxes = container.querySelectorAll('input[type="checkbox"]');
        const index = Array.from(checkboxes).indexOf(target as HTMLInputElement);

        // Parse and update the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(meeting.content, "text/html");
        const docCheckboxes = doc.querySelectorAll('input[type="checkbox"]');

        if (docCheckboxes[index]) {
          const cb = docCheckboxes[index] as HTMLInputElement;
          const wasChecked = cb.hasAttribute("checked");
          if (wasChecked) {
            cb.removeAttribute("checked");
          } else {
            cb.setAttribute("checked", "checked");
          }

          // Also update the parent li data-checked attribute
          const li = cb.closest("li");
          if (li) {
            li.setAttribute("data-checked", wasChecked ? "false" : "true");
          }

          const newContent = doc.body.innerHTML;
          setMeeting({ ...meeting, content: newContent });

          // Save to server
          await fetch(`/api/meetings/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: newContent }),
          });
        }
      }
    },
    [meeting, id]
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-red-600">{error || "Meeting not found"}</p>
      </div>
    );
  }

  const dateObj = new Date(meeting.date + "T12:00:00");
  const formatted = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/meetings" className="hover:text-blue-600">
          Meetings
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">{formatted}</span>
      </nav>

      <article className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                IS Weekly Meeting &mdash; {formatted}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                {meeting.time && <span>{meeting.time}</span>}
                {meeting.location && (
                  <>
                    <span>&middot;</span>
                    <span>{meeting.location}</span>
                  </>
                )}
                {meeting.facilitator && (
                  <>
                    <span>&middot;</span>
                    <span>Facilitator: {meeting.facilitator}</span>
                  </>
                )}
              </div>
            </div>
            <Link
              href={`/meetings/${id}/edit`}
              className="shrink-0 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            >
              Edit
            </Link>
          </div>

          {/* Attendees */}
          {meeting.attendees && meeting.attendees.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Attendees:
              </p>
              <div className="flex flex-wrap gap-2">
                {meeting.attendees.map((name) => (
                  <span
                    key={name}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      name.includes("Optional")
                        ? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        : "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                    }`}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content with clickable checkboxes */}
        <div
          className="prose prose-sm sm:prose-base dark:prose-invert max-w-none p-6 meeting-content"
          onClick={handleContentClick}
          dangerouslySetInnerHTML={{ __html: meeting.content }}
        />
      </article>
    </div>
  );
}
