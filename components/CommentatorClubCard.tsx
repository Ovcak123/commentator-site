import Link from "next/link";

const MAJOR_HEADLINE_SERIF_CLASS = "font-serif tracking-[-0.022em]";

export default function CommentatorClubCard() {
  return (
    <Link
      href="/club"
      className="group block no-underline hover:no-underline focus:outline-none"
      aria-label="Explore The Commentator Club"
    >
      <section className="relative overflow-hidden rounded-[6px] border border-[#E7C9B4]/[0.08] bg-[linear-gradient(135deg,rgba(52,7,15,0.96)_0%,rgba(88,11,24,0.95)_34%,rgba(116,18,33,0.92)_66%,rgba(79,10,21,0.96)_100%)] px-7 py-7 transition-all duration-200 group-hover:border-[#E7C9B4]/[0.14] group-hover:shadow-[0_14px_34px_rgba(0,0,0,0.28)] lg:px-8 lg:py-7 lg:group-hover:shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.085),transparent_28%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(255,220,190,0.055),transparent_24%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.035),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.28),transparent)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0.008)_24%,rgba(0,0,0,0.10)_100%)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[38%] bg-[linear-gradient(to_left,rgba(255,255,255,0.03),transparent_72%)] opacity-80" />

        <div className="relative">
          <div className="mb-3 inline-flex items-center rounded-full border border-[#D8A77F]/[0.24] bg-black/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D8A77F]">
            Membership
          </div>

          <h3
            className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[19px] font-semibold leading-[1.06] text-[#F4E7DB] transition-colors duration-150 group-hover:text-[#FFF5ED] lg:text-[20px]`}
          >
            Join The Commentator Club
          </h3>

          <p className="mt-4 max-w-none text-[14.2px] leading-[1.9] text-[#E9D6C8] transition-colors duration-150 group-hover:text-[#FAEEE5] lg:max-w-[64ch] lg:text-[16px] lg:leading-[1.82]">
            <em>Intelligence Brief</em> and <em>Intelligence Alerts</em> on tech,
            power, and markets. <em>Revolution Rewired</em> podcast. Exclusive
            commenting privileges. Submit article ideas for editorial
            consideration. If you appreciate what we do, join us!
          </p>

          <div className="mt-6 text-[14px] font-bold text-white">
            One month free. Then $5/mo or $50/yr.{" "}
            <span className="inline-flex whitespace-nowrap items-center gap-2">
              Click for more
              <span className="relative top-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E4B58D]/60 bg-[#D8A77F]/15 text-[#F2C49D] transition-all duration-200 group-hover:translate-x-1 group-hover:border-[#F2C49D] group-hover:bg-[#D8A77F]/25 sm:top-0">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-[19px] w-[19px]"
                >
                  <path
                    d="M4 12h15m-6-6 6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </span>
          </div>
        </div>
      </section>
    </Link>
  );
}