"use client";

import * as React from "react";

type DesktopShareProps = {
  title?: string;
  className?: string;
};

export default function DesktopShare({ title, className }: DesktopShareProps) {
  const [copied, setCopied] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);

  function getShareUrl() {
    return window.location.href;
  }

  function getShareTitle() {
    return title || document.title || "The Commentator";
  }

  async function copyLink(url: string) {
    // Fallback: copy link
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      return;
    }

    // Last-resort fallback
    window.prompt("Copy this link:", url);
  }

  function emailLink(url: string) {
    const subject = encodeURIComponent(getShareTitle());
    const body = encodeURIComponent(url);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  async function handlePrimaryClick() {
    try {
      const url = getShareUrl();

      // Preferred: native share dialog (supported on many modern desktop browsers)
      if (navigator.share) {
        await navigator.share({
          title: getShareTitle(),
          url,
        });
        return;
      }

      // Otherwise, open minimal fallback popover
      setOpen((v) => !v);
    } catch {
      // If user cancels share sheet, do nothing.
      // If something fails, fail silently to avoid disrupting reading.
    }
  }

  async function handleCopy() {
    try {
      const url = getShareUrl();
      await copyLink(url);
      setOpen(false);
    } catch {
      // Fail silently
    }
  }

  function handleEmail() {
    try {
      const url = getShareUrl();
      emailLink(url);
      setOpen(false);
    } catch {
      // Fail silently
    }
  }

  // Close on Escape
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Close on click outside
  React.useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (!open) return;
      const el = wrapperRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  return (
    <div ref={wrapperRef} className={className}>
      <div className="relative inline-flex items-center">
        <button
          type="button"
          onClick={handlePrimaryClick}
          aria-label="Share"
          aria-haspopup="menu"
          aria-expanded={open}
          className="inline-flex items-center gap-2 px-1 py-1 text-[12px] font-medium text-[#7DA2FF]/85 transition hover:text-[#7DA2FF] active:scale-[0.98]"
        >
          {/* 3-node share icon (no box), muted blue */}
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

        {open && (
          <div
            role="menu"
            aria-label="Share options"
            className="absolute right-0 top-full z-50 mt-2 w-44 rounded-md border border-white/10 bg-black/90 p-1 shadow-lg backdrop-blur"
          >
            <button
              type="button"
              role="menuitem"
              onClick={handleCopy}
              className="w-full rounded px-2 py-2 text-left text-[12px] text-white/80 transition hover:bg-white/5 hover:text-white"
            >
              Copy link
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={handleEmail}
              className="w-full rounded px-2 py-2 text-left text-[12px] text-white/80 transition hover:bg-white/5 hover:text-white"
            >
              Email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
