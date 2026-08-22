"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/ui/Navbar";
import { getUserFromToken, isLoggedIn } from "../lib/auth";
import api from "../lib/api";

type Room = { id: number; slug: string; createdAt: string };

export default function DashboardPage() {
  const router = useRouter();
  const user = typeof window !== "undefined" ? getUserFromToken() : null;

  const [createSlug, setCreateSlug] = useState("");
  const [joinSlug, setJoinSlug] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [recentRooms, setRecentRooms] = useState<Room[]>([]);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/signin");
    }
    // Load recently visited rooms from localStorage
    try {
      const stored = localStorage.getItem("bb_recent_rooms");
      if (stored) setRecentRooms(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, [router]);

  const saveRecentRoom = (slug: string, id: number) => {
    const newRoom: Room = { id, slug, createdAt: new Date().toISOString() };
    setRecentRooms((prev) => {
      const updated = [newRoom, ...prev.filter((r) => r.slug !== slug)].slice(0, 6);
      localStorage.setItem("bb_recent_rooms", JSON.stringify(updated));
      return updated;
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = createSlug.trim();
    if (!slug) { setCreateError("Room name is required."); return; }
    if (slug.length < 4) { setCreateError("Room name must be at least 4 characters."); return; }
    setCreateLoading(true);
    setCreateError(null);
    try {
      const res = await api.post("/room/create", { slug });
      saveRecentRoom(slug, res.data.room.id);
      router.push(`/room/${slug}`);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setCreateError(axiosErr.response?.data?.message ?? "Failed to create room.");
      } else {
        setCreateError("Failed to create room.");
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent, slugOverride?: string) => {
    e?.preventDefault();
    const slug = (slugOverride ?? joinSlug).trim();
    if (!slug) { setJoinError("Enter a room name to join."); return; }
    setJoinLoading(true);
    setJoinError(null);
    try {
      await api.get(`/room/slug/${slug}`);
      router.push(`/room/${slug}`);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
        if (axiosErr.response?.status === 404) {
          setJoinError("Room not found. Check the name and try again.");
        } else {
          setJoinError(axiosErr.response?.data?.message ?? "Failed to join room.");
        }
      } else {
        setJoinError("Failed to join room.");
      }
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div className="page-full">
      <div className="bg-mesh" />
      <Navbar username={user?.username} />

      <main
        style={{
          flex: 1,
          overflow: "auto",
          padding: "40px 24px",
          maxWidth: 900,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Header */}
        <div className="animate-fadeIn" style={{ marginBottom: 40 }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              background: "linear-gradient(135deg, #f0f0fa 0%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: 8,
            }}
          >
            Welcome back{user?.username ? `, @${user.username}` : ""}! 👋
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Create a new room or join an existing one to start collaborating in real-time.
          </p>
        </div>

        {/* Action Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
            marginBottom: 40,
          }}
        >
          {/* Create Room */}
          <div
            className="glass glass-hover animate-fadeIn"
            style={{ padding: 28, animationDelay: "0.05s" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(124,58,237,0.18)",
                  border: "1px solid rgba(124,58,237,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                ✨
              </div>
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 2 }}>
                  Create a Room
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                  Start a new chat room
                </p>
              </div>
            </div>
            <form onSubmit={handleCreate}>
              <div className="input-group">
                <label htmlFor="create-slug" className="input-label">
                  Room Name (slug)
                </label>
                <input
                  id="create-slug"
                  type="text"
                  className="input-field"
                  placeholder="e.g. design-team"
                  value={createSlug}
                  onChange={(e) => {
                    setCreateSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                    setCreateError(null);
                  }}
                />
                {createError && (
                  <span className="input-error-text">{createError}</span>
                )}
              </div>
              <button
                id="create-room-btn"
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%" }}
                disabled={createLoading}
              >
                {createLoading ? (
                  <span className="spinner" style={{ borderTopColor: "#fff" }} />
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Create Room
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Join Room */}
          <div
            className="glass glass-hover animate-fadeIn"
            style={{ padding: 28, animationDelay: "0.1s" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(168,85,247,0.15)",
                  border: "1px solid rgba(168,85,247,0.22)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                🔗
              </div>
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 2 }}>
                  Join a Room
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                  Enter by room name
                </p>
              </div>
            </div>
            <form onSubmit={handleJoin}>
              <div className="input-group">
                <label htmlFor="join-slug" className="input-label">
                  Room Name (slug)
                </label>
                <input
                  id="join-slug"
                  type="text"
                  className="input-field"
                  placeholder="e.g. design-team"
                  value={joinSlug}
                  onChange={(e) => {
                    setJoinSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                    setJoinError(null);
                  }}
                />
                {joinError && (
                  <span className="input-error-text">{joinError}</span>
                )}
              </div>
              <button
                id="join-room-btn"
                type="submit"
                className="btn btn-ghost"
                style={{ width: "100%", borderColor: "rgba(168,85,247,0.3)", color: "var(--accent-3)" }}
                disabled={joinLoading}
              >
                {joinLoading ? (
                  <span className="spinner" />
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                      <polyline points="10 17 15 12 10 7" />
                      <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                    Join Room
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Recent Rooms */}
        {recentRooms.length > 0 && (
          <div className="animate-fadeIn" style={{ animationDelay: "0.2s" }}>
            <h2
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 14,
              }}
            >
              Recent Rooms
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 12,
              }}
            >
              {recentRooms.map((room) => (
                <button
                  key={room.slug}
                  id={`recent-room-${room.slug}`}
                  className="glass glass-hover"
                  onClick={(e) => {
                    e.preventDefault();
                    handleJoin(e as unknown as React.FormEvent, room.slug);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 16px",
                    background: "none",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all var(--transition-normal)",
                    fontFamily: "inherit",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      background: "var(--accent-gradient)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 800,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {room.slug[0]?.toUpperCase()}
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "0.88rem",
                        color: "var(--text-primary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      #{room.slug}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      Click to rejoin
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
