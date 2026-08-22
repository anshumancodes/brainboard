import axios from "axios";
import { HTTP_BACKEND_URL } from "../../app/config/config";

async function getChats(id: string) {
  const response = await axios.get(
    `${HTTP_BACKEND_URL}/room/${id}/chats`,
  );

  return response.data;
}

import React from "react";

export const ChatRoom = async ({ id }: { id: string }) => {
  const messages = await getChats(id);

  return (
    <div>
      {messages.map((chat: { message: string }, index: number) => (
        <div key={index}>{chat.message}</div>
      ))}
    </div>
  );
};