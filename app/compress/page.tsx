"use client";
import { useState } from "react";
import FileDropzone from "@/components/FileDropzone";
import PageShell from "@/components/PageShell";
import { Btn, Label, ErrorBox, FileTag, SuccessBox, Tabs, Section } from "@/components/ui";

const fmt = (b: number) => b > 1e6 ? `${(b/1e6).toFixed(2)} MB` : `${(b/1024).toFixed(0)} KB`;

function ImageCompress() {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(82);
  const [format, setFormat] = useState("jpeg");
  const [maxWidth, setMaxWidth] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ name: string; orig: number; size: number; url: string }[]>([]);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true); setError(""); setResults([]);
    const out = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file); fd.append("quality", String(quality));
      fd.append("format", format); fd.append("maxWidth", maxWidth || "0");
      const res = await fetch("/api/compress/image", { method: "POST", body: fd });
      if (!res.ok) { const d = await res.json(); setError(d.error); setLoading(false); return; }
      const blob = await res.blob();
      out.push({ name: file.name, orig: file.size, size: blob.size, url: URL.createObjectURL(blob) });
    }
    setResults(out); setLoading(false);
  }

  const ext = format === "jpeg" ? "jpg" : format;

  return (
    <Section title="Image Compression">
      <FileDropzone onFiles={f => setFiles(p => [...p, ...f])} accept=".jpg,.jpeg,.png,.webp,.avif" multiple label="Drop images here" icon="🖼️" />

      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          {files.map((f, i) => <FileTag key={i} name={f.name} size={f.size} onRemove={() => setFiles(files.filter((_, j) => j !== i))} />)}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
        <div>
          <Label>Output format</Label>
          <select value={format} onChange={e => setFormat(e.target.value)}>
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
            <option value="png">PNG</option>
            <option value="avif">AVIF</option>
          </select>
        </div>
        <div>
          <Label hint={`${quality}%`}>Quality</Label>
          <input type="range" min={1} max={100} value={quality} onChange={e => setQuality(+e.target.value)}
            style={{ width: "100%", padding: 0, border: "none", background: "none", accentColor: "var(--accent)", marginTop: "0.55rem" }} />
        </div>
        <div>
          <Label hint="optional">Max width (px)</Label>
          <input type="number" value={maxWidth} onChange={e => setMaxWidth(e.target.value)} placeholder="e.g. 1920" />
        </div>
      </div>

      {error && <ErrorBox msg={error} />}

      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <Btn onClick={run} disabled={!files.length} loading={loading}>
          Compress {files.length > 1 ? `${files.length} images` : "image"}
        </Btn>
        {files.length > 0 && <button onClick={() => { setFiles([]); setResults([]); }} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "12px" }}>Clear</button>}
      </div>

      {results.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {results.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 0.85rem", background: "var(--green-light)", border: "1px solid #b7dfca", borderRadius: "var(--radius)" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: 500 }}>{r.name.replace(/\.[^.]+$/, "")}.{ext}</div>
                <div style={{ fontSize: "12px", color: "var(--green)" }}>{fmt(r.orig)} → {fmt(r.size)} · saved {Math.round((1-r.size/r.orig)*100)}%</div>
              </div>
              <Btn href={r.url} download={r.name.replace(/\.[^.]+$/, "") + "." + ext} variant="success">↓ Save</Btn>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function ZipCompress() {
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState("archive");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);

  async function run() {
    setLoading(true); setResult(null);
    const fd = new FormData(); files.forEach(f => fd.append("files", f)); fd.append("name", name);
    const res = await fetch("/api/compress/zip", { method: "POST", body: fd });
    if (res.ok) { const b = await res.blob(); setResult({ url: URL.createObjectURL(b), size: b.size }); }
    setLoading(false);
  }

  return (
    <Section title="ZIP Archive">
      <FileDropzone onFiles={f => setFiles(p => [...p, ...f])} multiple label="Add files to compress into ZIP" icon="📦" />
      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          {files.map((f, i) => <FileTag key={i} name={f.name} size={f.size} onRemove={() => setFiles(files.filter((_, j) => j !== i))} />)}
        </div>
      )}
      <div>
        <Label>Archive name</Label>
        <input value={name} onChange={e => setName(e.target.value)} style={{ maxWidth: 240 }} />
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Btn onClick={run} disabled={!files.length} loading={loading}>Create ZIP</Btn>
        {result && <Btn href={result.url} download={name + ".zip"} variant="success">↓ {name}.zip ({fmt(result.size)})</Btn>}
      </div>
    </Section>
  );
}

export default function CompressPage() {
  return (
    <PageShell title="Compress" desc="Compress images and create ZIP archives.">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <ImageCompress />
        <ZipCompress />
      </div>
    </PageShell>
  );
}
