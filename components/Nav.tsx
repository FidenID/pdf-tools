"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/compress", label: "Compress" },
  { href: "/convert", label: "Convert" },
  { href: "/pdf-tools", label: "PDF Tools" },
  { href: "/image-tools", label: "Image Tools" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <header style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 20 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", height: 50, gap: "1.5rem" }}>
        <Link href="/" style={{ textDecoration: "none", fontWeight: 700, fontSize: "15px", color: "var(--text)", letterSpacing: "-0.01em" }}>
          FileTools
        </Link>
        <div style={{ width: 1, height: 18, background: "var(--border)" }} />
        <nav style={{ display: "flex", gap: "0.15rem" }}>
          {links.map(l => {
            const active = path.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} style={{
                textDecoration: "none", fontSize: "13px", padding: "0.3rem 0.7rem",
                borderRadius: "var(--radius)",
                color: active ? "var(--accent)" : "var(--muted)",
                background: active ? "var(--accent-light)" : "transparent",
                fontWeight: active ? 500 : 400,
              }}>{l.label}</Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
