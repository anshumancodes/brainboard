import { WebSocketServer, WebSocket } from "ws";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prisma } from "@repo/database";
import { jwtVerify } from "jose";
const wss = new WebSocketServer({ port: 8080 });

console.log("web socket server sucesfully started on port 8080");
async function checkUser(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (!payload.userId || typeof payload.userId !== "string") {
      return null;
    }

    return payload.userId;
  } catch {
    return null;
  }
}

interface User {
  userId: string;
  rooms: string[];
  ws: WebSocket;
}

const users: User[] = [];

wss.on("connection", async function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return "no request url found!";
  }
  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") ?? " ";
  console.log("token on ws ", token);
  const userId = await checkUser(token);
  if (!userId) {
    ws.close();
    return;
  }

  users.push({
    userId,
    rooms: [],
    ws,
  });

  ws.on("message", async (data) => {
    const ParsedData = JSON.parse(data as unknown as string);
    if (ParsedData.type === "join_room") {
      // basically find the user whose socket is matching
      const user = users.find((u) => u.ws === ws);
      // push the roomid to that user's room id aray
      user?.rooms.push(ParsedData.roomId);
    }
    if (ParsedData.type === "leave_room") {
      // basically find the user whose socket is matching
      const user = users.find((x) => x.ws === ws);
      if (!user) {
        return;
      }

      user.rooms = user.rooms.filter((roomid) => roomid !== ParsedData.roomId);
    }
    if (ParsedData.type === "chat") {
      const roomIdStr: string = ParsedData.roomId;  // rooms[] stores strings
      const roomId = parseInt(roomIdStr, 10);        // Prisma expects Int
      const message = ParsedData.message;

      if (isNaN(roomId)) return;

      // persist the message
      await prisma.chat.create({
        data: {
          roomId,
          message,
          userId,
        },
      });

      // broadcast to all OTHER users in this room (sender has optimistic update)
      users.forEach((user) => {
        if (user.rooms.includes(roomIdStr) && user.ws !== ws) {
          user.ws.send(
            JSON.stringify({
              type: "chat",
              message,
              userId,
              roomId: roomIdStr,
            }),
          );
        }
      });
    }
  });
});
