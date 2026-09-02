"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Canvas,
  Circle,
  FabricImage,
  FabricObject,
  IText,
  Line,
  Point,
  PencilBrush,
  Polygon,
  Rect,
  Triangle,
  util,
} from "fabric";

import WhiteboardToolbar from "./WhiteboardToolbar";
import type { Tool } from "@repo/ui/types";
import { useWebSocket } from "../../hooks/useWebSocket";
import api from "../../lib/api";
import { getToken } from "../../lib/auth";

interface WhiteboardProps {
  /** The numeric room ID from the URL. */
  roomId: string;
}

export default function Whiteboard({ roomId }: WhiteboardProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeTool, setActiveTool] = useState<Tool>("select");

  //  Space-bar pan refs kept as refs so event handlers
  //   always read the latest value without re-registering.
  const isSpaceDownRef = useRef(false);
  const toolBeforeSpaceRef = useRef<Tool>("select");
  // Suppress draw-emit when we add shapes received from WS or loaded from DB
  const isRemoteAddRef = useRef(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/");
    }
  }, [router]);

  //Remote draw handler
  const handleRemoteDraw = useCallback(
    async (payload: { shape: string; message: Record<string, unknown> }) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      try {
        const objects = await util.enlivenObjects([payload.message]);
        isRemoteAddRef.current = true;
        objects.forEach((obj) => {
          (obj as FabricObject).set({ selectable: true, evented: true });
          canvas.add(obj as FabricObject);
        });
        isRemoteAddRef.current = false;
        canvas.requestRenderAll();
      } catch (err) {
        console.error("[WB] Failed to render remote shape", err);
      }
    },
    [],
  );

  const { sendDraw } = useWebSocket({
    roomId: roomId ?? "",
    onRemoteDraw: handleRemoteDraw,
  });

  // Create Fabric canvas once
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: "#ffffff",
      selection: true,
    });

    fabricCanvasRef.current = canvas;

    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  //Load persisted shapes from DB on mount
  useEffect(() => {
    if (!roomId || isNaN(Number(roomId))) return;

    const load = async () => {
      try {
        const { data } = await api.get<{
          shapes: { name: string; data: Record<string, unknown> }[];
        }>(`/room/shapes/${roomId}`);

        const canvas = fabricCanvasRef.current;
        if (!canvas || !data.shapes?.length) return;

        const objects = await util.enlivenObjects(
          data.shapes.map((s) => s.data),
        );

        isRemoteAddRef.current = true;
        objects.forEach((obj) => {
          (obj as FabricObject).set({ selectable: true, evented: true });
          canvas.add(obj as FabricObject);
        });
        isRemoteAddRef.current = false;

        canvas.requestRenderAll();
      } catch (err) {
        console.error("[WB] Failed to load shapes", err);
      }
    };

    // Small delay to ensure Fabric canvas has mounted
    const timer = setTimeout(load, 100);
    return () => clearTimeout(timer);
  }, [roomId]);

  //Emit draw event whenever a shape is placed/modified
  const emitDraw = useCallback(
    (obj: FabricObject) => {
      const shapeName = obj.type ?? "unknown";
      const objectJson = obj.toObject() as Record<string, unknown>;
      sendDraw(shapeName, objectJson);
    },
    [sendDraw],
  );

  // Register canvas-level listeners for local changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const onObjectAdded = (e: any) => {
      if (!isRemoteAddRef.current && e.target) emitDraw(e.target);
    };

    const onObjectModified = (e: any) => {
      if (e.target) emitDraw(e.target);
    };

    canvas.on("object:added", onObjectAdded);
    canvas.on("object:modified", onObjectModified);

    return () => {
      canvas.off("object:added", onObjectAdded);
      canvas.off("object:modified", onObjectModified);
    };
  }, [emitDraw]);

  /*
   * Configure Fabric based on selected tool.
   */
  useEffect(() => {
    const canvas = fabricCanvasRef.current;

    if (!canvas) return;

    canvas.isDrawingMode = activeTool === "draw";
    canvas.selection = activeTool === "select";

    const eraserCursorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.4)" stroke="#111827" stroke-width="2"/></svg>`;
    const eraserCursorUrl = `url("data:image/svg+xml,${encodeURIComponent(eraserCursorSvg)}") 12 12, crosshair`;

    canvas.defaultCursor =
      activeTool === "hand"
        ? "grab"
        : activeTool === "draw"
          ? "crosshair"
          : activeTool === "eraser"
            ? eraserCursorUrl
            : "default";

    /*
     * Pencil
     */
    if (activeTool === "draw") {
      const brush = new PencilBrush(canvas);

      brush.width = 3;
      brush.color = "#111827";

      canvas.freeDrawingBrush = brush;
    }

    /*
     * Don't create drawing handlers for select/draw.
     */
    if (activeTool === "select" || activeTool === "draw") {
      return;
    }

    let startPoint: { x: number; y: number } | null = null;
    let isPanning = false;
    let lastPanPoint: { x: number; y: number } | null = null;

    let previewObject: Rect | Circle | Line | Polygon | null = null;

    /*
     * Mouse down
     */
    const handleMouseDown = (event: any) => {
      const pointer = canvas.getScenePoint(event.e);

      /*
       * HAND
       */
      if (activeTool === "hand") {
        isPanning = true;
        lastPanPoint = {
          x: event.e.clientX,
          y: event.e.clientY,
        };

        canvas.defaultCursor = "grabbing";
        return;
      }

      /*
       * ERASER
       */
      if (activeTool === "eraser") {
        const target = event.target;

        if (target) {
          canvas.remove(target);
          canvas.discardActiveObject();
          canvas.requestRenderAll();
        }

        return;
      }

      /*
       * IMAGE
       *
       * Image is handled through a file picker,
       * so nothing happens on mouse down.
       */
      if (activeTool === "image") {
        return;
      }

      /*
       * TEXT
       */
      if (activeTool === "text") {
        const text = new IText("Type here", {
          left: pointer.x,
          top: pointer.y,
          fontSize: 24,
          fill: "#111827",
        });

        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();
        text.selectAll();

        setActiveTool("select");

        return;
      }

      /*
       * SHAPES
       */
      startPoint = {
        x: pointer.x,
        y: pointer.y,
      };

      if (activeTool === "rectangle") {
        previewObject = new Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: "transparent",
          stroke: "#111827",
          strokeWidth: 2,
        });

        canvas.add(previewObject);
      }

      if (activeTool === "circle") {
        previewObject = new Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 0,
          fill: "transparent",
          stroke: "#111827",
          strokeWidth: 2,
        });

        canvas.add(previewObject);
      }

      if (activeTool === "line") {
        previewObject = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: "#111827",
          strokeWidth: 2,
        });

        canvas.add(previewObject);
      }

      if (activeTool === "diamond") {
        previewObject = new Polygon(
          [
            { x: 0, y: 50 },
            { x: 50, y: 0 },
            { x: 100, y: 50 },
            { x: 50, y: 100 },
          ],
          {
            left: pointer.x,
            top: pointer.y,
            fill: "transparent",
            stroke: "#111827",
            strokeWidth: 2,
          },
        );

        canvas.add(previewObject);
      }
    };

    /*
     * Mouse move
     */
    const handleMouseMove = (event: any) => {
      /*
       * HAND / PAN
       */
      if (activeTool === "hand" && isPanning && lastPanPoint) {
        const currentX = event.e.clientX;
        const currentY = event.e.clientY;

        const deltaX = currentX - lastPanPoint.x;
        const deltaY = currentY - lastPanPoint.y;

        canvas.relativePan(new Point(deltaX, deltaY));

        lastPanPoint = {
          x: currentX,
          y: currentY,
        };

        return;
      }

      if (!startPoint || !previewObject) {
        return;
      }

      const pointer = canvas.getScenePoint(event.e);

      const width = Math.abs(pointer.x - startPoint.x);
      const height = Math.abs(pointer.y - startPoint.y);

      /*
       * RECTANGLE
       */
      if (activeTool === "rectangle") {
        previewObject.set({
          left: Math.min(pointer.x, startPoint.x),
          top: Math.min(pointer.y, startPoint.y),
          width,
          height,
        });
      }

      /*
       * CIRCLE
       */
      if (activeTool === "circle") {
        const radius = Math.max(width, height) / 2;

        previewObject.set({
          left: Math.min(pointer.x, startPoint.x),
          top: Math.min(pointer.y, startPoint.y),
          radius,
        });
      }

      /*
       * LINE
       */
      if (activeTool === "line") {
        previewObject.set({
          x2: pointer.x,
          y2: pointer.y,
        });
      }

      /*
       * DIAMOND
       */
      if (activeTool === "diamond" && previewObject instanceof Polygon) {
        previewObject.set({
          left: Math.min(pointer.x, startPoint.x),
          top: Math.min(pointer.y, startPoint.y),
          scaleX: Math.max(width, 1) / 100,
          scaleY: Math.max(height, 1) / 100,
        });
      }

      previewObject.setCoords();
      canvas.requestRenderAll();
    };

    /*
     * Mouse up
     */
    const handleMouseUp = () => {
      /*
       * Finish panning
       */
      if (activeTool === "hand") {
        isPanning = false;
        lastPanPoint = null;
        canvas.defaultCursor = "grab";
        return;
      }

      if (!previewObject) {
        return;
      }

      /*
       * Remove tiny accidental shapes.
       */
      const bounds = previewObject.getBoundingRect();

      if (activeTool !== "line" && (bounds.width < 5 || bounds.height < 5)) {
        canvas.remove(previewObject);
      }

      previewObject = null;
      startPoint = null;

      canvas.requestRenderAll();

      /*
       * Return to select after creating a shape.
       */
      if (
        activeTool === "rectangle" ||
        activeTool === "diamond" ||
        activeTool === "circle" ||
        activeTool === "line"
      ) {
        setActiveTool("select");
      }
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [activeTool]);

  /*
   * Arrow tool
   *
   * We keep this separate because an arrow is made
   * from a line + triangle.
   */
  useEffect(() => {
    const canvas = fabricCanvasRef.current;

    if (!canvas || activeTool !== "arrow") return;

    let startPoint: { x: number; y: number } | null = null;

    const handleMouseDown = (event: any) => {
      const pointer = canvas.getScenePoint(event.e);

      startPoint = {
        x: pointer.x,
        y: pointer.y,
      };
    };

    const handleMouseUp = (event: any) => {
      if (!startPoint) return;

      const pointer = canvas.getScenePoint(event.e);

      const dx = pointer.x - startPoint.x;
      const dy = pointer.y - startPoint.y;

      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 5) {
        startPoint = null;
        return;
      }

      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      const line = new Line(
        [startPoint.x, startPoint.y, pointer.x, pointer.y],
        {
          stroke: "#111827",
          strokeWidth: 2,
          selectable: false,
          evented: false,
        },
      );

      const arrowHead = new Triangle({
        left: pointer.x,
        top: pointer.y,
        width: 12,
        height: 12,
        fill: "#111827",
        originX: "center",
        originY: "center",
        angle: angle + 90,
      });

      canvas.add(line);
      canvas.add(arrowHead);

      canvas.requestRenderAll();

      startPoint = null;
      setActiveTool("select");
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [activeTool]);

  /*
   * Image tool
   */
  useEffect(() => {
    const canvas = fabricCanvasRef.current;

    if (!canvas || activeTool !== "image") return;

    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files?.[0];

      if (!file) return;

      const url = URL.createObjectURL(file);

      try {
        const image = await FabricImage.fromURL(url);

        image.set({
          left: 100,
          top: 100,
        });

        /*
         * Prevent huge images from taking over the board.
         */
        const maxSize = 500;

        if (image.width && image.width > maxSize) {
          image.scaleToWidth(maxSize);
        }

        canvas.add(image);
        canvas.setActiveObject(image);
        canvas.requestRenderAll();
      } finally {
        URL.revokeObjectURL(url);
        setActiveTool("select");
      }
    };

    input.click();
  }, [activeTool]);

  /*
   * Keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      /*
       * Space — temporarily switch to hand tool for panning.
       * Guard with repeat so we don't re-trigger on key hold.
       */
      if (event.code === "Space" && !event.repeat) {
        event.preventDefault();
        if (!isSpaceDownRef.current) {
          isSpaceDownRef.current = true;
          toolBeforeSpaceRef.current = activeTool;
          setActiveTool("hand");
        }
        return;
      }

      const shortcuts: Record<string, Tool> = {
        "1": "select",
        "2": "rectangle",
        "3": "diamond",
        "4": "circle",
        "5": "arrow",
        "6": "line",
        "7": "draw",
        "8": "text",
        "9": "image",
        "0": "eraser",
      };

      const tool = shortcuts[event.key];

      if (tool) {
        event.preventDefault();
        setActiveTool(tool);
      }

      /*
       * Delete selected objects.
       */
      if (event.key === "Backspace" || event.key === "Delete") {
        const canvas = fabricCanvasRef.current;

        if (!canvas) return;

        const selected = canvas.getActiveObjects();

        if (selected.length > 0) {
          canvas.remove(...selected);
          canvas.discardActiveObject();
          canvas.requestRenderAll();
        }
      }

      /*
       * Escape -> select
       */
      if (event.key === "Escape") {
        setActiveTool("select");
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        isSpaceDownRef.current = false;
        setActiveTool(toolBeforeSpaceRef.current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [activeTool]);

  /*
   * Block scroll on the canvas container unless Space is held.
   */
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const handleWheel = (event: WheelEvent) => {
      if (!isSpaceDownRef.current) {
        /*
         * Space is not held — block all scroll / zoom on the canvas.
         */
        event.preventDefault();
      }
    };

    /*
     * passive: false is required so we can call preventDefault().
     */
    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-white"
    >
      <canvas ref={canvasRef} />

      <WhiteboardToolbar activeTool={activeTool} onToolChange={setActiveTool} />
    </div>
  );
}
