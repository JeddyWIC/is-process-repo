"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import RichEditor from "@/components/RichEditor";
import TagInput from "@/components/TagInput";
import FileAttachments, { uploadAttachments } from "@/components/FileAttachments";

const inputClass =
  "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700";

function EditForm() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [content, setContent] = useState("");
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<
    { id: number; filename: string; mimeType: string; size: number }[]
  >([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/processes/${id}`).then((r) => r.json()),
      fetch(`/api/attachments?processId=${id}`).then((r) => r.json()),
    ])
      .then(([data, attachData]) => {
        setTitle(data.title);
        setAuthor(data.author);
        setCategory(data.category);
        setContent(data.content);
        setTagNames(data.tags || []);
        setExistingAttachments(Array.isArray(attachData) ? attachData : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(String(err));
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !content.trim()) {
      setError("Please fill in title, author, and content.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/processes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, author, category, content, tagNames }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      // Upload any pending file attachments
      if (pendingFiles.length > 0) {
        await uploadAttachments(parseInt(id), pendingFiles);
      }

      router.push(`/process/${id}`);
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Edit Process</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Author *
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className={inputClass}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${inputClass} md:w-auto`}
          >
            <option value="GENERAL">General</option>
            <option value="FOOD_BEV">Food &amp; Beverage</option>
            <option value="AIRPORT">Airport</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags
          </label>
          <TagInput tags={tagNames} onChange={setTagNames} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Content *
          </label>
          {content !== undefined && (
            <RichEditor content={content} onChange={setContent} />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Attachments
          </label>
          <FileAttachments
            processId={parseInt(id)}
            existingAttachments={existingAttachments}
            onAttachmentsChange={setPendingFiles}
          />
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

export default function EditProcessPage() {
  return <EditForm />;
}
