import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { binaryResponse } from "@/lib/response";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const buf = Buffer.from(await file.arrayBuffer());

    // pdf-lib can load and re-save encrypted PDFs, stripping the encryption
    // ignoreEncryption bypasses the password requirement
    let pdfDoc: PDFDocument;
    try {
      pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
    } catch {
      return NextResponse.json({ error: "Could not parse PDF. File may be corrupt." }, { status: 400 });
    }

    // Re-save without any encryption
    const decrypted = await pdfDoc.save();

    return binaryResponse(decrypted, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${file.name.replace(".pdf", "_unlocked.pdf")}"`,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
