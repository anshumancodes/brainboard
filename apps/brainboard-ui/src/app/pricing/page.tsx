import { Check, Minus, Sparkles } from "lucide-react";

const sections = [
  {
    title: "Create",
    features: [
      ["Infinite canvas", true, true],
      ["Full editor features", true, true],
      ["Unlimited boards", true, true],
      ["Automatically sync to cloud", true, true],
      ["Quick dashboard access", true, true],
      ["AI assistance", "Limited", "Extended"],
      ["Presentations", true, true],
    ],
  },
  {
    title: "Collaborate",
    features: [
      ["Invite collaborators by link", true, true],
      ["View-only access", true, true],
      ["Voice & screen sharing", false, true],
      ["Comments", true, true],
      ["Live real-time collaboration", true, true],
    ],
  },
  {
    title: "Teams",
    features: [
      ["User accounts", true, true],
      ["Cloud storage", true, true],
      ["Workspace teams", false, true],
      ["User management", false, true],
      ["Organize into collections", false, true],
    ],
  },
  {
    title: "Share",
    features: [
      ["Share with guests", "For free", "For free"],
      ["PNG, SVG & JSON export", true, true],
      ["Embeddable / read-only links", true, true],
      ["Presentations as slides", true, true],
      ["Live presentations", true, true],
      ["PDF & PPTX export", false, true],
    ],
  },
  {
    title: "Libraries",
    features: [
      ["Public libraries", true, true],
      ["Personal library", "Browser", "Cloud"],
      ["Workspace libraries", false, "Soon"],
      ["Search in libraries", false, "Soon"],
    ],
  },
];

function FeatureValue({
  value,
}: {
  value: boolean | string;
}) {
  if (value === true) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#d9ff72]/10 text-[#d9ff72]">
        <Check size={14} strokeWidth={2.5} />
      </span>
    );
  }

  if (value === false) {
    return <Minus size={15} className="text-white/20" />;
  }

  return (
    <span className="text-xs font-medium text-white/60">
      {value}
    </span>
  );
}

export default function Pricing() {
  return (
    <main className="min-h-screen bg-[#071014] px-3 py-3 text-[#f4f1e9]">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-white/10">
        {/* Header */}
        <section className="relative overflow-hidden px-6 pb-16 pt-20 text-center lg:px-10">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-125 w-175 -translate-x-1/2 rounded-full bg-[#d9ff72]/5 blur-[140px]" />

          <div className="relative">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-xs text-white/50 backdrop-blur-md">
              <Sparkles size={13} className="text-[#d9ff72]" />
              Simple, transparent pricing
            </div>

            <h1 className="mx-auto max-w-4xl text-balance text-5xl font-medium tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Brainboard{" "}
              <span className="font-serif italic font-normal text-[#d9ff72]">
                vs.
              </span>{" "}
              Brainboard Pro
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/50 sm:text-lg">
              Choose the right set of features for your team. Start free,
              upgrade when your ideas get bigger.
            </p>
          </div>
        </section>

        {/* Pricing cards */}
        <section className="px-4 pb-8 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Free */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
              <div className="mb-10">
                <p className="text-sm font-medium text-white/50">
                  For individuals
                </p>

                <h2 className="mt-2 text-3xl font-medium tracking-tight">
                  Free
                </h2>

                <p className="mt-2 text-sm text-white/40">
                  Free forever
                </p>
              </div>

              <button className="w-full rounded-full border border-white/15 bg-white/5 py-3 text-sm font-medium transition hover:bg-white/10">
                Get started
              </button>
            </div>

            {/* Pro */}
            <div className="relative overflow-hidden rounded-2xl border border-[#d9ff72]/30 bg-[#d9ff72]/6 p-6 sm:p-8">
              <div className="absolute right-5 top-5 rounded-full bg-[#d9ff72] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#071014]">
                Recommended
              </div>

              <div className="mb-10">
                <p className="text-sm font-medium text-[#d9ff72]/70">
                  For teams
                </p>

                <h2 className="mt-2 text-3xl font-medium tracking-tight">
                  Brainboard Pro
                </h2>

                <p className="mt-2 text-sm text-white/40">
                  <span className="text-lg font-medium text-white">
                    $6
                  </span>{" "}
                  a month per user
                </p>
              </div>

              <button className="w-full rounded-full bg-[#d9ff72] py-3 text-sm font-medium text-[#071014] transition hover:scale-[1.01]">
                Start Pro
              </button>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="px-4 pb-12 sm:px-6 lg:px-10">
          <div className="overflow-hidden rounded-2xl border border-white/10">
            {/* Column header */}
            <div className="grid grid-cols-[1fr_100px_100px] border-b border-white/10 bg-white/2.5 sm:grid-cols-[1fr_150px_150px]">
              <div className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-white/30">
                Features
              </div>

              <div className="border-l border-white/10 px-3 py-4 text-center text-xs font-medium text-white/50">
                Free
              </div>

              <div className="border-l border-white/10 px-3 py-4 text-center text-xs font-medium text-[#d9ff72]">
                Pro
              </div>
            </div>

            {sections.map((section) => (
              <div key={section.title}>
                {/* Section title */}
                <div className="border-b border-white/10 bg-white/1.5 px-5 py-4">
                  <h3 className="text-sm font-medium">
                    {section.title}
                  </h3>
                </div>

                {/* Features */}
                {section.features.map(([name, free, pro]) => (
                  <div
                    key={name as string}
                    className="grid grid-cols-[1fr_100px_100px] border-b border-white/6 last:border-b-0 sm:grid-cols-[1fr_150px_150px]"
                  >
                    <div className="flex items-center px-5 py-4 text-sm text-white/65">
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
            Your next idea starts{" "}
            <span className="font-serif italic text-[#d9ff72]">
              here.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/40">
            Create your first board in seconds. No credit card required.
          </p>

          <button className="mt-7 rounded-full bg-[#d9ff72] px-6 py-3.5 text-sm font-medium text-[#071014] transition hover:scale-[1.02]">
            Start drawing
          </button>
        </section>
      </div>
    </main>
  );
}