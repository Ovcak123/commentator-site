// components/Header.tsx
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-[#0B0D10] text-[#E6E9EE]">
      {/* Top band: masthead */}
      <div className="border-b border-white/5">
        {/* +16px total header depth preserved */}
        <div className="mx-auto flex max-w-6xl items-center px-6 py-11 sm:py-12">
          <Link
            href="/"
            aria-label="Go to homepage"
            className="group block no-underline hover:no-underline focus:outline-none"
          >
            {/* Title line — logo sits on SAME LINE as “THE” */}
            <span
              className="block text-[28px] font-bold tracking-[0.22em] sm:text-[32px] transition-colors duration-200 group-hover:text-white"
              style={{ textShadow: "0 1px 0 rgba(0,0,0,0.45)" }}
            >
              <img
                src="/commentator-mark.png"
                alt=""
                aria-hidden="true"
                className="inline-block opacity-[0.62] -ml-[2px] mr-4"
                style={{
                  width: "32px",
                  height: "32px",
                  verticalAlign: "-0.16em",
                }}
              />
              THE COMMENTATOR
            </span>

            {/* Subtitle — subtly brightened, alignment preserved */}
            <span
              className="mt-1 block text-[11px] tracking-wide transition-colors duration-200 group-hover:text-[#E6E9EE]"
              style={{
                color: "#D6DAE1", // subtle brightness lift
                paddingLeft: "calc(46px + 0.22em)", // alignment preserved
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
      <nav className="mx-auto flex max-w-6xl flex-wrap gap-8 px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#9AA1AB]">
        <Link href="/" className="no-underline hover:no-underline hover:text-[#E6E9EE]">
          Home
        </Link>
        <Link href="/about" className="no-underline hover:no-underline hover:text-[#E6E9EE]">
          About
        </Link>
        <Link
          href="/freedom-reloaded"
          className="no-underline hover:no-underline hover:text-[#E6E9EE]"
        >
          Freedom Reloaded
        </Link>
        <Link href="/contact" className="no-underline hover:no-underline hover:text-[#E6E9EE]">
          Contact
        </Link>
      </nav>
    </header>
  );
}
