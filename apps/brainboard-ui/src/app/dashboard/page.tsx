"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Loader2, Trash2, Users } from "lucide-react";
import { getUserFromToken, isLoggedIn } from "../../lib/auth";
import api from "../../lib/api";

interface Room {
  id: number;
  slug: string;
  createdAt: string;
  adminId: string;
}

export default function DashboardPage() {
  const router = useRouter();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomName, setRoomName] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const user = getUserFromToken();

  const fetchRooms = useCallback(async () => {
    setLoadingRooms(true);
    setError(null);
    try {
      const res = await api.get<{ rooms: Room[] }>("/room/my-rooms");
      setRooms(res.data.rooms);
    } catch {
      setError("Failed to load rooms. Please try again.");
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/signin");
      return;
    }
    fetchRooms();
  }, [router, fetchRooms]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = roomName.trim();
    if (!slug) return;

    setCreating(true);
    setCreateError(null);

    try {
      await api.post("/room/create", { slug });
      setRoomName("");
      await fetchRooms();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to create room.";
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRoom = async (roomId: number) => {
    setDeletingId(roomId);
    try {
      await api.delete(`/room/${roomId}`);
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
    } catch {
      // silently ignore — room list will still be consistent
    } finally {
      setDeletingId(null);
    }
  };

  const handleJoinRoom = (slug: string) => {
    router.push(`/canvas/${slug}`);
  };

  return (
    <main className="min-h-screen bg-[#071014] px-3 py-3 text-[#f4f1e9]">
      <section className="relative min-h-[calc(100vh-24px)] overflow-hidden rounded-[28px] border border-white/10">
        {/* Subtle ambient glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-[#d9ff72]/4 blur-[120px]" />

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            brainboard<span className="text-[#d9ff72]">.</span>
          </Link>

          <div className="flex items-center gap-5">
            {user && (
              <span className="hidden text-sm text-white/40 sm:block">
                {user.username}
              </span>
            )}
            <button
              onClick={() => {
                localStorage.removeItem("bb_token");
                router.push("/signin");
              }}
              className="text-sm text-white/50 transition hover:text-white"
            >
              Sign out
            </button>
          </div>
        </nav>

        {/* Page content */}
        <div className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-16 pt-8 sm:px-10">
          {/* Heading */}
          <div className="mb-8">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-[#d9ff72]/70">
              Dashboard
            </p>
            <h1 className="text-4xl font-medium tracking-[-0.04em]">
              Your{" "}
              <span className="font-serif italic text-[#d9ff72]">rooms.</span>
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/45">
              Create a new room or join an existing one to start collaborating.
            </p>
          </div>

          {/* Create room */}
          <form onSubmit={handleCreateRoom} className="mb-3">
            <div className="flex gap-3">
              <input
                id="dashboard-room-name"
                type="text"
                placeholder="enter room name (placeholder)"
                value={roomName}
                onChange={(e) => {
                  setRoomName(e.target.value);
                  setCreateError(null);
                }}
                className="h-12 flex-1 rounded-xl border border-white/10 bg-white/4 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#d9ff72]/40 focus:bg-white/6 focus:ring-2 focus:ring-[#d9ff72]/10"
              />
              <button
                id="dashboard-create-room"
                type="submit"
                disabled={creating || !roomName.trim()}
                className="group flex h-12 shrink-0 items-center gap-2 rounded-xl bg-[#d9ff72] px-5 text-sm font-medium text-[#071014] transition hover:scale-[1.02] hover:bg-[#e2ff8a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    create room
                    <ArrowUpRight
                      size={15}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Create error */}
          {createError && (
            <p className="mb-4 text-xs text-red-400/80">{createError}</p>
          )}

          {/* Rooms list container */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] shadow-2xl shadow-black/20">
            {/* List header */}
            <div className="flex items-center gap-2 border-b border-white/8 px-5 py-3.5">
              <Users size={13} className="text-white/30" />
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/30">
                Rooms
              </span>
            </div>

            {/* States */}
            {loadingRooms ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-white/30">
                <Loader2 size={16} className="animate-spin" />
                Loading rooms…
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <p className="mb-3 text-sm text-red-400/70">{error}</p>
                <button
                  onClick={fetchRooms}
                  className="text-xs text-white/40 underline underline-offset-2 transition hover:text-white/70"
                >
                  Try again
                </button>
              </div>
            ) : rooms.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-white/25">No rooms yet.</p>
                <p className="mt-1 text-xs text-white/15">
                  Create one above to get started.
                </p>
              </div>
            ) : (
              <ul>
                {rooms.map((room, idx) => {
                  const isOwner = user?.userId === room.adminId;
                  const isDeleting = deletingId === room.id;
                  const isLast = idx === rooms.length - 1;

                  return (
                    <li
                      key={room.id}
                      className={`flex flex-col gap-3 px-5 py-4 transition hover:bg-white/[0.02] sm:flex-row sm:items-center sm:gap-0 ${
                        !isLast ? "border-b border-white/8" : ""
                      }`}
                    >
                      {/* Left: room identity */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#f4f1e9]">
                          {room.slug}
                        </p>
                        <p className="mt-0.5 text-xs text-white/30">
                          ID&nbsp;#{room.id}
                        </p>
                      </div>

                      {/* Middle: metadata */}
                      <div className="shrink-0 sm:px-6">
                        <p className="text-xs text-white/25">
                          Created&nbsp;
                          {new Date(room.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </p>
                        {isOwner && (
                          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#d9ff72]/50">
                            Owner
                          </p>
                        )}
                      </div>

                      {/* Right: actions */}
                      <div className="flex shrink-0 items-center gap-2">
                        {isOwner && (
                          <button
                            id={`dashboard-delete-room-${room.id}`}
                            onClick={() => handleDeleteRoom(room.id)}
                            disabled={isDeleting}
                            aria-label={`Delete room ${room.slug}`}
                            className="flex items-center gap-1.5 rounded-lg border border-red-400/15 bg-red-400/5 px-3 py-1.5 text-xs text-red-400/60 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isDeleting ? (
                              <Loader2 size={11} className="animate-spin" />
                            ) : (
                              <Trash2 size={11} />
                            )}
                            [delete]
                          </button>
                        )}

                        <button
                          id={`dashboard-join-room-${room.id}`}
                          onClick={() => handleJoinRoom(room.slug)}
                          className="group flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-xs text-white/60 transition hover:border-white/20 hover:bg-white/8 hover:text-white"
                        >
                          join room
                          <ArrowUpRight
                            size={11}
                            className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
