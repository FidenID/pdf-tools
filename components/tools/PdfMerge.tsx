"use client";
import { useState } from "react";
import { Combine, Loader2, X } from "lucide-react";
import ToolCard from "@/components/ToolCard";
import FileDropzone from "@/components/FileDropzone";

export default function PdfMerge() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const move = (i: number, dir: -1 | 1) => {
    const arr = [...files];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setFiles(arr);
  };

  const merge = async () => {
    setLoading(true); setError("");
    const form = new FormData();
    files.forEach(f => form.append("files", f));
    const res = await fetch("/api/pdf/merge", { method: "POST", body: form });
    if (res.ok) {
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "merged.pdf";
      a.click();
    } else {
      const data = await res.json();
      setError(data.error);
    }
    setLoading(false);
  };

  return (
    <ToolCard title="PDF Merge" description="Combine multiple PDF files into one document" icon={<Combine size={22} />}>
      <FileDropzone onFiles={f => setFiles(p => [...p, ...f])} accept=".pdf" multiple label="Drop PDF files here" />
      {files.length > 0 && (
        <div className="mt-3 space-y-1">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5 text-sm">
              <span className="text-gray-500 w-5 text-center">{i + 1}</span>
              <span className="flex-1 truncate">{f.name}</span>
              <button onClick={() => move(i, -1)} disabled={i === 0} className="text-gray-500 hover:text-white disabled:opacity-20">↑</button>
              <button onClick={() => move(i, 1)} disabled={i === files.length - 1} className="text-gray-500 hover:text-white disabled:opacity-20">↓</button>
              <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-gray-500 hover:text-red-400"><X size={14} /></button>
            </div>
          ))}
        </div>
      )}
      {error && <div className="mt-2 text-red-400 text-sm bg-red-900/20 rounded-lg p-3">{error}</div>}
      <button onClick={merge} disabled={files.length < 2 || loading}
        className="mt-3 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-lg py-2.5 font-medium flex items-center justify-center gap-2">
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Combine size={18} />}
        {loading ? "Merging..." : `Merge ${files.length} PDFs`}
      </button>
    </ToolCard>
  );
}
