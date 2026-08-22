"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "../../app/hooks/useSocket";
import { getToken, getUserFromToken, isLoggedIn } from "../../app/lib/auth";
import api from "../../app/lib/api";
import Navbar from "../ui/Navbar";

interface Message {
  id?: number;
  message: string;
  userId: string;
  roomId?: number;
}

interface ChatClientProps {
  slug: string;
  roomId: number | null;
  initialMessages: Message[];
}

export default function ChatClient({
  slug,
  roomId: initialRoomId,
  initialMessages,
}: ChatClientProps) {
  const router = useRouter();
  const user = typeof window !== "undefined" ? getUserFromToken() : null;
  const token = typeof window !== "undefined" ? getToken() : null;

  const [roomId, setRoomId] = useState<number | null>(initialRoomId);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [roomError, setRoomError] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState(initialRoomId === null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { socket, loading: wsLoading, error: wsError } = useSocket(token);

  // Auth guard
  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/signin");
    }
  }, [router]);

  // Resolve slug → roomId client-side if SSR didn't get it
  useEffect(() => {
    if (roomId !== null) return;
    setFetchLoading(true);
    api
      .get(`/room/slug/${slug}`)
      .then((res) => {
        const id = res.data.roomId as number;
        setRoomId(id);
        // Fetch messages
        return api.get(`/room/chats/${id}`);
      })
      .then((res) => {
        setMessages((res.data.messages as Message[]) ?? []);
      })
      .catch((err) => {
        if (err?.response?.status === 404) {
          setRoomError("This room does not exist.");
        } else if (err?.response?.status === 401) {
          router.replace("/signin");
        } else {
          setRoomError("Failed to load room.");
        }
      })
      .finally(() => setFetchLoading(false));
  }, [slug, roomId, router]);

  // Join WebSocket room once connected and roomId known
  useEffect(() => {
    if (!socket || wsLoading || roomId === null) return;
    socket.send(
      JSON.stringify({ type: "join_room", roomId: String(roomId) })
    );
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat") {
        setMessages((prev) => [
          ...prev,
          { message: data.message, userId: data.userId ?? "__remote__" },
        ]);
      }
    };
    return () => {
      socket.onmessage = null;
    };
  }, [socket, wsLoading, roomId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save to recent rooms
  useEffect(() => {
    if (!roomId) return;
    try {
      const stored = localStorage.getItem("bb_recent_rooms");
      const rooms = stored ? JSON.parse(stored) : [];
      const updated = [
        { id: roomId, slug, createdAt: new Date().toISOString() },
        ...rooms.filter((r: { slug: string }) => r.slug !== slug),
      ].slice(0, 6);
      localStorage.setItem("bb_recent_rooms", JSON.stringify(updated));
    } catch {
      // ignore
    }
  }, [roomId, slug]);

  const sendMessage = () => {
    const msg = input.trim();
    if (!msg || !socket || wsLoading || roomId === null) return;
    socket.send(
      JSON.stringify({ type: "chat", roomId: String(roomId), message: msg })
    );
    // Optimistic update
    setMessages((prev) => [
      ...prev,
      { message: msg, userId: user?.userId ?? "__self__" },
    ]);
    setInput("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── UI States ─────────────────────────────────────────────────────
  if (fetchLoading) {
    return (
      <div className="page-full">
        <div className="bg-mesh" />
        <Navbar showBack username={user?.username} />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Loading room…
          </p>
        </div>
      </div>
    );
  }

  if (roomError) {
    return (
      <div className="page-full">
        <div className="bg-mesh" />
        <Navbar showBack username={user?.username} />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            padding: 24,
          }}
        >
          <div style={{ fontSize: 48 }}>💬</div>
          <h2 style={{ fontWeight: 700, color: "var(--text-primary)" }}>
            {roomError}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            The room &ldquo;{slug}&rdquo; could not be found.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Main Chat UI ──────────────────────────────────────────────────
  return (
    <div className="page-full">
      <div className="bg-mesh" />

      {/* Navbar */}
      <Navbar
        showBack
        backHref="/dashboard"
        backLabel="Dashboard"
        username={user?.username}
        rightSlot={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "5px 12px",
                borderRadius: 99,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: wsLoading || wsError ? "var(--warning)" : "var(--success)",
                  boxShadow: wsLoading || wsError
                    ? "0 0 6px var(--warning)"
                    : "0 0 6px var(--success)",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  fontFamily: "monospace",
                  color: "var(--text-secondary)",
                }}
              >
                #{slug}
              </span>
            </div>
          </div>
        }
      />

      {/* Messages Area */}
      <div
        id="messages-list"
        style={{
          flex: 1,
          overflow: "auto",
          padding: "24px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {messages.length === 0 && !fetchLoading && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              color: "var(--text-muted)",
            }}
          >
            <div style={{ fontSize: 40 }}>💬</div>
            <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>
              No messages yet
            </p>
            <p style={{ fontSize: "0.82rem" }}>
              Be the first to say something in #{slug}!
            </p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMine = msg.userId === user?.userId || msg.userId === "__self__";
          const showAvatar =
            i === 0 || messages[i - 1]?.userId !== msg.userId;

          return (
            <div
              key={i}
              id={`msg-${i}`}
              style={{
                display: "flex",
                flexDirection: isMine ? "row-reverse" : "row",
                alignItems: "flex-end",
                gap: 8,
                marginTop: showAvatar ? 12 : 2,
                animation: "messagePop 0.2s both",
              }}
            >
              {/* Avatar */}
              {!isMine && showAvatar && (
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "var(--accent-gradient)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    color: "#fff",
                    flexShrink: 0,
                    marginBottom: 2,
                  }}
                >
                  {msg.userId === "__remote__"
                    ? "?"
                    : (msg.userId[0] ?? "?").toUpperCase()}
                </div>
              )}
              {/* Spacer when no avatar */}
              {!isMine && !showAvatar && (
                <div style={{ width: 30, flexShrink: 0 }} />
              )}

              {/* Bubble */}
              <div
                style={{
                  maxWidth: "68%",
                  padding: "10px 14px",
                  borderRadius: isMine
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                  background: isMine
                    ? "var(--accent-gradient)"
                    : "var(--bg-elevated)",
                  border: isMine ? "none" : "1px solid var(--border)",
                  color: isMine ? "#fff" : "var(--text-primary)",
                  fontSize: "0.9rem",
                  lineHeight: 1.5,
                  wordBreak: "break-word",
                  boxShadow: isMine
                    ? "0 4px 12px var(--accent-glow)"
                    : "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* WS Status Banner */}
      {(wsLoading || wsError) && (
        <div
          style={{
            padding: "8px 20px",
            background: wsError
              ? "rgba(239,68,68,0.1)"
              : "rgba(245,158,11,0.1)",
            borderTop: `1px solid ${wsError ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)"}`,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: "0.8rem",
            color: wsError ? "#fca5a5" : "#fcd34d",
          }}
        >
          {wsLoading ? (
            <>
              <span
                className="spinner"
                style={{ width: 14, height: 14, borderWidth: 2, borderTopColor: "#fcd34d" }}
              />
              Connecting to real-time server…
            </>
          ) : (
            <>⚠️ {wsError} — messages may not sync in real-time</>
          )}
        </div>
      )}

      {/* Input Bar */}
      <div
        style={{
          padding: "16px 20px",
          background: "rgba(13,13,18,0.9)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <input
          id="chat-input"
          ref={inputRef}
          type="text"
          className="input-field"
          placeholder="Type a message… (Enter to send)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!!wsError || wsLoading || roomId === null}
          style={{ flex: 1 }}
          autoFocus
        />
        <button
          id="send-btn"
          className="btn btn-primary btn-icon"
          onClick={sendMessage}
          disabled={!input.trim() || !!wsError || wsLoading || roomId === null}
          style={{ flexShrink: 0, width: 44, height: 44, borderRadius: "var(--radius-md)" }}
          title="Send message"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}