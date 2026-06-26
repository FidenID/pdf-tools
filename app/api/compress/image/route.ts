import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { binaryResponse } from "@/lib/response";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;
    const quality = parseInt(form.get("quality") as string) || 80;
    const format = (form.get("format") as string) || "jpeg";
    const maxWidth = parseInt(form.get("maxWidth") as string) || 0;

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    let img = sharp(buffer);

    if (maxWidth > 0) img = img.resize({ width: maxWidth, withoutEnlargement: true });

    let output: Buffer;
    let mime: string;
    let ext: string;

    if (format === "webp") {
      output = await img.webp({ quality }).toBuffer();
      mime = "image/webp"; ext = "webp";
    } else if (format === "png") {
      output = await img.png({ compressionLevel: Math.floor((100 - quality) / 11) }).toBuffer();
      mime = "image/png"; ext = "png";
    } else if (format === "avif") {
      output = await img.avif({ quality }).toBuffer();
      mime = "image/avif"; ext = "avif";
    } else {
      output = await img.jpeg({ quality, mozjpeg: true }).toBuffer();
      mime = "image/jpeg"; ext = "jpg";
    }

    const originalName = file.name.replace(/\.[^.]+$/, "");
    return binaryResponse(output, {
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="${originalName}_compressed.${ext}"`,
      "X-Original-Size": String(buffer.length),
      "X-Compressed-Size": String(output.length),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
