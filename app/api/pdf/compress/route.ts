import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import { writeFileSync, readFileSync, mkdirSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { PDFDocument } from "pdf-lib";
import { binaryResponse } from "@/lib/response";

function findGhostscript(): string | null {
  for (const cmd of ["gs", "ghostscript"]) {
    try { execSync(`which ${cmd}`, { stdio: "ignore" }); return cmd; } catch {}
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;
    const quality = (form.get("quality") as string) || "ebook";

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const buf = Buffer.from(await file.arrayBuffer());
    const gs = findGhostscript();

    if (gs) {
      const tmpDir = join(tmpdir(), `pdfcomp_${Date.now()}`);
      mkdirSync(tmpDir, { recursive: true });
      const inPath = join(tmpDir, "input.pdf");
      const outPath = join(tmpDir, "output.pdf");
      writeFileSync(inPath, buf);

      execSync(
        `${gs} -dBATCH -dNOPAUSE -dQUIET -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/${quality} -sOutputFile="${outPath}" "${inPath}"`,
        { timeout: 60000 }
      );

      const output = readFileSync(outPath);
      rmSync(tmpDir, { recursive: true, force: true });
      const name = file.name.replace(".pdf", "");
      return binaryResponse(output, {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${name}_compressed.pdf"`,
        "X-Original-Size": String(buf.length),
        "X-Compressed-Size": String(output.length),
      });
    }

    // Fallback: pdf-lib
    const pdfDoc = await PDFDocument.load(buf);
    const output = await pdfDoc.save({ useObjectStreams: true });
    const name = file.name.replace(".pdf", "");
    return binaryResponse(output, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${name}_compressed.pdf"`,
      "X-Original-Size": String(buf.length),
      "X-Compressed-Size": String(output.length),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
