import { ReactNode } from "react";

export default function PageShell({ title, desc, children }: { title: string; desc: string; children: ReactNode }) {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1.5rem 5rem" }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ marginBottom: "0.3rem" }}>{title}</h1>
        <p style={{ color: "var(--muted)", fontSize: "13px" }}>{desc}</p>
      </div>
      {children}
    </div>
  );
}
