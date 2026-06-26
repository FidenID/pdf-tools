"use client";
import { useState } from "react";
import { Scissors, Loader2 } from "lucide-react";
import ToolCard from "@/components/ToolCard";
import FileDropzone from "@/components/FileDropzone";

export default function PdfSplit() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"all" | "range">("all");
  const [range, setRange] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const split = async () => {
    if (!file) return;
    setLoading(true); setError("");
    const form = new FormData();
    form.append("file", file);
    form.append("mode", mode);
    if (mode === "range") form.append("range", range);
    const res = await fetch("/api/pdf/split", { method: "POST", body: form });
    if (res.ok) {
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      const cd = res.headers.get("Content-Disposition") || "";
      const nameMatch = cd.match(/filename="([^"]+)"/);
      a.download = nameMatch?.[1] || "split.zip";
      a.click();
    } else {
      const data = await res.json();
      setError(data.error);
    }
    setLoading(false);
  };

  return (
    <ToolCard title="PDF Split" description="Extract pages or split a PDF into individual files" icon={<Scissors size={22} />}>
      <FileDropzone onFiles={f => setFile(f[0])} accept=".pdf" label="Drop PDF here" />
      {file && <div className="mt-2 text-sm text-gray-400">{file.name}</div>}
      <div className="flex gap-2 mt-4">
        {(["all", "range"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-lg text-sm capitalize transition-colors ${
              mode === m ? "bg-blue-600" : "bg-gray-800 hover:bg-gray-700"
            }`}>{m === "all" ? "All Pages" : "Custom Range"}</button>
        ))}
      </div>
      {mode === "range" && (
        <div className="mt-3">
          <label className="text-sm text-gray-400 block mb-1">Page Range (e.g. 1-3,5,7-9)</label>
          <input value={range} onChange={e => setRange(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            placeholder="1-3,5,7-9" />
        </div>
      )}
      {error && <div className="mt-2 text-red-400 text-sm bg-red-900/20 rounded-lg p-3">{error}</div>}
      <button onClick={split} disabled={!file || loading || (mode === "range" && !range)}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-lg py-2.5 font-medium flex items-center justify-center gap-2">
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Scissors size={18} />}
        {loading ? "Splitting..." : "Split PDF"}
      </button>
    </ToolCard>
  );
}
