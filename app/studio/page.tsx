"use client";
import { useRef, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import LivePreview from "@/components/LivePreview";

export default function StudioPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const [leftPct, setLeftPct] = useState(50);

  function onMouseDown(e: React.MouseEvent) {
    draggingRef.current = true;

    function onMove(ev: MouseEvent) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let pct = ((ev.clientX - rect.left) / rect.width) * 100;
      pct = Math.max(10, Math.min(90, pct));
      setLeftPct(pct);
    }

    function onUp() {
      draggingRef.current = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  return (
    <main className="h-screen flex flex-col">
      <div className="flex-1" ref={containerRef}>
        <div className="h-full flex" style={{ userSelect: draggingRef.current ? "none" : "auto" }}>
          <div className="border-r border-gray-800" style={{ width: `${leftPct}%`, minWidth: "10%" }}>
            <CodeEditor />
          </div>

          <div
            className="w-1 bg-gray-700 cursor-col-resize"
            onMouseDown={onMouseDown}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize editor"
          />

          <div className="flex-1">
            <LivePreview />
          </div>
        </div>
      </div>
    </main>
  );
}
