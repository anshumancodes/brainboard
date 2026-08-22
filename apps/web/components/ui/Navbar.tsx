"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { removeToken } from "../../app/lib/auth";

interface NavbarProps {
  username?: string;
  showBack?: boolean;
  backHref?: string;
  backLabel?: string;
  rightSlot?: React.ReactNode;
}

export default function Navbar({
  username,
  showBack = false,
  backHref = "/dashboard",
  backLabel = "Dashboard",
  rightSlot,
}: NavbarProps) {
  const router = useRouter();

  const handleSignOut = () => {
    removeToken();
    router.push("/signin");
  };

  return (
    <header
      style={{
        height: 60,
        background: "rgba(13,13,18,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: 16,
        flexShrink: 0,
        zIndex: 100,
      }}
    >
      {/* Back */}
      {showBack && (
        <Link
          href={backHref}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "var(--text-secondary)",
            fontSize: "0.85rem",
            fontWeight: 500,
            transition: "color var(--transition-fast)",
            padding: "6px 10px",
            borderRadius: "var(--radius-sm)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {backLabel}
        </Link>
      )}

      {/* Brand */}
      <Link
        href="/dashboard"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 18 }}>🧠</span>
        <span
          style={{
            fontWeight: 700,
            fontSize: "1rem",
            background: "linear-gradient(135deg, #f0f0fa, #a855f7)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Brainboard
        </span>
      </Link>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Right slot */}
      {rightSlot}

      {/* User pill */}
      {username && (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 12px",
              borderRadius: 99,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "var(--accent-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {username[0]?.toUpperCase()}
            </div>
            <span
              style={{
                fontSize: "0.82rem",
                fontWeight: 500,
                color: "var(--text-secondary)",
              }}
            >
              @{username}
            </span>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleSignOut}
            title="Sign out"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      )}
    </header>
  );
}
