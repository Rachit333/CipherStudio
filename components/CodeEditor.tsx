"use client";
import Editor from "@monaco-editor/react";
import { useProjectStore } from "@/hooks/useProjectStore";
import { useCallback, useRef } from "react";

export default function CodeEditor() {
  const { code, setCode } = useProjectStore();
  const timeoutRef = useRef<number | null>(null);
  const fixJsxComments = useCallback((src: string) => {
    return src.replace(/^\s*\/\/\s*(<[^>]+>\s*|<[^>]+\/>\s*)$/gm, (m, g1) => {
      return `{/* ${g1.trim()} */}`;
    });
  }, []);

  function handleChange(value: string | undefined) {
    const next = value || "";
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      const fixed = fixJsxComments(next);
      setCode(fixed);
    }, 250) as unknown as number;
  }

  return (
    <Editor
      height="100%"
      defaultLanguage="javascript"
      theme="vs-dark"
      value={code}
      onChange={handleChange}
    />
  );
}
