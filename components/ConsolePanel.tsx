// "use client";
// import { useState, useMemo, useRef } from "react";
// import { SandpackConsole } from "@codesandbox/sandpack-react";
// import { useProjectStore } from "@/hooks/useProjectStore";

// export default function ConsolePanel() {
//   const [isOpen, setIsOpen] = useState(true);
//   const files = useProjectStore((s) => s.files);
//   const appCode = files["/src/App.js"] ?? "";
//   const consoleKey = useMemo(() => {
//     let h = 0;
//     for (let i = 0; i < appCode.length; i++) {
//       h = (h << 5) - h + appCode.charCodeAt(i);
//       h |= 0;
//     }
//     return String(h);
//   }, [appCode]);

//   const [heightVh, setHeightVh] = useState(30);
//   const draggingRef = useRef(false);

//   function onDragStart(e: React.MouseEvent) {
//     draggingRef.current = true;

//     function onMove(ev: MouseEvent) {
//       const yFromBottom = window.innerHeight - ev.clientY;
//       let vh = (yFromBottom / window.innerHeight) * 100;
//       vh = Math.max(10, Math.min(60, vh));
//       setHeightVh(vh);
//       if (vh > 12) setIsOpen(true);
//     }

//     function onUp() {
//       draggingRef.current = false;
//       document.removeEventListener("mousemove", onMove);
//       document.removeEventListener("mouseup", onUp);
//     }

//     document.addEventListener("mousemove", onMove);
//     document.addEventListener("mouseup", onUp);
//   }

//   const wrapperHeightClass = isOpen ? `h-[${heightVh}vh]` : "h-[40px]";

//   return (
//     <div className={`w-full transition-all duration-200 ease-in-out ${wrapperHeightClass}`}>
//       <div
//         className="w-full h-[40px] flex items-center px-3 bg-[#0b0b0b] border-t border-gray-700 text-white select-none"
//         onClick={() => setIsOpen((s) => !s)}
//       >
//         <span className="">Console</span>
//         <span
//           className={`ml-auto transform transition-transform duration-200 ${
//             isOpen ? "rotate-180" : "rotate-0"
//           }`}
//         >
//           ▲
//         </span>
//       </div>
//       {isOpen && (
//         <div
//           className="w-full h-1 bg-gray-600 cursor-row-resize"
//           onMouseDown={onDragStart}
//           role="separator"
//           aria-orientation="horizontal"
//           aria-label="Resize console"
//         />
//       )}

//       <div
//         className={`w-full bg-gray-200 overflow-auto ${isOpen ? `block` : "hidden"}`}
//         style={isOpen ? { height: `calc(${heightVh}vh - 40px)` } : undefined}
//       >
//         <div key={consoleKey}>
//           <SandpackConsole />
//         </div>
//       </div>
//     </div>
//   );
// }

"use client"
import { useState, useMemo, useRef } from "react"
import type React from "react"

import { SandpackConsole } from "@codesandbox/sandpack-react"
import { useProjectStore } from "@/hooks/useProjectStore"
import { Button } from "@/components/ui/button"
import { ChevronUp } from "lucide-react"

export default function ConsolePanel() {
  const [isOpen, setIsOpen] = useState(true)
  const files = useProjectStore((s) => s.files)
  const appCode = files["/src/App.js"] ?? ""
  const consoleKey = useMemo(() => {
    let h = 0
    for (let i = 0; i < appCode.length; i++) {
      h = (h << 5) - h + appCode.charCodeAt(i)
      h |= 0
    }
    return String(h)
  }, [appCode])

  const [heightVh, setHeightVh] = useState(30)
  const draggingRef = useRef(false)

  function onDragStart(e: React.MouseEvent) {
    draggingRef.current = true

    function onMove(ev: MouseEvent) {
      const yFromBottom = window.innerHeight - ev.clientY
      let vh = (yFromBottom / window.innerHeight) * 100
      vh = Math.max(10, Math.min(60, vh))
      setHeightVh(vh)
      if (vh > 12) setIsOpen(true)
    }

    function onUp() {
      draggingRef.current = false
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
    }

    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
  }

  const wrapperHeightClass = isOpen ? `h-[${heightVh}vh]` : "h-[40px]"

  return (
    <div className={`w-full transition-all duration-200 ease-in-out ${wrapperHeightClass}`}>
      <div className="w-full h-[40px] flex items-center px-3 bg-background border-t border-border select-none">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen((s) => !s)}
          className="h-auto p-0 text-foreground hover:bg-muted"
        >
          <span className="text-sm font-medium">Console</span>
          <ChevronUp
            className={`ml-auto w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
          />
        </Button>
      </div>
      {isOpen && (
        <div
          className="w-full h-1 bg-muted cursor-row-resize"
          onMouseDown={onDragStart}
          role="separator"
          aria-orientation="horizontal"
          aria-label="Resize console"
        />
      )}

      <div
        className={`w-full bg-background overflow-auto ${isOpen ? `block` : "hidden"}`}
        style={isOpen ? { height: `calc(${heightVh}vh - 40px)` } : undefined}
      >
        <div key={consoleKey}>
          <SandpackConsole />
        </div>
      </div>
    </div>
  )
}
