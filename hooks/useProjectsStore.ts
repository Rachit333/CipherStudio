import { create } from "zustand";

type ProjectMeta = {
  id: string;
  name: string;
  description?: string;
  status?: string;
  createdAt: string;
  savedAt?: string;
};

type ProjectsState = {
  projects: ProjectMeta[];
  addProject: (p: { name: string; description?: string; status?: string }) => ProjectMeta;
  deleteProject: (id: string) => void;
  getProject: (id: string) => ProjectMeta | undefined;
  refresh: () => void;
};

const INDEX_KEY = "cipherstudio:projects";

function readIndex(): ProjectMeta[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as ProjectMeta[];
  } catch (e) {}
  return [];
}

function writeIndex(idx: ProjectMeta[]) {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(idx));
  } catch (e) {}
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  addProject: ({ name, description, status }) => {
    const existing = get().projects;
    const idBase = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "project";
    let id = idBase;
    let counter = 1;
    while (existing.find((p) => p.id === id)) {
      id = `${idBase}-${counter++}`;
    }

    const meta: ProjectMeta = {
      id,
      name,
      description,
      status: status || "active",
      createdAt: new Date().toISOString(),
      savedAt: new Date().toISOString(),
    };

    const next = [...existing, meta];
    writeIndex(next);

    try {
      const projectKey = `cipherstudio:project:${id}`;
      const defaultPayload = {
        files: {
          "/src/App.js": `export default function App() {\n  return <h1>Hello CipherStudio 👋</h1>;\n}`,
          "/src/index.js": `import ReactDOM from \"react-dom/client\";\nimport App from \"./App\";\nconst root = ReactDOM.createRoot(document.getElementById(\"root\"));\nroot.render(<App />);`,
          "/src/index.css": `body { font-family: Arial, Helvetica, sans-serif; }`,
          "/public/index.html": `<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>CipherStudio App</title>\n  </head>\n  <body>\n    <div id=\"root\"></div>\n  </body>\n</html>`,
          "/package.json": `{\n  "name": "my-app",\n  "private": true,\n  "dependencies": {\n    "react": "^18.0.0",\n    "react-dom": "^18.0.0"\n  }\n}`,
        },
        autosave: false,
        unsaved: {},
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(projectKey, JSON.stringify(defaultPayload));
    } catch (e) {}

    set({ projects: next });
    return meta;
  },
  deleteProject: (id: string) => {
    const next = get().projects.filter((p) => p.id !== id);
    writeIndex(next);
    try {
      localStorage.removeItem(`cipherstudio:project:${id}`);
    } catch (e) {}
    set({ projects: next });
  },
  getProject: (id: string) => {
    return get().projects.find((p) => p.id === id);
  },
  refresh: () => {
    const idx = readIndex();
    set({ projects: idx });
  },
}));

try {
  const initial = readIndex();
  useProjectsStore.setState({ projects: initial });
} catch (e) {}

export default useProjectsStore;
