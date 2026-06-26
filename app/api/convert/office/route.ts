import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import { writeFileSync, readFileSync, mkdirSync, readdirSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join, extname } from "path";

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  odt: "application/vnd.oasis.opendocument.text",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  odp: "application/vnd.oasis.opendocument.presentation",
  html: "text/html",
  txt: "text/plain",
  csv: "text/csv",
  rtf: "application/rtf",
};

function findLibreOffice(): string | null {
  for (const cmd of ["libreoffice", "soffice", "/usr/bin/libreoffice", "/usr/lib/libreoffice/program/soffice"]) {
    try { execSync(`which ${cmd} 2>/dev/null || test -f ${cmd}`, { stdio: "ignore" }); return cmd; } catch {}
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;
    const targetFormat = ((form.get("to") as string) || "pdf").toLowerCase();

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const lo = findLibreOffice();
    if (!lo) {
      return NextResponse.json({
        error: "LibreOffice not found. Install it on the server.",
        hint: "sudo apt install libreoffice",
      }, { status: 501 });
    }

    const tmpDir = join(tmpdir(), `convert_${Date.now()}`);
    mkdirSync(tmpDir, { recursive: true });

    const inputPath = join(tmpDir, file.name);
    writeFileSync(inputPath, Buffer.from(await file.arrayBuffer()));

    // LibreOffice filter mapping
    const filterMap: Record<string, string> = {
      pdf: "writer_pdf_Export",
      html: "HTML (StarWriter)",
      txt: "Text (encoded)",
      rtf: "Rich Text Format",
      csv: "Text - txt - csv (StarCalc)",
      docx: "MS Word 2007 XML",
      xlsx: "Calc MS Excel 2007 XML",
      pptx: "Impress MS PowerPoint 2007 XML",
    };

    const filter = filterMap[targetFormat];
    const filterArg = filter ? `--infilter="${filter}"` : "";

    execSync(
      `${lo} --headless --convert-to ${targetFormat} ${filterArg} --outdir "${tmpDir}" "${inputPath}"`,
      { timeout: 120000, env: { ...process.env, HOME: tmpDir } }
    );

    const outputFiles = readdirSync(tmpDir).filter(f => f !== file.name && f.endsWith(`.${targetFormat}`));
    if (!outputFiles.length) {
      rmSync(tmpDir, { recursive: true, force: true });
      return NextResponse.json({ error: "Conversion failed - no output file" }, { status: 500 });
    }

    const output = readFileSync(join(tmpDir, outputFiles[0]));
    rmSync(tmpDir, { recursive: true, force: true });

    const origName = file.name.replace(/\.[^.]+$/, "");
    const mime = MIME[targetFormat] || "application/octet-stream";

    return new NextResponse(output, {
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="${origName}.${targetFormat}"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
