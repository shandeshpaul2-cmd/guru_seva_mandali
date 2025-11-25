import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // Enhanced validation to prevent directory traversal
    if (!filename || typeof filename !== 'string') {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    // Decode filename in case of URL encoding attempts
    let decodedFilename: string;
    try {
      decodedFilename = decodeURIComponent(filename);
    } catch {
      return NextResponse.json(
        { error: 'Invalid filename encoding' },
        { status: 400 }
      );
    }

    // Strict validation: only allow alphanumeric, dash, underscore, and dot
    // Also validate it's a .pdf file
    const filenameRegex = /^[a-zA-Z0-9_-]+\.pdf$/;
    if (!filenameRegex.test(decodedFilename)) {
      return NextResponse.json(
        { error: 'Invalid filename format. Only PDF files with alphanumeric names are allowed.' },
        { status: 400 }
      );
    }

    // Get paths - Next.js runs from app/, certificates are in the same directory
    const projectRoot = process.cwd();
    const certificatesDir = path.join(projectRoot, 'certificates', 'output');
    const filePath = path.join(certificatesDir, decodedFilename);

    // Resolve to absolute paths and verify the file is within the allowed directory
    const resolvedFilePath = path.resolve(filePath);
    const resolvedCertificatesDir = path.resolve(certificatesDir);

    if (!resolvedFilePath.startsWith(resolvedCertificatesDir)) {
      console.error('Directory traversal attempt detected:', {
        requested: filename,
        decoded: decodedFilename,
        resolved: resolvedFilePath,
        allowed: resolvedCertificatesDir
      });
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = fs.readFileSync(filePath);

    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: headers
    });

  } catch (error) {
    console.error('Certificate download error:', error);
    return NextResponse.json(
      {
        error: 'Download failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}