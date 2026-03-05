import { parsePDF } from "./pdf";
import { parseDOCX } from "./docx";

export type SupportedMimeType =
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "text/plain";

export async function parseFile(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<string> {
  switch (mimeType) {
    case "application/pdf":
      return parsePDF(buffer);

    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return parseDOCX(buffer);

    case "text/plain":
      return buffer.toString("utf-8").trim();

    default:
      throw new Error(
        `Unsupported file type: ${mimeType} (${fileName}). Supported: PDF, DOCX, TXT`
      );
  }
}

export function getFileType(fileName: string): SupportedMimeType | null {
  const ext = fileName.toLowerCase().split(".").pop();
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "txt":
      return "text/plain";
    default:
      return null;
  }
}
