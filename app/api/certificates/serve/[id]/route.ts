import { NextRequest, NextResponse } from 'next/server';
import { getCachedPDF, deleteCachedPDF } from '@/lib/pdf-cache';

// GET endpoint to serve the PDF
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const cached = getCachedPDF(id);

    if (!cached) {
      return NextResponse.json(
        { error: 'PDF not found or expired' },
        { status: 404 }
      );
    }

    // Delete from cache after serving (one-time use)
    deleteCachedPDF(id);

    // Convert Buffer to Uint8Array for NextResponse compatibility
    const uint8Array = new Uint8Array(cached.data);

    // Return PDF
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${cached.filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });

  } catch (error) {
    console.error('Error serving PDF:', error);
    return NextResponse.json(
      { error: 'Failed to serve PDF' },
      { status: 500 }
    );
  }
}
