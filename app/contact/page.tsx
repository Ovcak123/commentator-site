// app/contact/page.tsx

import Header from "../../components/Header";
import Link from "next/link";

export const revalidate = 0;

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#0B0D10] text-[#E6E9EE]">
      <Header />

      <section className="w-full px-4 pb-16 pt-10 md:px-0">
        <div className="max-w-3xl md:ml-[180px] lg:ml-[180px]">
          <h1 className="mb-6 text-2xl font-semibold tracking-tight">
            Contact
          </h1>

          <div
            className="
              prose prose-invert max-w-none text-[15px] leading-relaxed text-[#9AA1AB]
              [&_p:first-of-type:first-letter]:!float-none
              [&_p:first-of-type:first-letter]:!mr-0
              [&_p:first-of-type:first-letter]:!mt-0
              [&_p:first-of-type:first-letter]:!text-inherit
              [&_p:first-of-type:first-letter]:!font-inherit
              [&_p:first-of-type:first-letter]:!text-[1em]
              [&_p:first-of-type:first-letter]:!leading-[inherit]
              [&_p:first-of-type:first-letter]:!tracking-[inherit]
            "
          >
            <p>To contact the team: info@thecommentator.com</p>

            <p>To submit news tips: tips@thecommentator.com</p>

            <p>
              We endeavor to read all emails, but cannot guarantee a response due to volume.
            </p>

            <p>
              Note: commentary submissions mainly come from members of The Commentator Club (
              <Link
                href="/club"
                className="underline decoration-[rgba(198,124,78,0.6)] underline-offset-2 hover:decoration-[rgba(198,124,78,0.9)]"
              >
                join by clicking here
              </Link>
              ), or are solicited directly by the editorial team.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}