"use client";

import { useState } from "react";
import { Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRCodeProps {
  url: string;
  size?: number;
  label?: string;
}

export function QRCode({ url, size = 160, label }: QRCodeProps) {
  const [copied, setCopied] = useState(false);

  // Use a free QR code API to generate the image
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=${size}x${size}&margin=8&format=svg`;

  function handleCopy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const link = document.createElement("a");
    link.href = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=400x400&margin=16&format=png`;
    link.download = `${label || "qr-code"}.png`;
    link.click();
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-xl border border-border bg-white p-3 shadow-soft">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrSrc}
          alt={`QR code for ${label || url}`}
          width={size}
          height={size}
          className="rounded-lg"
        />
      </div>
      {label && (
        <p className="text-xs text-muted-fg text-center max-w-[200px] truncate">
          {label}
        </p>
      )}
      <div className="flex gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="gap-1 text-xs press-effect"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-600" strokeWidth={2} />
          ) : (
            <Copy className="h-3 w-3" strokeWidth={1.75} />
          )}
          {copied ? "Copied" : "Copy URL"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          className="gap-1 text-xs press-effect"
        >
          <Download className="h-3 w-3" strokeWidth={1.75} />
          Download
        </Button>
      </div>
    </div>
  );
}
