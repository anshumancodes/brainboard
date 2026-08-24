"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Footer from "../components/layout/Footer";

export default function Hero() {
  return (
    <main className="min-h-screen bg-[#071014] px-3 py-3 text-[#f4f1e9]">
      <section className="relative min-h-[calc(100vh-24px)] overflow-hidden rounded-[28px] border border-white/10">
        {/* Background */}
        <Image
          src="/brainboard-hero.png"
          alt=""
          fill
          priority
          className="object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/15" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,.55)_100%)]" />

        {/* Navigation */}
        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            brainboard<span className="text-[#d9ff72]">.</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm text-white/70 md:flex">
            <Link href="#how-it-works" className="transition hover:text-white">
              How it works
            </Link>
            <Link href="/pricing" className="transition hover:text-white">
              Pricing
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm text-white/70 transition hover:text-white sm:block"
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="rounded-full bg-[#f4f1e9] px-5 py-2.5 text-sm font-medium text-[#071014] transition hover:scale-[1.02]"
            >
              Get started
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 pt-20 text-center lg:px-10 lg:pt-24">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs text-white/70 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d9ff72]" />
            The collaborative canvas for ideas
          </div>

          <h1 className="max-w-5xl text-balance text-5xl font-medium leading-[0.95] tracking-[-0.055em] sm:text-6xl md:text-7xl lg:text-[88px]">
            Turn your ideas into{" "}
            <span className="font-serif italic font-normal text-[#d9ff72]">
              something
            </span>{" "}
            you can see.
          </h1>

          <p className="mt-7 max-w-xl text-base leading-7 text-white/65 sm:text-lg">
            Brainboard gives your team a shared canvas to think, sketch, plan,
            and build together , in real time.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="group flex items-center gap-2 rounded-full bg-[#d9ff72] px-6 py-3.5 text-sm font-medium text-[#071014] transition hover:scale-[1.03]"
            >
              Start drawing
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>

            <Link
              href="#demo"
              className="rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-medium backdrop-blur-md transition hover:bg-white/15"
            >
              View demo
            </Link>
          </div>
        </div>

        {/* Floating Whiteboard */}
        <div className="relative z-10 mx-auto mt-16 w-[90%] max-w-4xl lg:mt-20">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/20 bg-[#f5f3eb] shadow-2xl shadow-black/40 -rotate-1">
            {/* Canvas */}
            <div className="absolute inset-0 bg-[#f5f3eb]">
              {/* Grid */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "linear-gradient(#c8c8c8 1px, transparent 1px), linear-gradient(90deg, #c8c8c8 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />

              {/* Sticky note */}
              <div className="absolute left-[10%] top-[18%] w-32 rotate-[-4deg] bg-[#d9ff72] p-4 text-left text-xs text-black shadow-lg sm:w-40 sm:text-sm">
                <strong>Brainstorm</strong>
                <p className="mt-2 opacity-70">What are we building next?</p>
              </div>

              {/* Diagram */}
              <div className="absolute left-[40%] top-[25%] flex items-center gap-3  text-gray-600">
                <div className="rounded-lg0 border-2 border-black/70 bg-white px-4 py-3 text-xs font-medium sm:px-6 sm:py-4">
                  Idea
                </div>

                <div className="h-px w-10 bg-black/60 sm:w-16" />

                <div className="rounded-lg border-2 border-black/70 bg-white px-4 py-3 text-xs font-medium sm:px-6 sm:py-4">
                  Design
                </div>

                <div className="h-px w-10 bg-black/60 sm:w-16" />

                <div className="rounded-lg border-2 border-black/70 bg-white px-4 py-3 text-xs font-medium sm:px-6 sm:py-4">
                  Build
                </div>
              </div>

              {/* Handwritten text */}
              <div className="absolute bottom-[20%] left-[22%] rotate-[-5deg] font-serif text-xl italic text-black/70 sm:text-3xl">
                make it real →
              </div>

              {/* Cursor */}
              <div className="absolute right-[18%] top-[55%]">
                <div className="h-5 w-5 rotate-[-20deg] border-l-[3px] border-t-[3px] border-black" />
                <div className="ml-3 -mt-0.75 rounded-full bg-black px-2 py-1 text-[9px] text-white">
                  Anshuman
                </div>
              </div>

              {/* Small card */}
              <div className="absolute bottom-[12%] right-[12%] w-32 rotate-3 rounded-xl border border-black/10 bg-white p-3 text-left shadow-md sm:w-44 sm:p-4">
                <div className="mb-3 h-2 w-16 rounded bg-black/20" />
                <div className="space-y-2">
                  <div className="h-1.5 w-full rounded bg-black/10" />
                  <div className="h-1.5 w-4/5 rounded bg-black/10" />
                  <div className="h-1.5 w-3/5 rounded bg-black/10" />
                </div>
              </div>
            </div>

            {/* Browser-style controls */}
            <div className="absolute left-4 top-4 flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-black/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-black/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-black/20" />
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-12 px-6 pb-8">
          <div className="flex flex-col items-center gap-5 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">
              Made for people who think visually
            </span>

            <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 sm:gap-x-10">
              {[
                "Thinkers",
                "Designers",
                "Engineers",
                "Founders",
                "Product teams",
              ].map((item, index) => (
                <div key={item} className="flex items-center gap-7 sm:gap-10">
                  <span className="text-xs font-medium uppercase tracking-[0.12em] text-white/55 transition hover:text-[#d9ff72]">
                    {item}
                  </span>

                  {index !== 4 && (
                    <span className="h-1 w-1 rounded-full bg-[#d9ff72]/40" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
