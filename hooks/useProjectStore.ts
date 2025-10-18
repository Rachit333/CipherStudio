import { create } from "zustand";

interface FileState {
  code: string;
  setCode: (value: string) => void;
}

export const useProjectStore = create<FileState>((set) => ({
  code: `export default function App() {
  return <h1>Hello CipherStudio 👋</h1>;
}`,
  setCode: (value) => set({ code: value }),
}));
