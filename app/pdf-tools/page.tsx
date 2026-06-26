"use client";
import { useState } from "react";
import FileDropzone from "@/components/FileDropzone";
import PageShell from "@/components/PageShell";
import { Btn, Label, ErrorBox, FileTag, Tabs, Section } from "@/components/ui";

function Merge() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const move = (i: number, d: -1 | 1) => {
    const a = [...files]; const j = i+d; if(j<0||j>=a.length) return; [a[i],a[j]]=[a[j],a[i]]; setFiles(a);
  };

  async function run() {
    setLoading(true); setError("");
    const fd = new FormData(); files.forEach(f => fd.append("files", f));
    const res = await fetch("/api/pdf/merge", { method: "POST", body: fd });
    if (res.ok) { const b = await res.blob(); const a = document.createElement("a"); a.href=URL.createObjectURL(b); a.download="merged.pdf"; a.click(); }
    else { const d = await res.json(); setError(d.error); }
    setLoading(false);
  }

  return (
    <Section title="Merge PDFs">
      <FileDropzone onFiles={f => setFiles(p=>[...p,...f])} accept=".pdf" multiple label="Drop PDF files — order matters" icon="📄" />
      {files.length > 0 && (
        <div style={{ display:"flex",flexDirection:"column",gap:"0.3rem" }}>
          {files.map((f,i) => (
            <div key={i} style={{ display:"flex",alignItems:"center",gap:"0.5rem",padding:"0.35rem 0.65rem",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:"var(--radius)",fontSize:"12px" }}>
              <span style={{ color:"var(--muted)",minWidth:20,textAlign:"right" }}>{i+1}</span>
              <span style={{ flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{f.name}</span>
              <button onClick={()=>move(i,-1)} disabled={i===0} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--muted)",opacity:i===0?.3:1 }}>↑</button>
              <button onClick={()=>move(i,1)} disabled={i===files.length-1} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--muted)",opacity:i===files.length-1?.3:1 }}>↓</button>
              <button onClick={()=>setFiles(files.filter((_,j)=>j!==i))} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--muted)" }}>×</button>
            </div>
          ))}
        </div>
      )}
      {error && <ErrorBox msg={error} />}
      <Btn onClick={run} disabled={files.length < 2} loading={loading}>Merge {files.length || ""} PDFs</Btn>
    </Section>
  );
}

function Split() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"all"|"range">("all");
  const [range, setRange] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    if (!file) return;
    setLoading(true); setError("");
    const fd = new FormData(); fd.append("file", file); fd.append("mode", mode);
    if (mode === "range") fd.append("range", range);
    const res = await fetch("/api/pdf/split", { method: "POST", body: fd });
    if (res.ok) {
      const blob = await res.blob(); const a = document.createElement("a"); a.href=URL.createObjectURL(blob);
      const cd = res.headers.get("Content-Disposition")||""; const m = cd.match(/filename="([^"]+)"/);
      a.download = m?.[1]||"split.zip"; a.click();
    } else { const d = await res.json(); setError(d.error); }
    setLoading(false);
  }

  return (
    <Section title="Split PDF">
      <FileDropzone onFiles={f => setFile(f[0])} accept=".pdf" label="Drop PDF here" icon="📄" />
      {file && <FileTag name={file.name} size={file.size} onRemove={() => setFile(null)} />}
      <div>
        <Label>Extract pages</Label>
        <div style={{ display:"flex",gap:"0.5rem" }}>
          {(["all","range"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding:"0.4rem 0.85rem",borderRadius:"var(--radius)",fontSize:"13px",cursor:"pointer",
              border:`1px solid ${mode===m?"var(--accent)":"var(--border)"}`,
              background:mode===m?"var(--accent)":"var(--surface)",
              color:mode===m?"#fff":"var(--muted)",
            }}>{m === "all" ? "All pages" : "Custom range"}</button>
          ))}
        </div>
      </div>
      {mode === "range" && (
        <div>
          <Label hint="e.g. 1-3, 5, 7-9">Page range</Label>
          <input value={range} onChange={e => setRange(e.target.value)} placeholder="1-3, 5, 7-9" />
        </div>
      )}
      {error && <ErrorBox msg={error} />}
      <Btn onClick={run} disabled={!file||(mode==="range"&&!range)} loading={loading}>Split PDF</Btn>
    </Section>
  );
}

function Rotate() {
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState(90);
  const [pages, setPages] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    if (!file) return;
    setLoading(true); setError("");
    const fd = new FormData(); fd.append("file", file); fd.append("angle", String(angle)); fd.append("pages", pages);
    const res = await fetch("/api/pdf/rotate", { method: "POST", body: fd });
    if (res.ok) { const b = await res.blob(); const a = document.createElement("a"); a.href=URL.createObjectURL(b); a.download=file.name.replace(".pdf","_rotated.pdf"); a.click(); }
    else { const d = await res.json(); setError(d.error); }
    setLoading(false);
  }

  return (
    <Section title="Rotate PDF Pages">
      <FileDropzone onFiles={f => setFile(f[0])} accept=".pdf" label="Drop PDF here" icon="📄" />
      {file && <FileTag name={file.name} size={file.size} onRemove={() => setFile(null)} />}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem" }}>
        <div>
          <Label>Rotation angle</Label>
          <div style={{ display:"flex",gap:"0.4rem" }}>
            {[90,180,270].map(a => (
              <button key={a} onClick={() => setAngle(a)} style={{
                flex:1,padding:"0.4rem",borderRadius:"var(--radius)",fontSize:"13px",cursor:"pointer",
                border:`1px solid ${angle===a?"var(--accent)":"var(--border)"}`,
                background:angle===a?"var(--accent)":"var(--surface)",
                color:angle===a?"#fff":"var(--muted)",
              }}>{a}°</button>
            ))}
          </div>
        </div>
        <div>
          <Label hint="all or specific e.g. 1,3,5">Pages</Label>
          <input value={pages} onChange={e => setPages(e.target.value)} placeholder="all" />
        </div>
      </div>
      {error && <ErrorBox msg={error} />}
      <Btn onClick={run} disabled={!file} loading={loading}>Rotate &amp; Download</Btn>
    </Section>
  );
}

function Watermark() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(15);
  const [fontSize, setFontSize] = useState(48);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    if (!file) return;
    setLoading(true); setError("");
    const fd = new FormData(); fd.append("file", file); fd.append("text", text);
    fd.append("opacity", String(opacity / 100)); fd.append("fontSize", String(fontSize));
    const res = await fetch("/api/pdf/watermark", { method: "POST", body: fd });
    if (res.ok) { const b = await res.blob(); const a = document.createElement("a"); a.href=URL.createObjectURL(b); a.download=file.name.replace(".pdf","_watermarked.pdf"); a.click(); }
    else { const d = await res.json(); setError(d.error); }
    setLoading(false);
  }

  return (
    <Section title="Add Watermark">
      <FileDropzone onFiles={f => setFile(f[0])} accept=".pdf" label="Drop PDF here" icon="📄" />
      {file && <FileTag name={file.name} size={file.size} onRemove={() => setFile(null)} />}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.75rem" }}>
        <div>
          <Label>Watermark text</Label>
          <input value={text} onChange={e => setText(e.target.value)} />
        </div>
        <div>
          <Label hint={`${opacity}%`}>Opacity</Label>
          <input type="range" min={5} max={60} value={opacity} onChange={e => setOpacity(+e.target.value)}
            style={{ width:"100%",padding:0,border:"none",background:"none",accentColor:"var(--accent)",marginTop:"0.55rem" }} />
        </div>
        <div>
          <Label hint={`${fontSize}px`}>Font size</Label>
          <input type="range" min={20} max={96} value={fontSize} onChange={e => setFontSize(+e.target.value)}
            style={{ width:"100%",padding:0,border:"none",background:"none",accentColor:"var(--accent)",marginTop:"0.55rem" }} />
        </div>
      </div>
      {error && <ErrorBox msg={error} />}
      <Btn onClick={run} disabled={!file||!text} loading={loading}>Add Watermark</Btn>
    </Section>
  );
}

function Encrypt() {
  const [mode, setMode] = useState<"enc"|"dec">("enc");
  const [file, setFile] = useState<File | null>(null);
  const [userPw, setUserPw] = useState("");
  const [ownerPw, setOwnerPw] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runEnc() {
    if (!file||!userPw) return;
    setLoading(true); setError("");
    const fd = new FormData(); fd.append("file",file); fd.append("userPassword",userPw); fd.append("ownerPassword",ownerPw||userPw);
    const res = await fetch("/api/pdf/encrypt", { method:"POST", body:fd });
    if (res.ok) { const b=await res.blob(); const a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download=file.name.replace(".pdf","_encrypted.pdf"); a.click(); }
    else { const d=await res.json(); setError(d.error); }
    setLoading(false);
  }

  async function runDec() {
    if (!file) return;
    setLoading(true); setError("");
    const fd = new FormData(); fd.append("file",file);
    const res = await fetch("/api/pdf/decrypt", { method:"POST", body:fd });
    if (res.ok) { const b=await res.blob(); const a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download=file.name.replace(".pdf","_unlocked.pdf"); a.click(); }
    else { const d=await res.json(); setError(d.error); }
    setLoading(false);
  }

  return (
    <Section title="Encrypt / Decrypt">
      <div style={{ display:"flex",gap:"0.5rem" }}>
        {(["enc","dec"] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setFile(null); setError(""); }} style={{
            padding:"0.4rem 0.85rem",borderRadius:"var(--radius)",fontSize:"13px",cursor:"pointer",
            border:`1px solid ${mode===m?"var(--accent)":"var(--border)"}`,
            background:mode===m?"var(--accent)":"var(--surface)",
            color:mode===m?"#fff":"var(--muted)",
          }}>{m==="enc"?"Encrypt":"Decrypt"}</button>
        ))}
      </div>

      <FileDropzone onFiles={f=>{setFile(f[0]);setError("");}} accept=".pdf" label={mode==="enc"?"Drop PDF to encrypt":"Drop encrypted PDF"} icon="🔒" />
      {file && <FileTag name={file.name} size={file.size} onRemove={() => setFile(null)} />}

      {mode === "enc" ? (
        <>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem" }}>
            <div>
              <Label hint="required to open PDF">User password</Label>
              <input type="password" value={userPw} onChange={e=>setUserPw(e.target.value)} placeholder="Password" />
            </div>
            <div>
              <Label hint="optional, defaults to user pw">Owner password</Label>
              <input type="password" value={ownerPw} onChange={e=>setOwnerPw(e.target.value)} placeholder="Owner password" />
            </div>
          </div>
          {error && <ErrorBox msg={error} />}
          <Btn onClick={runEnc} disabled={!file||!userPw} loading={loading}>Encrypt PDF</Btn>
        </>
      ) : (
        <>
          <p style={{ fontSize:"13px",color:"var(--muted)" }}>Removes encryption from a PDF file. Note: this uses pdf-lib&apos;s ignoreEncryption flag which bypasses RC4 encryption.</p>
          {error && <ErrorBox msg={error} />}
          <Btn onClick={runDec} disabled={!file} loading={loading}>Remove Encryption</Btn>
        </>
      )}
    </Section>
  );
}

function Compress() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{url:string;orig:number;size:number}|null>(null);
  const [error, setError] = useState("");
  const fmtSize = (b: number) => b > 1e6 ? `${(b/1e6).toFixed(2)} MB` : `${(b/1024).toFixed(0)} KB`;

  async function run() {
    if (!file) return;
    setLoading(true); setError(""); setResult(null);
    const fd = new FormData(); fd.append("file", file); fd.append("quality", "ebook");
    const res = await fetch("/api/pdf/compress", { method:"POST", body:fd });
    if (res.ok) { const b=await res.blob(); setResult({ url:URL.createObjectURL(b), orig:file.size, size:b.size }); }
    else { const d=await res.json(); setError(d.error); }
    setLoading(false);
  }

  return (
    <Section title="Compress PDF">
      <FileDropzone onFiles={f=>{setFile(f[0]);setResult(null);}} accept=".pdf" label="Drop PDF here" icon="📄" />
      {file && <FileTag name={file.name} size={file.size} onRemove={() => {setFile(null);setResult(null);}} />}
      {error && <ErrorBox msg={error} />}
      {result ? (
        <div style={{ display:"flex",flexDirection:"column",gap:"0.5rem",padding:"0.85rem",background:"var(--green-light)",border:"1px solid #b7dfca",borderRadius:"var(--radius)" }}>
          <div style={{ fontSize:"13px",color:"var(--green)" }}>
            {fmtSize(result.orig)} → {fmtSize(result.size)} · saved {Math.round((1-result.size/result.orig)*100)}%
          </div>
          <Btn href={result.url} download={file?.name.replace(".pdf","_compressed.pdf")} variant="success">↓ Download compressed PDF</Btn>
        </div>
      ) : (
        <Btn onClick={run} disabled={!file} loading={loading}>Compress PDF</Btn>
      )}
    </Section>
  );
}

const TABS = [
  { id:"merge",    label:"Merge"    },
  { id:"split",    label:"Split"    },
  { id:"compress", label:"Compress" },
  { id:"rotate",   label:"Rotate"   },
  { id:"watermark",label:"Watermark"},
  { id:"encrypt",  label:"Encrypt"  },
];

export default function PdfToolsPage() {
  const [active, setActive] = useState("merge");
  return (
    <PageShell title="PDF Tools" desc="Merge, split, compress, rotate, watermark, encrypt PDF files — all in-browser, no upload to third parties.">
      <Tabs tabs={TABS} active={active} onChange={setActive} />
      <div style={{ maxWidth: 620 }}>
        {active==="merge"    && <Merge />}
        {active==="split"    && <Split />}
        {active==="compress" && <Compress />}
        {active==="rotate"   && <Rotate />}
        {active==="watermark"&& <Watermark />}
        {active==="encrypt"  && <Encrypt />}
      </div>
    </PageShell>
  );
}
