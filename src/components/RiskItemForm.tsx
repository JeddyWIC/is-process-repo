"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700";

const PHASE_OPTIONS = [
  { key: "BID", label: "Bid" },
  { key: "PRECON", label: "Preconstruction" },
  { key: "CONSTRUCTION", label: "Construction" },
  { key: "COMMISSIONING", label: "Commissioning" },
];

const EFFECT_OPTIONS = ["Delays", "Efficiency", "Rework", "Material", "Time", "Cost", "Risk"];

const TYPE_SUGGESTIONS = [
  "Engineering",
  "Supervision",
  "Tradesmen",
  "Project Management",
  "PM / Engineering",
  "Quality Control",
  "Punch List Management",
  "RFI Management",
  "Schedule Management",
];

export interface RiskItemFormData {
  id?: number;
  type: string;
  title: string;
  description: string;
  effects: string[];
  phases: string[];
  tags: string[];
  notes: string;
}

interface Props {
  initial?: RiskItemFormData;
  mode: "new" | "edit";
}

export default function RiskItemForm({ initial, mode }: Props) {
  const router = useRouter();
  const [type, setType] = useState(initial?.type || "Engineering");
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [effects, setEffects] = useState<string[]>(initial?.effects || []);
  const [phases, setPhases] = useState<string[]>(initial?.phases || []);
  const [tags, setTags] = useState<string[]>(initial?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const togglePhase = (key: string) => {
    setPhases((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const toggleEffect = (e: string) => {
    setEffects((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]
    );
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput("");
  };

  const removeTag = (t: string) => {
    setTags(tags.filter((x) => x !== t));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (phases.length === 0) {
      setError("Select at least one phase.");
      return;
    }
    setSaving(true);
    setError("");

    const url =
      mode === "new" ? "/api/framework" : `/api/framework/${initial?.id}`;
    const method = mode === "new" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, description, effects, phases, tags, notes }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      router.push("/framework");
      router.refresh();
    } catch (err) {
      setError(String(err));
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initial?.id) return;
    if (!confirm("Delete this risk item?")) return;
    try {
      const res = await fetch(`/api/framework/${initial.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      router.push("/framework");
      router.refresh();
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Type *
        </label>
        <input
          type="text"
          list="type-suggestions"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={inputClass}
          required
        />
        <datalist id="type-suggestions">
          {TYPE_SUGGESTIONS.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          required
        />
      </div>

      {/* Phases */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Project Phase(s) * — when should this be addressed?
        </label>
        <div className="flex flex-wrap gap-2">
          {PHASE_OPTIONS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => togglePhase(p.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                phases.includes(p.key)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description / Deeper Dive
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className={inputClass}
        />
      </div>

      {/* Effects */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Risks / Effects
        </label>
        <div className="flex flex-wrap gap-2">
          {EFFECT_OPTIONS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => toggleEffect(e)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                effects.includes(e)
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags / Keywords — for search (e.g. &ldquo;bag tags&rdquo;, &ldquo;RFIs&rdquo;, &ldquo;commissioning&rdquo;)
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
            >
              #{t}
              <button
                type="button"
                onClick={() => removeTag(t)}
                className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-100"
                aria-label={`Remove ${t}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add tag and press Enter..."
            className={`${inputClass} max-w-sm`}
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className={inputClass}
        />
      </div>

      <div className="flex gap-3 items-center">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : mode === "new" ? "Add Item" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
        >
          Cancel
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            className="ml-auto px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-sm font-medium"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
