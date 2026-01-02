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
        {/* Simple share icon, muted blue */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
        >
          <path
            d="M12 3v10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M8.5 6.5 12 3l3.5 3.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 10h-.5A2.5 2.5 0 0 0 4 12.5V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6.5A2.5 2.5 0 0 0 19.5 10H19"
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
