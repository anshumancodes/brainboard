"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Menu,
  X,
  Palette,
  Minus,
  Layers,
  ChevronDown,
  ChevronRight,
  Droplets,
  PenLine,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
} from "lucide-react";
import type { FabricObject } from "fabric";

interface ObjectProps {
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  rx: number; // border-radius (Rect only)
  fontSize: number; // IText only
  fontWeight: string; // IText only
  fontStyle: string; // IText only
  textAlign: string; // IText only
  strokeDashArray: number[]; // dash pattern
  shadow: boolean;
  type: string;
}

interface ToolbarProps {
  /* The currently selected Fabric object (or null when nothing is selected). */
  selectedObject: FabricObject | null;
  /* Called whenever a property changes so Whiteboard can emit an update. */
  onObjectChange: (obj: FabricObject, props: Partial<ObjectProps>) => void;
}
// helper functions here

/* Extract display-ready props from a Fabric object. */
function extractProps(obj: FabricObject): ObjectProps {
  const raw = obj as any;
  return {
    fill: typeof raw.fill === "string" ? raw.fill : "#ffffff",
    stroke: typeof raw.stroke === "string" ? raw.stroke : "#111827",
    strokeWidth: raw.strokeWidth ?? 2,
    opacity: raw.opacity ?? 1,
    rx: raw.rx ?? 0,
    fontSize: raw.fontSize ?? 24,
    fontWeight: raw.fontWeight ?? "normal",
    fontStyle: raw.fontStyle ?? "normal",
    textAlign: raw.textAlign ?? "left",
    strokeDashArray: Array.isArray(raw.strokeDashArray)
      ? raw.strokeDashArray
      : [],
    shadow: !!raw.shadow,
    type: raw.type ?? "unknown",
  };
}

/* Small colour swatch presets. */
const COLOUR_PRESETS = [
  "transparent",
  "#ffffff",
  "#111827",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

const STROKE_WIDTHS = [1, 2, 3, 4, 6, 8, 12];

// sub components , will them to different files later

function SectionHeader({
  label,
  icon: Icon,
  open,
  onToggle,
}: {
  label: string;
  icon: React.ElementType;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between py-2 px-1 text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-neutral-700 transition-colors"
    >
      <span className="flex items-center gap-1.5">
        <Icon size={13} strokeWidth={2} />
        {label}
      </span>
      {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
    </button>
  );
}

function ColourRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <span className="text-xs text-neutral-600 w-16 shrink-0">{label}</span>
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {/* Native colour picker */}
        <label className="relative cursor-pointer shrink-0">
          <div
            className="w-7 h-7 rounded-md border border-neutral-300 shadow-sm overflow-hidden"
            style={{
              background:
                value === "transparent"
                  ? "repeating-linear-gradient(45deg, #ccc 0 4px, #fff 4px 8px)"
                  : value,
            }}
          />
          <input
            type="color"
            value={value === "transparent" ? "#ffffff" : value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </label>
        {/* Hex input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 text-xs px-2 py-1 rounded-md border border-neutral-200 bg-neutral-50 focus:outline-none focus:border-indigo-400 font-mono"
        />
      </div>
    </div>
  );
}

function ColourSwatches({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 pb-1">
      {COLOUR_PRESETS.map((c) => (
        <button
          key={c}
          title={c}
          onClick={() => onChange(c)}
          className={`w-6 h-6 rounded-md border transition-all ${
            value === c
              ? "border-indigo-500 ring-1 ring-indigo-400 scale-110"
              : "border-neutral-300 hover:scale-105"
          }`}
          style={{
            background:
              c === "transparent"
                ? "repeating-linear-gradient(45deg, #ccc 0 4px, #fff 4px 8px)"
                : c,
          }}
        />
      ))}
    </div>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  displayValue,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  displayValue?: string;
}) {
  return (
    <div className="py-1.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-neutral-600">{label}</span>
        <span className="text-xs font-mono text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded">
          {displayValue ?? value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 accent-indigo-500 cursor-pointer"
      />
    </div>
  );
}

// main component
export default function Toolbar({
  selectedObject,
  onObjectChange,
}: ToolbarProps) {
  const [open, setOpen] = useState(false);
  const [props, setProps] = useState<ObjectProps | null>(null);

  // Sections collapsed state
  const [fillOpen, setFillOpen] = useState(true);
  const [strokeOpen, setStrokeOpen] = useState(true);
  const [geometryOpen, setGeometryOpen] = useState(true);
  const [textOpen, setTextOpen] = useState(true);
  const [effectsOpen, setEffectsOpen] = useState(false);

  /* Sync local state whenever the selected object changes */
  useEffect(() => {
    if (!selectedObject) {
      setProps(null);
      return;
    }
    setProps(extractProps(selectedObject));
    setOpen(true); // auto-open when an object is selected
  }, [selectedObject]);

  /* Apply a property change to the Fabric object & notify parent */
  const apply = useCallback(
    (patch: Partial<ObjectProps>) => {
      if (!selectedObject || !props) return;
      const next = { ...props, ...patch };
      setProps(next);

      // Apply to fabric object immediately
      (selectedObject as any).set(patch as any);
      selectedObject.canvas?.requestRenderAll();

      // Notify parent (Whiteboard) to emit the update via WS
      onObjectChange(selectedObject, patch);
    },
    [selectedObject, props, onObjectChange],
  );

  const isText =
    props?.type === "i-text" ||
    props?.type === "text" ||
    props?.type === "textbox";

  // rendering it

  return (
    <>
      {/* Hamburger toggle — always visible in top-left corner */}
      <button
        id="toolbar-toggle"
        onClick={() => setOpen((v) => !v)}
        className={`fixed top-4 left-4 z-60 flex h-9 w-9 items-center justify-center rounded-xl border shadow-md transition-all duration-200 ${
          open
            ? "bg-indigo-600 border-indigo-500 text-white shadow-indigo-200"
            : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
        }`}
        title={open ? "Close properties panel" : "Open properties panel"}
      >
        {open ? (
          <X size={17} strokeWidth={2} />
        ) : (
          <Menu size={17} strokeWidth={2} />
        )}
      </button>

      {/* Sidebar panel */}
      <div
        id="toolbar-sidebar"
        className={`fixed top-20 left-5 rounded-2xl z-50 h-[80%] flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: 240 }}
      >
        {/* Glass panel */}
        <div className="flex h-full flex-col bg-white/95 backdrop-blur-sm  shadow-[4px_0_24px_rgba(0,0,0,0.08)] overflow-hidden">
          {/* Header */}
          <div className="flex h-14 items-center justify-between px-4 border-b border-neutral-100 shrink-0">
            <span className="text-sm font-semibold text-neutral-800 tracking-tight">
              Properties
            </span>
            {/* Spacer for hamburger button alignment */}
            <div className="w-9" />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            {!selectedObject || !props ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center h-full gap-3 py-16 text-center">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center">
                  <Palette size={22} className="text-neutral-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-600">
                    No selection
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                    Select an object on the canvas to edit its properties
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-0.5">
                {/* Object type badge */}
                <div className="flex items-center gap-2 py-3 mb-1">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium capitalize border border-indigo-100">
                    {props.type}
                  </span>
                </div>

                {/*  Fill  */}
                <SectionHeader
                  label="Fill"
                  icon={Droplets}
                  open={fillOpen}
                  onToggle={() => setFillOpen((v) => !v)}
                />
                {fillOpen && (
                  <div className="pl-1 pb-2">
                    <ColourRow
                      label="Color"
                      value={props.fill}
                      onChange={(v) => apply({ fill: v })}
                    />
                    <ColourSwatches
                      value={props.fill}
                      onChange={(v) => apply({ fill: v })}
                    />
                  </div>
                )}

                <div className="h-px bg-neutral-100 my-1" />

                {/*  Stroke  */}
                <SectionHeader
                  label="Stroke"
                  icon={PenLine}
                  open={strokeOpen}
                  onToggle={() => setStrokeOpen((v) => !v)}
                />
                {strokeOpen && (
                  <div className="pl-1 pb-2 space-y-1">
                    <ColourRow
                      label="Color"
                      value={props.stroke}
                      onChange={(v) => apply({ stroke: v })}
                    />
                    <ColourSwatches
                      value={props.stroke}
                      onChange={(v) => apply({ stroke: v })}
                    />

                    {/* Stroke width quick picks */}
                    <div className="py-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-neutral-600">Width</span>
                        <span className="text-xs font-mono text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded">
                          {props.strokeWidth}px
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {STROKE_WIDTHS.map((w) => (
                          <button
                            key={w}
                            title={`${w}px`}
                            onClick={() => apply({ strokeWidth: w })}
                            className={`flex-1 flex items-center justify-center h-7 rounded-md border transition-all text-xs ${
                              props.strokeWidth === w
                                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
                            }`}
                          >
                            <div
                              className="rounded-full bg-current"
                              style={{
                                width: Math.min(w * 1.5, 12),
                                height: Math.min(w * 1.5, 12),
                              }}
                            />
                          </button>
                        ))}
                      </div>
                      {/* Fine-grained slider */}
                      <input
                        type="range"
                        min={0}
                        max={20}
                        step={0.5}
                        value={props.strokeWidth}
                        onChange={(e) =>
                          apply({ strokeWidth: Number(e.target.value) })
                        }
                        className="w-full h-1.5 accent-indigo-500 cursor-pointer mt-2"
                      />
                    </div>

                    {/* Dash style */}
                    <div className="py-1">
                      <span className="text-xs text-neutral-600 block mb-1.5">
                        Style
                      </span>
                      <div className="flex gap-1.5">
                        {[
                          { label: "Solid", dash: [] },
                          { label: "Dashed", dash: [8, 4] },
                          { label: "Dotted", dash: [2, 4] },
                        ].map(({ label, dash }) => {
                          const active =
                            JSON.stringify(props.strokeDashArray) ===
                            JSON.stringify(dash);
                          return (
                            <button
                              key={label}
                              title={label}
                              onClick={() => apply({ strokeDashArray: dash })}
                              className={`flex-1 h-7 text-xs rounded-md border transition-all ${
                                active
                                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                  : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <div className="h-px bg-neutral-100 my-1" />

                {/*  Geometry  */}
                <SectionHeader
                  label="Geometry"
                  icon={Layers}
                  open={geometryOpen}
                  onToggle={() => setGeometryOpen((v) => !v)}
                />
                {geometryOpen && (
                  <div className="pl-1 pb-2 space-y-1">
                    <Slider
                      label="Opacity"
                      min={0}
                      max={1}
                      step={0.01}
                      value={props.opacity}
                      onChange={(v) => apply({ opacity: v })}
                      displayValue={`${Math.round(props.opacity * 100)}%`}
                    />

                    {/* Corner radius — only meaningful for Rect */}
                    {props.type === "rect" && (
                      <Slider
                        label="Corner Radius"
                        min={0}
                        max={100}
                        step={1}
                        value={props.rx}
                        onChange={(v) => apply({ rx: v })}
                        displayValue={`${props.rx}px`}
                      />
                    )}
                  </div>
                )}

                {/*  Text  */}
                {isText && (
                  <>
                    <div className="h-px bg-neutral-100 my-1" />
                    <SectionHeader
                      label="Text"
                      icon={Type}
                      open={textOpen}
                      onToggle={() => setTextOpen((v) => !v)}
                    />
                    {textOpen && (
                      <div className="pl-1 pb-2 space-y-2">
                        <Slider
                          label="Font Size"
                          min={8}
                          max={120}
                          step={1}
                          value={props.fontSize}
                          onChange={(v) => apply({ fontSize: v })}
                          displayValue={`${props.fontSize}px`}
                        />

                        {/* Bold / Italic */}
                        <div>
                          <span className="text-xs text-neutral-600 block mb-1.5">
                            Style
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              title="Bold"
                              onClick={() =>
                                apply({
                                  fontWeight:
                                    props.fontWeight === "bold"
                                      ? "normal"
                                      : "bold",
                                })
                              }
                              className={`flex-1 h-7 flex items-center justify-center rounded-md border transition-all ${
                                props.fontWeight === "bold"
                                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                  : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
                              }`}
                            >
                              <Bold size={13} strokeWidth={2.5} />
                            </button>
                            <button
                              title="Italic"
                              onClick={() =>
                                apply({
                                  fontStyle:
                                    props.fontStyle === "italic"
                                      ? "normal"
                                      : "italic",
                                })
                              }
                              className={`flex-1 h-7 flex items-center justify-center rounded-md border transition-all ${
                                props.fontStyle === "italic"
                                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                  : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
                              }`}
                            >
                              <Italic size={13} strokeWidth={2} />
                            </button>
                          </div>
                        </div>

                        {/* Text align */}
                        <div>
                          <span className="text-xs text-neutral-600 block mb-1.5">
                            Align
                          </span>
                          <div className="flex gap-1.5">
                            {[
                              { value: "left", Icon: AlignLeft },
                              { value: "center", Icon: AlignCenter },
                              { value: "right", Icon: AlignRight },
                            ].map(({ value, Icon }) => (
                              <button
                                key={value}
                                title={value}
                                onClick={() => apply({ textAlign: value })}
                                className={`flex-1 h-7 flex items-center justify-center rounded-md border transition-all ${
                                  props.textAlign === value
                                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                    : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
                                }`}
                              >
                                <Icon size={13} strokeWidth={1.8} />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/*  Effects  */}
                <div className="h-px bg-neutral-100 my-1" />
                <SectionHeader
                  label="Effects"
                  icon={Minus}
                  open={effectsOpen}
                  onToggle={() => setEffectsOpen((v) => !v)}
                />
                {effectsOpen && (
                  <div className="pl-1 pb-2">
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-xs text-neutral-600">
                        Drop Shadow
                      </span>
                      <button
                        onClick={() => {
                          if (props.shadow) {
                            (selectedObject as any).set("shadow", null);
                            selectedObject.canvas?.requestRenderAll();
                            onObjectChange(selectedObject, {
                              shadow: false,
                            } as any);
                            setProps((p) => (p ? { ...p, shadow: false } : p));
                          } else {
                            const shadowObj = {
                              color: "rgba(0,0,0,0.25)",
                              blur: 8,
                              offsetX: 4,
                              offsetY: 4,
                            };
                            (selectedObject as any).set("shadow", shadowObj);
                            selectedObject.canvas?.requestRenderAll();
                            onObjectChange(selectedObject, {
                              shadow: true,
                            } as any);
                            setProps((p) => (p ? { ...p, shadow: true } : p));
                          }
                        }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          props.shadow ? "bg-indigo-500" : "bg-neutral-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                            props.shadow ? "translate-x-4" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-100 px-4 py-3 shrink-0">
            <p className="text-[10px] text-neutral-400 text-center">
              {selectedObject
                ? "Changes sync in real-time"
                : "Select an object to begin"}
            </p>
          </div>
        </div>
      </div>

      {/* Backdrop (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/10 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
