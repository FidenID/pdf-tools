"use client";
import { useState } from "react";
import FileDropzone from "@/components/FileDropzone";
import PageShell from "@/components/PageShell";
import { Btn, Label, ErrorBox, FileTag, Section, Tabs } from "@/components/ui";

const fmt = (b: number) => b > 1e6 ? `${(b/1e6).toFixed(2)} MB` : `${(b/1024).toFixed(0)} KB`;

function Resize() {
  const [files, setFiles] = useState<File[]>([]);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [fit, setFit] = useState("inside");
  const [format, setFormat] = useState("jpeg");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{name:string;w:number;h:number;size:number;url:string}[]>([]);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true); setError(""); setResults([]);
    const out = [];
    for (const file of files) {
      const fd = new FormData(); fd.append("file",file);
      fd.append("width",width||"0"); fd.append("height",height||"0");
      fd.append("fit",fit); fd.append("format",format);
      const res = await fetch("/api/image/transform", { method:"POST", body:fd });
      if (!res.ok) { const d=await res.json(); setError(d.error); setLoading(false); return; }
      const blob = await res.blob();
      out.push({ name: file.name.replace(/\.[^.]+$/,"")+"."+(format==="jpeg"?"jpg":format), w:parseInt(res.headers.get("X-Width")||"0"), h:parseInt(res.headers.get("X-Height")||"0"), size:blob.size, url:URL.createObjectURL(blob) });
    }
    setResults(out); setLoading(false);
  }

  return (
    <Section title="Resize Images">
      <FileDropzone onFiles={f=>setFiles(p=>[...p,...f])} accept=".jpg,.jpeg,.png,.webp,.avif" multiple label="Drop images to resize" icon="🖼️" />
      {files.length > 0 && (
        <div style={{ display:"flex",flexDirection:"column",gap:"0.3rem" }}>
          {files.map((f,i) => <FileTag key={i} name={f.name} size={f.size} onRemove={()=>setFiles(files.filter((_,j)=>j!==i))} />)}
        </div>
      )}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"0.75rem" }}>
        <div>
          <Label hint="px, optional">Width</Label>
          <input type="number" value={width} onChange={e=>setWidth(e.target.value)} placeholder="auto" />
        </div>
        <div>
          <Label hint="px, optional">Height</Label>
          <input type="number" value={height} onChange={e=>setHeight(e.target.value)} placeholder="auto" />
        </div>
        <div>
          <Label>Fit mode</Label>
          <select value={fit} onChange={e=>setFit(e.target.value)}>
            <option value="inside">Fit inside</option>
            <option value="cover">Crop to fill</option>
            <option value="fill">Stretch</option>
          </select>
        </div>
        <div>
          <Label>Output format</Label>
          <select value={format} onChange={e=>setFormat(e.target.value)}>
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
            <option value="png">PNG</option>
            <option value="avif">AVIF</option>
          </select>
        </div>
      </div>
      {error && <ErrorBox msg={error} />}
      <div style={{ display:"flex",gap:"0.5rem",alignItems:"center" }}>
        <Btn onClick={run} disabled={!files.length||(!width&&!height)} loading={loading}>
          Resize {files.length > 1 ? `${files.length} images` : "image"}
        </Btn>
        <span style={{ fontSize:"12px",color:"var(--muted)" }}>At least one dimension required</span>
      </div>
      {results.length > 0 && (
        <div style={{ display:"flex",flexDirection:"column",gap:"0.35rem" }}>
          {results.map((r,i) => (
            <div key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.6rem 0.85rem",background:"var(--green-light)",border:"1px solid #b7dfca",borderRadius:"var(--radius)" }}>
              <div>
                <div style={{ fontSize:"13px",fontWeight:500 }}>{r.name}</div>
                <div style={{ fontSize:"12px",color:"var(--green)" }}>{r.w} × {r.h}px · {fmt(r.size)}</div>
              </div>
              <Btn href={r.url} download={r.name} variant="success">↓ Save</Btn>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function Convert() {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState("webp");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{name:string;orig:number;size:number;url:string}[]>([]);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true); setError(""); setResults([]);
    const out = [];
    for (const file of files) {
      const fd = new FormData(); fd.append("file",file); fd.append("format",format);
      const res = await fetch("/api/image/transform", { method:"POST", body:fd });
      if (!res.ok) { const d=await res.json(); setError(d.error); setLoading(false); return; }
      const blob = await res.blob();
      out.push({ name:file.name.replace(/\.[^.]+$/,"")+"."+(format==="jpeg"?"jpg":format), orig:file.size, size:blob.size, url:URL.createObjectURL(blob) });
    }
    setResults(out); setLoading(false);
  }

  return (
    <Section title="Convert Format">
      <FileDropzone onFiles={f=>setFiles(p=>[...p,...f])} accept=".jpg,.jpeg,.png,.webp,.avif,.gif,.bmp,.tiff" multiple label="Drop images to convert" icon="🔄" />
      {files.length > 0 && (
        <div style={{ display:"flex",flexDirection:"column",gap:"0.3rem" }}>
          {files.map((f,i) => <FileTag key={i} name={f.name} size={f.size} onRemove={()=>setFiles(files.filter((_,j)=>j!==i))} />)}
        </div>
      )}
      <div>
        <Label>Convert to</Label>
        <div style={{ display:"flex",gap:"0.4rem",flexWrap:"wrap" }}>
          {[["jpeg","JPG"],["webp","WebP"],["png","PNG"],["avif","AVIF"]].map(([v,l]) => (
            <button key={v} onClick={()=>setFormat(v)} style={{
              padding:"0.35rem 0.75rem",borderRadius:"var(--radius)",fontSize:"12px",fontWeight:500,cursor:"pointer",
              border:`1px solid ${format===v?"var(--accent)":"var(--border)"}`,
              background:format===v?"var(--accent)":"var(--surface)",
              color:format===v?"#fff":"var(--muted)",
            }}>{l}</button>
          ))}
        </div>
      </div>
      {error && <ErrorBox msg={error} />}
      <Btn onClick={run} disabled={!files.length} loading={loading}>Convert {files.length > 1 ? `${files.length} images` : ""}</Btn>
      {results.length > 0 && (
        <div style={{ display:"flex",flexDirection:"column",gap:"0.35rem" }}>
          {results.map((r,i) => (
            <div key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.6rem 0.85rem",background:"var(--green-light)",border:"1px solid #b7dfca",borderRadius:"var(--radius)" }}>
              <div>
                <div style={{ fontSize:"13px",fontWeight:500 }}>{r.name}</div>
                <div style={{ fontSize:"12px",color:"var(--green)" }}>{fmt(r.orig)} → {fmt(r.size)}</div>
              </div>
              <Btn href={r.url} download={r.name} variant="success">↓ Save</Btn>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

const TABS = [
  { id:"resize",  label:"Resize" },
  { id:"convert", label:"Convert Format" },
];

export default function ImageToolsPage() {
  const [active, setActive] = useState("resize");
  return (
    <PageShell title="Image Tools" desc="Resize, convert, and transform images. Supports JPG, PNG, WebP, AVIF, GIF, BMP, TIFF.">
      <Tabs tabs={TABS} active={active} onChange={setActive} />
      <div style={{ maxWidth: 680 }}>
        {active==="resize"  && <Resize />}
        {active==="convert" && <Convert />}
      </div>
    </PageShell>
  );
}
