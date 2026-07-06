"use client";

import * as React from "react";
import PrintButton from "./PrintButton";

type DesktopShareProps = {
  title?: string;
  className?: string;
};

export default function DesktopShare({
  title,
  className,
}: DesktopShareProps) {
  const [copied, setCopied] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);

  function getShareUrl() {
    return window.location.href;
  }

  function getShareTitle() {
    return title || document.title || "The Commentator";
  }

  function getShareText() {
    return getShareTitle();
  }

  async function copyLink(url: string) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
      return;
    }

    window.prompt("Copy this link:", url);
  }

  function openPopup(url: string) {
    const width = 640;
    const height = 720;
    const left = Math.max(window.screenX + (window.outerWidth - width) / 2, 0);
    const top = Math.max(window.screenY + (window.outerHeight - height) / 2, 0);

    window.open(
      url,
      "commentator-share",
      [
        "toolbar=no",
        "location=no",
        "status=no",
        "menubar=no",
        "scrollbars=yes",
        "resizable=yes",
        `width=${width}`,
        `height=${height}`,
        `left=${left}`,
        `top=${top}`,
      ].join(","),
    );
  }

  function buildXUrl() {
    const shareUrl = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(getShareText());
    return `https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`;
  }

  function buildFacebookUrl() {
    const shareUrl = encodeURIComponent(getShareUrl());
    return `https://www.facebook.com/dialog/share?app_id=966242223397117&display=popup&href=${shareUrl}`;
  }

  function buildThreadsUrl() {
    const composed = encodeURIComponent(`${getShareText()} ${getShareUrl()}`);
    return `https://www.threads.com/intent/post?text=${composed}`;
  }

  function buildLinkedInUrl() {
    const shareUrl = encodeURIComponent(getShareUrl());
    return `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
  }

  function handlePrimaryClick() {
    setOpen((v) => !v);
  }

  async function handleCopy() {
    try {
      await copyLink(getShareUrl());
      setOpen(false);
    } catch {
      // Fail silently
    }
  }

  function handleX() {
    try {
      openPopup(buildXUrl());
      setOpen(false);
    } catch {
      // Fail silently
    }
  }

  function handleFacebook() {
    try {
      openPopup(buildFacebookUrl());
      setOpen(false);
    } catch {
      // Fail silently
    }
  }

  function handleThreads() {
    try {
      openPopup(buildThreadsUrl());
      setOpen(false);
    } catch {
      // Fail silently
    }
  }

  function handleLinkedIn() {
    try {
      openPopup(buildLinkedInUrl());
      setOpen(false);
    } catch {
      // Fail silently
    }
  }

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

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
    <div ref={wrapperRef} className={`inline-flex items-center gap-4 ${className ?? ""}`}>
      <div className="relative inline-flex items-center">
        <button
          type="button"
          onClick={handlePrimaryClick}
          aria-label="Share"
          aria-haspopup="menu"
          aria-expanded={open}
          className="inline-flex items-center gap-2 px-1 py-1 text-[12px] font-medium text-[#7DA2FF]/85 transition hover:text-[#7DA2FF] active:scale-[0.98]"
        >
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
            className="absolute right-0 top-full z-50 mt-2 w-48 rounded-md border border-white/10 bg-black/95 p-1 shadow-lg backdrop-blur"
          >
            <button
              type="button"
              role="menuitem"
              onClick={handleCopy}
              className="block w-full rounded px-3 py-2 text-left text-[12px] text-white/80 transition hover:bg-white/5 hover:text-white"
            >
              Copy link
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={handleX}
              className="block w-full rounded px-3 py-2 text-left text-[12px] text-white/80 transition hover:bg-white/5 hover:text-white"
            >
              X
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={handleFacebook}
              className="block w-full rounded px-3 py-2 text-left text-[12px] text-white/80 transition hover:bg-white/5 hover:text-white"
            >
              Facebook
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={handleThreads}
              className="block w-full rounded px-3 py-2 text-left text-[12px] text-white/80 transition hover:bg-white/5 hover:text-white"
            >
              Threads
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={handleLinkedIn}
              className="block w-full rounded px-3 py-2 text-left text-[12px] text-white/80 transition hover:bg-white/5 hover:text-white"
            >
              LinkedIn
            </button>
          </div>
        )}
      </div>
      <PrintButton />
    </div>
  );
}