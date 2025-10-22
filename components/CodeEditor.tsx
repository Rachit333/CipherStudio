"use client";
import Editor from "@monaco-editor/react";
import { useProjectStore } from "@/hooks/useProjectStore";
import { useCallback, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";

export default function CodeEditor({ selectedPath }: { selectedPath?: string }) {
  const files = useProjectStore((s) => s.files);
  const unsaved = useProjectStore((s) => s.unsaved);
  const setFile = useProjectStore((s) => s.setFile);
  const autosave = useProjectStore((s) => s.autosave);
  const setUnsaved = useProjectStore((s) => s.setUnsaved);
  const { theme } = useTheme();
  const code = selectedPath
    ? (unsaved && unsaved[selectedPath]) ?? files[selectedPath] ?? ""
    : files[Object.keys(files)[0]];
  const timeoutRef = useRef<number | null>(null);

  const isJsxLike = useCallback((path?: string) => {
    const ext = path?.split(".").pop()?.toLowerCase();
    return ext === "js" || ext === "jsx" || ext === "ts" || ext === "tsx";
  }, []);
  const fixJsxComments = useCallback((src: string) => {
    return src.replace(/^\s*\/\/\s*(<[^>]+>\s*|<[^>]+\/>\s*)$/gm, (m, g1) => {
      return `{/* ${g1.trim()} */}`;
    });
  }, []);

  function handleChange(value: string | undefined) {
    const next = value || "";

    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      const contentToStore = isJsxLike(selectedPath) ? fixJsxComments(next) : next;
      if (!selectedPath) return;
      if (autosave) {
        setFile(selectedPath, contentToStore);
      } else {
        setUnsaved(selectedPath, contentToStore);
      }
    }, 250) as unknown as number;
  }

  return (
    <Editor
      key={selectedPath ?? "global-editor"}
      height="100%"
      language={getLanguageFromPath(selectedPath)}
      theme={theme === "dark" ? "vs-dark" : "light"}
      value={code}
      onChange={handleChange}
    />
  );
}

function getLanguageFromPath(path?: string) {
  if (!path) return "javascript";
  const ext = path.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js":
      return "javascript";
    case "jsx":
      return "javascript";
    case "ts":
      return "typescript";
    case "tsx":
      return "typescript";
    case "css":
      return "css";
    case "html":
      return "html";
    case "json":
      return "json";
    case "md":
    case "markdown":
      return "markdown";
    default:
      return "javascript";
  }
}
