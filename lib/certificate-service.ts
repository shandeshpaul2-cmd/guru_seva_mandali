/**
 * Certificate Service - Handles DONATION certificate generation ONLY
 * Integrates with Python certificate service via API endpoints
 */

export interface CertificateData {
  donor_name: string;
  amount: string | number;
  donation_id: string;
  donation_date: string; // YYYY-MM-DD format
  phone_number?: string;
  reason_text?: string;
}

export interface CertificateResponse {
  success: boolean;
  filename?: string;
  download_url?: string;
  pdf_base64?: string;
  message?: string;
  error?: string;
  details?: string;
}

export interface CertificateServiceConfig {
  baseUrl?: string;
  timeout?: number;
}

class CertificateService {
  private baseUrl: string;
  private timeout: number;

  constructor(config: CertificateServiceConfig = {}) {
    this.baseUrl = config.baseUrl || '/api/certificates';
    this.timeout = config.timeout || 60000; // 60 seconds for Puppeteer PDF generation
  }

  /**
   * Generate a donation certificate
   */
  async generateCertificate(data: CertificateData): Promise<CertificateResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donor_name: data.donor_name,
          amount: data.amount,
          donation_id: data.donation_id,
          donation_date: data.donation_date,
          phone_number: data.phone_number || '',
          reason_text: data.reason_text || 'for their valued contribution',
        }),
        signal: AbortSignal.timeout(this.timeout),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Certificate API error:', result);
        console.error('Certificate API error - Full details:', {
          error: result.error,
          details: result.details,
          stack: result.stack,
          timestamp: result.timestamp,
          fullResponse: JSON.stringify(result, null, 2)
        });
        return {
          success: false,
          error: result.error || 'Certificate generation failed',
          details: result.details || result.stack || JSON.stringify(result),
        };
      }

      return {
        success: true,
        filename: result.filename,
        download_url: result.download_url,
        pdf_base64: result.pdf_base64,
        message: result.message,
      };

    } catch (error) {
      console.error('Certificate service error:', error);
      console.error('Certificate service error - Full details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        errorObject: error
      });
      return {
        success: false,
        error: 'Network error',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if certificate service is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // Short timeout for health check
      });

      if (!response.ok) return false;

      const data = await response.json();
      return data.status === 'healthy';

    } catch (error) {
      console.error('Certificate service health check failed:', error);
      return false;
    }
  }

  /**
   * Download certificate file
   */
  async downloadCertificate(filename: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/download/${encodeURIComponent(filename)}`);

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Certificate download error:', error);
      throw error;
    }
  }

  /**
   * Generate certificate and immediately trigger download
   */
  async generateAndDownload(data: CertificateData): Promise<CertificateResponse> {
    const result = await this.generateCertificate(data);

    if (result.success) {
      try {
        // Check if we have base64 PDF data (preferred method for serverless)
        if (result.pdf_base64) {
          // Convert base64 to blob and download directly
          const base64Data = result.pdf_base64;
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = result.filename || 'certificate.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          console.log('[Certificate] Downloaded from base64 data');
        } else if (result.download_url) {
          // Fallback: try to download from URL (may fail in serverless)
          const response = await fetch(result.download_url);

          if (!response.ok) {
            throw new Error(`Download failed: ${response.statusText}`);
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = result.filename || 'certificate.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          console.log('[Certificate] Downloaded from URL');
        }
      } catch (error) {
        // Certificate was generated but download failed
        console.error('[Certificate] Download error:', error);
        return {
          success: false,
          error: 'Certificate generated but download failed',
          details: error instanceof Error ? error.message : 'Unknown error',
          filename: result.filename,
          download_url: result.download_url,
        };
      }
    }

    return result;
  }

  /**
   * Get certificate download URL for use in links or WhatsApp
   */
  getDownloadUrl(filename: string): string {
    return `${this.baseUrl}/download/${encodeURIComponent(filename)}`;
  }

  /**
   * Generate certificate asynchronously without blocking payment flow
   */
  async generateCertificateAsync(data: CertificateData): Promise<void> {
    // Fire and forget - generate certificate in background
    this.generateCertificate(data).catch(error => {
      console.warn('Async certificate generation failed:', error);
    });
  }

  /**
   * Format donation data from existing donation record
   */
  static formatDonationData(donation: {
    name?: string;
    donorName?: string;
    userInfo?: { fullName?: string; phoneNumber?: string };
    amount?: number;
    donationAmount?: number;
    receiptNumber?: string;
    donationId?: string;
    createdAt?: string | Date;
    phoneNumber?: string;
  }): CertificateData {
    return {
      donor_name: donation.name || donation.donorName || donation.userInfo?.fullName || '',
      amount: donation.amount || donation.donationAmount || 0,
      donation_id: donation.receiptNumber || donation.donationId || '',
      donation_date: donation.createdAt ?
        new Date(donation.createdAt).toISOString().split('T')[0] :
        new Date().toISOString().split('T')[0],
      phone_number: donation.phoneNumber || donation.userInfo?.phoneNumber || '',
      reason_text: 'for their valued contribution',
    };
  }
}

// Export singleton instance
export const certificateService = new CertificateService();

export default CertificateService;