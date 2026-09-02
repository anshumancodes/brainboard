import { useEffect, useRef, useCallback } from "react";
import { WS_URL } from "../config/config";
import { getToken } from "../lib/auth";

export type WsDrawPayload = {
  type: "draw";
  roomId: string;
  shape: string;
  message: Record<string, unknown>; // serialised Fabric object JSON
};

type IncomingMessage = WsDrawPayload | { type: string };

interface UseWebSocketOptions {
  roomId: string;
  onRemoteDraw: (payload: WsDrawPayload) => void;
}

export function useWebSocket({ roomId, onRemoteDraw }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const onRemoteDrawRef = useRef(onRemoteDraw);

  // Keep callback ref fresh without reconnecting
  useEffect(() => {
    onRemoteDrawRef.current = onRemoteDraw;
  }, [onRemoteDraw]);

  useEffect(() => {
    const token = getToken();
    // Don't connect until we have both a valid token and a resolved (non-empty) roomId
    if (!token || !roomId) return;

    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join_room", roomId }));
    };

    ws.onmessage = (event) => {
      try {
        const data: IncomingMessage = JSON.parse(event.data as string);
        if (data.type === "draw") {
          onRemoteDrawRef.current(data as WsDrawPayload);
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onerror = (err) => {
      console.error("[WS] error", err);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "leave_room", roomId }));
      }
      ws.close();
      wsRef.current = null;
    };
  }, [roomId]);

  /**
   * Send a draw event for a single Fabric object.
   *
   * @param shapeName  - fabric class name (e.g. "Rect", "Circle", "Path")
   * @param objectJson - result of fabricObject.toObject()
   */
  const sendDraw = useCallback(
    (shapeName: string, objectJson: Record<string, unknown>) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      ws.send(
        JSON.stringify({
          type: "draw",
          roomId,
          shape: shapeName,
          message: objectJson,
        }),
      );
    },
    [roomId],
  );

  return { sendDraw };
}
