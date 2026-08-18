import { WebSocketServer, WebSocket } from "ws";
import { JWT_SECRET } from "@repo/backend-common/config";
const wss = new WebSocketServer({ port: 8080 });
import { jwtVerify } from "jose";

wss.on("connection", async function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return "no request url found!";
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") ?? " ";
  const decoded = await jwtVerify(token, JWT_SECRET);
  if (typeof decoded == "string") {
    ws.close();
    return;
  }
  if (!decoded) {
    ws.close();
    return;
  }
  ws.on("message", (message) => {
    ws.send("pong");
  });
});
