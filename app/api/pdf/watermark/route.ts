import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import { binaryResponse } from "@/lib/response";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;
    const text = (form.get("text") as string) || "CONFIDENTIAL";
    const opacity = parseFloat(form.get("opacity") as string) || 0.15;
    const fontSize = parseInt(form.get("fontSize") as string) || 48;

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const buf = Buffer.from(await file.arrayBuffer());
    const pdfDoc = await PDFDocument.load(buf);
    const pages = pdfDoc.getPages();

    for (const page of pages) {
      const { width, height } = page.getSize();
      page.drawText(text, {
        x: width / 2 - (text.length * fontSize * 0.3),
        y: height / 2,
        size: fontSize,
        color: rgb(0.5, 0.5, 0.5),
        opacity,
        rotate: degrees(45),
      });
    }

    const output = await pdfDoc.save();
    return binaryResponse(output, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${file.name.replace(".pdf", "_watermarked.pdf")}"`,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
