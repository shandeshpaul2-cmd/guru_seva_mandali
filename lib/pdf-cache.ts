// Simple in-memory cache for temporary PDF storage
// This will be cleared when the serverless function cold-starts
const pdfCache = new Map<string, { data: Buffer; filename: string; timestamp: number }>();

// Clean up old PDFs (older than 5 minutes)
function cleanupOldPDFs() {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  for (const [id, pdf] of pdfCache.entries()) {
    if (now - pdf.timestamp > fiveMinutes) {
      pdfCache.delete(id);
      console.log(`[Cleanup] Removed old PDF: ${id}`);
    }
  }
}

// Store PDF temporarily and return an ID
export function storePDFTemporarily(pdfBase64: string, filename: string): string {
  cleanupOldPDFs();

  const id = `pdf-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const pdfBuffer = Buffer.from(pdfBase64, 'base64');

  pdfCache.set(id, {
    data: pdfBuffer,
    filename,
    timestamp: Date.now()
  });

  console.log(`[PDF Cache] Stored PDF with ID: ${id}`);
  return id;
}

// Get cached PDF by ID
export function getCachedPDF(id: string): { data: Buffer; filename: string } | undefined {
  return pdfCache.get(id);
}

// Delete cached PDF by ID
export function deleteCachedPDF(id: string): boolean {
  const result = pdfCache.delete(id);
  if (result) {
    console.log(`[PDF Cache] Removed PDF: ${id}`);
  }
  return result;
}
