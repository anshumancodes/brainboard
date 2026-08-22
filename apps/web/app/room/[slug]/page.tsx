import axios from "axios";
import { HTTP_BACKEND_URL } from "../../config/config";
import ChatClient from "../../../components/chat/ChatClient";

interface Message {
  id: number;
  message: string;
  userId: string;
  roomId: number;
}

async function getRoomId(slug: string): Promise<number | null> {
  // We need a token for this server component — for SSR we read the Authorization cookie
  // For this app we pass the token from a cookie or skip auth on slug lookup
  // Since backend requires auth, we handle 401 gracefully and let the client handle it
  try {
    const res = await axios.get(`${HTTP_BACKEND_URL}/room/slug/${slug}`, {
      headers: {
        // This server component can't access localStorage; we rely on the
        // client-side ChatClient to re-fetch if needed
        Authorization: "Bearer public",
      },
    });
    return res.data.roomId;
  } catch {
    return null;
  }
}

async function getMessages(roomId: number): Promise<Message[]> {
  try {
    const res = await axios.get(`${HTTP_BACKEND_URL}/room/chats/${roomId}`, {
      headers: { Authorization: "Bearer public" },
    });
    return res.data.messages ?? [];
  } catch {
    return [];
  }
}

export default async function RoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Try to get initial data server-side; fallback to empty (client will fetch)
  const roomId = await getRoomId(slug);
  const initialMessages: Message[] = roomId ? await getMessages(roomId) : [];

  return (
    <ChatClient
      slug={slug}
      roomId={roomId}
      initialMessages={initialMessages}
    />
  );
}
