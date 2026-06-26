import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import { writeFileSync, readFileSync, mkdirSync, rmSync, readdirSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { binaryResponse } from "@/lib/response";

const MIME: Record<string, string> = {
  pdf:  "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc:  "application/msword",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls:  "application/vnd.ms-excel",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ppt:  "application/vnd.ms-powerpoint",
  odt:  "application/vnd.oasis.opendocument.text",
  ods:  "application/vnd.oasis.opendocument.spreadsheet",
  odp:  "application/vnd.oasis.opendocument.presentation",
  html: "text/html",
  txt:  "text/plain",
  csv:  "text/csv",
  rtf:  "application/rtf",
  epub: "application/epub+zip",
};

function findLibreOffice(): string | null {
  for (const cmd of ["libreoffice", "soffice", "/usr/bin/libreoffice", "/usr/lib/libreoffice/program/soffice"]) {
    try { execSync(`which ${cmd} 2>/dev/null || test -x "${cmd}"`, { stdio: "pipe" }); return cmd; } catch {}
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;
    const to = ((form.get("to") as string) || "pdf").toLowerCase().trim();

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const lo = findLibreOffice();
    if (!lo) {
      return NextResponse.json({
        error: "LibreOffice not found on this server.",
        hint: "sudo pacman -S libreoffice-fresh  (or: sudo apt install libreoffice)",
      }, { status: 501 });
    }

    const tmpDir = join(tmpdir(), `lo_${Date.now()}`);
    mkdirSync(tmpDir, { recursive: true });

    const inputPath = join(tmpDir, file.name);
    writeFileSync(inputPath, Buffer.from(await file.arrayBuffer()));

    // LibreOffice conversion
    execSync(
      `${lo} --headless --convert-to ${to} --outdir "${tmpDir}" "${inputPath}"`,
      { timeout: 120000, env: { ...process.env, HOME: tmpDir, TMPDIR: tmpDir } }
    );

    const outputFiles = readdirSync(tmpDir).filter(f => f !== file.name && f.endsWith(`.${to}`));
    if (!outputFiles.length) {
      rmSync(tmpDir, { recursive: true, force: true });
      return NextResponse.json({ error: `Conversion to ${to.toUpperCase()} failed — no output produced.` }, { status: 500 });
    }

    const output = readFileSync(join(tmpDir, outputFiles[0]));
    rmSync(tmpDir, { recursive: true, force: true });

    const origName = file.name.replace(/\.[^.]+$/, "");
    return binaryResponse(output, {
      "Content-Type": MIME[to] || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${origName}.${to}"`,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
