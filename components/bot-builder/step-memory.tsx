"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  Link2,
  X,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import type { BotBuilderState } from "@/types";

interface StepMemoryProps {
  state: BotBuilderState;
  onChange: (updates: Partial<BotBuilderState["memory"]>) => void;
}

const QA_QUESTIONS = [
  "What's your professional background in 2-3 sentences?",
  "What are you most passionate about in your work?",
  "What's a recent accomplishment you're proud of?",
  "How would your colleagues describe you?",
  "What's your superpower — the thing you do better than most?",
];

type UploadStatus = "idle" | "uploading" | "done" | "error";

export function StepMemory({ state, onChange }: StepMemoryProps) {
  const { memory } = state;
  const [uploadStatus, setUploadStatus] = useState<
    Record<string, UploadStatus>
  >({});
  const [linkInput, setLinkInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    onChange({ uploads: [...memory.uploads, ...newFiles] });

    // Upload each file
    for (const file of newFiles) {
      setUploadStatus((prev) => ({ ...prev, [file.name]: "uploading" }));
      try {
        const formData = new FormData();
        formData.append("type", "file");
        formData.append("file", file);
        formData.append("isShareable", "true");

        const res = await fetch("/api/memory/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");
        setUploadStatus((prev) => ({ ...prev, [file.name]: "done" }));
      } catch {
        setUploadStatus((prev) => ({ ...prev, [file.name]: "error" }));
      }
    }
  }

  function addLink() {
    if (!linkInput.trim()) return;
    onChange({ links: [...memory.links, linkInput.trim()] });
    setLinkInput("");
  }

  function removeLink(index: number) {
    const updated = memory.links.filter((_, i) => i !== index);
    onChange({ links: updated });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold tracking-heading">
          Feed your memory
        </h2>
        <p className="text-sm text-muted-fg">
          Upload documents and add context so your bot knows you.
        </p>
      </div>

      {/* File Upload */}
      <div>
        <label className="text-sm font-medium">Upload documents</label>
        <p className="text-xs text-muted-fg mb-3">
          Resume, CV, portfolio docs — PDF, DOCX, or TXT
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx,.txt"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <div
          onClick={() => fileRef.current?.click()}
          className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-6 transition-colors hover:border-primary/30 hover:bg-accent/20"
        >
          <Upload className="h-6 w-6 text-muted-fg" strokeWidth={1.5} />
          <p className="text-sm text-muted-fg">
            Click to upload or drag files here
          </p>
          <p className="text-xs text-muted-fg">PDF, DOCX, TXT up to 10MB</p>
        </div>

        {/* Uploaded files */}
        {memory.uploads.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {memory.uploads.map((file, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-xl border border-border px-3 py-2"
              >
                <FileText
                  className="h-4 w-4 text-muted-fg"
                  strokeWidth={1.75}
                />
                <span className="flex-1 text-sm truncate">{file.name}</span>
                {uploadStatus[file.name] === "uploading" && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
                {uploadStatus[file.name] === "done" && (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
                {uploadStatus[file.name] === "error" && (
                  <Badge variant="primary">Failed</Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Links */}
      <div>
        <label className="text-sm font-medium">Add links</label>
        <p className="text-xs text-muted-fg mb-3">
          LinkedIn, personal website, portfolio
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="https://linkedin.com/in/..."
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addLink()}
          />
          <Button variant="secondary" onClick={addLink}>
            <Link2 className="h-4 w-4" strokeWidth={1.75} />
          </Button>
        </div>
        {memory.links.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {memory.links.map((link, i) => (
              <Badge key={i} variant="outline" className="gap-1.5">
                {link.replace(/https?:\/\//, "").slice(0, 30)}
                <button onClick={() => removeLink(i)}>
                  <X className="h-3 w-3" strokeWidth={2} />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <Textarea
        id="notes"
        label="About me / notes"
        placeholder="Paste anything else you'd like your bot to know — an about page, bio, key achievements, etc."
        value={memory.notes}
        onChange={(e) => onChange({ notes: e.target.value })}
        rows={4}
      />

      {/* Q&A */}
      <div>
        <label className="text-sm font-medium">Quick Q&A</label>
        <p className="text-xs text-muted-fg mb-3">
          Answer a few questions to shape your bot&apos;s voice.
        </p>
        <div className="flex flex-col gap-4">
          {QA_QUESTIONS.map((q, i) => (
            <Card key={i}>
              <CardContent className="py-3">
                <p className="text-sm font-medium mb-2">{q}</p>
                <Textarea
                  placeholder="Your answer..."
                  value={memory.qa_answers[q] || ""}
                  onChange={(e) =>
                    onChange({
                      qa_answers: {
                        ...memory.qa_answers,
                        [q]: e.target.value,
                      },
                    })
                  }
                  rows={2}
                  className="min-h-[60px]"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
