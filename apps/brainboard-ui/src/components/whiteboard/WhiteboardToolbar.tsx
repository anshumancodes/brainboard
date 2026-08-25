"use client";

import {
  LockKeyhole,
  Hand,
  MousePointer2,
  Square,
  Diamond,
  Circle,
  ArrowRight,
  Minus,
  Pencil,
  Type,
  Image,
  Eraser,
  MoreVertical,
} from "lucide-react";

import { Tool } from "@repo/ui/types";

type WhiteboardToolbarProps = {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
};

const tools: {
  id: Tool;
  icon: React.ElementType;
  shortcut?: string;
}[] = [
  { id: "select", icon: MousePointer2, shortcut: "1" },
  { id: "rectangle", icon: Square, shortcut: "2" },
  { id: "diamond", icon: Diamond, shortcut: "3" },
  { id: "circle", icon: Circle, shortcut: "4" },
  { id: "arrow", icon: ArrowRight, shortcut: "5" },
  { id: "line", icon: Minus, shortcut: "6" },
  { id: "draw", icon: Pencil, shortcut: "7" },
  { id: "text", icon: Type, shortcut: "8" },
  { id: "image", icon: Image, shortcut: "9" },
  { id: "eraser", icon: Eraser, shortcut: "0" },
];

export default function WhiteboardToolbar({
  activeTool,
  onToolChange,
}: WhiteboardToolbarProps) {
  return (
    <div className="fixed left-1/2 top-3 z-50 -translate-x-1/2">
      <div className="flex h-13 items-center gap-1 rounded-xl border border-neutral-200 bg-white px-2 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100"
          title="Lock"
        >
          <LockKeyhole size={17} strokeWidth={1.8} />
        </button>

        <div className="mx-1 h-7 w-px bg-neutral-200" />

        <button
          onClick={() => onToolChange("hand")}
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            activeTool === "hand"
              ? "bg-indigo-100 text-indigo-700"
              : "text-neutral-700 hover:bg-neutral-100"
          }`}
          title="Hand"
        >
          <Hand size={17} strokeWidth={1.8} />
        </button>

        {tools.map(({ id, icon: Icon, shortcut }) => {
          const active = activeTool === id;

          return (
            <button
              key={id}
              onClick={() => onToolChange(id)}
              title={id}
              className={`relative flex h-9 w-9 items-center justify-center rounded-lg ${
                active
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              <Icon size={18} strokeWidth={1.8} />

              {shortcut && (
                <span
                  className={`absolute bottom-0.5 right-1 text-[9px] ${
                    active ? "text-indigo-500" : "text-neutral-400"
                  }`}
                >
                  {shortcut}
                </span>
              )}
            </button>
          );
        })}

        <div className="mx-1 h-7 w-px bg-neutral-200" />

        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100"
          title="More"
        >
          <MoreVertical size={18} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}