"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import AuthForm from "../../components/ui/AuthForm";
import { saveToken } from "../lib/auth";
import { HTTP_BACKEND_URL } from "../config/config";

export default function SignInPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
      const res = await axios.post(`${HTTP_BACKEND_URL}/user/signin`, form);
      saveToken(res.data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Sign-in failed. Try again.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Welcome back"
      subtitle="Sign in to your Brainboard account"
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkHref="/signup"
      error={error}
    >
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="signin-username" className="input-label">
            Username
          </label>
          <input
            id="signin-username"
            name="username"
            type="text"
            className="input-field"
            placeholder="your_username"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
            autoFocus
          />
        </div>

        <div className="input-group">
          <label htmlFor="signin-password" className="input-label">
            Password
          </label>
          <input
            id="signin-password"
            name="password"
            type="password"
            className="input-field"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
        </div>

        <button
          id="signin-submit"
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={loading}
          style={{ marginTop: 8 }}
        >
          {loading ? <span className="spinner" style={{ borderTopColor: "#fff" }} /> : "Sign In"}
        </button>
      </form>
    </AuthForm>
  );
}
