"use client";
import { useState } from "react";
import FileDropzone from "@/components/FileDropzone";
import PageShell from "@/components/PageShell";
import { Btn, Label, ErrorBox, FileTag, SuccessBox, Section } from "@/components/ui";

const fmt = (b: number) => b > 1e6 ? `${(b/1e6).toFixed(2)} MB` : `${(b/1024).toFixed(0)} KB`;

export default function CompressPage() {
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
    <PageShell title="Image Compression" desc="Reduce image file sizes. Supports JPG, PNG, WebP, AVIF. Batch processing supported.">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "1.5rem", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Section>
            <FileDropzone onFiles={f => setFiles(p => [...p, ...f])} accept=".jpg,.jpeg,.png,.webp,.avif,.gif,.bmp,.tiff" multiple label="Drop images here" icon="🖼️" />
            {files.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                {files.map((f, i) => <FileTag key={i} name={f.name} size={f.size} onRemove={() => setFiles(files.filter((_, j) => j !== i))} />)}
              </div>
            )}
            {error && <ErrorBox msg={error} />}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Btn onClick={run} disabled={!files.length} loading={loading}>
                Compress {files.length > 1 ? `${files.length} images` : "image"}
              </Btn>
              {files.length > 0 && <button onClick={() => { setFiles([]); setResults([]); }} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "12px" }}>Clear all</button>}
            </div>
          </Section>

          {results.length > 0 && (
            <Section>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Results</div>
              {results.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "0.65rem 0.85rem", background: "var(--green-light)", border: "1px solid #b7dfca", borderRadius: "var(--radius)" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 500 }}>{r.name.replace(/\.[^.]+$/, "")}.{ext}</div>
                    <div style={{ fontSize: "12px", color: "var(--green)" }}>{fmt(r.orig)} → {fmt(r.size)} · −{Math.round((1 - r.size / r.orig) * 100)}%</div>
                  </div>
                  <Btn href={r.url} download={r.name.replace(/\.[^.]+$/, "") + "." + ext} variant="success">↓ Save</Btn>
                </div>
              ))}
            </Section>
          )}
        </div>

        <div style={{ position: "sticky", top: 68 }}>
          <Section>
            <div style={{ fontWeight: 600, fontSize: "13px" }}>Settings</div>
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
                style={{ width: "100%", padding: 0, border: "none", background: "none", accentColor: "var(--accent)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--muted)", marginTop: "0.2rem" }}>
                <span>Smaller file</span><span>Better quality</span>
              </div>
            </div>
            <div>
              <Label hint="optional">Max width (px)</Label>
              <input type="number" value={maxWidth} onChange={e => setMaxWidth(e.target.value)} placeholder="e.g. 1920" />
            </div>
          </Section>
        </div>
      </div>
    </PageShell>
  );
}
