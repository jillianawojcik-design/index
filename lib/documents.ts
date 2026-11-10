import "server-only";
import { inflateRawSync } from "node:zlib";

// Reads uploaded resumes and supporting documents.
// - PDFs are checked here and then sent to Claude as-is (Claude reads PDFs
//   natively, including tables and layout).
// - DOCX files are unzipped and converted to plain text here.
// Uploads are processed in memory only and never written to disk or the database.

export const MAX_FILE_BYTES = 4 * 1024 * 1024; // per file
export const MAX_TOTAL_BYTES = 4.3 * 1024 * 1024; // Vercel rejects request bodies over 4.5 MB
export const MAX_SUPPORTING_FILES = 2;
const MAX_DOCX_TEXT = 60_000;
const MAX_UNZIPPED_BYTES = 25 * 1024 * 1024; // guards against "zip bombs"

export type ParsedDocument =
  | { kind: "pdf"; name: string; base64: string }
  | { kind: "text"; name: string; text: string };

export class DocumentError extends Error {}

function isPdf(bytes: Uint8Array) {
  // "%PDF-" within the first 1 KB (some generators add a few bytes first).
  const head = Buffer.from(bytes.subarray(0, 1024)).toString("latin1");
  return head.includes("%PDF-");
}

function isZip(bytes: Uint8Array) {
  return bytes.length > 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
}

export async function parseUpload(file: File): Promise<ParsedDocument> {
  const name = (file.name || "document").slice(0, 120);
  if (file.size === 0) throw new DocumentError(`"${name}" is empty.`);
  if (file.size > MAX_FILE_BYTES) throw new DocumentError(`"${name}" is larger than 4 MB.`);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = name.toLowerCase().split(".").pop();

  if (ext === "pdf") {
    if (!isPdf(bytes)) throw new DocumentError(`"${name}" isn't a valid PDF.`);
    return { kind: "pdf", name, base64: Buffer.from(bytes).toString("base64") };
  }
  if (ext === "docx") {
    if (!isZip(bytes)) throw new DocumentError(`"${name}" isn't a valid Word (.docx) file.`);
    const text = docxToText(bytes);
    if (text.trim().length < 20) throw new DocumentError(`Couldn't find any text in "${name}".`);
    return { kind: "text", name, text };
  }
  if (ext === "doc") {
    throw new DocumentError(`"${name}" is an older .doc file. Please save it as .docx or PDF and try again.`);
  }
  throw new DocumentError(`"${name}" isn't supported. Upload a PDF or Word (.docx) file.`);
}

// ---------------------------------------------------------------------------
// DOCX → text, with no external libraries. A .docx is a zip archive; the
// document body is the XML file word/document.xml.

function readZipEntry(zip: Uint8Array, wanted: string): Uint8Array | null {
  const buf = Buffer.from(zip.buffer, zip.byteOffset, zip.byteLength);
  // Find the End Of Central Directory record (searching backwards).
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65_557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new DocumentError("This Word file appears to be damaged.");

  const entries = buf.readUInt16LE(eocd + 10);
  let ptr = buf.readUInt32LE(eocd + 16);
  for (let n = 0; n < entries && ptr + 46 <= buf.length; n++) {
    if (buf.readUInt32LE(ptr) !== 0x02014b50) break;
    const method = buf.readUInt16LE(ptr + 10);
    const compressedSize = buf.readUInt32LE(ptr + 20);
    const uncompressedSize = buf.readUInt32LE(ptr + 24);
    const nameLen = buf.readUInt16LE(ptr + 28);
    const extraLen = buf.readUInt16LE(ptr + 30);
    const commentLen = buf.readUInt16LE(ptr + 32);
    const localOffset = buf.readUInt32LE(ptr + 42);
    const entryName = buf.toString("utf8", ptr + 46, ptr + 46 + nameLen);
    ptr += 46 + nameLen + extraLen + commentLen;
    if (entryName !== wanted) continue;

    if (buf.readUInt32LE(localOffset) !== 0x04034b50) throw new DocumentError("This Word file appears to be damaged.");
    const dataStart = localOffset + 30 + buf.readUInt16LE(localOffset + 26) + buf.readUInt16LE(localOffset + 28);
    const data = buf.subarray(dataStart, dataStart + compressedSize);
    if (uncompressedSize > MAX_UNZIPPED_BYTES) throw new DocumentError("This Word file is too large to read.");
    if (method === 0) return data;
    if (method === 8) {
      try {
        return inflateRawSync(data, { maxOutputLength: MAX_UNZIPPED_BYTES });
      } catch {
        throw new DocumentError("This Word file appears to be damaged.");
      }
    }
    throw new DocumentError("This Word file uses an unsupported format.");
  }
  return null;
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

export function docxToText(bytes: Uint8Array): string {
  const xmlBytes = readZipEntry(bytes, "word/document.xml");
  if (!xmlBytes) throw new DocumentError("This doesn't look like a Word document.");
  const xml = Buffer.from(xmlBytes).toString("utf8");

  const text = xml
    .replace(/<w:delText[^>]*>[\s\S]*?<\/w:delText>/g, "") // deleted tracked changes
    .replace(/<w:instrText[^>]*>[\s\S]*?<\/w:instrText>/g, "") // field codes
    .replace(/<w:tab\/>/g, "\t")
    .replace(/<w:(br|cr)\/>/g, "\n")
    .replace(/<\/w:p>\s*<\/w:tc>/g, "\t") // last paragraph in a table cell → cell separator
    .replace(/<\/w:tc>/g, "\t")
    .replace(/<\/w:tr>/g, "\n") // table rows
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, e: string) =>
      e[0] === "#"
        ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10))
        : ENTITIES[e.toLowerCase()]
    )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text.slice(0, MAX_DOCX_TEXT);
}
