export const dynamic = "force-dynamic";
export const revalidate = 0;

function CardIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px] shrink-0"
      fill="none"
    >
      <rect
        x="2.5"
        y="4.5"
        width="19"
        height="15"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3.5 9.5H20.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[20px] w-[16px] shrink-0"
      fill="currentColor"
    >
      <path d="M16.83 12.18c.03 3.02 2.65 4.03 2.68 4.04-.02.07-.42 1.45-1.39 2.87-.84 1.23-1.72 2.45-3.1 2.48-1.35.03-1.79-.8-3.35-.8-1.56 0-2.05.78-3.32.83-1.33.05-2.35-1.33-3.2-2.55-1.74-2.52-3.07-7.11-1.28-10.22.89-1.55 2.49-2.53 4.22-2.56 1.31-.03 2.55.88 3.35.88.8 0 2.31-1.09 3.89-.93.66.03 2.52.27 3.72 2.02-.1.06-2.22 1.29-2.22 3.94Z" />
      <path d="M14.74 5.27c.7-.84 1.17-2.01 1.04-3.17-1.01.04-2.23.67-2.96 1.5-.65.75-1.22 1.94-1.06 3.08 1.12.09 2.27-.57 2.98-1.41Z" />
    </svg>
  );
}

function GooglePayIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[20px] w-[20px] shrink-0"
      fill="none"
    >
      <path
        d="M20 12.23c0-.68-.06-1.19-.19-1.72H12v3.24h4.59c-.09.8-.58 2-1.67 2.81l-.02.11 2.43 1.88.17.02c1.56-1.44 2.5-3.56 2.5-6.34Z"
        fill="currentColor"
      />
      <path
        d="M12 20.35c2.24 0 4.12-.74 5.5-2.02l-2.62-2.01c-.7.49-1.64.84-2.88.84-2.2 0-4.06-1.44-4.73-3.44l-.1.01-2.53 1.95-.03.09c1.37 2.72 4.19 4.58 7.39 4.58Z"
        fill="currentColor"
      />
      <path
        d="M7.27 13.72A4.87 4.87 0 0 1 7 12c0-.6.1-1.18.26-1.72l-.01-.12-2.56-1.98-.08.04A8.3 8.3 0 0 0 3.65 12c0 1.35.32 2.63.88 3.78l2.74-2.06Z"
        fill="currentColor"
      />
      <path
        d="M12 6.84c1.56 0 2.61.67 3.21 1.23l2.34-2.28C16.11 4.44 14.24 3.65 12 3.65c-3.2 0-6.02 1.86-7.39 4.57l2.65 2.06c.68-2 2.54-3.44 4.74-3.44Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PayPalIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[20px] w-[16px] shrink-0"
      fill="currentColor"
    >
      <path d="M8.02 4h6.02c2.55 0 4.52.54 5.3 2.53.35.9.3 1.9.1 2.82-.67 3.07-2.91 4.63-6.3 4.63h-2.4c-.4 0-.73.29-.8.69L9.1 20H5.7l1.88-11.84c.07-.45.22-.8.44-1.1C8.29 4.52 8.12 4.24 8.02 4Z" />
      <path
        d="M6.1 4.27c.1-.17.3-.27.5-.27H13c1.97 0 3.54.32 4.48 1.2-.71-.2-1.54-.28-2.5-.28H9.3c-.52 0-.96.38-1.04.89L6.32 18H3l2-12.63c.06-.43.18-.8.39-1.1.2-.29.45-.5.71-.63Z"
        opacity="0.55"
      />
    </svg>
  );
}

function PaymentMethodsRow() {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[#717c89] sm:gap-x-8">
      <span className="inline-flex items-center gap-1.5 text-[15px] font-medium tracking-[-0.01em]">
        <CardIcon />
        <span>CARD</span>
      </span>

      <span className="inline-flex items-center gap-1.5 text-[15px] font-semibold tracking-[-0.02em]">
        <AppleIcon />
        <span className="text-[16px]">Pay</span>
      </span>

      <span className="inline-flex items-center gap-1.5 text-[15px] font-semibold tracking-[-0.02em]">
        <GooglePayIcon />
        <span className="text-[16px]">Pay</span>
      </span>

      <span className="inline-flex items-center gap-1.5 text-[15px] font-semibold italic tracking-[-0.02em]">
        <PayPalIcon />
        <span className="text-[16px] not-italic">PayPal</span>
      </span>
    </div>
  );
}

export default function ClubPage() {
  return (
    <main className="min-h-screen bg-[#071019] text-[#f2efe9]">
      <section className="overflow-hidden bg-[radial-gradient(circle_at_top,rgba(184,148,115,0.18),transparent_30%),radial-gradient(circle_at_78%_28%,rgba(120,22,18,0.1),transparent_24%),linear-gradient(to_bottom,#0d1824_0%,#0a1520_58%,#08131c_100%)] md:bg-[radial-gradient(circle_at_top,rgba(184,148,115,0.14),transparent_28%),radial-gradient(circle_at_78%_28%,rgba(120,22,18,0.08),transparent_22%),linear-gradient(to_bottom,#0c1622_0%,#09141d_58%,#08131c_100%)]">
        <div className="mx-auto max-w-7xl px-5 pb-12 pt-10 sm:px-6 md:px-8 md:pb-18 md:pt-18 lg:pb-20 lg:pt-24">
          <div className="lg:grid lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-16">
            <div className="block lg:hidden">
              <div className="mx-auto mb-8 w-full max-w-[420px] overflow-hidden rounded-[22px] border border-[#3b5368] bg-[linear-gradient(to_bottom,rgba(206,176,145,0.12),rgba(16,28,40,0.26))] p-2.5 shadow-[0_18px_44px_rgba(0,0,0,0.22)]">
                <img
                  src="/images/commentator-club-hero.jpeg"
                  alt="The Commentator Club"
                  className="block h-auto w-full rounded-[16px] object-cover opacity-100 brightness-[1.1] contrast-[1.08] saturate-[1.04]"
                />
              </div>
            </div>

            <div className="lg:order-1 lg:pt-2">
              <h1 className="max-w-[10.5ch] text-[2.65rem] font-semibold uppercase leading-[0.92] tracking-[0.025em] text-[#fbf6ee] sm:text-[3.35rem] lg:max-w-[11ch] lg:text-[3.9rem] lg:text-[#f2ece3]">
                The Commentator Club
              </h1>

              <div className="mt-6 max-w-2xl space-y-5 text-[1.02rem] leading-8 text-[#e4ddd4] sm:mt-8 sm:text-[1.12rem] sm:leading-9 lg:mt-10 lg:max-w-[38rem] lg:text-[1.16rem] lg:leading-9 lg:text-[#ddd8d1]">
                <p>
                  The Commentator Club is a high-agency network operating at the
                  intersection of technology, intelligence, and politics.
                </p>

                <p>
                  Members share ideas with each other and with our editorial
                  team. They are seen and heard by CEOs, founders, strategists,
                  elected representatives, leading writers, and entrepreneurs.
                </p>

                <p className="text-[#f6eee2] lg:text-[#f0e8dc]">
                  This is where serious readers become participants in shaping
                  what comes next.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:mt-10 sm:flex-row lg:mt-11">
                <a
                  href="#benefits"
                  className="inline-flex items-center justify-center rounded-2xl border border-[#4a6075] bg-[rgba(13,27,40,0.82)] px-7 py-4 text-base font-medium text-[#f3e9dc] transition hover:border-[#5f7b98] hover:bg-[#12202d] sm:text-lg lg:border-[#3e5368] lg:bg-[rgba(11,25,38,0.88)] lg:text-[#efe4d6]"
                >
                  Explore Benefits
                </a>
              </div>
            </div>

            <div className="hidden lg:block lg:order-2 lg:translate-x-2 lg:pt-44">
              <div className="overflow-hidden rounded-[34px] border border-[#314659] bg-[linear-gradient(to_bottom,rgba(206,176,145,0.08),rgba(9,17,26,0.38))] p-4 shadow-[0_32px_90px_rgba(0,0,0,0.42)]">
                <img
                  src="/images/commentator-club-hero.jpeg"
                  alt="The Commentator Club"
                  className="block h-auto w-full rounded-[26px] object-cover opacity-95 brightness-[0.97] contrast-[0.96]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="join"
        className="bg-[radial-gradient(circle_at_50%_100%,rgba(174,34,24,0.08),transparent_24%),radial-gradient(circle_at_22%_12%,rgba(184,148,115,0.08),transparent_20%),linear-gradient(to_bottom,#08131c_0%,#08121b_46%,#08121a_100%)] md:bg-[radial-gradient(circle_at_50%_100%,rgba(174,34,24,0.07),transparent_24%),radial-gradient(circle_at_22%_12%,rgba(184,148,115,0.07),transparent_18%),linear-gradient(to_bottom,#08131c_0%,#08121b_48%,#08121a_100%)]"
      >
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 md:px-8 md:py-18">
          <div className="mb-10 max-w-3xl">
            <h2 className="text-[2.3rem] font-semibold leading-[1.02] tracking-[-0.02em] text-[#f7f1e8] sm:text-[2.9rem] lg:text-[3.9rem]">
              Join for the price of a cup of coffee — and stay in the room.
            </h2>

            <p className="mt-4 text-[1.1rem] leading-8 text-[#d7d1c8] sm:mt-5 sm:text-xl lg:text-2xl">
              $5 a month or $50 a year.
            </p>
          </div>

          <div className="grid items-stretch gap-6 md:grid-cols-2">
            <div className="flex h-full flex-col rounded-[26px] border border-[#31485d] bg-[radial-gradient(circle_at_top,rgba(64,106,150,0.09),transparent_35%),linear-gradient(to_bottom,#10202e_0%,#0b1620_100%)] p-6 shadow-[0_26px_70px_rgba(0,0,0,0.28)] sm:rounded-[30px] sm:p-8">
              <div className="mb-7 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[1.75rem] font-semibold text-[#f7f1e8] sm:text-[2rem]">
                    Monthly
                  </h3>
                  <p className="mt-3 text-[2.7rem] font-semibold leading-none text-[#f1e5d7] sm:text-[3.2rem]">
                    $5
                    <span className="ml-2 text-[1.35rem] font-normal text-[#c4c8cc] sm:text-[1.65rem]">
                      / month
                    </span>
                  </p>
                </div>

                <span className="rounded-full border border-[#506273] bg-[rgba(18,31,44,0.88)] px-4 py-2 text-[12px] font-medium uppercase tracking-[0.22em] text-[#d7bc9e]">
                  Flexible
                </span>
              </div>

              <ul className="mb-8 space-y-4 text-[1.05rem] leading-8 text-[#d8dbe0] sm:text-[1.15rem]">
                <li>Full access to The Commentator Club</li>
                <li>Comment and contribute</li>
                <li>Tip Sheet access</li>
                <li>Weekly newsletter</li>
                <li>Cancel any time</li>
              </ul>

              <div className="mt-auto">
                <a
                  href="#"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-[#c40f0f] px-6 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(139,0,0,0.28)] transition hover:opacity-90 sm:text-lg"
                >
                  Join Monthly →
                </a>
              </div>
            </div>

            <div className="flex h-full flex-col rounded-[26px] border border-[#a87842] bg-[radial-gradient(circle_at_top,rgba(214,164,95,0.12),transparent_34%),linear-gradient(to_bottom,#1a1410_0%,#0f161d_100%)] p-6 shadow-[0_26px_70px_rgba(0,0,0,0.34)] sm:rounded-[30px] sm:p-8">
              <div className="mb-7 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[1.75rem] font-semibold text-[#fbf3e8] sm:text-[2rem]">
                    Annual
                  </h3>
                  <p className="mt-3 text-[2.7rem] font-semibold leading-none text-[#f3dfc1] sm:text-[3.2rem]">
                    $50
                    <span className="ml-2 text-[1.35rem] font-normal text-[#e2c793] sm:text-[1.65rem]">
                      / year
                    </span>
                  </p>
                </div>

                <span className="rounded-full border border-[#d0a15e] bg-[rgba(53,35,19,0.78)] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#f0c98d] shadow-[0_0_24px_rgba(214,164,95,0.08)]">
                  Best value
                </span>
              </div>

              <ul className="mb-8 space-y-4 text-[1.05rem] leading-8 text-[#e6dacd] sm:text-[1.15rem]">
                <li>Everything in monthly</li>
                <li>Lower annual price</li>
                <li>Simplest way to stay in the room</li>
              </ul>

              <div className="mt-auto">
                <a
                  href="#"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-[#c40f0f] px-6 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(139,0,0,0.28)] transition hover:opacity-90 sm:text-lg"
                >
                  Join Annual →
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center sm:mt-12">
            <p className="text-[13px] font-medium tracking-[0.01em] text-[#99A2AD]">
              Payments secured by <span className="text-[#C8CDD4]">Stripe</span>
            </p>

            <PaymentMethodsRow />
          </div>
        </div>
      </section>

      <section
        id="benefits"
        className="bg-[radial-gradient(circle_at_18%_0%,rgba(184,148,115,0.05),transparent_16%),radial-gradient(circle_at_82%_18%,rgba(70,112,156,0.04),transparent_20%),linear-gradient(to_bottom,#08121a_0%,#071119_48%,#071019_100%)] md:bg-[radial-gradient(circle_at_18%_0%,rgba(184,148,115,0.045),transparent_15%),radial-gradient(circle_at_82%_18%,rgba(70,112,156,0.035),transparent_20%),linear-gradient(to_bottom,#08121a_0%,#071119_48%,#071019_100%)]"
      >
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 md:px-8 md:py-18">
          <div className="mb-10">
            <h2 className="text-[2.35rem] font-semibold tracking-[-0.02em] text-[#f7f1e8] sm:text-[3rem] lg:text-[4rem]">
              Membership Benefits
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[24px] border border-[#284055] bg-[linear-gradient(to_bottom,#0d1a27_0%,#09131c_100%)] p-6 shadow-[0_18px_42px_rgba(0,0,0,0.2)] sm:rounded-[26px] sm:p-7">
              <div className="mb-5 h-2 w-14 rounded-full bg-[#d4ac83]" />
              <h3 className="text-[1.6rem] font-semibold text-[#f7f1e8] sm:text-2xl">
                Comment where it matters
              </h3>
              <p className="mt-4 text-[1.02rem] leading-8 text-[#d3d7dc] sm:text-lg">
                Exclusive ability to contribute your thoughts to our articles —
                read by your top level peers.
              </p>
            </div>

            <div className="rounded-[24px] border border-[#284055] bg-[linear-gradient(to_bottom,#0d1a27_0%,#09131c_100%)] p-6 shadow-[0_18px_42px_rgba(0,0,0,0.2)] sm:rounded-[26px] sm:p-7">
              <div className="mb-5 h-2 w-14 rounded-full bg-[#b92a1f]" />
              <h3 className="text-[1.6rem] font-semibold text-[#f7f1e8] sm:text-2xl">
                Get ahead of the news cycle
              </h3>
              <p className="mt-4 text-[1.02rem] leading-8 text-[#d3d7dc] sm:text-lg">
                Advance notice of time-sensitive and potentially market-moving
                stories via our Tip Sheet.
              </p>
            </div>

            <div className="rounded-[24px] border border-[#284055] bg-[linear-gradient(to_bottom,#0d1a27_0%,#09131c_100%)] p-6 shadow-[0_18px_42px_rgba(0,0,0,0.2)] sm:rounded-[26px] sm:p-7">
              <div className="mb-5 h-2 w-14 rounded-full bg-[#6689ae]" />
              <h3 className="text-[1.6rem] font-semibold text-[#f7f1e8] sm:text-2xl">
                Weekly strategic insight
              </h3>
              <p className="mt-4 text-[1.02rem] leading-8 text-[#d3d7dc] sm:text-lg">
                Revolution Rewired — our agenda-setting newsletter on what’s
                coming next, including select member contributions.
              </p>
            </div>

            <div className="rounded-[24px] border border-[#284055] bg-[linear-gradient(to_bottom,#0d1a27_0%,#09131c_100%)] p-6 shadow-[0_18px_42px_rgba(0,0,0,0.2)] sm:rounded-[26px] sm:p-7">
              <div className="mb-5 h-2 w-14 rounded-full bg-[#d4ac83]" />
              <h3 className="text-[1.6rem] font-semibold text-[#f7f1e8] sm:text-2xl">
                Direct line to the editorial team
              </h3>
              <p className="mt-4 text-[1.02rem] leading-8 text-[#d3d7dc] sm:text-lg">
                Submit ideas, shape coverage, and receive priority
                consideration.
              </p>
            </div>

            <div className="rounded-[24px] border border-[#284055] bg-[linear-gradient(to_bottom,#0d1a27_0%,#09131c_100%)] p-6 shadow-[0_18px_42px_rgba(0,0,0,0.2)] sm:rounded-[26px] sm:p-7 md:col-span-2 xl:col-span-2">
              <div className="mb-5 h-2 w-14 rounded-full bg-[#b92a1f]" />
              <h3 className="text-[1.6rem] font-semibold text-[#f7f1e8] sm:text-2xl">
                Be part of the network
              </h3>
              <p className="mt-4 max-w-3xl text-[1.02rem] leading-8 text-[#d3d7dc] sm:text-lg">
                Join and support a community dedicated to understanding power in
                the digital revolution, and to harnessing its potential for the
                greater good.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}