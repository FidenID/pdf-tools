"use client";
import { useState } from "react";
import { Minimize2, Loader2 } from "lucide-react";
import ToolCard from "@/components/ToolCard";
import FileDropzone from "@/components/FileDropzone";

const QUALITIES = [
  { value: "screen", label: "Screen (72 dpi)", desc: "Smallest size" },
  { value: "ebook", label: "eBook (150 dpi)", desc: "Good balance" },
  { value: "printer", label: "Printer (300 dpi)", desc: "High quality" },
  { value: "prepress", label: "Prepress (300 dpi)", desc: "Best quality" },
];

function fmt(n: number) { return n < 1024 * 1024 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1024 / 1024).toFixed(2)} MB`; }

export default function PdfCompress() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState("ebook");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ url: string; original: number; compressed: number } | null>(null);
  const [error, setError] = useState("");

  const compress = async () => {
    if (!file) return;
    setLoading(true); setError(""); setResult(null);
    const form = new FormData();
    form.append("file", file);
    form.append("quality", quality);
    const res = await fetch("/api/pdf/compress", { method: "POST", body: form });
    if (res.ok) {
      const blob = await res.blob();
      setResult({
        url: URL.createObjectURL(blob),
        original: parseInt(res.headers.get("X-Original-Size") || "0"),
        compressed: parseInt(res.headers.get("X-Compressed-Size") || String(blob.size)),
      });
    } else {
      const data = await res.json();
      setError(data.error + (data.hint ? ` → ${data.hint}` : ""));
    }
    setLoading(false);
  };

  return (
    <ToolCard title="PDF Compress" description="Reduce PDF file size with quality presets" icon={<Minimize2 size={22} />}>
      <FileDropzone onFiles={f => setFile(f[0])} accept=".pdf" label="Drop PDF here" />
      {file && <div className="mt-2 text-sm text-gray-400">{file.name}</div>}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {QUALITIES.map(q => (
          <button key={q.value} onClick={() => setQuality(q.value)}
            className={`p-3 rounded-lg text-left transition-colors border ${
              quality === q.value ? "border-blue-500 bg-blue-900/20" : "border-gray-700 hover:border-gray-500"
            }`}>
            <div className="text-sm font-medium">{q.label}</div>
            <div className="text-xs text-gray-500">{q.desc}</div>
          </button>
        ))}
      </div>
      {error && <div className="mt-3 text-red-400 text-sm bg-red-900/20 rounded-lg p-3">{error}</div>}
      {result && (
        <div className="mt-3 bg-green-900/20 rounded-lg p-3 text-sm">
          <div className="text-green-400 font-medium">Compressed!</div>
          <div className="text-gray-400">
            {fmt(result.original)} → {fmt(result.compressed)}{" "}
            {result.original > 0 && <span className="text-green-400">({Math.round((1 - result.compressed / result.original) * 100)}% smaller)</span>}
          </div>
          <a href={result.url} download={file?.name.replace(".pdf", "_compressed.pdf")}
            className="mt-2 block text-center bg-green-600 hover:bg-green-500 rounded-lg py-2 font-medium">
            Download
          </a>
        </div>
      )}
      {!result && (
        <button onClick={compress} disabled={!file || loading}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-lg py-2.5 font-medium flex items-center justify-center gap-2">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Minimize2 size={18} />}
          {loading ? "Compressing..." : "Compress PDF"}
        </button>
      )}
    </ToolCard>
  );
}
