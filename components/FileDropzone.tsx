"use client";
import { useRef, useState, DragEvent } from "react";

export default function FileDropzone({ onFiles, accept, multiple, label, icon }: {
  onFiles: (files: File[]) => void; accept?: string; multiple?: boolean; label?: string; icon?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const handle = (list: FileList | null) => { if (list?.length) onFiles(Array.from(list)); };

  return (
    <div
      onClick={() => ref.current?.click()}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files); }}
      style={{
        border: `2px dashed ${over ? "var(--accent)" : "var(--border)"}`,
        borderRadius: 7, padding: "1.75rem 1.5rem", textAlign: "center",
        cursor: "pointer", background: over ? "var(--accent-light)" : "var(--surface2)",
        transition: "all 0.15s", userSelect: "none",
      }}
    >
      <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{icon || "📂"}</div>
      <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)", marginBottom: "0.2rem" }}>
        {label || "Drop files here, or click to browse"}
      </div>
      {accept && (
        <div style={{ fontSize: "11px", color: "var(--muted)" }}>
          {accept.replace(/\./g, "").replace(/,/g, " · ").toUpperCase()}
        </div>
      )}
      <input ref={ref} type="file" accept={accept} multiple={multiple} style={{ display: "none" }} onChange={e => handle(e.target.files)} />
    </div>
  );
}
