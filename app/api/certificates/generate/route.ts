import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { storePDFTemporarily } from '@/lib/pdf-cache';
import { nodeCertificateGenerator } from '@/lib/certificate-generator-node';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields for new exact generator
    const requiredFields = ['donor_name', 'amount', 'donation_id', 'donation_date'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Sanitize and validate input data
    const sanitizeString = (str: string): string => {
      // Remove any potentially harmful characters
      return String(str).replace(/[<>]/g, '');
    };

    // Prepare certificate data with sanitization
    const certificateData = {
      donor_name: sanitizeString(body.donor_name),
      amount: String(Number(body.amount)), // Ensure it's a valid number
      donation_id: sanitizeString(body.donation_id),
      donation_date: sanitizeString(body.donation_date),
      phone_number: body.phone_number ? sanitizeString(body.phone_number) : "",
      reason_text: body.reason_text ? sanitizeString(body.reason_text) : "for their valued contribution"
    };

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `certificate_${certificateData.donation_id}_${timestamp}.pdf`;

    try {
      console.log(`[Certificate] Generating certificate for ${certificateData.donor_name}...`);

      // Generate PDF using Node.js Puppeteer
      const pdfBuffer = await nodeCertificateGenerator.generate(certificateData);

      // Convert PDF to base64
      const pdfBase64 = pdfBuffer.toString('base64');

      // Store PDF temporarily and get serving URL
      const pdfId = storePDFTemporarily(pdfBase64, filename);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const downloadUrl = `${baseUrl}/api/certificates/serve/${pdfId}`;

      console.log(`[Certificate] Generated and stored temporarily: ${downloadUrl}`);

      // Return success response with temporary download URL
      // PDF will be served once to WhatsApp, then auto-deleted from cache
      return NextResponse.json({
        success: true,
        filename: filename,
        download_url: downloadUrl,
        pdf_base64: pdfBase64, // Also include base64 for direct use if needed
        donation_id: certificateData.donation_id,
        donor_name: certificateData.donor_name,
        message: 'Certificate generated successfully (temporary URL valid for 5 minutes)'
      });

    } catch (generationError) {
      console.error('Certificate generation error:', generationError);
      console.error('Error stack:', generationError instanceof Error ? generationError.stack : 'No stack');
      return NextResponse.json(
        {
          error: 'Certificate generation failed',
          details: generationError instanceof Error ? generationError.message : 'Generation error',
          stack: generationError instanceof Error ? generationError.stack : undefined,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Certificate generation error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Health check endpoint
  try {
    const projectRoot = process.cwd();
    const templatePath = path.join(projectRoot, 'public', 'certificates', 'templates', 'donation_certificate_temple_v19_phone.html');

    // Check if template exists
    try {
      await fs.access(templatePath);
    } catch {
      return NextResponse.json(
        {
          status: 'unhealthy',
          service: 'certificate-api',
          error: 'Certificate template not found',
          generator: 'node-puppeteer'
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      service: 'certificate-api',
      message: 'Certificate generation service is ready',
      generator: 'node-puppeteer'
    });

  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        service: 'certificate-api',
        error: error instanceof Error ? error.message : 'Health check failed',
        generator: 'node-puppeteer'
      },
      { status: 503 }
    );
  }
}
