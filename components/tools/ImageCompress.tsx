"use client";
import { useState } from "react";
import { ImageIcon, Download, Loader2 } from "lucide-react";
import ToolCard from "@/components/ToolCard";
import FileDropzone from "@/components/FileDropzone";

function fmt(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}

export default function ImageCompress() {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState("jpeg");
  const [maxWidth, setMaxWidth] = useState(0);
  const [results, setResults] = useState<{ name: string; original: number; compressed: number; url: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const compress = async () => {
    setLoading(true);
    const newResults = [];
    for (const file of files) {
      const form = new FormData();
      form.append("file", file);
      form.append("quality", String(quality));
      form.append("format", format);
      form.append("maxWidth", String(maxWidth));
      const res = await fetch("/api/compress/image", { method: "POST", body: form });
      if (res.ok) {
        const blob = await res.blob();
        newResults.push({
          name: file.name,
          original: parseInt(res.headers.get("X-Original-Size") || "0"),
          compressed: parseInt(res.headers.get("X-Compressed-Size") || "0"),
          url: URL.createObjectURL(blob),
        });
      }
    }
    setResults(newResults);
    setLoading(false);
  };

  return (
    <ToolCard title="Image Compression" description="Compress JPG, PNG, WebP, AVIF with quality control" icon={<ImageIcon size={22} />}>
      <FileDropzone onFiles={setFiles} accept="image/*" multiple label="Drop images here" />
      {files.length > 0 && (
        <div className="mt-3 text-sm text-gray-400">{files.length} file(s) selected</div>
      )}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="text-sm text-gray-400 block mb-1">Format</label>
          <select
            value={format}
            onChange={e => setFormat(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
          >
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
            <option value="png">PNG</option>
            <option value="avif">AVIF</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1">Max Width (0 = original)</label>
          <input
            type="number"
            value={maxWidth}
            onChange={e => setMaxWidth(Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="mt-4">
        <label className="text-sm text-gray-400 block mb-1">Quality: {quality}%</label>
        <input
          type="range" min={1} max={100} value={quality}
          onChange={e => setQuality(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
      </div>
      <button
        onClick={compress}
        disabled={!files.length || loading}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-lg py-2.5 font-medium flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : null}
        {loading ? "Compressing..." : "Compress"}
      </button>
      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map(r => (
            <div key={r.name} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2 text-sm">
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-gray-400">
                  {fmt(r.original)} → {fmt(r.compressed)}{" "}
                  <span className="text-green-400">
                    ({r.original > 0 ? Math.round((1 - r.compressed / r.original) * 100) : 0}% smaller)
                  </span>
                </div>
              </div>
              <a href={r.url} download className="text-blue-400 hover:text-blue-300">
                <Download size={18} />
              </a>
            </div>
          ))}
        </div>
      )}
    </ToolCard>
  );
}
