import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { binaryResponse } from "@/lib/response";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const files = form.getAll("files") as File[];
    const zipName = (form.get("name") as string) || "archive";

    if (!files.length) return NextResponse.json({ error: "No files" }, { status: 400 });

    const zip = new JSZip();
    for (const file of files) zip.file(file.name, await file.arrayBuffer());

    const output = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 9 } });
    return binaryResponse(output, {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipName}.zip"`,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
