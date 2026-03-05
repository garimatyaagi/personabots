export async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid build issues
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return data.text.trim();
  } catch (error) {
    console.error("PDF parsing failed:", error);
    throw new Error("Failed to parse PDF. The file may be corrupted or password-protected.");
  }
}
