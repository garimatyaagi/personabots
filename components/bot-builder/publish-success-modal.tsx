"use client";

import { Button } from "@/components/ui/button";
import { QRCode } from "@/components/ui/qr-code";
import {
  Check,
  Copy,
  ExternalLink,
  Twitter,
  Linkedin,
  X,
  PartyPopper,
} from "lucide-react";
import { useState } from "react";

interface PublishSuccessModalProps {
  botName: string;
  botSlug: string;
  onClose: () => void;
}

export function PublishSuccessModal({
  botName,
  botSlug,
  onClose,
}: PublishSuccessModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const botUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/b/${botSlug}`;

  function copyLink() {
    navigator.clipboard.writeText(botUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Check out my personal AI bot: ${botName}`
  )}&url=${encodeURIComponent(botUrl)}`;

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    botUrl
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-text/20 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div className="relative mx-4 w-full max-w-md rounded-2xl border border-border bg-bg p-6 shadow-xl animate-fade-in">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-fg hover:text-text transition-colors"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            {showQR ? (
              <PartyPopper className="h-7 w-7 text-green-600" strokeWidth={1.75} />
            ) : (
              <Check className="h-7 w-7 text-green-600" strokeWidth={2} />
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold">Your bot is live!</h2>
            <p className="mt-1 text-sm text-muted-fg">
              Share {botName} with the world
            </p>
          </div>

          {/* URL display */}
          <div className="w-full rounded-xl border border-border bg-accent/20 p-3">
            <p className="text-sm font-mono text-text break-all">{botUrl}</p>
          </div>

          {/* Actions */}
          <div className="flex w-full gap-2">
            <Button
              onClick={copyLink}
              variant="secondary"
              className="flex-1 gap-1.5 press-effect"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
              ) : (
                <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
              )}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <a href={botUrl} target="_blank" className="flex-1">
              <Button variant="primary" className="w-full gap-1.5 press-effect">
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
                View Bot
              </Button>
            </a>
          </div>

          {/* QR Code toggle */}
          {showQR ? (
            <div className="w-full rounded-xl border border-border bg-accent/10 p-4 animate-fade-in">
              <QRCode url={botUrl} label={botSlug} size={140} />
            </div>
          ) : (
            <button
              onClick={() => setShowQR(true)}
              className="text-xs text-muted-fg hover:text-text transition-colors underline underline-offset-2"
            >
              Show QR code for sharing
            </button>
          )}

          {/* Social sharing */}
          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs text-muted-fg">Share on:</span>
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/50 text-text hover:bg-accent transition-all press-effect"
            >
              <Twitter className="h-4 w-4" strokeWidth={1.75} />
            </a>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/50 text-text hover:bg-accent transition-all press-effect"
            >
              <Linkedin className="h-4 w-4" strokeWidth={1.75} />
            </a>
          </div>

          {/* Dashboard button */}
          <Button variant="ghost" onClick={onClose} className="mt-2 press-effect">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
