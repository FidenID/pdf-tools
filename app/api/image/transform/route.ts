export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { binaryResponse } from "@/lib/response";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;
    const width = parseInt(form.get("width") as string) || 0;
    const height = parseInt(form.get("height") as string) || 0;
    const format = (form.get("format") as string) || "jpeg";
    const fit = (form.get("fit") as string) || "inside"; // inside | cover | fill

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const buf = Buffer.from(await file.arrayBuffer());
    let img = sharp(buf);

    if (width || height) {
      img = img.resize(
        width || undefined,
        height || undefined,
        { fit: fit as "inside" | "cover" | "fill", withoutEnlargement: true }
      );
    }

    const FORMATS: Record<string, { fn: () => ReturnType<typeof img.jpeg>; mime: string; ext: string }> = {
      jpeg: { fn: () => img.jpeg({ quality: 90, mozjpeg: true }), mime: "image/jpeg", ext: "jpg" },
      webp: { fn: () => img.webp({ quality: 90 }), mime: "image/webp", ext: "webp" },
      png:  { fn: () => img.png(), mime: "image/png", ext: "png" },
      avif: { fn: () => img.avif({ quality: 80 }), mime: "image/avif", ext: "avif" },
    };

    const f = FORMATS[format] || FORMATS.jpeg;
    const output = await f.fn().toBuffer();
    const meta = await sharp(output).metadata();
    const origName = file.name.replace(/\.[^.]+$/, "");

    return binaryResponse(output, {
      "Content-Type": f.mime,
      "Content-Disposition": `attachment; filename="${origName}.${f.ext}"`,
      "X-Width": String(meta.width || 0),
      "X-Height": String(meta.height || 0),
      "X-Original-Size": String(buf.length),
      "X-Output-Size": String(output.length),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
