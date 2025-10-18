import StudioPage from "@/app/studio/page";

export default function HomePage() {
  return (
    <main className="h-screen flex flex-col">
      <div className="p-2 border-b border-gray-800 text-xl font-semibold">
        CipherStudio
      </div>
      <div className="flex-1">
        <StudioPage />
      </div>
    </main>
  );
}
