export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ClubPage() {
  return (
    <main className="min-h-screen bg-[#071019] text-[#f2efe9]">
      <section className="overflow-hidden bg-[radial-gradient(circle_at_top,rgba(184,148,115,0.16),transparent_26%),radial-gradient(circle_at_78%_28%,rgba(120,22,18,0.12),transparent_22%),linear-gradient(to_bottom,#0c1622_0%,#09131d_52%,#071019_100%)]">
        <div className="mx-auto max-w-7xl px-5 pb-12 pt-10 sm:px-6 md:px-8 md:pb-18 md:pt-18">
          <div className="lg:grid lg:items-start lg:gap-14 lg:grid-cols-[0.96fr_1.04fr]">
            <div className="block lg:hidden">
              <div className="mx-auto mb-8 w-full max-w-[420px] overflow-hidden rounded-[22px] border border-[#314659] bg-[linear-gradient(to_bottom,rgba(206,176,145,0.08),rgba(9,17,26,0.38))] p-2.5 shadow-[0_18px_44px_rgba(0,0,0,0.28)]">
                <img
                  src="/images/commentator-club-hero.jpeg"
                  alt="The Commentator Club"
                  className="block h-auto w-full rounded-[16px] object-cover opacity-95"
                />
              </div>
            </div>

            <div className="lg:order-1">
              <h1 className="max-w-[10.5ch] text-[2.65rem] font-semibold uppercase leading-[0.94] tracking-[0.025em] text-[#f7f1e8] sm:text-[3.35rem] lg:text-[4.9rem]">
                The Commentator Club
              </h1>

              <div className="mt-6 max-w-2xl space-y-5 text-[1.02rem] leading-8 text-[#ddd8d1] sm:mt-8 sm:text-[1.12rem] sm:leading-9 lg:text-[1.18rem] lg:leading-9">
                <p>
                  The Commentator Club is a high-agency network operating at the
                  intersection of technology, intelligence, and politics.
                </p>

                <p>
                  Members share ideas with each other and with our editorial
                  team. They are seen and heard by CEOs, founders, strategists,
                  elected representatives, leading writers, and entrepreneurs.
                </p>

                <p className="text-[#f0e8dc]">
                  This is where serious readers become participants in shaping
                  what comes next.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:mt-10 sm:flex-row">
                <a
                  href="#benefits"
                  className="inline-flex items-center justify-center rounded-2xl border border-[#3e5368] bg-[rgba(11,25,38,0.88)] px-7 py-4 text-base font-medium text-[#efe4d6] transition hover:border-[#5f7b98] hover:bg-[#12202d] sm:text-lg"
                >
                  Explore Benefits
                </a>
              </div>
            </div>

            <div className="hidden lg:block lg:order-2 lg:translate-x-6 lg:pt-40">
              <div className="overflow-hidden rounded-[34px] border border-[#314659] bg-[linear-gradient(to_bottom,rgba(206,176,145,0.08),rgba(9,17,26,0.38))] p-4 shadow-[0_32px_90px_rgba(0,0,0,0.42)]">
                <img
                  src="/images/commentator-club-hero.jpeg"
                  alt="The Commentator Club"
                  className="block h-auto w-full rounded-[26px] object-cover opacity-95"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="join"
        className="bg-[radial-gradient(circle_at_50%_100%,rgba(174,34,24,0.12),transparent_22%),radial-gradient(circle_at_22%_12%,rgba(184,148,115,0.1),transparent_18%),linear-gradient(to_bottom,#09121c_0%,#08111a_100%)]"
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
        </div>
      </section>

      <section
        id="benefits"
        className="bg-[radial-gradient(circle_at_18%_0%,rgba(184,148,115,0.08),transparent_14%),linear-gradient(to_bottom,#08111a_0%,#071019_100%)]"
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
                Join a community aligned around understanding power in the
                digital revolution, and influencing its direction.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}