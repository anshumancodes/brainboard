"use client";

import React from "react";
import Link from "next/link";

interface AuthFormProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
  error?: string | null;
  success?: string | null;
}

export default function AuthForm({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
  error,
  success,
}: AuthFormProps) {
  return (
    <div className="page-center">
      <div className="bg-mesh" />

      <div
        className="glass animate-fadeInScale"
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "40px 36px",
          position: "relative",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "var(--accent-gradient)",
              boxShadow: "0 0 24px var(--accent-glow)",
              marginBottom: 16,
              fontSize: 22,
            }}
          >
            🧠
          </div>
          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: 800,
              background: "linear-gradient(135deg, #f0f0fa, #a855f7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: 6,
            }}
          >
            {title}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            {subtitle}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            {success}
          </div>
        )}

        {/* Form Content */}
        {children}

        {/* Footer */}
        <p
          style={{
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: "0.85rem",
            marginTop: 24,
          }}
        >
          {footerText}{" "}
          <Link
            href={footerLinkHref}
            style={{
              color: "var(--accent-3)",
              fontWeight: 600,
              transition: "color var(--transition-fast)",
            }}
          >
            {footerLinkText}
          </Link>
        </p>
      </div>
    </div>
  );
}
