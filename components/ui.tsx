"use client";
import { ReactNode } from "react";

type BtnVariant = "primary" | "secondary" | "success" | "danger";

export function Btn({ onClick, disabled, loading, children, variant = "primary", fullWidth, href, download }: {
  onClick?: () => void; disabled?: boolean; loading?: boolean; children: ReactNode;
  variant?: BtnVariant; fullWidth?: boolean; href?: string; download?: string;
}) {
  const styles: Record<BtnVariant, React.CSSProperties> = {
    primary:   { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" },
    secondary: { background: "var(--surface)", color: "var(--text)", borderColor: "var(--border)" },
    success:   { background: "var(--green)", color: "#fff", borderColor: "var(--green)" },
    danger:    { background: "var(--red)", color: "#fff", borderColor: "var(--red)" },
  };
  const s: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
    padding: "0.45rem 1rem", borderRadius: "var(--radius)", fontSize: "13px", fontWeight: 500,
    border: "1px solid", cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled || loading ? 0.5 : 1, width: fullWidth ? "100%" : undefined,
    textDecoration: "none", transition: "opacity 0.1s, filter 0.1s",
    ...styles[variant],
  };
  if (href) return <a href={href} download={download} style={s}>{children}</a>;
  return <button onClick={onClick} disabled={disabled || loading} style={s}>{loading ? "Working…" : children}</button>;
}

export function Label({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div style={{ marginBottom: "0.35rem" }}>
      <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)", display: "block" }}>{children}</span>
      {hint && <span style={{ fontSize: "11px", color: "var(--muted)" }}>{hint}</span>}
    </div>
  );
}

export function ErrorBox({ msg }: { msg: string }) {
  return <div style={{ padding: "0.6rem 0.85rem", background: "var(--red-light)", border: "1px solid #f5c5c5", borderRadius: "var(--radius)", fontSize: "13px", color: "var(--red)", whiteSpace: "pre-wrap" }}>{msg}</div>;
}

export function SuccessBox({ children }: { children: ReactNode }) {
  return <div style={{ padding: "0.75rem 1rem", background: "var(--green-light)", border: "1px solid #b7dfca", borderRadius: "var(--radius)", fontSize: "13px", color: "var(--green)" }}>{children}</div>;
}

export function FileTag({ name, size, onRemove }: { name: string; size?: number; onRemove?: () => void }) {
  const fmt = (b: number) => b > 1e6 ? `${(b/1e6).toFixed(1)} MB` : `${(b/1024).toFixed(0)} KB`;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.35rem 0.65rem", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "12px" }}>
      <span style={{ fontSize: "14px" }}>📄</span>
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text)" }}>{name}</span>
      {size !== undefined && <span style={{ color: "var(--muted)", flexShrink: 0 }}>{fmt(size)}</span>}
      {onRemove && <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: "16px", lineHeight: 1, padding: "0 2px" }}>×</button>}
    </div>
  );
}

export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "1.5rem", gap: "0.1rem" }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding: "0.55rem 0.9rem", fontSize: "13px", background: "none", border: "none",
          borderBottom: `2px solid ${active === t.id ? "var(--accent)" : "transparent"}`,
          color: active === t.id ? "var(--accent)" : "var(--muted)", cursor: "pointer",
          fontWeight: active === t.id ? 600 : 400, marginBottom: "-1px",
        }}>{t.label}</button>
      ))}
    </div>
  );
}

export function InfoBox({ children }: { children: ReactNode }) {
  return <div style={{ padding: "0.55rem 0.85rem", background: "#f0f4f8", border: "1px solid #c8d8e8", borderRadius: "var(--radius)", fontSize: "12px", color: "#4a6080" }}>{children}</div>;
}

export function Section({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      {title && <h2 style={{ marginBottom: "0.25rem" }}>{title}</h2>}
      {children}
    </div>
  );
}
