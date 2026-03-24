"use client";

import { useState, useRef, useCallback } from "react";

interface AttachmentInfo {
  id?: number;
  filename: string;
  mimeType: string;
  size: number;
  file?: File; // only for pending uploads
}

interface FileAttachmentsProps {
  processId?: number;
  existingAttachments?: AttachmentInfo[];
  onAttachmentsChange?: (pending: File[]) => void;
  readOnly?: boolean;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "\ud83d\uddbc\ufe0f";
  if (mimeType === "application/pdf") return "\ud83d\udcc4";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "\ud83d\udcca";
  if (mimeType.includes("document") || mimeType.includes("word")) return "\ud83d\udcdd";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "\ud83d\udcfd\ufe0f";
  if (mimeType.startsWith("video/")) return "\ud83c\udfa5";
  if (mimeType.startsWith("text/")) return "\ud83d\udcc3";
  return "\ud83d\udcce";
}

export default function FileAttachments({
  processId,
  existingAttachments = [],
  onAttachmentsChange,
  readOnly = false,
}: FileAttachmentsProps) {
  const [attachments, setAttachments] = useState<AttachmentInfo[]>(existingAttachments);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const newFiles: File[] = [];
      const newAttachments: AttachmentInfo[] = [];

      for (const file of Array.from(files)) {
        if (file.size > MAX_FILE_SIZE) {
          setError(`"${file.name}" exceeds 10MB limit`);
          continue;
        }

        // Check for duplicates
        const isDuplicate =
          pendingFiles.some((f) => f.name === file.name && f.size === file.size) ||
          attachments.some((a) => a.filename === file.name && a.size === file.size);

        if (isDuplicate) continue;

        newFiles.push(file);
        newAttachments.push({
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          file,
        });
      }

      if (newFiles.length > 0) {
        const updatedPending = [...pendingFiles, ...newFiles];
        setPendingFiles(updatedPending);
        setAttachments((prev) => [...prev, ...newAttachments]);
        onAttachmentsChange?.(updatedPending);
      }
    },
    [pendingFiles, attachments, onAttachmentsChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      setError("");
      if (readOnly) return;
      addFiles(e.dataTransfer.files);
    },
    [addFiles, readOnly]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!readOnly) setDragOver(true);
    },
    [readOnly]
  );

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError("");
      if (e.target.files) {
        addFiles(e.target.files);
      }
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [addFiles]
  );

  const removeAttachment = useCallback(
    async (index: number) => {
      const attachment = attachments[index];

      // If it's a saved attachment, delete from server
      if (attachment.id) {
        try {
          await fetch(`/api/attachments/${attachment.id}`, { method: "DELETE" });
        } catch {
          setError("Failed to delete attachment");
          return;
        }
      }

      // If it's a pending file, remove from pending list
      if (attachment.file) {
        const updatedPending = pendingFiles.filter((f) => f !== attachment.file);
        setPendingFiles(updatedPending);
        onAttachmentsChange?.(updatedPending);
      }

      setAttachments((prev) => prev.filter((_, i) => i !== index));
    },
    [attachments, pendingFiles, onAttachmentsChange]
  );

  // Upload all pending files to a process
  const uploadPending = useCallback(
    async (targetProcessId: number) => {
      if (pendingFiles.length === 0) return;
      setUploading(true);
      setError("");

      try {
        const formData = new FormData();
        formData.append("processId", targetProcessId.toString());
        for (const file of pendingFiles) {
          formData.append("files", file);
        }

        const res = await fetch("/api/attachments", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const results = await res.json();

        // Replace pending entries with saved ones
        setAttachments((prev) =>
          prev.map((a) => {
            if (!a.file) return a;
            const saved = results.find(
              (r: AttachmentInfo) => r.filename === a.filename
            );
            return saved ? { ...saved } : a;
          })
        );
        setPendingFiles([]);
      } catch (err) {
        setError(String(err));
      } finally {
        setUploading(false);
      }
    },
    [pendingFiles]
  );

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {!readOnly && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="text-3xl mb-2">{dragOver ? "\ud83d\udce5" : "\ud83d\udcce"}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-blue-600 dark:text-blue-400">
              Click to browse
            </span>{" "}
            or drag &amp; drop files here
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            PDF, Word, Excel, images, and more. Max 10MB per file.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* File list */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment, index) => (
            <div
              key={attachment.id || `pending-${index}`}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <span className="text-xl shrink-0">
                {getFileIcon(attachment.mimeType)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {attachment.filename}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatSize(attachment.size)}
                  {attachment.file && (
                    <span className="ml-2 text-amber-600 dark:text-amber-400">
                      (pending upload)
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Download button for saved attachments */}
                {attachment.id && (
                  <a
                    href={`/api/attachments/${attachment.id}`}
                    download={attachment.filename}
                    className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                    title="Download"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </a>
                )}
                {/* Remove button */}
                {!readOnly && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAttachment(index);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          Uploading files...
        </div>
      )}
    </div>
  );
}

// Export the upload function type for use in forms
export async function uploadAttachments(
  processId: number,
  files: File[]
): Promise<void> {
  if (files.length === 0) return;

  const formData = new FormData();
  formData.append("processId", processId.toString());
  for (const file of files) {
    formData.append("files", file);
  }

  const res = await fetch("/api/attachments", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Upload failed");
  }
}
