"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header({
  transparentOnDark = false,
}: {
  transparentOnDark?: boolean;
}) {
  const pathname = usePathname() ?? "";

  const navLinkClass = (href: string) => {
    const isActive =
      href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(href + "/");

    return [
      "relative no-underline hover:no-underline",
      "transition-colors duration-200",
      isActive ? "text-[#D8D0C4]" : "text-[#8A9098] hover:text-[#D8D0C4]",
      "after:content-[''] after:absolute after:left-0 after:-bottom-[6px]",
      "after:h-[1px] after:w-full after:bg-[#B87449]/70",
      "after:opacity-0 after:transition-opacity after:duration-200",
      "hover:after:opacity-100",
      isActive ? "after:opacity-100" : "",
    ].join(" ");
  };

  return (
    <header className={`${transparentOnDark ? "bg-transparent" : "bg-[#0B0D10]"} text-[#E6E9EE]`}>
      {/* Top band: masthead */}
            <div>
        <div
          className={[
            "mx-auto flex max-w-6xl items-center justify-between gap-4",
            "px-5 pr-5 pt-[2.7rem] pb-[2.1rem]",
            "sm:px-6 sm:pr-6 sm:py-12",
          ].join(" ")}
        >
          {/* Left: home link block */}
          <Link
            href="/"
            aria-label="Go to homepage"
            className="group block max-w-full no-underline hover:no-underline focus:outline-none"
          >
            {/* Title */}
            <span
              className={[
                "block max-w-full font-bold transition-colors duration-200",
                "text-[26px] tracking-[0.08em] whitespace-nowrap",
                "text-[#D8D0C4] group-hover:text-[#E3DCCE]",
                "sm:text-[32px] sm:tracking-[0.22em] sm:text-[#E4DED4] sm:group-hover:text-[#EEE8DE]",
              ].join(" ")}
              style={{ textShadow: "0 1px 0 rgba(0,0,0,0.45)" }}
            >
              <img
                src="/commentator-mark.png"
                alt=""
                aria-hidden="true"
                className="inline-block -ml-[2px] mr-3 opacity-[0.62] sm:mr-4 sm:opacity-[0.62]"
                style={{
                  width: "32px",
                  height: "32px",
                  verticalAlign: "-0.16em",
                }}
              />
              THE COMMENTATOR
            </span>

            {/* Subtitle — mobile */}
            <span className="mt-[0.45rem] ml-[52px] block whitespace-nowrap text-[12px] tracking-[0.02em] text-[#BFB7AC] transition-colors duration-200 group-hover:text-[#CFC7BC] sm:hidden">
              Freedom in the Age of AI
            </span>

            {/* Subtitle — desktop */}
            <span
              className="mt-1 hidden text-[11px] tracking-wide whitespace-nowrap transition-colors duration-200 group-hover:text-[#DDD5CA] sm:block"
              style={{
                color: "#CFC7BC",
                paddingLeft: "calc(46px + 0.22em)",
              }}
            >
              Freedom in the Age of AI
            </span>

            <span className="sr-only">Home</span>
          </Link>

          {/* Right side intentionally empty */}
          <div className="shrink-0" aria-hidden="true" />
        </div>
      </div>

      {/* Nav band */}
      <nav
        className={[
          "mx-auto max-w-6xl px-6 pt-4 pb-[21px] text-[10px] font-semibold uppercase",
          "flex flex-nowrap items-center gap-4 overflow-x-auto whitespace-nowrap",
          "tracking-[0.14em]",
          "sm:py-4 sm:gap-8 sm:tracking-[0.24em]",
        ].join(" ")}
        aria-label="Primary navigation"
      >
        <Link href="/about" className={navLinkClass("/about")}>
          Mission
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