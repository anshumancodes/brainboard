"use client";

import { useEffect, useRef, useState } from "react";
import { WS_URL } from "../config/config";

export function useSocket(token: string | null) {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token) {
      setError("No auth token");
      setLoading(false);
      return;
    }

    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setLoading(false);
      setSocket(ws);
      setError(null);
    };

    ws.onerror = () => {
      setError("WebSocket connection failed");
      setLoading(false);
    };

    ws.onclose = () => {
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, [token]);

  return { socket, loading, error };
}
