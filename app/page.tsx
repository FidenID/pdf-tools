"use client";
import Link from "next/link";

const sections = [
  {
    href: "/compress", icon: "🗜️", title: "Compress",
    desc: "Reduce image file sizes. JPG, PNG, WebP, AVIF. Also create ZIP archives.",
    items: ["Image compression", "Batch compress", "ZIP archive"],
  },
  {
    href: "/convert", icon: "🔄", title: "Convert",
    desc: "Convert images between formats. Combine images into PDF or extract PDF pages.",
    items: ["Images → PDF", "PDF → Images", "JPG ↔ PNG ↔ WebP ↔ AVIF"],
  },
  {
    href: "/pdf-tools", icon: "📄", title: "PDF Tools",
    desc: "Everything you need to work with PDFs — merge, split, rotate, watermark, protect.",
    items: ["Merge & Split", "Rotate pages", "Encrypt & Decrypt", "Watermark"],
  },
  {
    href: "/image-tools", icon: "🖼️", title: "Image Tools",
    desc: "Resize, crop, and convert images with full control over dimensions and format.",
    items: ["Resize & crop", "Format convert", "Batch processing"],
  },
];

export default function Home() {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "2.5rem 1.5rem 5rem" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>FileTools</h1>
        <p style={{ color: "var(--muted)", fontSize: "14px", maxWidth: 520 }}>
          Compress, convert, and work with files — all processed on the server, nothing stored.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "1rem" }}>
        {sections.map(s => (
          <Link key={s.href} href={s.href} style={{ textDecoration: "none" }}>
            <div style={{
              background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8,
              padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.85rem",
              transition: "border-color 0.15s",
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <span style={{ fontSize: "1.4rem" }}>{s.icon}</span>
                <span style={{ fontWeight: 600, fontSize: "15px" }}>{s.title}</span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.6 }}>{s.desc}</p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                {s.items.map(i => (
                  <li key={i} style={{ fontSize: "12px", color: "var(--muted)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ color: "var(--accent)", fontWeight: 700 }}>–</span> {i}
                  </li>
                ))}
              </ul>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
