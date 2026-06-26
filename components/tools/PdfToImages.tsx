"use client";
import { useState } from "react";
import { FileImage, Loader2 } from "lucide-react";
import ToolCard from "@/components/ToolCard";
import FileDropzone from "@/components/FileDropzone";

export default function PdfToImages() {
  const [file, setFile] = useState<File | null>(null);
  const [dpi, setDpi] = useState(150);
  const [format, setFormat] = useState("png");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const convert = async () => {
    if (!file) return;
    setLoading(true); setError("");
    const form = new FormData();
    form.append("file", file);
    form.append("dpi", String(dpi));
    form.append("format", format);
    const res = await fetch("/api/convert/pdf-to-images", { method: "POST", body: form });
    if (res.ok) {
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      const ext = res.headers.get("Content-Type")?.includes("zip") ? "zip" : format;
      a.download = file.name.replace(".pdf", "") + "." + ext;
      a.click();
    } else {
      const data = await res.json();
      setError(data.error + (data.hint ? ` → ${data.hint}` : ""));
    }
    setLoading(false);
  };

  return (
    <ToolCard title="PDF → Images" description="Extract each PDF page as an image file" icon={<FileImage size={22} />}>
      <FileDropzone onFiles={f => setFile(f[0])} accept=".pdf" label="Drop PDF here" />
      {file && <div className="mt-2 text-sm text-gray-400">{file.name}</div>}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div>
          <label className="text-sm text-gray-400 block mb-1">Format</label>
          <select value={format} onChange={e => setFormat(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1">DPI: {dpi}</label>
          <input type="range" min={72} max={300} step={25} value={dpi}
            onChange={e => setDpi(Number(e.target.value))} className="w-full mt-2 accent-blue-500" />
        </div>
      </div>
      {error && <div className="mt-3 text-red-400 text-sm bg-red-900/20 rounded-lg p-3">{error}</div>}
      <button onClick={convert} disabled={!file || loading}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-lg py-2.5 font-medium flex items-center justify-center gap-2">
        {loading ? <Loader2 size={18} className="animate-spin" /> : null}
        {loading ? "Converting..." : "Convert to Images"}
      </button>
    </ToolCard>
  );
}
