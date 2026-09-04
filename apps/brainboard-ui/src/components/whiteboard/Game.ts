import {
  Canvas,
  Circle,
  FabricImage,
  FabricObject,
  IText,
  Line,
  PencilBrush,
  Point,
  Polygon,
  Rect,
  Triangle,
  util,
  type TPointerEventInfo,
  type TPointerEvent,
} from "fabric";

import type { Tool } from "@repo/ui/types";
import type {
  WsShapeCreatedPayload,
  WsShapeUpdatedPayload,
  WsShapeDeletedPayload,
  WsDrawPayload,
} from "../../hooks/useWebSocket";
import api from "../../lib/api";

// Typed canvas event callback parameter shapes used by Fabric v6.

type FabricMouseEvent = TPointerEventInfo<TPointerEvent>;

// Extract clientX / clientY from a Fabric pointer event (MouseEvent | TouchEvent).
// For touch events the first changedTouch is used; falls back to 0.

function getClientXY(e: TPointerEvent): { x: number; y: number } {
  if (e instanceof MouseEvent) {
    return { x: e.clientX, y: e.clientY };
  }
  const touch = (e as TouchEvent).changedTouches?.[0];
  return { x: touch?.clientX ?? 0, y: touch?.clientY ?? 0 };
}

/** Extended FabricObject with the optional DB shape id we stamp onto objects. */
interface StampedObject extends FabricObject {
  shapeId?: number;
}

// Callback interface — the Game class fires these; React wires them to WS.

export interface GameCallbacks {
  /** Called when a brand-new local shape has been finalised. */
  onDraw: (
    shapeName: string,
    objectJson: Record<string, unknown>,
    tempId: string,
  ) => void;
  /** Called when an existing, already-persisted shape is mutated. */
  onUpdate: (shapeId: number, objectJson: Record<string, unknown>) => void;
  /** Called when a local shape is deleted (optimistic). */
  onDelete: (shapeId: number) => void;
  /** Called whenever canvas selection changes so React can update its UI. */
  onSelectionChange: (object: FabricObject | null) => void;
  /** Called when a tool switch is needed from inside the class (e.g. after drawing). */
  onToolChange: (tool: Tool) => void;
}

//                   ---
// Internal mouse-interaction state kept as plain fields (never React state).
//                   ---

interface DrawingState {
  startPoint: { x: number; y: number } | null;
  previewObject: FabricObject | null;
}

// Fabric canvas event payload shapes (generic object events)

interface FabricObjectEvent {
  target?: FabricObject;
}

interface FabricSelectionEvent {
  selected?: FabricObject[];
}

interface FabricPathEvent {
  path?: FabricObject;
}

// Helper — get shapeId from a stamped object

function getShapeId(obj: FabricObject): number | undefined {
  return (obj as StampedObject).shapeId;
}

function setShapeId(obj: FabricObject, id: number): void {
  (obj as StampedObject).shapeId = id;
}

// Game

export class Game {
  private canvas: Canvas;
  private callbacks: GameCallbacks;

  private activeTool: Tool = "select";

  // Drawing
  private isDrawing = false;
  private drawingState: DrawingState = {
    startPoint: null,
    previewObject: null,
  };

  // Arrow tool keeps its own start-point (separate flow).
  private arrowStartPoint: { x: number; y: number } | null = null;

  // Panning
  private isPanning = false;
  private lastPanPoint: { x: number; y: number } | null = null;

  // Spacebar temporary-hand state
  private isSpaceDown = false;
  private toolBeforeSpace: Tool = "select";

  // Suppress object:added / object:removed events when adding remote/DB shapes
  private isApplyingRemoteChange = false;

  // Temp-id → Fabric object map for pending (not-yet-ack'd) shapes.
  private pendingShapes = new Map<string, FabricObject>();

  // Bound event-handler references so we can remove them precisely.
  private boundMouseDown: (e: FabricMouseEvent) => void;
  private boundMouseMove: (e: FabricMouseEvent) => void;
  private boundMouseUp: (e: FabricMouseEvent) => void;
  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  private boundResize: () => void;

  // Fabric canvas event handler refs (stored for cleanup).
  private boundObjectAdded: (e: FabricObjectEvent) => void;
  private boundObjectModified: (e: FabricObjectEvent) => void;
  private boundPathCreated: (e: FabricPathEvent) => void;
  private boundSelectionCreated: (e: FabricSelectionEvent) => void;
  private boundSelectionUpdated: (e: FabricSelectionEvent) => void;
  private boundSelectionCleared: () => void;

  constructor(canvasEl: HTMLCanvasElement, callbacks: GameCallbacks) {
    this.callbacks = callbacks;

    // Create Fabric canvas

    this.canvas = new Canvas(canvasEl, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: "#ffffff",
      selection: true,
    });

    // Bind mouse handlers once — tool-routing happens inside the handlers.

    this.boundMouseDown = (e: FabricMouseEvent) => this.handleMouseDown(e);
    this.boundMouseMove = (e: FabricMouseEvent) => this.handleMouseMove(e);
    this.boundMouseUp = (e: FabricMouseEvent) => this.handleMouseUp(e);

    this.canvas.on("mouse:down", this.boundMouseDown);
    this.canvas.on("mouse:move", this.boundMouseMove);
    this.canvas.on("mouse:up", this.boundMouseUp);

    //  Fabric canvas event listeners.

    this.boundObjectAdded = (e: FabricObjectEvent) => this.onObjectAdded(e);
    this.boundObjectModified = (e: FabricObjectEvent) =>
      this.onObjectModified(e);
    this.boundPathCreated = (e: FabricPathEvent) => this.onPathCreated(e);
    this.boundSelectionCreated = (e: FabricSelectionEvent) =>
      this.onSelectionCreated(e);
    this.boundSelectionUpdated = (e: FabricSelectionEvent) =>
      this.onSelectionUpdated(e);
    this.boundSelectionCleared = () => this.onSelectionCleared();

    this.canvas.on("object:added", this.boundObjectAdded);
    this.canvas.on("object:modified", this.boundObjectModified);
    this.canvas.on("path:created", this.boundPathCreated);
    this.canvas.on("selection:created", this.boundSelectionCreated);
    this.canvas.on("selection:updated", this.boundSelectionUpdated);
    this.canvas.on("selection:cleared", this.boundSelectionCleared);

    //  Keyboard handlers (registered once).

    this.boundKeyDown = (e: KeyboardEvent) => this.handleKeyDown(e);
    this.boundKeyUp = (e: KeyboardEvent) => this.handleKeyUp(e);

    window.addEventListener("keydown", this.boundKeyDown);
    window.addEventListener("keyup", this.boundKeyUp);

    //  Resize handler.

    this.boundResize = () => this.handleResize();
    window.addEventListener("resize", this.boundResize);
  }

  // Lifecycle

  destroy(): void {
    // Fabric canvas events
    this.canvas.off("mouse:down", this.boundMouseDown);
    this.canvas.off("mouse:move", this.boundMouseMove);
    this.canvas.off("mouse:up", this.boundMouseUp);
    this.canvas.off("object:added", this.boundObjectAdded);
    this.canvas.off("object:modified", this.boundObjectModified);
    this.canvas.off("path:created", this.boundPathCreated);
    this.canvas.off("selection:created", this.boundSelectionCreated);
    this.canvas.off("selection:updated", this.boundSelectionUpdated);
    this.canvas.off("selection:cleared", this.boundSelectionCleared);

    // Global DOM events
    window.removeEventListener("keydown", this.boundKeyDown);
    window.removeEventListener("keyup", this.boundKeyUp);
    window.removeEventListener("resize", this.boundResize);

    // Fabric canvas itself
    this.canvas.dispose();
  }

  // Tool management

  setTool(tool: Tool): void {
    this.activeTool = tool;
    this.applyToolToCanvas(tool);
  }

  private applyToolToCanvas(tool: Tool): void {
    this.canvas.isDrawingMode = tool === "draw";
    this.canvas.selection = tool === "select";

    const eraserCursorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.4)" stroke="#111827" stroke-width="2"/></svg>`;
    const eraserCursorUrl = `url("data:image/svg+xml,${encodeURIComponent(eraserCursorSvg)}") 12 12, crosshair`;

    this.canvas.defaultCursor =
      tool === "hand"
        ? "grab"
        : tool === "draw"
          ? "crosshair"
          : tool === "eraser"
            ? eraserCursorUrl
            : "default";

    if (tool === "draw") {
      const brush = new PencilBrush(this.canvas);
      brush.width = 3;
      brush.color = "#111827";
      this.canvas.freeDrawingBrush = brush;
    }

    // Image tool: open file picker immediately when the tool is activated.
    if (tool === "image") {
      this.openImagePicker();
    }
  }

  // Mouse handlers (single registration, routed by this.activeTool)

  private handleMouseDown(event: FabricMouseEvent): void {
    const tool = this.activeTool;

    //   HAND / PAN  
    if (tool === "hand") {
      this.isPanning = true;
      const { x: downX, y: downY } = getClientXY(event.e);
      this.lastPanPoint = { x: downX, y: downY };
      this.canvas.defaultCursor = "grabbing";
      return;
    }

    //   ERASER  
    if (tool === "eraser") {
      const target = event.target;
      if (target) {
        this.canvas.remove(target);
        this.canvas.discardActiveObject();
        this.canvas.requestRenderAll();
        this.emitDelete(target);
      }
      return;
    }

    //  IMAGE — handled via picker; nothing on mousedown 
    if (tool === "image") return;

    // TEXT 
    if (tool === "text") {
      const pointer = this.canvas.getScenePoint(event.e);
      const text = new IText("Type here", {
        left: pointer.x,
        top: pointer.y,
        fontSize: 24,
        fill: "#111827",
      });
      this.canvas.add(text);
      this.canvas.setActiveObject(text);
      text.enterEditing();
      text.selectAll();
      this.callbacks.onToolChange("select");
      return;
    }

    //  ARROW
    if (tool === "arrow") {
      const pointer = this.canvas.getScenePoint(event.e);
      this.isDrawing = true;
      this.arrowStartPoint = { x: pointer.x, y: pointer.y };
      return;
    }

    // SHAPES (rectangle / circle / line / diamond) 
    if (
      tool === "rectangle" ||
      tool === "circle" ||
      tool === "line" ||
      tool === "diamond"
    ) {
      const pointer = this.canvas.getScenePoint(event.e);
      this.isDrawing = true;
      this.drawingState.startPoint = { x: pointer.x, y: pointer.y };
      this.drawingState.previewObject = this.createPreviewObject(
        tool,
        pointer.x,
        pointer.y,
      );
      if (this.drawingState.previewObject) {
        this.canvas.add(this.drawingState.previewObject);
      }
    }
  }

  private handleMouseMove(event: FabricMouseEvent): void {
    const tool = this.activeTool;

    // HAND / PAN 
    if (tool === "hand" && this.isPanning && this.lastPanPoint) {
      const { x: cx, y: cy } = getClientXY(event.e);
      const dx = cx - this.lastPanPoint.x;
      const dy = cy - this.lastPanPoint.y;
      this.canvas.relativePan(new Point(dx, dy));
      this.lastPanPoint = { x: cx, y: cy };
      return;
    }

    // SHAPES 
    if (!this.drawingState.startPoint || !this.drawingState.previewObject) {
      return;
    }

    const pointer = this.canvas.getScenePoint(event.e);
    const { startPoint, previewObject } = this.drawingState;
    const width = Math.abs(pointer.x - startPoint.x);
    const height = Math.abs(pointer.y - startPoint.y);

    if (tool === "rectangle") {
      previewObject.set({
        left: Math.min(pointer.x, startPoint.x),
        top: Math.min(pointer.y, startPoint.y),
        width,
        height,
      });
    }

    if (tool === "circle") {
      const radius = Math.max(width, height) / 2;
      previewObject.set({
        left: Math.min(pointer.x, startPoint.x),
        top: Math.min(pointer.y, startPoint.y),
        radius,
      });
    }

    if (tool === "line") {
      previewObject.set({ x2: pointer.x, y2: pointer.y });
    }

    if (tool === "diamond" && previewObject instanceof Polygon) {
      previewObject.set({
        left: Math.min(pointer.x, startPoint.x),
        top: Math.min(pointer.y, startPoint.y),
        scaleX: Math.max(width, 1) / 100,
        scaleY: Math.max(height, 1) / 100,
      });
    }

    previewObject.setCoords();
    this.canvas.requestRenderAll();
  }

  private handleMouseUp(event: FabricMouseEvent): void {
    const tool = this.activeTool;

    //   HAND  
    if (tool === "hand") {
      this.isPanning = false;
      this.lastPanPoint = null;
      this.canvas.defaultCursor = "grab";
      return;
    }

    //   ARROW  
    if (tool === "arrow") {
      this.isDrawing = false;
      if (!this.arrowStartPoint) return;

      const pointer = this.canvas.getScenePoint(event.e);
      const start = this.arrowStartPoint;
      this.arrowStartPoint = null;

      const dx = pointer.x - start.x;
      const dy = pointer.y - start.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 5) return;

      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      const line = new Line([start.x, start.y, pointer.x, pointer.y], {
        stroke: "#111827",
        strokeWidth: 2,
        selectable: false,
        evented: false,
      });

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

      this.canvas.add(line);
      this.canvas.add(arrowHead);

      this.emitDraw(line);
      this.emitDraw(arrowHead);

      this.canvas.requestRenderAll();
      this.callbacks.onToolChange("select");
      return;
    }

    //   SHAPES  
    this.isDrawing = false;
    const { previewObject } = this.drawingState;

    if (!previewObject) return;

    // Discard tiny accidental shapes.
    const bounds = previewObject.getBoundingRect();
    if (tool !== "line" && (bounds.width < 5 || bounds.height < 5)) {
      this.canvas.remove(previewObject);
      this.drawingState.previewObject = null;
      this.drawingState.startPoint = null;
      this.canvas.requestRenderAll();
      return;
    }

    this.emitDraw(previewObject);

    this.drawingState.previewObject = null;
    this.drawingState.startPoint = null;
    this.canvas.requestRenderAll();

    // Return to select after creating a shape.
    if (
      tool === "rectangle" ||
      tool === "diamond" ||
      tool === "circle" ||
      tool === "line"
    ) {
      this.callbacks.onToolChange("select");
    }
  }

  //                   ---
  // Preview-object factory
  //                   ---

  private createPreviewObject(
    tool: Tool,
    x: number,
    y: number,
  ): FabricObject | null {
    if (tool === "rectangle") {
      return new Rect({
        left: x,
        top: y,
        width: 0,
        height: 0,
        fill: "transparent",
        stroke: "#111827",
        strokeWidth: 2,
      });
    }

    if (tool === "circle") {
      return new Circle({
        left: x,
        top: y,
        radius: 0,
        fill: "transparent",
        stroke: "#111827",
        strokeWidth: 2,
      });
    }

    if (tool === "line") {
      return new Line([x, y, x, y], {
        stroke: "#111827",
        strokeWidth: 2,
      });
    }

    if (tool === "diamond") {
      return new Polygon(
        [
          { x: 0, y: 50 },
          { x: 50, y: 0 },
          { x: 100, y: 50 },
          { x: 50, y: 100 },
        ],
        {
          left: x,
          top: y,
          fill: "transparent",
          stroke: "#111827",
          strokeWidth: 2,
        },
      );
    }

    return null;
  }

  //                   ---
  // Keyboard handling
  //                   ---

  private handleKeyDown(event: KeyboardEvent): void {
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    // Spacebar — temporarily switch to hand tool.
    if (event.code === "Space" && !event.repeat) {
      event.preventDefault();
      if (!this.isSpaceDown) {
        this.isSpaceDown = true;
        this.toolBeforeSpace = this.activeTool;
        this.callbacks.onToolChange("hand");
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
      this.callbacks.onToolChange(tool);
      return;
    }

    // Delete / Backspace — remove selected objects.
    if (event.key === "Backspace" || event.key === "Delete") {
      const selected = this.canvas.getActiveObjects();
      if (selected.length > 0) {
        selected.forEach((obj) => this.emitDelete(obj));
        this.canvas.remove(...selected);
        this.canvas.discardActiveObject();
        this.canvas.requestRenderAll();
      }
      return;
    }

    // Escape — return to select.
    if (event.key === "Escape") {
      this.callbacks.onToolChange("select");
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    if (event.code === "Space") {
      this.isSpaceDown = false;
      this.callbacks.onToolChange(this.toolBeforeSpace);
    }
  }

  //                   ---
  // Resize handler
  //                   ---

  private handleResize(): void {
    this.canvas.setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }

  //                   ---
  // Image tool
  //                   ---

  private openImagePicker(): void {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const url = URL.createObjectURL(file);

      try {
        const image = await FabricImage.fromURL(url);
        image.set({ left: 100, top: 100 });

        const maxSize = 500;
        if (image.width && image.width > maxSize) {
          image.scaleToWidth(maxSize);
        }

        this.canvas.add(image);
        this.canvas.setActiveObject(image);
        this.canvas.requestRenderAll();
      } finally {
        URL.revokeObjectURL(url);
        this.callbacks.onToolChange("select");
      }
    };

    input.click();
  }

  //                   ---
  // Fabric canvas event handlers
  //                   ---

  private onObjectAdded(e: FabricObjectEvent): void {
    // Skip objects added by remote/DB load, or mid-drag previews.
    if (this.isApplyingRemoteChange || this.isDrawing) return;
    if (e.target) this.emitDraw(e.target);
  }

  private onObjectModified(e: FabricObjectEvent): void {
    if (!e.target) return;
    const shapeId = getShapeId(e.target);
    if (shapeId) {
      // Already persisted — update in DB.
      const objectJson = e.target.toObject(["shapeId"]) as Record<
        string,
        unknown
      >;
      this.callbacks.onUpdate(shapeId, objectJson);
    } else {
      // shape_created ack not yet arrived — treat as a new draw.
      this.emitDraw(e.target);
    }
  }

  private onPathCreated(e: FabricPathEvent): void {
    // Free-draw strokes are finalised after mouse-up.
    if (e.path) this.emitDraw(e.path);
  }

  private onSelectionCreated(e: FabricSelectionEvent): void {
    const active = e.selected?.[0] ?? this.canvas.getActiveObject();
    this.callbacks.onSelectionChange(active ?? null);
  }

  private onSelectionUpdated(e: FabricSelectionEvent): void {
    const active = e.selected?.[0] ?? this.canvas.getActiveObject();
    this.callbacks.onSelectionChange(active ?? null);
  }

  private onSelectionCleared(): void {
    this.callbacks.onSelectionChange(null);
  }

  //                   ---
  // Emit helpers (delegate to callbacks; keep WS logic outside the class)
  //                   ---

  private emitDraw(obj: FabricObject): void {
    const shapeName = obj.type ?? "unknown";
    const objectJson = obj.toObject(["shapeId"]) as Record<string, unknown>;
    const tempId = crypto.randomUUID();
    this.pendingShapes.set(tempId, obj);
    this.callbacks.onDraw(shapeName, objectJson, tempId);
  }

  private emitDelete(obj: FabricObject): void {
    const shapeId = getShapeId(obj);
    if (!shapeId) return;
    this.callbacks.onDelete(shapeId);
  }

  /** Public — called by React's Toolbar → handleObjectChange bridge. */
  emitUpdate(obj: FabricObject): void {
    const shapeId = getShapeId(obj);
    if (!shapeId) return;
    const objectJson = obj.toObject(["shapeId"]) as Record<string, unknown>;
    this.callbacks.onUpdate(shapeId, objectJson);
  }

  //                   ---
  // WebSocket / remote methods — called from the React component
  //                   ---

  async handleRemoteDraw(payload: WsDrawPayload): Promise<void> {
    const canvas = this.canvas;

    // If a shapeId is supplied check for an existing object first.
    if (payload.shapeId !== undefined) {
      const existing = canvas
        .getObjects()
        .find((o) => getShapeId(o) === payload.shapeId);
      if (existing) {
        existing.set(payload.message as Partial<FabricObject>);
        existing.setCoords();
        canvas.requestRenderAll();
        return;
      }
    }

    try {
      const objects = await util.enlivenObjects([payload.message]);
      this.isApplyingRemoteChange = true;
      objects.forEach((obj) => {
        const fabricObj = obj as FabricObject;
        fabricObj.set({ selectable: true, evented: true });
        if (payload.shapeId) {
          setShapeId(fabricObj, payload.shapeId);
        }
        canvas.add(fabricObj);
      });
      this.isApplyingRemoteChange = false;
      canvas.requestRenderAll();
    } catch (err) {
      this.isApplyingRemoteChange = false;
      console.error("[WB] Failed to render remote shape", err);
    }
  }

  handleShapeCreated(payload: WsShapeCreatedPayload): void {
    if (!payload.tempId) return;
    const match = this.pendingShapes.get(payload.tempId);
    if (match) {
      setShapeId(match, payload.shapeId);
      this.pendingShapes.delete(payload.tempId);
    }
  }

  handleRemoteUpdate(payload: WsShapeUpdatedPayload): void {
    if (!payload.message) return;
    const target = this.canvas
      .getObjects()
      .find((o) => getShapeId(o) === payload.shapeId);
    if (!target) return;
    target.set(payload.message as Partial<FabricObject>);
    target.setCoords();
    this.canvas.requestRenderAll();
  }

  handleRemoteDelete(payload: WsShapeDeletedPayload): void {
    const target = this.canvas
      .getObjects()
      .find((o) => getShapeId(o) === payload.shapeId);
    if (!target) return;

    this.isApplyingRemoteChange = true;
    this.canvas.remove(target);
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
    this.isApplyingRemoteChange = false;
  }

  //                   ---
  // DB shape loading
  //                   ---

  async loadPersistedShapes(roomId: string): Promise<void> {
    if (!roomId || isNaN(Number(roomId))) return;

    try {
      const { data } = await api.get<{
        shapes: { id: number; name: string; data: Record<string, unknown> }[];
      }>(`/room/shapes/${roomId}`);

      const canvas = this.canvas;
      if (!data.shapes?.length) return;

      const objects = await util.enlivenObjects(data.shapes.map((s) => s.data));

      this.isApplyingRemoteChange = true;
      objects.forEach((obj, idx) => {
        const fabricObj = obj as FabricObject;
        fabricObj.set({ selectable: true, evented: true });
        setShapeId(fabricObj, data.shapes[idx].id);
        canvas.add(fabricObj);
      });
      this.isApplyingRemoteChange = false;

      canvas.requestRenderAll();
    } catch (err) {
      this.isApplyingRemoteChange = false;
      console.error("[WB] Failed to load shapes", err);
    }
  }
}
