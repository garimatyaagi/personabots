"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Copy,
  Check,
  Pencil,
  RefreshCw,
  Sparkles,
  Loader2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentSectionProps {
  contentType: string;
  label: string;
  content: string;
  contentId: string | null;
  isGenerating: boolean;
  onGenerate: () => void;
  onContentChange: (content: string, id: string | null) => void;
}

export function ContentSection({
  contentType,
  label,
  content,
  contentId,
  isGenerating,
  onGenerate,
  onContentChange,
}: ContentSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentEndRef = useRef<HTMLDivElement>(null);

  // Reset editing state when content type changes
  useEffect(() => {
    setIsEditing(false);
    setCopied(false);
  }, [contentType]);

  // Auto-scroll to bottom while generating
  useEffect(() => {
    if (isGenerating && contentEndRef.current) {
      contentEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [content, isGenerating]);

  // Auto-resize textarea when editing
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [isEditing, editValue]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [content]);

  const handleEdit = useCallback(() => {
    setEditValue(content);
    setIsEditing(true);
  }, [content]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditValue("");
  }, []);

  const handleSave = useCallback(async () => {
    if (!contentId || editValue === content) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/tailoring/${contentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editValue, is_edited: true }),
      });

      if (!res.ok) throw new Error("Save failed");

      onContentChange(editValue, contentId);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  }, [contentId, editValue, content, onContentChange]);

  // Empty state
  if (!content && !isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 px-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/5">
          <Sparkles className="h-6 w-6 text-primary/60" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-fg">No {label.toLowerCase()} yet</p>
          <p className="mt-1 text-xs text-muted">
            Generate AI-tailored content for this role
          </p>
        </div>
        <Button onClick={onGenerate} size="sm">
          <Sparkles className="h-4 w-4" />
          Generate {label}
        </Button>
      </div>
    );
  }

  // Generating state (streaming)
  if (isGenerating) {
    return (
      <div className="p-6">
        <div className="mb-3 flex items-center gap-2 text-xs text-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Generating {label.toLowerCase()}...</span>
        </div>
        <div className="text-sm text-fg leading-relaxed whitespace-pre-wrap">
          {content}
          <span className="inline-block w-0.5 h-4 bg-primary/70 align-middle animate-pulse ml-0.5" />
        </div>
        <div ref={contentEndRef} />
      </div>
    );
  }

  // Content exists
  return (
    <div className="p-6">
      {/* Action bar */}
      <div className="mb-4 flex items-center justify-end gap-2">
        {isEditing ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              isLoading={saving}
            >
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={onGenerate}>
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </Button>
          </>
        )}
      </div>

      {/* Content area */}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full resize-none rounded-lg border border-border bg-white/80 p-4 text-sm text-fg leading-relaxed outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
          rows={10}
        />
      ) : (
        <div className="text-sm text-fg leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      )}
    </div>
  );
}
