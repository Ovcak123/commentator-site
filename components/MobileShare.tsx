"use client";

import * as React from "react";

type MobileShareProps = {
  title?: string;
  className?: string;
};

export default function MobileShare({ title, className }: MobileShareProps) {
  const [copied, setCopied] = React.useState(false);

  async function handleShare() {
    try {
      const url = window.location.href;

      // Native share sheet (iOS Safari, modern mobile browsers)
      if (navigator.share) {
        await navigator.share({
          title: title || document.title,
          url,
        });
        return;
      }

      // Fallback: copy link
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
        return;
      }

      // Last-resort fallback
      window.prompt("Copy this link:", url);
    } catch {
      // If user cancels share sheet, do nothing.
      // If something fails, fail silently to avoid disrupting reading.
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleShare}
        aria-label="Share"
        className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-[12px] font-medium text-[#7DA2FF]/85 ring-1 ring-white/10 transition hover:text-[#7DA2FF] hover:ring-white/20 active:scale-[0.98]"
      >
        {/* 3-node share icon (matches your reference), muted blue */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
        >
          <circle cx="18" cy="5" r="2" fill="currentColor" />
          <circle cx="6" cy="12" r="2" fill="currentColor" />
          <circle cx="18" cy="19" r="2" fill="currentColor" />
          <path
            d="M8 12l8-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M8 12l8 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        <span>{copied ? "Copied" : "Share"}</span>
      </button>
    </div>
  );
}
