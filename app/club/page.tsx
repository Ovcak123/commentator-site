export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ClubPage() {
  return (
    <main className="min-h-screen bg-[#071019] text-[#f2efe9]">
      <section className="bg-[radial-gradient(circle_at_top,rgba(184,148,115,0.16),transparent_26%),radial-gradient(circle_at_78%_28%,rgba(120,22,18,0.12),transparent_22%),linear-gradient(to_bottom,#0c1622_0%,#09131d_52%,#071019_100%)]">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-14 md:px-8 md:pb-18 md:pt-18">
          <div className="grid items-start gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:gap-14">
            <div className="order-2 lg:order-1">
              <h1 className="max-w-[11ch] text-[3.7rem] font-semibold uppercase leading-[0.96] tracking-[0.025em] text-[#f7f1e8] sm:text-[4.4rem] lg:text-[4.9rem]">
                The Commentator Club
              </h1>

              <div className="mt-8 max-w-2xl space-y-5 text-lg leading-8 text-[#ddd8d1]">
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

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#benefits"
                  className="inline-flex items-center justify-center rounded-2xl border border-[#3e5368] bg-[rgba(11,25,38,0.88)] px-7 py-4 text-lg font-medium text-[#efe4d6] transition hover:border-[#5f7b98] hover:bg-[#12202d]"
                >
                  Explore Benefits
                </a>
              </div>
            </div>

            <div className="order-1 lg:order-2 lg:translate-x-6 lg:pt-40">
  <div className="overflow-hidden rounded-[34px] border border-[#314659] bg-[linear-gradient(to_bottom,rgba(206,176,145,0.08),rgba(9,17,26,0.38))] p-4 shadow-[0_32px_90px_rgba(0,0,0,0.42)]">
    <img
      src="/images/commentator-club-hero.jpeg"
      alt="The Commentator Club"
      className="h-full w-full rounded-[26px] object-cover opacity-95"
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
        <div className="mx-auto max-w-7xl px-6 py-14 md:px-8 md:py-18">
          <div className="mb-10 max-w-3xl">
            <h2 className="text-[2.9rem] font-semibold leading-[1.02] tracking-[-0.02em] text-[#f7f1e8] sm:text-[3.45rem] lg:text-[3.9rem]">
              Join for the price of a cup of coffee — and stay in the room.
            </h2>

            <p className="mt-5 text-xl leading-8 text-[#d7d1c8] sm:text-2xl">
              $5 a month or $50 a year.
            </p>
          </div>

          <div className="grid items-stretch gap-6 md:grid-cols-2">
            <div className="flex h-full flex-col rounded-[30px] border border-[#31485d] bg-[radial-gradient(circle_at_top,rgba(64,106,150,0.09),transparent_35%),linear-gradient(to_bottom,#10202e_0%,#0b1620_100%)] p-8 shadow-[0_26px_70px_rgba(0,0,0,0.28)]">
              <div className="mb-7 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[2rem] font-semibold text-[#f7f1e8]">
                    Monthly
                  </h3>
                  <p className="mt-3 text-[3.2rem] font-semibold leading-none text-[#f1e5d7]">
                    $5
                    <span className="ml-2 text-[1.65rem] font-normal text-[#c4c8cc]">
                      / month
                    </span>
                  </p>
                </div>

                <span className="rounded-full border border-[#506273] bg-[rgba(18,31,44,0.88)] px-4 py-2 text-[12px] font-medium uppercase tracking-[0.22em] text-[#d7bc9e]">
                  Flexible
                </span>
              </div>

              <ul className="mb-8 space-y-4 text-[1.15rem] leading-8 text-[#d8dbe0]">
                <li>Full access to The Commentator Club</li>
                <li>Comment and contribute</li>
                <li>Tip Sheet access</li>
                <li>Weekly newsletter</li>
                <li>Cancel any time</li>
              </ul>

              <div className="mt-auto">
                <a
                  href="#"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-[#c40f0f] px-6 py-4 text-lg font-semibold text-white shadow-[0_18px_40px_rgba(139,0,0,0.28)] transition hover:opacity-90"
                >
                  Join Monthly →
                </a>
              </div>
            </div>

            <div className="flex h-full flex-col rounded-[30px] border border-[#a87842] bg-[radial-gradient(circle_at_top,rgba(214,164,95,0.12),transparent_34%),linear-gradient(to_bottom,#1a1410_0%,#0f161d_100%)] p-8 shadow-[0_26px_70px_rgba(0,0,0,0.34)]">
              <div className="mb-7 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[2rem] font-semibold text-[#fbf3e8]">
                    Annual
                  </h3>
                  <p className="mt-3 text-[3.2rem] font-semibold leading-none text-[#f3dfc1]">
                    $50
                    <span className="ml-2 text-[1.65rem] font-normal text-[#e2c793]">
                      / year
                    </span>
                  </p>
                </div>

                <span className="rounded-full border border-[#d0a15e] bg-[rgba(53,35,19,0.78)] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#f0c98d] shadow-[0_0_24px_rgba(214,164,95,0.08)]">
                  Best value
                </span>
              </div>

              <ul className="mb-8 space-y-4 text-[1.15rem] leading-8 text-[#e6dacd]">
                <li>Everything in monthly</li>
                <li>Lower annual price</li>
                <li>Simplest way to stay in the room</li>
              </ul>

              <div className="mt-auto">
                <a
                  href="#"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-[#c40f0f] px-6 py-4 text-lg font-semibold text-white shadow-[0_18px_40px_rgba(139,0,0,0.28)] transition hover:opacity-90"
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
        <div className="mx-auto max-w-7xl px-6 py-14 md:px-8 md:py-18">
          <div className="mb-10">
            <h2 className="text-[3rem] font-semibold tracking-[-0.02em] text-[#f7f1e8] sm:text-[3.5rem] lg:text-[4rem]">
              Membership Benefits
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[26px] border border-[#284055] bg-[linear-gradient(to_bottom,#0d1a27_0%,#09131c_100%)] p-7 shadow-[0_18px_42px_rgba(0,0,0,0.2)]">
              <div className="mb-5 h-2 w-14 rounded-full bg-[#d4ac83]" />
              <h3 className="text-2xl font-semibold text-[#f7f1e8]">
                Comment where it matters
              </h3>
              <p className="mt-4 text-lg leading-8 text-[#d3d7dc]">
                Exclusive ability to contribute your thoughts to our articles —
                read by your top level peers.
              </p>
            </div>

            <div className="rounded-[26px] border border-[#284055] bg-[linear-gradient(to_bottom,#0d1a27_0%,#09131c_100%)] p-7 shadow-[0_18px_42px_rgba(0,0,0,0.2)]">
              <div className="mb-5 h-2 w-14 rounded-full bg-[#b92a1f]" />
              <h3 className="text-2xl font-semibold text-[#f7f1e8]">
                Get ahead of the news cycle
              </h3>
              <p className="mt-4 text-lg leading-8 text-[#d3d7dc]">
                Advance notice of time-sensitive and potentially market-moving
                stories via our Tip Sheet.
              </p>
            </div>

            <div className="rounded-[26px] border border-[#284055] bg-[linear-gradient(to_bottom,#0d1a27_0%,#09131c_100%)] p-7 shadow-[0_18px_42px_rgba(0,0,0,0.2)]">
              <div className="mb-5 h-2 w-14 rounded-full bg-[#6689ae]" />
              <h3 className="text-2xl font-semibold text-[#f7f1e8]">
                Weekly strategic insight
              </h3>
              <p className="mt-4 text-lg leading-8 text-[#d3d7dc]">
                Revolution Rewired — our agenda-setting newsletter on what’s
                coming next, including select member contributions.
              </p>
            </div>

            <div className="rounded-[26px] border border-[#284055] bg-[linear-gradient(to_bottom,#0d1a27_0%,#09131c_100%)] p-7 shadow-[0_18px_42px_rgba(0,0,0,0.2)]">
              <div className="mb-5 h-2 w-14 rounded-full bg-[#d4ac83]" />
              <h3 className="text-2xl font-semibold text-[#f7f1e8]">
                Direct line to the editorial team
              </h3>
              <p className="mt-4 text-lg leading-8 text-[#d3d7dc]">
                Submit ideas, shape coverage, and receive priority
                consideration.
              </p>
            </div>

            <div className="rounded-[26px] border border-[#284055] bg-[linear-gradient(to_bottom,#0d1a27_0%,#09131c_100%)] p-7 shadow-[0_18px_42px_rgba(0,0,0,0.2)] md:col-span-2 xl:col-span-2">
              <div className="mb-5 h-2 w-14 rounded-full bg-[#b92a1f]" />
              <h3 className="text-2xl font-semibold text-[#f7f1e8]">
                Be part of the network
              </h3>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-[#d3d7dc]">
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