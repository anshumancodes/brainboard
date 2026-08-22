"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import AuthForm from "../../components/ui/AuthForm";
import { saveToken } from "../lib/auth";
import { HTTP_BACKEND_URL } from "../config/config";

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
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.username || !form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Register
      await axios.post(`${HTTP_BACKEND_URL}/user/signup`, form);
      // Auto sign in
      const signinRes = await axios.post(`${HTTP_BACKEND_URL}/user/signin`, {
        username: form.username,
        password: form.password,
      });
      saveToken(signinRes.data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Sign-up failed. Try again.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Create account"
      subtitle="Join Brainboard and start collaborating"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/signin"
      error={error}
    >
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="signup-name" className="input-label">
            Full Name
          </label>
          <input
            id="signup-name"
            name="name"
            type="text"
            className="input-field"
            placeholder="Jane Doe"
            value={form.name}
            onChange={handleChange}
            autoFocus
          />
        </div>

        <div className="input-group">
          <label htmlFor="signup-username" className="input-label">
            Username
          </label>
          <input
            id="signup-username"
            name="username"
            type="text"
            className="input-field"
            placeholder="janedoe"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
          />
        </div>

        <div className="input-group">
          <label htmlFor="signup-email" className="input-label">
            Email
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            className="input-field"
            placeholder="jane@example.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
        </div>

        <div className="input-group">
          <label htmlFor="signup-password" className="input-label">
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            className="input-field"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </div>

        <button
          id="signup-submit"
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={loading}
          style={{ marginTop: 8 }}
        >
          {loading ? (
            <span className="spinner" style={{ borderTopColor: "#fff" }} />
          ) : (
            "Create Account"
          )}
        </button>
      </form>
    </AuthForm>
  );
}
