"use client";
import { SandpackProvider, SandpackLayout, SandpackPreview } from "@codesandbox/sandpack-react";
import { useProjectStore } from "@/hooks/useProjectStore";
import ConsolePanel from "./ConsolePanel";

export default function LivePreview() {
  const files = useProjectStore((s) => s.files);
  const unsaved = useProjectStore((s) => s.unsaved);
  const sandpackFiles: Record<string, string> = {};
  Object.entries(files).forEach(([p, content]) => {
    const effective = (unsaved && unsaved[p]) ?? content;
    if (p.startsWith("/src/")) {
      const target = `/${p.slice("/src/".length)}`;
      sandpackFiles[target] = effective;
    } else {
      sandpackFiles[p] = effective;
    }
  });
  if (unsaved) {
    Object.entries(unsaved).forEach(([p, content]) => {
      if (files[p] !== undefined) return; 
      const effective = content;
      if (p.startsWith("/src/")) {
        const target = `/${p.slice("/src/".length)}`;
        sandpackFiles[target] = effective;
      } else {
        sandpackFiles[p] = effective;
      }
    });
  }

  if (!sandpackFiles["/index.js"]) {
    sandpackFiles["/index.js"] = `import ReactDOM from \"react-dom/client\";\nimport App from \"./App\";\nconst root = ReactDOM.createRoot(document.getElementById(\"root\"));\nroot.render(<App />);`;
  }

  if (!sandpackFiles["/App.js"]) {
    sandpackFiles["/App.js"] = `export default function App(){ return null }`;
  }
  const keyParts = Object.entries(sandpackFiles).map(([k, v]) => `${k}:${v?.length ?? 0}`).sort().join("|");
  console.log("LivePreview sandpackFiles", Object.keys(sandpackFiles), keyParts);

  return (
    <SandpackProvider key={keyParts} template="react" files={sandpackFiles}>
      <SandpackLayout>
        <div className="live-preview w-full h-screen flex flex-col">
          <div className="preview-area w-full flex-1 min-h-0">
            <SandpackPreview
              className="w-full h-full"
              showNavigator
              showOpenInCodeSandbox={false}
            />
          </div>
          <ConsolePanel />
        </div>
      </SandpackLayout>
    </SandpackProvider>
  );
}

