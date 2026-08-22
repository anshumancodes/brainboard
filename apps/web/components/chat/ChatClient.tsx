"use client";

import React, { useEffect, useState } from "react";
import { useSocket } from "../../app/hooks/useSocket";

export default function ChatClient({
  messages,
  id,
}: {
  messages: { message: string }[];
  id: string;
}) {
  const [chats, setChats] = useState(messages);
  const { socket, loading } = useSocket();

  useEffect(() => {
    if (!socket || loading) return;

    socket.send(
      JSON.stringify({
        type: "join_room",
        roomId: id,
      }),
    );

    const handleMessage = (event: MessageEvent) => {
      const parsedData = JSON.parse(event.data);

      if (parsedData.type === "chat") {
        setChats((currentChats) => [
          ...currentChats,
          parsedData.message,
        ]);
      }
    };

    socket.onmessage = handleMessage;

    return () => {
      socket.onmessage = null;
    };
  }, [socket, loading, id]);

  return (
    <div className="flex flex-col gap-3">
      {chats.map((chat, index) => (
        <div
          key={index}
          className="rounded-lg bg-gray-100 px-4 py-2"
        >
          {chat.message}
        </div>
      ))}
    </div>
  );
}