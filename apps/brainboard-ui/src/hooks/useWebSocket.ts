import { useEffect, useRef, useCallback } from "react";
import { WS_URL } from "../config/config";
import { getToken } from "../lib/auth";

export type WsDrawPayload = {
  type: "draw";
  roomId: string;
  shape: string;
  shapeId?: number;
  message: Record<string, unknown>; // serialised Fabric object JSON
};

export type WsShapeCreatedPayload = {
  type: "shape_created";
  shapeId: number;
  /** Echoed back from the sender so the client can match the ack to the exact Fabric object. */
  tempId?: string;
  message: Record<string, unknown>;
};

export type WsShapeUpdatedPayload = {
  type: "shape_updated";
  shapeId: number;
  //  Present only on the broadcast sent to remote peers; absent on the ack sent to the originator.
  message?: Record<string, unknown>;
};

export type WsShapeDeletedPayload = {
  type: "shape_deleted";
  shapeId: number;
  roomId: string;
};

type IncomingMessage =
  | WsDrawPayload
  | WsShapeCreatedPayload
  | WsShapeUpdatedPayload
  | WsShapeDeletedPayload
  | { type: string };

interface UseWebSocketOptions {
  roomId: string;
  onRemoteDraw: (payload: WsDrawPayload) => void;
  onShapeCreated?: (payload: WsShapeCreatedPayload) => void;
  onRemoteUpdate?: (payload: WsShapeUpdatedPayload) => void;
  onRemoteDelete?: (payload: WsShapeDeletedPayload) => void;
}

export function useWebSocket({
  roomId,
  onRemoteDraw,
  onShapeCreated,
  onRemoteUpdate,
  onRemoteDelete,
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const onRemoteDrawRef = useRef(onRemoteDraw);
  const onShapeCreatedRef = useRef(onShapeCreated);
  const onRemoteUpdateRef = useRef(onRemoteUpdate);
  const onRemoteDeleteRef = useRef(onRemoteDelete);

  // Keep callback refs fresh without reconnecting
  useEffect(() => {
    onRemoteDrawRef.current = onRemoteDraw;
  }, [onRemoteDraw]);

  useEffect(() => {
    onShapeCreatedRef.current = onShapeCreated;
  }, [onShapeCreated]);

  useEffect(() => {
    onRemoteUpdateRef.current = onRemoteUpdate;
  }, [onRemoteUpdate]);

  useEffect(() => {
    onRemoteDeleteRef.current = onRemoteDelete;
  }, [onRemoteDelete]);

  useEffect(() => {
    const token = getToken();
    // Don't connect until we have both a valid token and a resolved (non-empty) roomId
    if (!token || !roomId) return;

    // Flag set during intentional cleanup (React Strict Mode double-invoke, unmount, roomId change).
    // Prevents onerror from logging noise when *we* close the socket.
    let intentionalClose = false;

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
        } else if (data.type === "shape_created") {
          onShapeCreatedRef.current?.(data as WsShapeCreatedPayload);
        } else if (data.type === "shape_updated") {
          onRemoteUpdateRef.current?.(data as WsShapeUpdatedPayload);
        } else if (data.type === "shape_deleted") {
          onRemoteDeleteRef.current?.(data as WsShapeDeletedPayload);
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onerror = () => {
      if (!intentionalClose) {
        console.error(
          "[WS] Unexpected connection error — check that ws-backend is reachable at",
          WS_URL,
        );
      }
    };

    return () => {
      intentionalClose = true;
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "leave_room", roomId }));
      }
      ws.close();
      wsRef.current = null;
    };
  }, [roomId]);

  // Send a draw event for a brand-new Fabric object (shape creation).

  // @param shapeName  - fabric class name (e.g. "Rect", "Circle", "Path")
  // @param objectJson - result of fabricObject.toObject()
  // @param tempId     - client-generated UUID for ack correlation

  const sendDraw = useCallback(
    (
      shapeName: string,
      objectJson: Record<string, unknown>,
      tempId?: string,
    ) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      ws.send(
        JSON.stringify({
          type: "draw",
          roomId,
          shape: shapeName,
          message: objectJson,
          tempId,
        }),
      );
    },
    [roomId],
  );

  //  Send an update event for an existing Fabric object (move / resize / rotate).
  //  The backend will update the existing DB row instead of creating a new one.

  //  @param shapeId    - the persistent DB id stamped on the Fabric object
  //  @param objectJson - result of fabricObject.toObject()

  const sendUpdate = useCallback(
    (shapeId: number, objectJson: Record<string, unknown>) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      ws.send(
        JSON.stringify({
          type: "update",
          roomId,
          shapeId,
          message: objectJson,
        }),
      );
    },
    [roomId],
  );

  // Send a delete event to remove a shape from the DB and broadcast to peers.
  const sendDelete = useCallback(
    (shapeId: number) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      ws.send(
        JSON.stringify({
          type: "delete",
          roomId,
          shapeId,
        }),
      );
    },
    [roomId],
  );

  return { sendDraw, sendUpdate, sendDelete };
}
