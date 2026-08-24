"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Loader2 } from "lucide-react";
import { saveToken } from "../../lib/auth";
import { HTTP_BACKEND_URL } from "../../config/config";

export default function SignUpPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
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

    if (
      !form.name.trim() ||
      !form.username.trim() ||
      !form.email.trim() ||
      !form.password
    ) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Register
      await axios.post(`${HTTP_BACKEND_URL}/user/signup`, form);

      // Auto sign in
      const signinRes = await axios.post(
        `${HTTP_BACKEND_URL}/user/signin`,
        {
          username: form.username,
          password: form.password,
        }
      );

      saveToken(signinRes.data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ??
            "Sign-up failed. Try again."
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
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-162.5 w-162.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d9ff72]/5 blur-[150px]" />

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

        {/* Sign up */}
        <div className="relative z-10 m-auto w-full max-w-md px-6 py-16">
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-9">
            {/* Heading */}
            <div className="mb-7">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-[#d9ff72]/70">
                Get started
              </p>

              <h1 className="text-4xl font-medium tracking-[-0.04em]">
                Create{" "}
                <span className="font-serif italic text-[#d9ff72]">
                  something.
                </span>
              </h1>

              <p className="mt-3 text-sm leading-6 text-white/45">
                Create your Brainboard account and start turning
                ideas into something you can see.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full name */}
              <div>
                <label
                  htmlFor="signup-name"
                  className="mb-2 block text-xs font-medium text-white/55"
                >
                  Full name
                </label>

                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={handleChange}
                  autoFocus
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/4 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#d9ff72]/40 focus:bg-white/6 focus:ring-2 focus:ring-[#d9ff72]/10"
                />
              </div>

              {/* Username */}
              <div>
                <label
                  htmlFor="signup-username"
                  className="mb-2 block text-xs font-medium text-white/55"
                >
                  Username
                </label>

                <input
                  id="signup-username"
                  name="username"
                  type="text"
                  placeholder="janedoe"
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="username"
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/4 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#d9ff72]/40 focus:bg-white/6 focus:ring-2 focus:ring-[#d9ff72]/10"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="signup-email"
                  className="mb-2 block text-xs font-medium text-white/55"
                >
                  Email
                </label>

                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/4 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#d9ff72]/40 focus:bg-white/6 focus:ring-2 focus:ring-[#d9ff72]/10"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="signup-password"
                  className="mb-2 block text-xs font-medium text-white/55"
                >
                  Password
                </label>

                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/4 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#d9ff72]/40 focus:bg-white/6 focus:ring-2 focus:ring-[#d9ff72]/10"
                />
              </div>

              {/* Submit */}
              <button
                id="signup-submit"
                type="submit"
                disabled={loading}
                className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#d9ff72] text-sm font-medium text-[#071014] transition hover:scale-[1.01] hover:bg-[#e2ff8a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
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
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="font-medium text-[#d9ff72] transition hover:text-[#e5ff9b]"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] text-white/20">
            Start with an idea. Build it together.
          </p>
        </div>
      </section>
    </main>
  );
}