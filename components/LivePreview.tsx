"use client";
import { SandpackProvider, SandpackLayout, SandpackPreview } from "@codesandbox/sandpack-react";
import { useProjectStore } from "@/hooks/useProjectStore";
import ConsolePanel from "./ConsolePanel";

export default function LivePreview() {
  const { code } = useProjectStore();

  return (
    <SandpackProvider
      template="react"
      files={{
        "/App.js": code,
        "/index.js": `import ReactDOM from "react-dom/client";
import App from "./App";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);`,
      }}
    >
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

