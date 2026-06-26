import { NextRequest, NextResponse } from "next/server";
import { binaryResponse } from "@/lib/response";

// PDF encryption using qpdf if available, otherwise returns error with install instructions
// pdf-lib 1.17.1 does not support password encryption in save()
import { execSync, spawnSync } from "child_process";
import { writeFileSync, readFileSync, mkdirSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;
    const userPassword = form.get("userPassword") as string;
    const ownerPassword = (form.get("ownerPassword") as string) || userPassword + "_owner";

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    if (!userPassword) return NextResponse.json({ error: "Password required" }, { status: 400 });

    // Check qpdf
    const check = spawnSync("which", ["qpdf"], { encoding: "utf8" });
    if (check.status !== 0) {
      return NextResponse.json({
        error: "PDF encryption requires qpdf.",
        hint: "sudo pacman -S qpdf  (or: sudo apt install qpdf)",
        vercel: false,
      }, { status: 501 });
    }

    const tmpDir = join(tmpdir(), `pdfenc_${Date.now()}`);
    mkdirSync(tmpDir, { recursive: true });
    const inPath = join(tmpDir, "input.pdf");
    const outPath = join(tmpDir, "encrypted.pdf");
    writeFileSync(inPath, Buffer.from(await file.arrayBuffer()));

    execSync(`qpdf --allow-weak-crypto --encrypt "${userPassword}" "${ownerPassword}" 256 -- "${inPath}" "${outPath}"`, { timeout: 30000 });

    const output = readFileSync(outPath);
    rmSync(tmpDir, { recursive: true, force: true });

    return binaryResponse(output, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${file.name.replace(".pdf", "_encrypted.pdf")}"`,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
