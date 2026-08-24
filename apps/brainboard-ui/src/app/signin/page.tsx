"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Loader2 } from "lucide-react";
import { saveToken } from "../../lib/auth";
import {HTTP_BACKEND_URL} from "../../config/config"

export default function SignInPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.username.trim() || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(
        `${HTTP_BACKEND_URL}/user/signin`,
        form
      );

      saveToken(res.data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ??
            "Sign-in failed. Try again."
        );
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#071014] px-3 py-3 text-[#f4f1e9]">
      <section className="relative flex min-h-[calc(100vh-24px)] overflow-hidden rounded-[28px] border border-white/10">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d9ff72]/5 blur-[140px]" />

        {/* Back */}
        <Link
          href="/"
          className="absolute left-6 top-6 z-20 flex items-center gap-2 text-sm text-white/50 transition hover:text-white sm:left-10 sm:top-8"
        >
          <ArrowLeft size={16} />
          Back
        </Link>

        {/* Logo */}
        <Link
          href="/"
          className="absolute right-6 top-6 z-20 text-xl font-semibold tracking-tight sm:right-10 sm:top-8"
        >
          brainboard<span className="text-[#d9ff72]">.</span>
        </Link>

        {/* Auth container */}
        <div className="relative z-10 m-auto w-full max-w-md px-6 py-20">
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-9">
            {/* Heading */}
            <div className="mb-8">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-[#d9ff72]/70">
                Welcome back
              </p>

              <h1 className="text-4xl font-medium tracking-[-0.04em]">
                Continue{" "}
                <span className="font-serif italic text-[#d9ff72]">
                  thinking.
                </span>
              </h1>

              <p className="mt-3 text-sm leading-6 text-white/45">
                Sign in to your Brainboard account and get back to
                your ideas.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label
                  htmlFor="signin-username"
                  className="mb-2 block text-xs font-medium text-white/55"
                >
                  Username
                </label>

                <input
                  id="signin-username"
                  name="username"
                  type="text"
                  placeholder="your_username"
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="username"
                  autoFocus
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/4 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#d9ff72]/40 focus:bg-white/6 focus:ring-2 focus:ring-[#d9ff72]/10"
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="signin-password"
                    className="block text-xs font-medium text-white/55"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-xs text-white/30 transition hover:text-[#d9ff72]"
                  >
                    Forgot password?
                  </Link>
                </div>

                <input
                  id="signin-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/4 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#d9ff72]/40 focus:bg-white/6 focus:ring-2 focus:ring-[#d9ff72]/10"
                />
              </div>

              {/* Submit */}
              <button
                id="signin-submit"
                type="submit"
                disabled={loading}
                className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#d9ff72] text-sm font-medium text-[#071014] transition hover:scale-[1.01] hover:bg-[#e2ff8a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowUpRight
                      size={16}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-7 border-t border-white/10 pt-6 text-center">
              <p className="text-sm text-white/35">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-[#d9ff72] transition hover:text-[#e5ff9b]"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] text-white/20">
            Your ideas deserve a place to grow.
          </p>
        </div>
      </section>
    </main>
  );
}