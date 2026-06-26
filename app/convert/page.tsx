"use client";
import { useState } from "react";
import FileDropzone from "@/components/FileDropzone";
import PageShell from "@/components/PageShell";
import { Btn, Label, ErrorBox, FileTag, Tabs, Section } from "@/components/ui";

function ImagesToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState("document");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");

  const move = (i: number, d: -1 | 1) => {
    const a = [...files]; const j = i + d;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]]; setFiles(a);
  };

  async function run() {
    setLoading(true); setError(""); setUrl("");
    const fd = new FormData(); files.forEach(f => fd.append("files", f)); fd.append("name", name);
    const res = await fetch("/api/convert/images-to-pdf", { method: "POST", body: fd });
    if (res.ok) { const b = await res.blob(); setUrl(URL.createObjectURL(b)); }
    else { const d = await res.json(); setError(d.error); }
    setLoading(false);
  }

  return (
    <Section title="Images → PDF">
      <FileDropzone onFiles={f => setFiles(p => [...p, ...f])} accept="image/*" multiple label="Drop images — drag to reorder pages" icon="🖼️" />
      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          {files.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.35rem 0.65rem", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "12px" }}>
              <span style={{ color: "var(--muted)", minWidth: 20, textAlign: "right" }}>{i+1}</span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
              <button onClick={() => move(i,-1)} disabled={i===0} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--muted)",opacity:i===0?.3:1 }}>↑</button>
              <button onClick={() => move(i,1)} disabled={i===files.length-1} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--muted)",opacity:i===files.length-1?.3:1 }}>↓</button>
              <button onClick={() => setFiles(files.filter((_,j)=>j!==i))} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--muted)" }}>×</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
        <div style={{ flex: 1, maxWidth: 240 }}>
          <Label>Output filename</Label>
          <input value={name} onChange={e => setName(e.target.value)} />
        </div>
        <Btn onClick={run} disabled={!files.length} loading={loading}>Create PDF</Btn>
        {url && <Btn href={url} download={name+".pdf"} variant="success">↓ Download</Btn>}
      </div>
      {error && <ErrorBox msg={error} />}
    </Section>
  );
}

function PdfToImages() {
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(1.5);
  const [fmt, setFmt] = useState("png");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    if (!file) return;
    setLoading(true); setError("");
    const fd = new FormData(); fd.append("file", file); fd.append("scale", String(scale)); fd.append("format", fmt);
    const res = await fetch("/api/convert/pdf-to-images", { method: "POST", body: fd });
    if (res.ok) {
      const blob = await res.blob(); const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(".pdf","") + (blob.type.includes("zip") ? "_pages.zip" : "."+fmt); a.click();
    } else { const d = await res.json(); setError(d.error); }
    setLoading(false);
  }

  const dpiLabel = Math.round(scale * 96);

  return (
    <Section title="PDF → Images">
      <FileDropzone onFiles={f => setFile(f[0])} accept=".pdf" label="Drop PDF file here" icon="📄" />
      {file && <FileTag name={file.name} size={file.size} onRemove={() => setFile(null)} />}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div>
          <Label>Image format</Label>
          <select value={fmt} onChange={e => setFmt(e.target.value)}>
            <option value="png">PNG (lossless)</option>
            <option value="jpg">JPG (smaller)</option>
          </select>
        </div>
        <div>
          <Label hint={`~${dpiLabel} DPI`}>Resolution</Label>
          <input type="range" min={1} max={3} step={0.5} value={scale} onChange={e => setScale(+e.target.value)}
            style={{ width:"100%",padding:0,border:"none",background:"none",accentColor:"var(--accent)",marginTop:"0.55rem" }} />
        </div>
      </div>
      {error && <ErrorBox msg={error} />}
      <Btn onClick={run} disabled={!file} loading={loading}>Extract as images</Btn>
    </Section>
  );
}

function ImageConvert() {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState("webp");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{name:string; url:string}[]>([]);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true); setError(""); setResults([]);
    const out = [];
    for (const file of files) {
      const fd = new FormData(); fd.append("file", file); fd.append("format", format);
      const res = await fetch("/api/image/transform", { method: "POST", body: fd });
      if (!res.ok) { const d = await res.json(); setError(d.error); setLoading(false); return; }
      const blob = await res.blob();
      out.push({ name: file.name.replace(/\.[^.]+$/, "") + "." + (format === "jpeg" ? "jpg" : format), url: URL.createObjectURL(blob) });
    }
    setResults(out); setLoading(false);
  }

  return (
    <Section title="Image Format Converter">
      <FileDropzone onFiles={f => setFiles(p => [...p,...f])} accept=".jpg,.jpeg,.png,.webp,.avif,.gif" multiple label="Drop images to convert" icon="🔄" />
      {files.length > 0 && (
        <div style={{ display:"flex",flexDirection:"column",gap:"0.3rem" }}>
          {files.map((f,i) => <FileTag key={i} name={f.name} size={f.size} onRemove={() => setFiles(files.filter((_,j)=>j!==i))} />)}
        </div>
      )}
      <div style={{ display:"flex",gap:"0.75rem",alignItems:"flex-end",flexWrap:"wrap" }}>
        <div>
          <Label>Convert to</Label>
          <div style={{ display:"flex",gap:"0.4rem" }}>
            {["jpeg","webp","png","avif"].map(f => (
              <button key={f} onClick={() => setFormat(f)} style={{
                padding:"0.3rem 0.65rem",borderRadius:"var(--radius)",fontSize:"12px",fontWeight:500,cursor:"pointer",
                border:`1px solid ${format===f?"var(--accent)":"var(--border)"}`,
                background:format===f?"var(--accent)":"var(--surface)",
                color:format===f?"#fff":"var(--muted)",
              }}>{f === "jpeg" ? "JPG" : f.toUpperCase()}</button>
            ))}
          </div>
        </div>
        <Btn onClick={run} disabled={!files.length} loading={loading}>Convert</Btn>
      </div>
      {error && <ErrorBox msg={error} />}
      {results.length > 0 && (
        <div style={{ display:"flex",flexDirection:"column",gap:"0.35rem" }}>
          {results.map((r,i) => (
            <div key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.5rem 0.75rem",background:"var(--green-light)",border:"1px solid #b7dfca",borderRadius:"var(--radius)" }}>
              <span style={{ fontSize:"13px" }}>{r.name}</span>
              <Btn href={r.url} download={r.name} variant="success">↓ Save</Btn>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

const TABS = [
  { id: "img2pdf", label: "Images → PDF" },
  { id: "pdf2img", label: "PDF → Images" },
  { id: "imgconv", label: "Image Format" },
];

export default function ConvertPage() {
  const [active, setActive] = useState("img2pdf");
  return (
    <PageShell title="Convert" desc="Convert between image formats, images to PDF, and PDF to images. No external tools required.">
      <Tabs tabs={TABS} active={active} onChange={setActive} />
      {active === "img2pdf" && <ImagesToPdf />}
      {active === "pdf2img" && <PdfToImages />}
      {active === "imgconv" && <ImageConvert />}
    </PageShell>
  );
}
