import Link from "next/link";

const MAJOR_HEADLINE_SERIF_CLASS = "font-serif tracking-[-0.022em]";

export default function CommentatorClubCard() {
  return (
    <Link
      href="/club"
      className="group block no-underline hover:no-underline focus:outline-none"
      aria-label="Join The Commentator Club"
    >
      <section className="relative overflow-hidden rounded-[6px] border border-[#E7C9B4]/[0.08] bg-[linear-gradient(135deg,rgba(52,7,15,0.96)_0%,rgba(88,11,24,0.95)_34%,rgba(116,18,33,0.92)_66%,rgba(79,10,21,0.96)_100%)] px-7 py-7 transition-all duration-200 group-hover:border-[#E7C9B4]/[0.14] group-hover:shadow-[0_14px_34px_rgba(0,0,0,0.28)] lg:px-8 lg:py-7 lg:group-hover:shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.085),transparent_28%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(255,220,190,0.055),transparent_24%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.035),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.28),transparent)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0.008)_24%,rgba(0,0,0,0.10)_100%)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[38%] bg-[linear-gradient(to_left,rgba(255,255,255,0.03),transparent_72%)] opacity-80" />

        <div className="relative">
          <div className="mb-3 inline-flex items-center rounded-full border border-[#F3D9C7]/[0.08] bg-black/5 px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.24em] text-[#F0D8C7]/65">
            Membership
          </div>

          <h3
            className={`${MAJOR_HEADLINE_SERIF_CLASS} text-[19px] font-semibold leading-[1.06] text-[#F4E7DB] transition-colors duration-150 group-hover:text-[#FFF5ED] lg:text-[20px]`}
          >
            Join The Commentator Club
          </h3>

          <p className="mt-4 max-w-none text-[14.2px] leading-[1.9] text-[#E9D6C8] transition-colors duration-150 group-hover:text-[#FAEEE5] lg:max-w-[64ch] lg:text-[16px] lg:leading-[1.82]">
            An influential community of agenda-setting founders, CEOs,
            policymakers, and thinkers. Members get the weekly Revolution
            Rewired newsletter, comment and submission rights, and access to
            discussions with our editorial team and other members of the club.
          </p>

          <div className="mt-6 flex items-end justify-between gap-3">
            <div className="text-[12.5px] font-semibold tracking-[0.04em] text-[#F4E7DB]">
              $5 per month
            </div>

            <div className="inline-flex items-center gap-2 text-[14px] font-semibold text-white transition-all duration-150 group-hover:translate-x-0.5">
              <span>Learn more</span>
              <span aria-hidden="true" className="text-[17px] leading-none">
                →
              </span>
            </div>
          </div>
        </div>
      </section>
    </Link>
  );
}