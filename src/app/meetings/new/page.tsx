"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PasswordGate from "@/components/PasswordGate";
import MeetingEditor from "@/components/MeetingEditor";

const inputClass =
  "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700";

// Fallback list used only if the API hasn't been seeded yet.
const FALLBACK_ATTENDEES = [
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

interface PermanentAttendee {
  id: number;
  name: string;
  isOptional: boolean;
  sortOrder: number;
}

function formatPermanentName(a: PermanentAttendee): string {
  return a.isOptional ? `${a.name} (Optional)` : a.name;
}

const DEFAULT_TEMPLATE = `
<p>Refer to: <a href="https://industrialsystems.live">industrialsystems.live</a> for SOPs, hints, issues, resolutions.</p>

<hr>

<h2>PART 1 — ALL HANDS</h2>

<h3>Safety</h3>

<p><strong>Incidents / Near Misses:</strong></p>
<ul>
<li></li>
</ul>

<p><strong>Required Follow-Ups:</strong></p>
<ul data-type="taskList">
<li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label></li>
</ul>

<p><strong>Safety Status:</strong> <span class="status-green">Green</span></p>

<hr>

<h3>SOP of the Week</h3>
<p><strong>Topic:</strong> </p>
<p><strong>Link:</strong> <a href="https://industrialsystems.live">industrialsystems.live</a></p>
<p><em>Notes:</em></p>
<ul>
<li></li>
</ul>

<hr>

<h3>Opportunities</h3>
<p><strong>Tracker:</strong> <a href="https://airtable.com/appn62PVFcjNdTbiN/tblpZMgRZq8MVJaGi/viwysDxfAwwmCY91x?blocks=bip2AzL24UVXZXDVV">Open Airtable Tracker</a></p>

<p><strong>Discussion Notes:</strong></p>
<ul>
<li></li>
</ul>

<p><strong>Possible Award / Pending Award:</strong></p>
<ul>
<li></li>
</ul>

<hr>

<h3>Engineering Check-In</h3>

<p><strong>1. Are we on track or falling behind anywhere?</strong></p>
<ul>
<li></li>
</ul>

<p><strong>2. Are engineering releases on time vs. project schedules?</strong></p>
<ul>
<li></li>
</ul>

<p><strong>3. Current Constraints:</strong></p>

<table>
<tr><th>Project</th><th>Owner</th><th>Constraint / Action</th><th>Due Date</th></tr>
<tr><td></td><td></td><td></td><td></td></tr>
</table>

<p><strong>4. Resources or Issues?</strong></p>
<ul>
<li></li>
</ul>

<p><strong>Drawing Logs / Revisions This Week:</strong></p>
<ul data-type="taskList">
<li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label></li>
</ul>

<p><strong>Engineering Status:</strong> <span class="status-green">Green</span></p>
<p><strong>Shop Status:</strong> Current lead time: ~6+ wks</p>

<p><em>Engineers &amp; Optional Attendees Adjourn:</em></p>

<hr>

<h2>PART 2 — PM / LEADERSHIP</h2>

<h3>Project Status</h3>

<table>
<tr><th>Project</th><th>Owner</th><th>Status / Action</th><th>Due Date</th></tr>
<tr><td></td><td></td><td></td><td></td></tr>
</table>

<p><em>Comments:</em></p>
<ul>
<li></li>
</ul>

<hr>

<h3>Financials</h3>

<p><strong>Over/Under:</strong> <span class="status-green">Green</span></p>
<p><strong>Cash Flow:</strong> <span class="status-green">Green</span></p>

<table>
<tr><th>Item / Project</th><th>Owner</th><th>Required</th><th>Due Date</th></tr>
<tr><td></td><td></td><td></td><td></td></tr>
</table>

<hr>

<h3>Tracker Reviews</h3>
<p><strong>Dashboard:</strong> <a href="https://happy-water-0ea27651e.7.azurestaticapps.net/">Open Project Dashboard</a></p>

<ul data-type="taskList">
<li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span>Airport Tracker Review</span></label></li>
<li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span>F&amp;B Tracker Review</span></label></li>
</ul>

<p><strong>Issues Identified:</strong></p>
<ul>
<li></li>
</ul>

<hr>

<h3>Hot Items / Action Items</h3>

<table>
<tr><th>#</th><th>Item</th><th>Owner</th><th>Required Update</th><th>Due Date</th></tr>
<tr><td>1</td><td></td><td></td><td></td><td></td></tr>
</table>
`.trim();

interface LastMeeting {
  id: number;
  date: string;
  time: string | null;
  location: string | null;
  facilitator: string | null;
  attendees: string[];
  content: string;
}

function stripKilledRows(html: string): string {
  // Remove table rows that contain "killed" (case-insensitive)
  // Matches <tr>...</tr> where content includes "killed"
  return html.replace(/<tr>(?:(?!<\/tr>).)*?[Kk]illed(?:(?!<\/tr>).)*?<\/tr>/g, "");
}

function MeetingForm() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [time, setTime] = useState("9:30 AM");
  const [location, setLocation] = useState("Keystone + Teams");
  const [facilitator, setFacilitator] = useState("Eddy");
  const [permanentAttendees, setPermanentAttendees] = useState<PermanentAttendee[]>([]);
  const [permanentAttendeesLoaded, setPermanentAttendeesLoaded] = useState(false);
  const [attendees, setAttendees] = useState<string[]>(FALLBACK_ATTENDEES);
  const [newAttendee, setNewAttendee] = useState("");
  const [newAttendeeOptional, setNewAttendeeOptional] = useState(false);
  const [content, setContent] = useState(DEFAULT_TEMPLATE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [lastMeeting, setLastMeeting] = useState<LastMeeting | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [manageMode, setManageMode] = useState(false);

  // Fetch permanent attendee list from DB
  useEffect(() => {
    fetch("/api/attendees")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPermanentAttendees(data);
          setAttendees(data.map(formatPermanentName));
        }
        setPermanentAttendeesLoaded(true);
      })
      .catch(() => setPermanentAttendeesLoaded(true));
  }, []);

  // Fetch last meeting for "copy" feature
  useEffect(() => {
    fetch("/api/meetings")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          fetch(`/api/meetings/${data[0].id}`)
            .then((r) => r.json())
            .then((full) => setLastMeeting(full))
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  const permanentNames = permanentAttendees.map(formatPermanentName);
  const fallbackInUse = !permanentAttendeesLoaded || permanentAttendees.length === 0;
  const knownNames = fallbackInUse ? FALLBACK_ATTENDEES : permanentNames;

  const copyFromLast = () => {
    if (!lastMeeting) return;

    // Uncheck all checkboxes and strip killed items
    let copied = lastMeeting.content
      .replace(/data-checked="true"/g, 'data-checked="false"')
      .replace(/checked="checked"/g, "")
      .replace(/checked>/g, ">");

    copied = stripKilledRows(copied);

    setContent(copied);
    setTime(lastMeeting.time || "9:30 AM");
    setLocation(lastMeeting.location || "Keystone + Teams");
    setFacilitator(lastMeeting.facilitator || "Eddy");
    if (lastMeeting.attendees?.length > 0) {
      setAttendees(lastMeeting.attendees);
    }
    setEditorKey((k) => k + 1);
  };

  const useTemplate = () => {
    setContent(DEFAULT_TEMPLATE);
    setEditorKey((k) => k + 1);
  };

  const toggleAttendee = (name: string) => {
    setAttendees((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const addGuest = () => {
    const name = newAttendee.trim();
    if (name && !attendees.includes(name)) {
      setAttendees((prev) => [...prev, name]);
      setNewAttendee("");
      setNewAttendeeOptional(false);
    }
  };

  const addPermanent = async () => {
    const name = newAttendee.trim();
    if (!name) return;
    setError("");
    try {
      const res = await fetch("/api/attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, isOptional: newAttendeeOptional }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add permanent attendee");
      }
      const created = (await res.json()) as PermanentAttendee;
      const formatted = formatPermanentName(created);
      setPermanentAttendees((prev) => [...prev, created]);
      setAttendees((prev) =>
        prev.includes(formatted) ? prev : [...prev, formatted]
      );
      setNewAttendee("");
      setNewAttendeeOptional(false);
    } catch (err) {
      setError(String(err));
    }
  };

  const removePermanent = async (id: number, formatted: string) => {
    if (!confirm(`Remove "${formatted}" from the permanent attendee list? They'll no longer appear by default in new meetings.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/attendees/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove");
      }
      setPermanentAttendees((prev) => prev.filter((a) => a.id !== id));
      setAttendees((prev) => prev.filter((n) => n !== formatted));
    } catch (err) {
      setError(String(err));
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
      const res = await fetch("/api/meetings", {
        method: "POST",
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

      const meeting = await res.json();
      router.push(`/meetings/${meeting.id}`);
    } catch (err) {
      setError(String(err));
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          New Meeting Notes
        </h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={useTemplate}
            className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 text-sm font-medium transition-colors border border-blue-300 dark:border-blue-600"
          >
            Fresh Template
          </button>
          {lastMeeting && (
            <button
              type="button"
              onClick={copyFromLast}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium transition-colors border border-gray-300 dark:border-gray-600"
            >
              Copy from{" "}
              {new Date(lastMeeting.date + "T12:00:00").toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric" }
              )}
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Meeting info */}
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

        {/* Attendees */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Attendees
            </label>
            {!fallbackInUse && (
              <button
                type="button"
                onClick={() => setManageMode((m) => !m)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                {manageMode ? "Done managing" : "Manage permanent list"}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Permanent attendees from DB (or fallback hardcoded list) */}
            {fallbackInUse
              ? FALLBACK_ATTENDEES.map((name) => (
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
                ))
              : permanentAttendees.map((a) => {
                  const formatted = formatPermanentName(a);
                  const isActive = attendees.includes(formatted);
                  return (
                    <span key={a.id} className="inline-flex items-stretch">
                      <button
                        type="button"
                        onClick={() => toggleAttendee(formatted)}
                        className={`px-3 py-1 ${
                          manageMode ? "rounded-l-full" : "rounded-full"
                        } text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 line-through"
                        }`}
                      >
                        {formatted}
                      </button>
                      {manageMode && (
                        <button
                          type="button"
                          onClick={() => removePermanent(a.id, formatted)}
                          className="px-2 rounded-r-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium"
                          title="Remove from permanent list"
                          aria-label="Remove from permanent list"
                        >
                          &times;
                        </button>
                      )}
                    </span>
                  );
                })}

            {/* One-time guests (not in permanent list) */}
            {attendees
              .filter((a) => !knownNames.includes(a))
              .map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleAttendee(name)}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-green-600 text-white"
                  title="Guest — click to remove from this meeting"
                >
                  {name} &times;
                </button>
              ))}
          </div>

          <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Add an attendee
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={newAttendee}
                onChange={(e) => setNewAttendee(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addPermanent();
                  }
                }}
                placeholder="Name..."
                className={`${inputClass} max-w-xs`}
              />
              <label className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={newAttendeeOptional}
                  onChange={(e) => setNewAttendeeOptional(e.target.checked)}
                />
                Optional
              </label>
              <button
                type="button"
                onClick={addPermanent}
                disabled={!newAttendee.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                title="Save to permanent list — appears every week"
              >
                + Permanent
              </button>
              <button
                type="button"
                onClick={addGuest}
                disabled={!newAttendee.trim()}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 text-sm font-medium"
                title="One-time only for this meeting"
              >
                + Guest
              </button>
            </div>
            {fallbackInUse && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                Permanent attendee list not yet seeded in the database — using
                fallback. POST to <code>/api/attendees/seed</code> to enable
                permanent additions.
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Meeting Notes *
          </label>
          <MeetingEditor key={editorKey} content={content} onChange={setContent} />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save Meeting Notes"}
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

export default function NewMeetingPage() {
  return (
    <PasswordGate>
      <MeetingForm />
    </PasswordGate>
  );
}
