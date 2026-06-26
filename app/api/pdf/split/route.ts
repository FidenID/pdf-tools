import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { binaryResponse } from "@/lib/response";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;
    const mode = (form.get("mode") as string) || "all";
    const range = form.get("range") as string;

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const buf = Buffer.from(await file.arrayBuffer());
    const src = await PDFDocument.load(buf);
    const total = src.getPageCount();

    let pageIndices: number[];

    if (mode === "range" && range) {
      pageIndices = [];
      for (const part of range.split(",")) {
        const [s, e] = part.trim().split("-").map(Number);
        const start = Math.max(1, s) - 1;
        const end = Math.min(total, e || s) - 1;
        for (let i = start; i <= end; i++) pageIndices.push(i);
      }
    } else {
      pageIndices = Array.from({ length: total }, (_, i) => i);
    }

    if (pageIndices.length === 1) {
      const out = await PDFDocument.create();
      const [page] = await out.copyPages(src, pageIndices);
      out.addPage(page);
      const output = await out.save();
      return binaryResponse(output, {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="page_${pageIndices[0] + 1}.pdf"`,
      });
    }

    const zip = new JSZip();
    for (const idx of pageIndices) {
      const out = await PDFDocument.create();
      const [page] = await out.copyPages(src, [idx]);
      out.addPage(page);
      zip.file(`page_${idx + 1}.pdf`, await out.save());
    }

    const output = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
    const name = file.name.replace(".pdf", "");
    return binaryResponse(output, {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${name}_split.zip"`,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
