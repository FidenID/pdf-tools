export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import { binaryResponse } from "@/lib/response";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const files = form.getAll("files") as File[];
    const name = (form.get("name") as string) || "converted";

    if (!files.length) return NextResponse.json({ error: "No files" }, { status: 400 });

    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
      const buf = Buffer.from(await file.arrayBuffer());
      const jpeg = await sharp(buf).jpeg().toBuffer();
      const img = await pdfDoc.embedJpg(jpeg);
      const page = pdfDoc.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }

    const output = await pdfDoc.save();
    return binaryResponse(output, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${name}.pdf"`,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
