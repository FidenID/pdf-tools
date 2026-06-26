import { NextResponse } from "next/server";

/** Wrap a binary payload (Buffer or Uint8Array) in a NextResponse with headers */
export function binaryResponse(
  data: Buffer | Uint8Array,
  headers: Record<string, string>
): NextResponse {
  // Convert to ArrayBuffer to satisfy BodyInit in strict TS
  const ab = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
  return new NextResponse(ab, { headers });
}
