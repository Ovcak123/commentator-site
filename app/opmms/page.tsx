// app/opmms/page.tsx

import Header from "../../components/Header";

export default function OpmmsPage() {
  return (
    <>
      <Header />
      <main className="mt-6 max-w-3xl space-y-4">
        <h1 className="text-3xl font-semibold text-neutral-900">
          How OPMMs Work
        </h1>
        <p className="text-[15px] leading-relaxed text-neutral-800">
          OPMMs (Other People’s Money Machines) are one of the core mechanisms
          through which power is exercised in the modern economy – from asset
          managers and sovereign wealth funds to big-tech platforms and
          security-industrial complexes.
        </p>
        <p className="text-[15px] leading-relaxed text-neutral-800">
          This section of Commentator will unpack how these structures work, how
          they intersect with democracy and technology, and what they mean for
          citizens who increasingly feel that everything is being done &quot;to&quot;
          them rather than &quot;with&quot; them.
        </p>
      </main>
    </>
  );
}
