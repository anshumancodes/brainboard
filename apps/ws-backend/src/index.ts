import { WebSocketServer, WebSocket } from "ws";
import { JWT_SECRET } from "./config";
const wss = new WebSocketServer({ port: 8080 });
import { JWTPayload, jwtVerify } from "jose";
export const JWT_KEY = new TextEncoder().encode(JWT_SECRET);
wss.on("connection", async function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return "no request url found!";
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") ?? " ";
  const decoded = await jwtVerify(token, JWT_KEY);
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
