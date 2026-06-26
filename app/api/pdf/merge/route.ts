export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { binaryResponse } from "@/lib/response";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const files = form.getAll("files") as File[];

    if (files.length < 2) return NextResponse.json({ error: "Need at least 2 PDFs" }, { status: 400 });

    const merged = await PDFDocument.create();

    for (const file of files) {
      const buf = Buffer.from(await file.arrayBuffer());
      const src = await PDFDocument.load(buf);
      const pages = await merged.copyPages(src, src.getPageIndices());
      pages.forEach(p => merged.addPage(p));
    }

    const output = await merged.save();
    return binaryResponse(output, {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="merged.pdf"',
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
