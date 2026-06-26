"use client";
import { useState } from "react";
import { FileText, Loader2, ChevronDown } from "lucide-react";
import ToolCard from "@/components/ToolCard";
import FileDropzone from "@/components/FileDropzone";

const CONVERSIONS: { from: string; to: string[]; accept: string }[] = [
  { from: "PDF", to: ["docx", "xlsx", "pptx", "html", "txt", "odt"], accept: ".pdf" },
  { from: "Word (DOCX)", to: ["pdf", "html", "txt", "odt", "rtf"], accept: ".docx,.doc" },
  { from: "Excel (XLSX)", to: ["pdf", "csv", "html", "ods"], accept: ".xlsx,.xls,.csv" },
  { from: "PowerPoint (PPTX)", to: ["pdf", "html", "odp"], accept: ".pptx,.ppt" },
  { from: "ODT", to: ["pdf", "docx", "html", "txt"], accept: ".odt" },
  { from: "RTF", to: ["pdf", "docx", "txt"], accept: ".rtf" },
  { from: "HTML", to: ["pdf", "docx", "txt"], accept: ".html,.htm" },
];

export default function OfficeConverter() {
  const [fromIdx, setFromIdx] = useState(0);
  const [toFormat, setToFormat] = useState(CONVERSIONS[0].to[0]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setFrom = (idx: number) => {
    setFromIdx(idx);
    setToFormat(CONVERSIONS[idx].to[0]);
    setFile(null);
  };

  const convert = async () => {
    if (!file) return;
    setLoading(true); setError("");
    const form = new FormData();
    form.append("file", file);
    form.append("to", toFormat);
    const res = await fetch("/api/convert/office", { method: "POST", body: form });
    if (res.ok) {
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(/\.[^.]+$/, "") + "." + toFormat;
      a.click();
    } else {
      const data = await res.json();
      setError(data.error + (data.hint ? ` → ${data.hint}` : ""));
    }
    setLoading(false);
  };

  const cur = CONVERSIONS[fromIdx];

  return (
    <ToolCard title="Document Converter" description="Convert between PDF, Word, Excel, PowerPoint, and more" icon={<FileText size={22} />}>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-sm text-gray-400 block mb-1">From</label>
          <div className="relative">
            <select value={fromIdx} onChange={e => setFrom(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm appearance-none">
              {CONVERSIONS.map((c, i) => <option key={i} value={i}>{c.from}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1">To</label>
          <div className="relative">
            <select value={toFormat} onChange={e => setToFormat(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm uppercase appearance-none">
              {cur.to.map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
      <FileDropzone onFiles={f => setFile(f[0])} accept={cur.accept} label={`Drop ${cur.from} file here`} />
      {file && <div className="mt-2 text-sm text-gray-400">{file.name}</div>}
      {error && <div className="mt-3 text-red-400 text-sm bg-red-900/20 rounded-lg p-3">{error}</div>}
      <button onClick={convert} disabled={!file || loading}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-lg py-2.5 font-medium flex items-center justify-center gap-2">
        {loading ? <Loader2 size={18} className="animate-spin" /> : null}
        {loading ? "Converting..." : `Convert to ${toFormat.toUpperCase()}`}
      </button>
    </ToolCard>
  );
}
