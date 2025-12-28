// components/Header.tsx
import Link from "next/link";

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10.5 18.5a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M16.5 16.5 21 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Header() {
  return (
    <header className="bg-[#0B0D10] text-[#E6E9EE]">
      {/* Top band: masthead */}
      <div className="border-b border-white/5">
        <div
          className={[
            // IMPORTANT: no justify-between here — we want FULL width for the title+subtitle block
            "mx-auto flex max-w-6xl items-start",
            "px-5 pt-9 pb-8",
            "sm:px-6 sm:py-12",
          ].join(" ")}
        >
          <Link
            href="/"
            aria-label="Go to homepage"
            className="group block w-full max-w-full no-underline hover:no-underline focus:outline-none"
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

            {/* Subtitle row (subtitle + search icon on the SAME line) */}
            <span className="mt-0.5 flex w-full items-center justify-between gap-3 sm:mt-1">
              {/* Subtitle — mobile (FORCE one line) */}
              <span
                className="sm:hidden"
                style={{
                  color: "#D6DAE1",
                  textDecoration: "none",
                  borderBottom: "none",
                  // Force single-line + reserve room for icon
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "clip",
                  maxWidth: "calc(100% - 34px)",
                  fontSize: "10px",
                  letterSpacing: "0.02em",
                  lineHeight: "1.2",
                }}
              >
                Freedom in the Age of AI. An OPMM by Robin Shepherd
              </span>

              {/* Subtitle — desktop (keeps your indent; still one line + room for icon) */}
              <span
                className="hidden sm:block"
                style={{
                  color: "#D6DAE1",
                  paddingLeft: "calc(46px + 0.22em)",
                  textDecoration: "none",
                  borderBottom: "none",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "clip",
                  maxWidth: "calc(100% - 40px)",
                  fontSize: "11px",
                  letterSpacing: "0.04em",
                  lineHeight: "1.2",
                }}
              >
                Freedom in the Age of AI. An OPMM by Robin Shepherd
              </span>

              {/* Search icon — adjacent to subtitle line */}
              <Link
                href="/search"
                aria-label="Search"
                title="Search"
                className="shrink-0 rounded-full p-[6px] no-underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C67C4E]/55"
              >
                <span className="grid place-items-center text-[#C67C4E]/80 transition-opacity duration-150 hover:text-[#C67C4E]/95">
                  <SearchIcon />
                </span>
              </Link>
            </span>

            <span className="sr-only">Home</span>
          </Link>
        </div>
      </div>

      {/* Nav band */}
      <nav
        className={[
          "mx-auto max-w-6xl px-6 py-2.5 text-[10px] font-semibold uppercase text-[#9AA1AB]",
          "flex flex-nowrap items-center gap-5 overflow-x-auto whitespace-nowrap tracking-[0.16em]",
          "sm:py-4 sm:gap-8 sm:tracking-[0.24em]",
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
    </header>
  );
}
