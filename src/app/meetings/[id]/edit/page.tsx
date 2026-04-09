"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import PasswordGate from "@/components/PasswordGate";
import MeetingEditor from "@/components/MeetingEditor";

const inputClass =
  "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700";

const DEFAULT_ATTENDEES = [
  "Ahlgrim",
  "Benett (Optional)",
  "Carlson",
  "Dumbauld",
  "Holiday",
  "Kittles (Optional)",
  "Kopel",
  "Montgomery",
  "Mueller",
  "Nau",
  "Reynolds",
  "Sar",
  "Sargent (Optional)",
  "Wells",
  "Williams",
];

function EditMeetingForm() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [facilitator, setFacilitator] = useState("");
  const [attendees, setAttendees] = useState<string[]>([]);
  const [newAttendee, setNewAttendee] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/meetings/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setDate(data.date);
        setTime(data.time || "");
        setLocation(data.location || "");
        setFacilitator(data.facilitator || "");
        setAttendees(data.attendees || []);
        setContent(data.content);
        setLoading(false);
      })
      .catch((err) => {
        setError(String(err));
        setLoading(false);
      });
  }, [id]);

  const toggleAttendee = (name: string) => {
    setAttendees((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const addAttendee = () => {
    const name = newAttendee.trim();
    if (name && !attendees.includes(name)) {
      setAttendees((prev) => [...prev, name]);
      setNewAttendee("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Please add meeting content.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/meetings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          time,
          location,
          facilitator,
          attendees,
          content,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      router.push(`/meetings/${id}`);
    } catch (err) {
      setError(String(err));
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Collect all unique attendees (default + any extras from data)
  const allKnown = [...new Set([...DEFAULT_ATTENDEES, ...attendees])];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Edit Meeting Notes
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time
            </label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Facilitator
            </label>
            <input
              type="text"
              value={facilitator}
              onChange={(e) => setFacilitator(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Attendees
          </label>
          <div className="flex flex-wrap gap-2">
            {allKnown.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => toggleAttendee(name)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  attendees.includes(name)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 line-through"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newAttendee}
              onChange={(e) => setNewAttendee(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addAttendee();
                }
              }}
              placeholder="Add guest..."
              className={`${inputClass} max-w-xs`}
            />
            <button
              type="button"
              onClick={addAttendee}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Meeting Notes *
          </label>
          {content !== undefined && (
            <MeetingEditor content={content} onChange={setContent} />
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EditMeetingPage() {
  return (
    <PasswordGate>
      <EditMeetingForm />
    </PasswordGate>
  );
}
