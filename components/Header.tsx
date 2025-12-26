// components/Header.tsx
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-[#0B0D10] text-[#E6E9EE]">
      {/* Top band: masthead */}
      <div className="border-b border-white/5">
        <div
          className={[
            "mx-auto flex max-w-6xl items-center px-6 py-7",
            "sm:py-12",
            // Mobile-only optical nudge to pull masthead away from right edge
            "-mr-1 sm:mr-0",
          ].join(" ")}
        >
          <Link
            href="/"
            aria-label="Go to homepage"
            className="group block no-underline hover:no-underline focus:outline-none"
          >
            {/* Title line — mobile stays ONE LINE; desktop unchanged */}
            <span
              className={[
                "block font-bold transition-colors duration-200 group-hover:text-white",
                "text-[26px] tracking-[0.14em] whitespace-nowrap",
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

            {/* Subtitle — mobile left-aligned; desktop keeps aligned version */}
            <span
              className="mt-0.5 block text-[11px] tracking-wide transition-colors duration-200 group-hover:text-[#E6E9EE] sm:hidden"
              style={{
                color: "#D6DAE1",
                textDecoration: "none",
                borderBottom: "none",
              }}
            >
              Freedom in the Age of AI. An OPMM by Robin Shepherd
            </span>

            <span
              className="mt-1 hidden text-[11px] tracking-wide transition-colors duration-200 group-hover:text-[#E6E9EE] sm:block"
              style={{
                color: "#D6DAE1",
                paddingLeft: "calc(46px + 0.22em)",
                textDecoration: "none",
                borderBottom: "none",
              }}
            >
              Freedom in the Age of AI. An OPMM by Robin Shepherd
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
