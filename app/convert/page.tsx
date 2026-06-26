"use client";
import { useState } from "react";
import FileDropzone from "@/components/FileDropzone";
import PageShell from "@/components/PageShell";
import { Btn, Label, ErrorBox, FileTag, Tabs, Section, InfoBox } from "@/components/ui";

/* Full conversion matrix */
const FORMAT_MAP: Record<string, { label: string; targets: string[] }> = {
  // PDF
  pdf:  { label: "PDF",               targets: ["docx", "xlsx", "pptx", "odt", "ods", "odp", "html", "txt", "rtf", "epub"] },
  // Word
  docx: { label: "Word (DOCX)",       targets: ["pdf", "odt", "html", "txt", "rtf", "epub"] },
  doc:  { label: "Word 97 (DOC)",     targets: ["pdf", "docx", "odt", "html", "txt", "rtf"] },
  odt:  { label: "OpenDocument Text", targets: ["pdf", "docx", "doc", "html", "txt", "rtf"] },
  rtf:  { label: "Rich Text (RTF)",   targets: ["pdf", "docx", "odt", "txt"] },
  // Excel
  xlsx: { label: "Excel (XLSX)",      targets: ["pdf", "ods", "csv", "html"] },
  xls:  { label: "Excel 97 (XLS)",    targets: ["pdf", "xlsx", "ods", "csv", "html"] },
  ods:  { label: "OpenDocument Sheet",targets: ["pdf", "xlsx", "xls", "csv", "html"] },
  csv:  { label: "CSV",               targets: ["pdf", "xlsx", "ods"] },
  // PowerPoint
  pptx: { label: "PowerPoint (PPTX)", targets: ["pdf", "odp", "html"] },
  ppt:  { label: "PowerPoint 97 (PPT)",targets: ["pdf", "pptx", "odp", "html"] },
  odp:  { label: "OpenDocument Presentation", targets: ["pdf", "pptx", "ppt", "html"] },
  // Web/Text
  html: { label: "HTML",              targets: ["pdf", "docx", "odt", "txt"] },
  txt:  { label: "Plain Text",        targets: ["pdf", "docx", "odt", "rtf", "html"] },
  epub: { label: "EPUB",              targets: ["pdf", "docx", "odt", "html"] },
};

const ALL_ACCEPT = Object.keys(FORMAT_MAP).map(e => "." + e).join(",");

function DocConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function onFile(f: File) {
    setFile(f); setError("");
    const ext = f.name.split(".").pop()?.toLowerCase() || "";
    setTo(FORMAT_MAP[ext]?.targets[0] || "pdf");
  }

  const ext = file?.name.split(".").pop()?.toLowerCase() || "";
  const info = FORMAT_MAP[ext];
  const targets = info?.targets || [];

  async function run() {
    if (!file || !to) return;
    setLoading(true); setError("");
    const fd = new FormData(); fd.append("file", file); fd.append("to", to);
    const res = await fetch("/api/convert/office", { method: "POST", body: fd });
    if (res.ok) {
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(/\.[^.]+$/, "") + "." + to;
      a.click();
    } else {
      const d = await res.json();
      setError(d.error + (d.hint ? `\n→ ${d.hint}` : ""));
    }
    setLoading(false);
  }

  return (
    <Section>
      <InfoBox>Requires <strong>LibreOffice</strong> on the server — <code>sudo pacman -S libreoffice-fresh</code></InfoBox>
      <FileDropzone onFiles={f => onFile(f[0])} accept={ALL_ACCEPT} label="Drop any document here" icon="📄" />
      {file && <FileTag name={file.name} size={file.size} onRemove={() => { setFile(null); setTo(""); }} />}

      {!file && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.4rem" }}>
          {Object.entries(FORMAT_MAP).map(([ext, { label }]) => (
            <div key={ext} style={{ padding: "0.5rem 0.65rem", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "12px" }}>
              <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 600, color: "var(--accent)" }}>.{ext}</span>
              <span style={{ color: "var(--muted)", marginLeft: "0.35rem" }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {targets.length > 0 && (
        <div>
          <Label>Convert {info?.label} to</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {targets.map(t => (
              <button key={t} onClick={() => setTo(t)} style={{
                padding: "0.3rem 0.7rem", borderRadius: "var(--radius)", fontSize: "12px", fontWeight: 600,
                fontFamily: "ui-monospace, monospace", cursor: "pointer", textTransform: "uppercase",
                border: `1px solid ${to === t ? "var(--accent)" : "var(--border)"}`,
                background: to === t ? "var(--accent)" : "var(--surface)",
                color: to === t ? "#fff" : "var(--muted)",
              }}>{t}</button>
            ))}
          </div>
        </div>
      )}

      {error && <ErrorBox msg={error} />}
      <Btn onClick={run} disabled={!file || !to} loading={loading}>
        Convert to {to ? to.toUpperCase() : "…"}
      </Btn>
    </Section>
  );
}

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
    <Section>
      <FileDropzone onFiles={f => setFiles(p => [...p, ...f])} accept="image/*" multiple label="Drop images — order = page order" icon="🖼️" />
      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          {files.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.35rem 0.65rem", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "12px" }}>
              <span style={{ color: "var(--muted)", minWidth: 20, textAlign: "right" }}>{i + 1}</span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
              <button onClick={() => move(i, -1)} disabled={i === 0} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", opacity: i === 0 ? 0.3 : 1 }}>↑</button>
              <button onClick={() => move(i, 1)} disabled={i === files.length - 1} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", opacity: i === files.length - 1 ? 0.3 : 1 }}>↓</button>
              <button onClick={() => setFiles(files.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}>×</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", flexWrap: "wrap" }}>
        <div>
          <Label>Filename</Label>
          <input value={name} onChange={e => setName(e.target.value)} style={{ width: 200 }} />
        </div>
        <Btn onClick={run} disabled={!files.length} loading={loading}>Create PDF</Btn>
        {url && <Btn href={url} download={name + ".pdf"} variant="success">↓ Download</Btn>}
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
      a.download = file.name.replace(".pdf", "") + (blob.type.includes("zip") ? "_pages.zip" : "." + fmt); a.click();
    } else { const d = await res.json(); setError(d.error); }
    setLoading(false);
  }

  return (
    <Section>
      <FileDropzone onFiles={f => setFile(f[0])} accept=".pdf" label="Drop PDF here" icon="📄" />
      {file && <FileTag name={file.name} size={file.size} onRemove={() => setFile(null)} />}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div>
          <Label>Format</Label>
          <select value={fmt} onChange={e => setFmt(e.target.value)}>
            <option value="png">PNG (lossless)</option>
            <option value="jpg">JPG (smaller)</option>
          </select>
        </div>
        <div>
          <Label hint={`~${Math.round(scale * 96)} DPI`}>Resolution</Label>
          <input type="range" min={1} max={3} step={0.5} value={scale} onChange={e => setScale(+e.target.value)}
            style={{ width: "100%", padding: 0, border: "none", background: "none", accentColor: "var(--accent)", marginTop: "0.55rem" }} />
        </div>
      </div>
      {error && <ErrorBox msg={error} />}
      <Btn onClick={run} disabled={!file} loading={loading}>Extract pages as images</Btn>
    </Section>
  );
}

const TABS = [
  { id: "doc",     label: "Document Converter" },
  { id: "img2pdf", label: "Images → PDF" },
  { id: "pdf2img", label: "PDF → Images" },
];

export default function ConvertPage() {
  const [active, setActive] = useState("doc");
  return (
    <PageShell title="Convert" desc="Convert between PDF, Word, Excel, PowerPoint, ODT, HTML, CSV, EPUB and more.">
      <Tabs tabs={TABS} active={active} onChange={setActive} />
      <div style={{ maxWidth: 680 }}>
        {active === "doc"     && <DocConverter />}
        {active === "img2pdf" && <ImagesToPdf />}
        {active === "pdf2img" && <PdfToImages />}
      </div>
    </PageShell>
  );
}
