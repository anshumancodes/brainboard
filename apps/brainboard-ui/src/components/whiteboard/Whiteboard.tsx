"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { FabricObject } from "fabric";

import WhiteboardToolbar from "./WhiteboardToolbar";
import Toolbar from "./Toolbar";
import type { Tool } from "@repo/ui/types";
import { useWebSocket } from "../../hooks/useWebSocket";
import { getToken } from "../../lib/auth";
import { Game, type GameCallbacks } from "./Game";

interface WhiteboardProps {
  // The numeric room ID from the URL.
  roomId: string;
}

export default function Whiteboard({ roomId }: WhiteboardProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);

  // React UI state — the only state that lives in React.

  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(
    null,
  );

  // Authentication guard

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/");
    }
  }, [router]);

  // WebSocket — stays in React; delegates to Game via gameRef.

  const { sendDraw, sendUpdate, sendDelete } = useWebSocket({
    roomId: roomId ?? "",
    onRemoteDraw: (payload) => gameRef.current?.handleRemoteDraw(payload),
    onShapeCreated: (payload) => gameRef.current?.handleShapeCreated(payload),
    onRemoteUpdate: (payload) => gameRef.current?.handleRemoteUpdate(payload),
    onRemoteDelete: (payload) => gameRef.current?.handleRemoteDelete(payload),
  });

  // Keep WS send functions accessible inside the stable Game callbacks below.
  const sendDrawRef = useRef(sendDraw);
  const sendUpdateRef = useRef(sendUpdate);
  const sendDeleteRef = useRef(sendDelete);

  useEffect(() => {
    sendDrawRef.current = sendDraw;
  }, [sendDraw]);

  useEffect(() => {
    sendUpdateRef.current = sendUpdate;
  }, [sendUpdate]);

  useEffect(() => {
    sendDeleteRef.current = sendDelete;
  }, [sendDelete]);

  // Game lifecycle — created once, destroyed on unmount.

  useEffect(() => {
    if (!canvasRef.current) return;

    const callbacks: GameCallbacks = {
      onDraw: (shapeName, objectJson, tempId) => {
        sendDrawRef.current(shapeName, objectJson, tempId);
      },
      onUpdate: (shapeId, objectJson) => {
        sendUpdateRef.current(shapeId, objectJson);
      },
      onDelete: (shapeId) => {
        sendDeleteRef.current(shapeId);
      },
      onSelectionChange: (obj) => {
        setSelectedObject(obj);
      },
      onToolChange: (tool) => {
        setActiveTool(tool);
      },
    };

    const game = new Game(canvasRef.current, callbacks);
    gameRef.current = game;

    // Load shapes persisted in DB.
    game.loadPersistedShapes(roomId);

    return () => {
      game.destroy();
      gameRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Propagate React tool changes → Game.

  useEffect(() => {
    gameRef.current?.setTool(activeTool);
  }, [activeTool]);

  // Block scroll on canvas container unless Space is held.
  // (isSpaceDown lives inside Game; we approximate by checking the cursor.)

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (event: WheelEvent) => {
      // Prevent default browser scroll/zoom on the canvas area unless the
      // user is in hand/pan mode (spacebar held or hand tool active).
      if (activeTool !== "hand") {
        event.preventDefault();
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [activeTool]);

  // Property-change bridge between Toolbar and WebSocket.

  // The `_patch` arg is forwarded by Toolbar but not needed here — Game
  // serialises the full object on every update via emitUpdate.
  const handleObjectChange = useCallback(
    (obj: FabricObject, _patch?: Partial<Record<string, unknown>>) => {
      gameRef.current?.emitUpdate(obj);
    },
    [],
  );

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-white"
    >
      <canvas ref={canvasRef} />

      {/* Properties sidebar — top-left corner */}
      <Toolbar
        selectedObject={selectedObject}
        onObjectChange={handleObjectChange}
      />

      <WhiteboardToolbar activeTool={activeTool} onToolChange={setActiveTool} />
    </div>
  );
}
