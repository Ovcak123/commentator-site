// components/Header.tsx
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-[#0B0D10] text-[#E6E9EE]">
      {/* Top band: masthead */}
      <div className="border-b border-white/5">
        <div
          className={[
            "mx-auto flex max-w-6xl items-center justify-between gap-4",
            "px-5 pr-5 pt-9 pb-8",
            "sm:px-6 sm:pr-6 sm:py-12",
          ].join(" ")}
        >
          {/* Left: home link block */}
          <Link
            href="/"
            aria-label="Go to homepage"
            className="group block max-w-full no-underline hover:no-underline focus:outline-none"
          >
            {/* Title line — MUST stay one line */}
            <span
              className={[
                "block max-w-full font-bold transition-colors duration-200 group-hover:text-white",
                "text-[24px] tracking-[0.10em] whitespace-nowrap",
                "sm:text-[32px] sm:tracking-[0.22em]",
              ].join(" ")}
              style={{ textShadow: "0 1px 0 rgba(0,0,0,0.45)" }}
            >
              <img
                src="/commentator-mark.png"
                alt=""
                aria-hidden="true"
                className="inline-block opacity-[0.62] -ml-[2px] mr-3 sm:mr-4"
                style={{
                  width: "32px",
                  height: "32px",
                  verticalAlign: "-0.16em",
                }}
              />
              THE COMMENTATOR
            </span>

            {/* Subtitle — mobile (ONE LINE) */}
            <span
              className="mt-0.5 block text-[11px] tracking-wide whitespace-nowrap transition-colors duration-200 group-hover:text-[#E6E9EE] sm:hidden"
              style={{ color: "#D6DAE1" }}
            >
              Freedom in the Age of AI. An OPMM by Robin Shepherd
            </span>

            {/* Subtitle — desktop (ONE LINE) */}
            <span
              className="mt-1 hidden text-[11px] tracking-wide whitespace-nowrap transition-colors duration-200 group-hover:text-[#E6E9EE] sm:block"
              style={{
                color: "#D6DAE1",
                paddingLeft: "calc(46px + 0.22em)",
              }}
            >
              Freedom in the Age of AI. An OPMM by Robin Shepherd
            </span>

            <span className="sr-only">Home</span>
          </Link>

          {/* (Search removed from masthead — now lives in nav band, right aligned) */}
          <div className="shrink-0" aria-hidden="true" />
        </div>
      </div>

      {/* Nav band + Search (right) */}
      <div className="mx-auto max-w-6xl px-6 py-2.5 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <nav
            className={[
              "text-[10px] font-semibold uppercase text-[#9AA1AB]",
              "flex flex-nowrap items-center gap-5 overflow-x-auto whitespace-nowrap tracking-[0.16em]",
              "sm:gap-8 sm:tracking-[0.24em]",
            ].join(" ")}
            aria-label="Primary navigation"
          >
            <Link
              href="/about"
              className="no-underline hover:no-underline hover:text-[#E6E9EE]"
            >
              About
            </Link>

            <Link
              href="/freedom-reloaded"
              className="no-underline hover:no-underline hover:text-[#E6E9EE]"
            >
              Freedom Reloaded
            </Link>

            <Link
              href="/contact"
              className="no-underline hover:no-underline hover:text-[#E6E9EE]"
            >
              Contact
            </Link>
          </nav>

          {/* Right: Search — fixed position, logo-family geometry, quiet copper */}
          <Link
            href="/search"
            aria-label="Search"
            title="Search"
            className={[
              "group shrink-0",
              "grid h-9 w-9 place-items-center rounded-full",
              // Quiet copper default; small lift on hover
              "text-[#B87449]/70 hover:text-[#B87449]/92",
              // No “button” background, only keyboard focus ring
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B87449]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0D10]",
              "transition-colors duration-200",
              "no-underline hover:no-underline",
            ].join(" ")}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              {/* Outer lens */}
              <circle
                cx="10.5"
                cy="10.5"
                r="7"
                stroke="currentColor"
                strokeWidth="2.35"
              />
              {/* Inner ring — subtle echo of the logo geometry */}
              <circle
                cx="10.5"
                cy="10.5"
                r="4.2"
                stroke="currentColor"
                strokeWidth="1.65"
                opacity="0.55"
              />
              {/* Handle */}
              <path
                d="M16.2 16.2 21 21"
                stroke="currentColor"
                strokeWidth="2.35"
                strokeLinecap="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
