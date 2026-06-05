/**
 * Node.js Certificate Generator using Puppeteer
 * Works on Vercel with @sparticuz/chromium
 */

import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import path from 'path';
import fs from 'fs/promises';

export interface CertificateInput {
  donor_name: string;
  amount: string | number;
  donation_id: string;
  donation_date: string;
  phone_number?: string;
  reason_text?: string;
}

export interface CertificateGeneratorOptions {
  templatePath?: string;
}

export class NodeCertificateGenerator {
  private templatePath: string;

  constructor(options: CertificateGeneratorOptions = {}) {
    // In production (Vercel), files must be in public/ to be included in deployment
    this.templatePath = options.templatePath ||
      path.join(process.cwd(), 'public', 'certificates', 'templates', 'donation_certificate_temple_v19_phone.html');
  }

  /**
   * Generate certificate PDF using Puppeteer
   */
  async generate(input: CertificateInput): Promise<Buffer> {
    let browser;

    try {
      // Read HTML template
      const htmlTemplate = await fs.readFile(this.templatePath, 'utf-8');

      // Prepare data for injection
      const certData = {
        donorName: input.donor_name,
        amountINR: typeof input.amount === 'string' ? parseFloat(input.amount) : input.amount,
        donationId: input.donation_id,
        donationDate: input.donation_date,
        phoneNumber: input.phone_number || '',
        reasonText: input.reason_text || 'for their valued contribution',
      };

      // Inject CERT_DATA script into the template's <head> section
      // This ensures proper HTML structure (no nested html/body tags)
      const certDataScript = `<script>window.CERT_DATA = ${JSON.stringify(certData)};</script>`;

      // Insert the script right after the opening <head> tag
      const htmlWithData = htmlTemplate.replace(
        /<head>/i,
        `<head>\n${certDataScript}`
      );

      // Launch Puppeteer
      const isLocal = process.env.NODE_ENV !== 'production';

      if (isLocal) {
        // Local development - use local Chrome
        browser = await puppeteer.launch({
          args: puppeteer.defaultArgs(),
          executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
          headless: true,
          timeout: 45000,
        });
      } else {
        // Production (Vercel) - use @sparticuz/chromium
        console.log('[Certificate] Starting Chromium setup for production...');

        const executablePath = await chromium.executablePath();
        console.log('[Certificate] Chromium executable path:', executablePath);
        console.log('[Certificate] Chromium args count:', chromium.args.length);

        browser = await puppeteer.launch({
          args: chromium.args,
          defaultViewport: {
            width: 1280,
            height: 720,
          },
          executablePath: executablePath,
          headless: true,
          timeout: 45000,
        });

        console.log('[Certificate] Browser launched successfully');
      }

      const page = await browser.newPage();

      // Optimize page for PDF generation
      await page.setDefaultNavigationTimeout(45000);
      await page.setDefaultTimeout(45000);

      // Set content and wait for fonts/images
      // Use domcontentloaded instead of networkidle for faster generation
      await page.setContent(htmlWithData, {
        waitUntil: 'domcontentloaded',
        timeout: 45000,
      });

      // Wait a bit for fonts to load
      await page.evaluate(() => {
        return new Promise<void>((resolve) => {
          if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => resolve());
          } else {
            setTimeout(() => resolve(), 1000);
          }
        });
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      });

      return Buffer.from(pdfBuffer);

    } catch (error) {
      console.error('Certificate generation error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
      });

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('Navigation timeout')) {
          throw new Error('Certificate generation timed out. The server may be under heavy load. Please try again.');
        } else if (error.message.includes('Protocol error') || error.message.includes('Target closed')) {
          throw new Error('Browser process crashed during certificate generation. This may be due to insufficient memory.');
        } else if (error.message.includes('ENOENT') || error.message.includes('not found')) {
          throw new Error('Certificate template file not found. Please contact support.');
        }
      }

      throw new Error(`Failed to generate certificate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          console.error('Error closing browser:', closeError);
        }
      }
    }
  }

  /**
   * Generate and save certificate to file
   */
  async generateToFile(input: CertificateInput, outputPath: string): Promise<string> {
    const pdfBuffer = await this.generate(input);
    await fs.writeFile(outputPath, pdfBuffer);
    return outputPath;
  }
}

// Export singleton instance
export const nodeCertificateGenerator = new NodeCertificateGenerator();
