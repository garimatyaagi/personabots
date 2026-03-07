"use client";

import { useState, useRef } from "react";
import { Avatar } from "./avatar";
import { Camera, Loader2, X } from "lucide-react";

interface AvatarUploadProps {
  name: string;
  currentUrl?: string | null;
  botId?: string | null;
  onUpload?: (url: string) => void;
  onFileSelect?: (file: File) => void;
  onRemove?: () => void;
}

export function AvatarUpload({
  name,
  currentUrl,
  botId,
  onUpload,
  onFileSelect,
  onRemove,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayUrl = previewUrl || currentUrl;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    if (botId && onUpload) {
      // Direct upload mode (bot already exists)
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("botId", botId);
        const res = await fetch("/api/upload/avatar", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          onUpload(data.url);
          setPreviewUrl(null);
        } else {
          setPreviewUrl(null);
        }
      } catch {
        setPreviewUrl(null);
      } finally {
        setUploading(false);
      }
    } else if (onFileSelect) {
      // Wizard mode — store file for later upload
      onFileSelect(file);
    }

    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative group">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative flex h-20 w-20 items-center justify-center rounded-full overflow-hidden border-2 border-dashed border-border hover:border-primary/40 transition-all"
          disabled={uploading}
        >
          {displayUrl ? (
            <img
              src={displayUrl}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <Avatar name={name} size="lg" />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-text/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
            {uploading ? (
              <Loader2 className="h-5 w-5 text-white animate-spin" />
            ) : (
              <Camera className="h-5 w-5 text-white" strokeWidth={1.75} />
            )}
          </div>
        </button>

        {/* Remove button */}
        {displayUrl && !uploading && onRemove && (
          <button
            type="button"
            onClick={() => {
              setPreviewUrl(null);
              onRemove();
            }}
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-hover transition-colors"
          >
            <X className="h-3 w-3" strokeWidth={2} />
          </button>
        )}
      </div>

      <p className="text-xs text-muted-fg">
        {uploading ? "Uploading..." : "Click to upload photo"}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
