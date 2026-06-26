import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, degrees } from "pdf-lib";
import { binaryResponse } from "@/lib/response";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;
    const angle = parseInt(form.get("angle") as string) || 90; // 90, 180, 270
    const pageRange = form.get("pages") as string; // "all" or "1,3,5"

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const buf = Buffer.from(await file.arrayBuffer());
    const pdfDoc = await PDFDocument.load(buf);
    const pages = pdfDoc.getPages();

    let indices: number[];
    if (pageRange === "all" || !pageRange) {
      indices = pages.map((_, i) => i);
    } else {
      indices = pageRange.split(",").map(s => parseInt(s.trim()) - 1).filter(i => i >= 0 && i < pages.length);
    }

    for (const i of indices) {
      const page = pages[i];
      const current = page.getRotation().angle;
      page.setRotation(degrees((current + angle) % 360));
    }

    const output = await pdfDoc.save();
    return binaryResponse(output, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${file.name.replace(".pdf", "_rotated.pdf")}"`,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
