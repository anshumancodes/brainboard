import { Check, Minus } from "lucide-react";
import Link from "next/link";

const PRO_PAYMENT_LINK = "https://rzp.io/rzp/brainboard-pro";

const sections = [
  {
    title: "Canvas",
    features: [
      ["Infinite canvas", true, true],
      ["Sticky notes, shapes & connectors", true, true],
      ["Freehand drawing", true, true],
      ["Text & rich media embeds", true, true],
      ["Presentation mode", true, true],
      ["AI-assisted brainstorming", "_", "Unlimited"],
    ],
  },
  {
    title: "Collaboration",
    features: [
      ["Share board via link", true, true],
      ["View-only guest access", true, true],
      ["Live multiplayer editing", true, true],
      ["Cursor presence", true, true],
      ["Comments & reactions", true, true],
      ["Voice & screen sharing", false, true],
    ],
  },
  {
    title: "Workspace",
    features: [
      ["Boards", "Up to 5", "Unlimited"],
      ["Cloud sync", true, true],
      ["Version history", "7 days", "90 days"],
      ["Team workspace", false, true],
      ["Member management", false, true],
      ["Board collections & folders", false, true],
    ],
  },
  {
    title: "Export & Share",
    features: [
      ["PNG & SVG export", true, true],
      ["JSON export", true, true],
      ["PDF & PPTX export", false, true],
      ["Embeddable read-only link", true, true],
      ["Custom share permissions", false, true],
    ],
  },
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#d9ff72]/12 text-[#d9ff72]">
        <Check size={13} strokeWidth={2.5} />
      </span>
    );
  }

  if (value === false) {
    return <Minus size={14} className="text-white/20" />;
  }

  return <span className="text-xs font-medium text-white/55">{value}</span>;
}

export default function Pricing() {
  return (
    <main className="min-h-screen bg-[#071014] px-3 py-3 text-[#f4f1e9]">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-white/10">

        {/* Header */}
        <section className="relative overflow-hidden px-6 pb-14 pt-20 text-center lg:px-10">
          <div className="pointer-events-none absolute left-1/2 top-0 h-100 w-175 -translate-x-1/2 rounded-full bg-[#d9ff72]/4 blur-[120px]" />

          <div className="relative">
            <h1 className="mx-auto max-w-3xl text-balance text-5xl font-medium tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              One plan for teams.{" "}
              <span className="font-serif italic font-normal text-[#d9ff72]">
                Free
              </span>{" "}
              for everyone else.
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-white/45 sm:text-lg">
              Brainboard is free to use. Upgrade to Pro when your team needs
              more boards, deeper history, and room to grow.
            </p>
          </div>
        </section>

        {/* Pricing cards */}
        <section className="px-4 pb-8 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {/* Free */}
            <div className="rounded-2xl border border-white/10 bg-white/3 p-6 sm:p-8">
              <div className="mb-8">
                <p className="text-xs font-medium uppercase tracking-wider text-white/35">
                  Free
                </p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-4xl font-medium tracking-tight">₹0</span>
                  <span className="mb-1 text-sm text-white/35">forever</span>
                </div>
                <p className="mt-3 text-sm text-white/40">
                  Up to 5 boards, 7-day history, and full canvas access. No
                  credit card required.
                </p>
              </div>

              <ul className="mb-8 space-y-3">
                {["5 boards", "7-day version history", "Unlimited collaborators", "PNG & SVG export"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/55">
                    <Check size={13} strokeWidth={2.5} className="shrink-0 text-white/30" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className="block w-full rounded-full border border-white/12 bg-white/5 py-3 text-center text-sm font-medium transition hover:bg-white/10"
              >
                Get started free
              </Link>
            </div>

            {/* Pro */}
            <div className="relative overflow-hidden rounded-2xl border border-[#d9ff72]/25 bg-[#d9ff72]/5 p-6 sm:p-8">
              <div className="absolute right-5 top-5 rounded-full bg-[#d9ff72] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#071014]">
                Pro
              </div>

              <div className="mb-8">
                <p className="text-xs font-medium uppercase tracking-wider text-[#d9ff72]/60">
                  For teams
                </p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-4xl font-medium tracking-tight">₹499</span>
                  <span className="mb-1 text-sm text-white/35">/ month</span>
                </div>
                <p className="mt-3 text-sm text-white/40">
                  Unlimited boards, 90-day history, team workspace, and
                  everything in Free.
                </p>
              </div>

              <ul className="mb-8 space-y-3">
                {[
                  "Unlimited boards",
                  "90-day version history",
                  "Team workspace & folders",
                  "Voice & screen sharing",
                  "PDF & PPTX export",
                  "Unlimited AI assistance",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                    <Check size={13} strokeWidth={2.5} className="shrink-0 text-[#d9ff72]" />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={PRO_PAYMENT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-full bg-[#d9ff72] py-3 text-center text-sm font-semibold text-[#071014] transition hover:scale-[1.01] hover:bg-[#e8ff8a]"
              >
                Upgrade to Pro →
              </a>
            </div>
          </div>
        </section>

        {/* Feature comparison */}
        <section className="px-4 pb-12 sm:px-6 lg:px-10">
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-[1fr_100px_100px] border-b border-white/10 bg-white/2.5 sm:grid-cols-[1fr_140px_140px]">
              <div className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-white/25">
                Feature
              </div>
              <div className="border-l border-white/10 px-3 py-4 text-center text-xs font-medium text-white/40">
                Free
              </div>
              <div className="border-l border-white/10 px-3 py-4 text-center text-xs font-medium text-[#d9ff72]">
                Pro
              </div>
            </div>

            {sections.map((section) => (
              <div key={section.title}>
                <div className="border-b border-white/10 bg-white/1.5 px-5 py-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-white/35">
                    {section.title}
                  </h3>
                </div>

                {section.features.map(([name, free, pro]) => (
                  <div
                    key={name as string}
                    className="grid grid-cols-[1fr_100px_100px] border-b border-white/6 last:border-b-0 sm:grid-cols-[1fr_140px_140px]"
                  >
                    <div className="flex items-center px-5 py-4 text-sm text-white/60">
                      {name as string}
                    </div>
                    <div className="flex items-center justify-center border-l border-white/6">
                      <FeatureValue value={free as boolean | string} />
                    </div>
                    <div className="flex items-center justify-center border-l border-white/6">
                      <FeatureValue value={pro as boolean | string} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="border-t border-white/10 px-6 py-16 text-center lg:px-10">
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Ready to think{" "}
            <span className="font-serif italic text-[#d9ff72]">together?</span>
          </h2>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-white/40">
            Start free. No setup, no installs. Open a board and get to work.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-full bg-[#f4f1e9] px-6 py-3.5 text-sm font-medium text-[#071014] transition hover:scale-[1.02]"
            >
              Start drawing free
            </Link>
            <a
              href={PRO_PAYMENT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[#d9ff72]/30 bg-[#d9ff72]/8 px-6 py-3.5 text-sm font-medium text-[#d9ff72] transition hover:bg-[#d9ff72]/15"
            >
              Upgrade to Pro →
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}