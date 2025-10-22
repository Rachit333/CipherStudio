import { create } from "zustand";
import { getIdToken, getAuthInstance } from "@/lib/firebaseClient";

type FileMap = Record<string, string>;

interface FileState {
  files: FileMap;
  currentProjectId?: string;
  setFile: (path: string, content: string) => void;
  deleteFile: (path: string) => void;
  renameFile: (oldPath: string, newPath: string) => void;
  autosave: boolean;
  setAutosave: (v: boolean) => void;
  unsaved: FileMap;
  setUnsaved: (path: string, content: string) => void;
  commitUnsaved: (path: string, pushToRedis?: boolean) => void;
  discardUnsaved: (path: string) => void;
  saveProject: (projectId: string) => void;
  pushProject: (projectId?: string, owner?: string) => void;
  loadProject: (projectId: string) => boolean;
  listProjects: () => string[];
}

export const useProjectStore = create<FileState>((set) => {
  const tag = "useProjectStore";
  const d = (...args: any[]) => {
    try {
      console.debug(tag, new Date().toISOString(), ...args);
    } catch {}
  };

  const i = (...args: any[]) => {
    try {
      console.info(tag, new Date().toISOString(), ...args);
    } catch {}
  };

  const e = (...args: any[]) => {
    try {
      console.error(tag, new Date().toISOString(), ...args);
    } catch {}
  };

  const safeSetLocal = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
      d("localStorage.setItem OK", key, value?.slice?.(0, 120));
    } catch (err) {
      e("localStorage.setItem ERROR", key, String(err));
    }
  };

  const pushToServer = async (payload: any) => {
    try {
      d("attempting to get ID token for push");
      const token = await getIdToken();
      if (!token) {
        i("no ID token available; skipping authenticated push", payload.projectId);
        return;
      }
      d("ID token available (not logged to avoid leaking)");
      const resp = await fetch("/api/upstash/push", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...payload, savedAt: new Date().toISOString() }),
      });
      const text = await resp.text();
      if (!resp.ok) {
        e("push failed", { status: resp.status, statusText: resp.statusText, body: text, payload });
      } else {
        i("push succeeded", { status: resp.status, body: text, projectId: payload.projectId });
      }
    } catch (err) {
      e("pushToServer ERROR", String(err));
    }
  };

  return ({
    files: {
      "/src/App.js": `export default function App() {
  return <h1>Hello CipherStudio 👋</h1>;
}`,
      "/src/index.js": `import ReactDOM from "react-dom/client";
import App from "./App";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);`,
      "/src/index.css": `body { font-family: Arial, Helvetica, sans-serif; }`,
      "/public/index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CipherStudio App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
      "/package.json": `{
  "name": "my-app",
  "private": true,
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}`,
    },
    autosave: true,
    unsaved: {},
    currentProjectId: undefined,
    setFile: (path: string, content: string) =>
      set((s) => {
        let p = (path || "").trim();
        if (!p.startsWith("/")) p = "/" + p;
        p = p.replace(/\/+/g, "/");
        if (p === "/" || p.length < 2) {
          e("setFile invalid path", path);
          return s;
        }

        const nextFiles = { ...s.files, [p]: content };
        try {
          const key = `cipherstudio:file:${encodeURIComponent(p)}`;
          safeSetLocal(key, content);
        } catch (err) {
          e("setFile localStorage error", p, String(err));
        }
        try {
          if (s.autosave) {
            const projectId = s.currentProjectId;
            const auth = getAuthInstance();
            const owner = auth.currentUser?.displayName || auth.currentUser?.email || auth.currentUser?.uid;
            const payload = { files: { ...nextFiles }, projectId, owner };
            d("autosave enabled; queuing push", projectId, owner);
            void pushToServer(payload);
          }
        } catch (err) {
          e("setFile autosave push error", String(err));
        }
        return { files: nextFiles };
      }),
    deleteFile: (path: string) =>
      set((s) => {
        const copy = { ...s.files };
        delete copy[path];
        d("deleteFile", path);
        return { files: copy };
      }),
    renameFile: (oldPath: string, newPath: string) =>
      set((s) => {
        const copy = { ...s.files };
        copy[newPath] = copy[oldPath] ?? "";
        delete copy[oldPath];
        d("renameFile", oldPath, newPath);
        return { files: copy };
      }),
    setAutosave: (v: boolean) =>
      set((s) => {
        try {
          if (v) {
            const payload = { key: s.currentProjectId, value: s.files };
            d("enabling autosave; triggering initial push attempt", payload);
            void pushToServer({ files: s.files, projectId: s.currentProjectId, owner: undefined });
          }
        } catch (err) {
          e("setAutosave error", String(err));
        }
        return { autosave: v };
      }),
    setUnsaved: (path: string, content: string) =>
      set((s) => {
        const next = { ...(s.unsaved || {}), [path]: content };
        try {
          const key = `cipherstudio:file:${encodeURIComponent(path)}`;
          safeSetLocal(key, content);
        } catch (err) {
          e("setUnsaved localStorage error", path, String(err));
        }
        d("setUnsaved", path);
        return { unsaved: next };
      }),
    commitUnsaved: (path: string, pushToRedis?: boolean) =>
      set((s) => {
        const copyFiles = { ...s.files };
        const copyUnsaved = { ...(s.unsaved || {}) };
        if (copyUnsaved[path] !== undefined) {
          let toWrite = copyUnsaved[path];
          const ext = path.split(".").pop()?.toLowerCase();
          if (ext === "js" || ext === "jsx" || ext === "ts" || ext === "tsx") {
            toWrite = toWrite.replace(/^\s*\/\/\s*(<[^>]+>\s*|<[^>]+\/>\s*)$/gm, (m: string, g1: string) => {
              return `{/* ${g1.trim()} */}`;
            });
          }
          copyFiles[path] = toWrite;
          try {
            const key = `cipherstudio:file:${encodeURIComponent(path)}`;
            safeSetLocal(key, toWrite);
          } catch (err) {
            e("commitUnsaved localStorage error", path, String(err));
          }
          delete copyUnsaved[path];
          try {
            if (s.autosave || pushToRedis) {
              const projectId = s.currentProjectId;
              const fullProject = { ...copyFiles };
              fullProject[path] = toWrite;
              const auth = getAuthInstance();
              const owner = auth.currentUser?.displayName || auth.currentUser?.email || auth.currentUser?.uid;
              d("commitUnsaved will push", { projectId, owner, path });
              void pushToServer({ files: fullProject, projectId, owner });
            }
          } catch (err) {
            e("commitUnsaved push error", String(err));
          }
          return { files: copyFiles, unsaved: copyUnsaved };
        }
        return s;
      }),
    discardUnsaved: (path: string) =>
      set((s) => {
        const copyUnsaved = { ...(s.unsaved || {}) };
        if (copyUnsaved[path] !== undefined) {
          delete copyUnsaved[path];
          d("discardUnsaved", path);
          return { unsaved: copyUnsaved };
        }
        return s;
      }),
    saveProject: (projectId: string) =>
      set((s) => {
        try {
          if (!projectId) throw new Error("projectId required");
          const key = `cipherstudio:project:${projectId}`;
          const payload = { files: s.files, autosave: s.autosave, unsaved: s.unsaved, savedAt: new Date().toISOString() };
          safeSetLocal(key, JSON.stringify(payload));
          s.currentProjectId = projectId;
          i("saveProject ok", projectId);
        } catch (err) {
          e("saveProject error", String(err));
        }
        return s;
      }),
    pushProject: (projectId?: string, owner?: string) =>
      set((s) => {
        try {
          const pid = projectId || s.currentProjectId;
          const finalOwner = owner || 'rick morty';
          Object.entries(s.files).forEach(([p, content]) => {
            try {
              const key = `cipherstudio:file:${encodeURIComponent(p)}`;
              safeSetLocal(key, content);
            } catch (err) {
              e("pushProject local persist error", p, String(err));
            }
          });
          const auth = getAuthInstance();
          const ownerToSend = auth.currentUser?.displayName || auth.currentUser?.email || auth.currentUser?.uid || finalOwner;
          d("pushProject preparing payload", { pid, ownerToSend });
          void pushToServer({ files: s.files, projectId: pid, owner: ownerToSend });
        } catch (err) {
          e("pushProject error", String(err));
        }
        return s;
      }),
    loadProject: (projectId: string) =>
      set((s) => {
        try {
          if (!projectId) return s;
          const localKey = `cipherstudio:project:${projectId}`;
          const rawLocal = localStorage.getItem(localKey);
          let localParsed: any = null;
          if (rawLocal) {
            try {
              localParsed = JSON.parse(rawLocal);
            } catch {}
          }
          (async () => {
            try {
              const resp = await fetch(`/api/upstash/push?key=project:${encodeURIComponent(projectId)}`);
              if (resp.ok) {
                const json = await resp.json();
                const remote = json?.value ?? null;
                if (remote && remote.files) {
                  const remoteSaved = remote.savedAt || remote.payload?.savedAt || remote.savedAt;
                  const localSaved = localParsed?.savedAt;
                  if (!localSaved && remoteSaved) {
                    safeSetLocal(localKey, JSON.stringify(remote));
                    set({ files: remote.files, autosave: s.autosave, unsaved: {} });
                    i("loadProject: remote newer, loaded remote", projectId, remoteSaved);
                    return;
                  }
                  if (localSaved && remoteSaved) {
                    const localTime = new Date(localSaved).getTime();
                    const remoteTime = new Date(remoteSaved).getTime();
                    if (remoteTime > localTime) {
                      safeSetLocal(localKey, JSON.stringify(remote));
                      set({ files: remote.files, autosave: s.autosave, unsaved: {} });
                      i("loadProject: remote newer, synced remote", projectId);
                      return;
                    } else if (localTime > remoteTime) {
                      d("loadProject: local newer, pushing to remote", projectId);
                      await pushToServer({ files: s.files, projectId, owner: undefined });
                      return;
                    }
                  }
                }
              }
            } catch (err) {
              e("loadProject remote fetch error", String(err));
            }
          })();

          if (localParsed) {
            const files = localParsed.files ?? s.files;
            const autosave = localParsed.autosave ?? s.autosave;
            const unsaved = localParsed.unsaved ?? {};
            i("loadProject ok (local)", projectId);
            return { files, autosave, unsaved } as any;
          }

          return s;
        } catch (err) {
          e("loadProject error", String(err));
          return s;
        }
      }) as any,
    listProjects: () => {
      try {
        const res: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i) as string;
          if (key?.startsWith("cipherstudio:project:")) {
            res.push(key.replace("cipherstudio:project:", ""));
          }
        }
        d("listProjects", res.length);
        return res;
      } catch (err) {
        e("listProjects error", String(err));
        return [];
      }
    },
  });
});
