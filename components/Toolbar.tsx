// "use client";
// import React from "react";
// import { useProjectStore } from "@/hooks/useProjectStore";
// import { Pencil, Trash, ChevronDown, Folder, File, Plus } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// type TreeNode =
//   | { type: "file"; name: string; path: string }
//   | { type: "folder"; name: string; path: string; children: TreeNode[] };

// function buildTree(files: Record<string, string>): TreeNode[] {
//   const root: TreeNode = { type: "folder", name: "my-app", path: "/", children: [] };

//   Object.keys(files)
//     .sort()
//     .forEach((fullPath) => {
//       const parts = fullPath.split("/").filter(Boolean);
//       let cur: any = root;
//       let acc = "";
//       parts.forEach((part, idx) => {
//         acc += `/${part}`;
//         const isLast = idx === parts.length - 1;
//         if (isLast) {
//           cur.children.push({ type: "file", name: part, path: fullPath });
//         } else {
//           let next = cur.children.find((c: any) => c.type === "folder" && c.name === part);
//           if (!next) {
//             next = { type: "folder", name: part, path: acc, children: [] };
//             cur.children.push(next);
//           }
//           cur = next;
//         }
//       });
//     });

//   return [root];
// }

// function NodeView({
//   node,
//   depth,
//   activeFile,
//   onOpen,
//   onRename,
//   onDelete,
// }: {
//   node: TreeNode;
//   depth: number;
//   activeFile?: string;
//   onOpen?: (p: string) => void;
//   onRename?: (oldP: string, newP: string) => void;
//   onDelete?: (p: string) => void;
// }) {
//   const [open, setOpen] = React.useState(true);

//   if (node.type === "file") {
//     return (
//       <div
//         tabIndex={0}
//         style={{ paddingLeft: depth * 14 }}
//         className={`flex items-center justify-between group px-2 py-1.5 rounded-md text-sm cursor-pointer transition-colors ${
//           activeFile === node.path
//             ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white"
//             : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
//         }`}
//         onClick={() => onOpen && onOpen(node.path)}
//         onKeyDown={(e) => {
//           if (e.key === "Enter") onOpen && onOpen(node.path);
//           if (e.key === "F2") {
//             const newName = prompt("Rename file", node.name);
//             if (newName && onRename) onRename(node.path, node.path.replace(/[^/]+$/, newName));
//           }
//           if (e.key === "Delete") onDelete && onDelete(node.path);
//         }}
//       >
//         <div className="flex items-center gap-2">
//           <File className="w-4 h-4 opacity-70" />
//           <span>{node.name}</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <div
//         style={{ paddingLeft: depth * 12 }}
//         className="flex items-center justify-between px-2 py-1.5 text-sm font-medium text-gray-800 dark:text-gray-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
//         onClick={() => setOpen((s) => !s)}
//       >
//         <div className="flex items-center gap-2">
//           <ChevronDown
//             className={`w-4 h-4 transform transition-transform ${open ? "rotate-0" : "-rotate-90"}`}
//           />
//           <Folder className="w-4 h-4 text-yellow-500" />
//           <span>{node.name}</span>
//         </div>
//       </div>

//       <AnimatePresence>
//         {open && (
//           <motion.div
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: "auto", opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             transition={{ duration: 0.2 }}
//             className="overflow-hidden"
//           >
//             {node.children.map((c, i) => (
//               <NodeView
//                 key={i}
//                 node={c}
//                 depth={depth + 1}
//                 activeFile={activeFile}
//                 onOpen={onOpen}
//                 onRename={onRename}
//                 onDelete={onDelete}
//               />
//             ))}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// export default function Toolbar({
//   activeFile,
//   onOpen,
//   onRename,
//   onDelete,
// }: {
//   activeFile?: string;
//   onOpen?: (path: string) => void;
//   onRename?: (oldP: string, newP: string) => void;
//   onDelete?: (p: string) => void;
// }) {
//   const files = useProjectStore((s) => s.files);
//   const tree = React.useMemo(() => buildTree(files), [files]);

//   return (
//     <div className="border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 h-full flex flex-col min-w-[13rem]">
//       <div className="p-2 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
//         <FilesMenuLabel activeFile={activeFile} onRename={onRename} onDelete={onDelete} />
//         <div className="flex items-center gap-2">
//           <button
//             className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition"
//             onClick={() => {
//               if (!activeFile) return;
//               const newName = prompt("Rename", activeFile.split("/").pop());
//               if (newName && onRename)
//                 onRename(activeFile, activeFile.replace(/[^/]+$/, newName));
//             }}
//           >
//             <Pencil className="w-4 h-4" />
//           </button>
//           <button
//             className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition"
//             onClick={() => {
//               if (!activeFile) return;
//               if (confirm(`Delete ${activeFile}?`)) onDelete && onDelete(activeFile);
//             }}
//           >
//             <Trash className="w-4 h-4" />
//           </button>
//         </div>
//       </div>

//       <div className="flex-1 overflow-auto p-2">
//         {tree.map((n, i) => (
//           <NodeView
//             key={(n as any).path || i}
//             node={n}
//             depth={0}
//             activeFile={activeFile}
//             onOpen={onOpen}
//             onRename={onRename}
//             onDelete={onDelete}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// function FilesMenuLabel({
//   activeFile,
//   onRename,
//   onDelete,
// }: {
//   activeFile?: string;
//   onRename?: (oldP: string, newP: string) => void;
//   onDelete?: (p: string) => void;
// }) {
//   const [open, setOpen] = React.useState(false);
//   const autosave = useProjectStore((s) => s.autosave);
//   const setAutosave = useProjectStore((s) => s.setAutosave);
//   const unsaved = useProjectStore((s) => s.unsaved);
//   const commitUnsaved = useProjectStore((s) => s.commitUnsaved);
//   const hasUnsaved = activeFile ? !!unsaved?.[activeFile] : false;
//   const saveProject = useProjectStore((s) => s.saveProject);
//   const loadProject = useProjectStore((s) => s.loadProject);
//   const listProjects = useProjectStore((s) => s.listProjects);
//   const [projectId, setProjectId] = React.useState("");
//   const [savedList, setSavedList] = React.useState<string[]>([]);

//   React.useEffect(() => {
//     setSavedList(listProjects());
//   }, [open]);

//   return (
//     <div className="relative">
//       <button
//         className="font-semibold text-sm flex items-center gap-1 text-gray-800 dark:text-gray-200 hover:text-blue-600 transition"
//         onClick={() => setOpen((s) => !s)}
//       >
//         Files <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
//       </button>

//       <AnimatePresence>
//         {open && (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95, y: -5 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.95, y: -5 }}
//             transition={{ duration: 0.15 }}
//             className="absolute left-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 z-20 min-w-[260px]"
//           >
//             <label className="flex items-center gap-2 text-sm mb-3">
//               <input
//                 type="checkbox"
//                 checked={!!autosave}
//                 onChange={(e) => setAutosave(e.target.checked)}
//               />
//               <span>Autosave</span>
//             </label>

//             <div className="flex gap-2 mb-2">
//               <button
//                 className={`text-sm px-2 py-1 rounded-md transition ${
//                   hasUnsaved
//                     ? "bg-blue-600 text-white hover:bg-blue-700"
//                     : "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
//                 }`}
//                 onClick={() => activeFile && commitUnsaved(activeFile, true)}
//                 disabled={!hasUnsaved}
//               >
//                 Save File
//               </button>
//             </div>

//             <hr className="border-gray-300 dark:border-gray-700 my-3" />

//             <div className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
//               Save / Load Project
//             </div>
//             <div className="flex gap-2 mb-2">
//               <input
//                 className="flex-1 text-sm p-1 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900"
//                 placeholder="project id"
//                 value={projectId}
//                 onChange={(e) => setProjectId(e.target.value)}
//               />
//               <button
//                 className="text-sm px-3 py-1 rounded-md bg-green-500 text-white hover:bg-green-600"
//                 onClick={() => {
//                   if (!projectId) return alert("Enter a project name");
//                   saveProject(projectId);
//                   try {
//                     useProjectStore.getState().pushProject(projectId, 'rick morty');
//                   } catch (e) {}
//                   setSavedList(listProjects());
//                 }}
//               >
//                 Save
//               </button>
//             </div>

//             <div className="flex gap-2 mb-3">
//               <select
//                 className="flex-1 text-sm p-1 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900"
//                 onChange={(e) => setProjectId(e.target.value)}
//                 value={projectId}
//               >
//                 <option value="">-- select saved --</option>
//                 {savedList.map((id) => (
//                   <option key={id} value={id}>
//                     {id}
//                   </option>
//                 ))}
//               </select>
//               <button
//                 className="text-sm px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
//                 onClick={() => {
//                   if (!projectId) return alert("Select a project id to load");
//                   loadProject(projectId);
//                   setOpen(false);
//                 }}
//               >
//                 Load
//               </button>
//             </div>

//             <div className="flex justify-end">
//               <button
//                 className="text-sm px-3 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
//                 onClick={() => setOpen(false)}
//               >
//                 Close
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

"use client";
import React from "react";
import { useProjectStore } from "@/hooks/useProjectStore";
import { Pencil, Trash, ChevronDown, Folder, File } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

type TreeNode =
  | { type: "file"; name: string; path: string }
  | { type: "folder"; name: string; path: string; children: TreeNode[] };

function buildTree(files: Record<string, string>): TreeNode[] {
  const root: TreeNode = {
    type: "folder",
    name: "my-app",
    path: "/",
    children: [],
  };

  Object.keys(files)
    .sort()
    .forEach((fullPath) => {
      const parts = fullPath.split("/").filter(Boolean);
      let cur: any = root;
      let acc = "";
      parts.forEach((part, idx) => {
        acc += `/${part}`;
        const isLast = idx === parts.length - 1;
        if (isLast) {
          cur.children.push({ type: "file", name: part, path: fullPath });
        } else {
          let next = cur.children.find(
            (c: any) => c.type === "folder" && c.name === part
          );
          if (!next) {
            next = { type: "folder", name: part, path: acc, children: [] };
            cur.children.push(next);
          }
          cur = next;
        }
      });
    });

  function sortChildren(node: TreeNode) {
    if (node.type === "file") return;
    node.children.sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });
    node.children.forEach((c) => {
      if (c.type === "folder") sortChildren(c);
    });
  }

  sortChildren(root);

  return [root];
}

function NodeView({
  node,
  depth,
  activeFile,
  onOpen,
  onRename,
  onDelete,
}: {
  node: TreeNode;
  depth: number;
  activeFile?: string;
  onOpen?: (p: string) => void;
  onRename?: (oldP: string, newP: string) => void;
  onDelete?: (p: string) => void;
}) {
  const [open, setOpen] = React.useState(true);

  if (node.type === "file") {
    return (
      <div
        tabIndex={0}
        style={{ paddingLeft: depth * 14 }}
        className={`flex items-center justify-between group px-2 py-1.5 rounded-md text-sm cursor-pointer transition-colors ${
          activeFile === node.path
            ? "bg-accent text-accent-foreground"
            : "hover:bg-muted text-foreground"
        }`}
        onClick={() => onOpen && onOpen(node.path)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onOpen && onOpen(node.path);
          if (e.key === "F2") {
            const newName = prompt("Rename file", node.name);
            if (newName && onRename)
              onRename(node.path, node.path.replace(/[^/]+$/, newName));
          }
          if (e.key === "Delete") onDelete && onDelete(node.path);
        }}
      >
        <div className="flex items-center gap-2">
          <File className="w-4 h-4 opacity-70" />
          <span>{node.name}</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{ paddingLeft: depth * 12 }}
        className="flex items-center justify-between px-2 py-1.5 text-sm font-medium text-foreground cursor-pointer hover:bg-muted rounded-md transition-colors"
        onClick={() => setOpen((s) => !s)}
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            className={`w-4 h-4 transform transition-transform ${
              open ? "rotate-0" : "-rotate-90"
            }`}
          />
          <Folder className="w-4 h-4 text-yellow-500" />
          <span>{node.name}</span>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {node.children.map((c, i) => (
              <NodeView
                key={i}
                node={c}
                depth={depth + 1}
                activeFile={activeFile}
                onOpen={onOpen}
                onRename={onRename}
                onDelete={onDelete}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Toolbar({
  activeFile,
  onOpen,
  onRename,
  onDelete,
}: {
  activeFile?: string;
  onOpen?: (path: string) => void;
  onRename?: (oldP: string, newP: string) => void;
  onDelete?: (p: string) => void;
}) {
  const files = useProjectStore((s) => s.files);
  const tree = React.useMemo(() => buildTree(files), [files]);

  return (
    <div className="border-r border-border bg-background h-full flex flex-col min-w-[13rem]">
      <div className="p-2 border-b border-border flex items-center justify-between">
        <FilesMenuLabel
          activeFile={activeFile}
          onRename={onRename}
          onDelete={onDelete}
          onOpen={onOpen}
        />
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (!activeFile) return;
              const newName = prompt("Rename", activeFile.split("/").pop());
              if (newName && onRename)
                onRename(activeFile, activeFile.replace(/[^/]+$/, newName));
            }}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (!activeFile) return;
              if (confirm(`Delete ${activeFile}?`))
                onDelete && onDelete(activeFile);
            }}
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {tree.map((n, i) => (
          <NodeView
            key={(n as any).path || i}
            node={n}
            depth={0}
            activeFile={activeFile}
            onOpen={onOpen}
            onRename={onRename}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

function FilesMenuLabel({
  activeFile,
  onRename,
  onDelete,
  onOpen,
}: {
  activeFile?: string;
  onRename?: (oldP: string, newP: string) => void;
  onDelete?: (p: string) => void;
  onOpen?: (p: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const autosave = useProjectStore((s) => s.autosave);
  const setAutosave = useProjectStore((s) => s.setAutosave);
  const unsaved = useProjectStore((s) => s.unsaved);
  const commitUnsaved = useProjectStore((s) => s.commitUnsaved);
  const hasUnsaved = activeFile ? !!unsaved?.[activeFile] : false;
  const saveProject = useProjectStore((s) => s.saveProject);
  const loadProject = useProjectStore((s) => s.loadProject);
  const listProjects = useProjectStore((s) => s.listProjects);
  const files = useProjectStore((s) => s.files);
  const [projectId, setProjectId] = React.useState("");
  const [savedList, setSavedList] = React.useState<string[]>([]);

  React.useEffect(() => {
    setSavedList(listProjects());
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="font-semibold">
          Files{" "}
          <ChevronDown
            className={`w-4 h-4 ml-1 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="start">
        <div className="flex items-center gap-2 mb-4">
          <Checkbox
            id="autosave"
            checked={!!autosave}
            onCheckedChange={(checked) => setAutosave(!!checked)}
          />
          <label
            htmlFor="autosave"
            className="text-sm font-medium cursor-pointer"
          >
            Autosave
          </label>
        </div>

        <Button
          size="sm"
          variant={hasUnsaved ? "default" : "secondary"}
          disabled={!hasUnsaved}
          onClick={() => activeFile && commitUnsaved(activeFile, true)}
          className="w-full"
        >
          Save File
        </Button>

        <Separator className="my-4" />

        <div className="space-y-3">
          <div className="text-sm font-medium">Save / Load Project</div>

          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const raw = prompt("New file name (e.g. /src/newFile.js)");
                  if (!raw) return;
                  const name = normalizePath(raw);
                  if (!isValidFilePath(name)) return alert("Invalid file path");
                  const finalName = ensureHasExtension(name);
                  if (files[finalName]) {
                    if (!confirm(`${finalName} already exists. Overwrite?`)) return;
                  }
                  useProjectStore.getState().setFile(finalName, "");
                  onOpen && onOpen(finalName);
                }}
              >
                + File
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const raw = prompt("New folder name (e.g. /src/components)");
                  if (!raw) return;
                  const folder = normalizePath(raw).replace(/\/$/, "");
                  if (!folder || folder === "/") return alert("Invalid folder name");
                  const idx = `${folder}/index.js`;
                  if (files[idx]) {
                    onOpen && onOpen(idx);
                    return;
                  }
                  useProjectStore.getState().setFile(idx, "export default function() { return null }");
                  onOpen && onOpen(idx);
                }}
              >
                + Folder
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="-- select saved --" />
              </SelectTrigger>
              <SelectContent>
                {savedList.map((id) => (
                  <SelectItem key={id} value={id}>
                    {id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                if (!projectId) return alert("Select a project id to load");
                loadProject(projectId);
                setOpen(false);
              }}
            >
              Load
            </Button>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function normalizePath(p: string) {
  let t = p.trim();
  if (!t.startsWith("/")) t = "/" + t;
  t = t.replace(/\/+/g, "/");
  return t;
}

function isValidFilePath(p: string) {
  if (!p || !p.startsWith("/")) return false;
  const parts = p.split("/").filter(Boolean);
  if (parts.length === 0) return false;
  const illegal = /[<>:"|?*\\]/;
  return parts.every((seg) => !illegal.test(seg));
}

function ensureHasExtension(p: string) {
  const parts = p.split("/");
  const last = parts[parts.length - 1] || "";
  if (last.includes(".")) return p;
  return p.replace(/\/$/, "") + ".js";
}
