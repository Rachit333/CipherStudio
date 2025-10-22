"use client"
import React, { useRef, useState, useEffect } from "react"
import type ReactType from "react"

import CodeEditor from "@/components/CodeEditor"
import LivePreview from "@/components/LivePreview"
import Toolbar from "@/components/Toolbar"
import { useProjectStore } from "@/hooks/useProjectStore"
import { X, Sun, MoonStar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/ThemeProvider"
import { useSearchParams } from "next/navigation"

const FILES = [
  { name: "App.js", path: "/App.js" },
  { name: "index.js", path: "/index.js" },
  { name: "utils.js", path: "/utils.js" },
]

const FILE_CONTENTS: Record<string, string> = {
  "/App.js": `export default function App() {
  console.log("Hello CipherStudio!");
  return <h1>Hello CipherStudio 👋</h1>;
}`,
  "/index.js": `import ReactDOM from "react-dom/client";
import App from "./App";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);`,
  "/utils.js": `export function greet(name) {
  return "Hello " + name;
}`,
}

export default function StudioClient() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const draggingRef = useRef(false)
  const [leftPct, setLeftPct] = useState(20)
  const [editorPct, setEditorPct] = useState(50)
  const [activeFile, setActiveFile] = useState<string>("")
  const files = useProjectStore((s) => s.files)
  const setFile = useProjectStore((s) => s.setFile)
  const autosave = useProjectStore((s) => s.autosave)
  const unsaved = useProjectStore((s) => s.unsaved)
  const commitUnsaved = useProjectStore((s) => s.commitUnsaved)
  const discardUnsaved = useProjectStore((s) => s.discardUnsaved)
  const [openTabs, setOpenTabs] = useState<string[]>([])

  useEffect(() => {
    if (activeFile) return
    const preferred = "/src/App.js"
    if (files[preferred]) {
      setActiveFile(preferred)
      setOpenTabs([preferred])
    } else {
      const first = Object.keys(files)[0]
      if (first) {
        setActiveFile(first)
        setOpenTabs([first])
      }
    }
  }, [files, activeFile])

  const search = useSearchParams();
  useEffect(() => {
    const projectId = search.get("project")
    if (!projectId) return
    try {
      const loaded = useProjectStore.getState().loadProject(projectId)
      if (loaded) {
        useProjectStore.getState().saveProject(projectId)
        // allow effect above to pick activeFile from files
      }
    } catch (err) {
      console.error("Failed to load project", projectId, err)
    }
  }, [search])

  function TabBar({
    openTabs,
    active,
    onSelect,
    onClose,
  }: {
    openTabs: string[]
    active?: string
    onSelect: (p: string) => void
    onClose: (p: string) => void
  }) {
    const { theme, toggleTheme } = useTheme();
    return (
      <div className="flex items-center border-b border-border bg-background px-2 py-3">
        <div className="flex-1 flex items-center">
          {openTabs.map((p) => {
          const name = p.split("/").pop() || p
          const hasUnsaved = !!unsaved?.[p]
          return (
            <div
              key={p}
              className={`flex items-center mr-2 p-2 rounded transition-colors ${
                active === p ? "bg-accent text-accent-foreground" : "hover:bg-muted text-foreground"
              }`}
            >
              <Button
                variant="ghost"
                size="sm"
                className="mr-2 h-auto p-0 text-sm font-normal  "
                onClick={() => onSelect(p)}
              >
                {name}
                {hasUnsaved ? <span className="ml-1 text-yellow-500">•</span> : null}
              </Button>
              {openTabs.length > 1 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => onClose(p)}
                >
                  <X className="stroke-2.5 h-4 w-4" />
                </Button>
              ) : null}
            </div>
          )
          })}
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={() => toggleTheme()}>
            {theme === "dark" ? <Sun /> : <MoonStar />}
          </Button>
        </div>
      </div>
    )
  }

  function onMouseDownSplit(e: ReactType.MouseEvent) {
    draggingRef.current = true

    function onMove(ev: MouseEvent) {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      let pct = ((ev.clientX - rect.left) / rect.width) * 100
      const minExplorer = 10
      const maxExplorer = 40
      pct = Math.max(minExplorer, Math.min(maxExplorer, pct))
      setEditorPct(((pct - leftPct) / (100 - leftPct)) * 100 + (leftPct / (100 - leftPct)) * 0)
    }

    function onUp() {
      draggingRef.current = false
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
    }

    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
  }

  return (
    <main className="h-screen flex flex-col bg-background text-foreground">
      <div className="flex-1" ref={containerRef}>
        <div className="h-full flex" style={{ userSelect: draggingRef.current ? "none" : "auto" }}>
          <Toolbar
            activeFile={activeFile}
            onOpen={(p: string) => {
              setActiveFile(p)
              setOpenTabs((tabs) => (tabs.includes(p) ? tabs : [...tabs, p]))
              if (!files[p]) {
                const content = FILE_CONTENTS[p] ?? ""
                if (content) setFile(p, content)
              }
            }}
            onRename={(oldP: string, newP: string) => {
              useProjectStore.getState().renameFile(oldP, newP)
              if (activeFile === oldP) setActiveFile(newP)
            }}
            onDelete={(p: string) => {
              useProjectStore.getState().deleteFile(p)
              if (activeFile === p) setActiveFile("")
            }}
          />
          <div className="flex-1 flex flex-col">
            <TabBar
              openTabs={openTabs}
              active={activeFile}
              onSelect={(p) => setActiveFile(p)}
              onClose={(p) => {
                const hasUnsaved = !!unsaved?.[p]
                if (!autosave && hasUnsaved) {
                  if (!confirm(`Discard unsaved changes to ${p}?`)) return
                  discardUnsaved(p)
                } else if (autosave && hasUnsaved) {
                  commitUnsaved(p)
                }
                setOpenTabs((t) => t.filter((x) => x !== p))
                if (activeFile === p)
                  setActiveFile((t) => {
                    const next = openTabs.find((x) => x !== p)
                    return next ?? ""
                  })
              }}
            />

            <div className="flex-1 h-full flex" style={{ userSelect: draggingRef.current ? "none" : "auto" }}>
              <div className="flex flex-col" style={{ width: `calc(50% - ${leftPct / 2}%)` }}>
                <div className="border-r border-border h-full">
                  <CodeEditor selectedPath={activeFile ?? undefined} />
                </div>
              </div>
              <div
                className="w-1 bg-border cursor-col-resize hover:bg-accent transition-colors"
                onMouseDown={onMouseDownSplit}
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize editor"
              />
              <div className="flex-1">
                <LivePreview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
