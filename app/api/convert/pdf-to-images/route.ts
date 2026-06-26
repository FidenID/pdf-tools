export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { binaryResponse } from "@/lib/response";
import JSZip from "jszip";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;
    const scale = parseFloat(form.get("scale") as string) || 1.5;
    const fmt = (form.get("format") as string) || "png";

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    // Dynamic imports to avoid bundler issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createCanvas } = require("canvas");

    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
    const total = pdf.numPages;

    const pages: { name: string; data: Buffer }[] = [];

    for (let i = 1; i <= total; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = createCanvas(Math.round(viewport.width), Math.round(viewport.height));
      const ctx = canvas.getContext("2d");

      const renderContext = { canvasContext: ctx, viewport };
      await page.render(renderContext).promise;

      const data: Buffer = fmt === "jpg"
        ? canvas.toBuffer("image/jpeg", { quality: 0.9 })
        : canvas.toBuffer("image/png");

      pages.push({ name: `page_${String(i).padStart(3, "0")}.${fmt}`, data });
    }

    if (pages.length === 1) {
      return binaryResponse(pages[0].data, {
        "Content-Type": fmt === "jpg" ? "image/jpeg" : "image/png",
        "Content-Disposition": `attachment; filename="${pages[0].name}"`,
      });
    }

    const zip = new JSZip();
    pages.forEach(p => zip.file(p.name, p.data));
    const out = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });

    return binaryResponse(out, {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${file.name.replace(".pdf", "")}_pages.zip"`,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
