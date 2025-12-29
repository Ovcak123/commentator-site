// components/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname() ?? "";

  const navLinkClass = (href: string) => {
    const isActive =
      href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(href + "/");

    return [
      "relative no-underline hover:no-underline",
      "transition-colors duration-200",
      isActive ? "text-[#E6E9EE]" : "text-[#9AA1AB] hover:text-[#E6E9EE]",
      // underline treatment (matches your editorial copper language)
      "after:content-[''] after:absolute after:left-0 after:-bottom-[6px]",
      "after:h-[1px] after:w-full after:bg-[#B87449]/70",
      "after:opacity-0 after:transition-opacity after:duration-200",
      "hover:after:opacity-100",
      isActive ? "after:opacity-100" : "",
    ].join(" ");
  };

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

          {/* Right side intentionally empty (reserved for future banner/utility) */}
          <div className="shrink-0" aria-hidden="true" />
        </div>
      </div>

      {/* Nav band */}
      <nav
        className={[
          "mx-auto max-w-6xl px-6 py-2.5 text-[10px] font-semibold uppercase",
          // single row, never wrap, allow horizontal scroll if needed
          "flex flex-nowrap items-center gap-4 overflow-x-auto whitespace-nowrap",
          // tracking slightly tightened on mobile to comfortably fit 4 items
          "tracking-[0.14em]",
          "sm:py-4 sm:gap-8 sm:tracking-[0.24em]",
        ].join(" ")}
        aria-label="Primary navigation"
      >
        <Link href="/about" className={navLinkClass("/about")}>
          About
        </Link>

        <Link
          href="/freedom-reloaded"
          className={navLinkClass("/freedom-reloaded")}
        >
          Freedom Reloaded
        </Link>

        <Link href="/contact" className={navLinkClass("/contact")}>
          Contact
        </Link>

        <Link href="/search" className={navLinkClass("/search")}>
          Search
        </Link>
      </nav>
    </header>
  );
}
