import sgMail from '@sendgrid/mail';

// Set the API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export class EmailService {
  private static fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@temple.org';

  static async sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
    try {
      if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === 'YOUR_SENDGRID_API_KEY_HERE') {
        console.warn('SENDGRID_API_KEY not configured, skipping email send');
        return { success: false, error: 'Email service not configured - Please add your SendGrid API key' };
      }

      const recipientEmails = Array.isArray(options.to) ? options.to : [options.to];

      const msg: any = {
        from: options.from || this.fromEmail,
        to: recipientEmails,
        subject: options.subject,
        html: options.html,
      };

      // Add attachments if provided - convert Buffer to base64 for SendGrid
      if (options.attachments && options.attachments.length > 0) {
        msg.attachments = options.attachments
          .filter(attachment => attachment && attachment.content) // Filter out null/undefined content
          .map(attachment => ({
            filename: attachment.filename,
            content: attachment.content instanceof Buffer
              ? attachment.content.toString('base64')
              : attachment.content,
            type: attachment.contentType || 'application/octet-stream',
            disposition: 'attachment'
          }));
      }

      const response = await sgMail.send(msg);

      console.log('✅ Email sent successfully via SendGrid:', response[0]?.headers?.['x-message-id']);
      console.log('📧 Email sent to:', recipientEmails);
      return { success: true };
    } catch (error: any) {
      console.error('Email service error:', error);

      // Handle SendGrid specific errors
      if (error.response) {
        console.error('SendGrid API Error:', error.response.body);
        return {
          success: false,
          error: `SendGrid error: ${error.response.body?.errors?.[0]?.message || error.message}`
        };
      }

      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }


  static async sendDonationReceipt(donorEmail: string, donorName: string, amount: number, receiptNumber: string, poojaName: string, gotra: string, certificateUrl?: string): Promise<{ success: boolean; error?: string }> {
    const subject = `Donation Receipt - ${receiptNumber}`;
    const html = this.generateDonationReceiptTemplate(donorName, amount, receiptNumber, poojaName, gotra, certificateUrl);

    // Prepare attachments
    const attachments: Array<{
      filename: string;
      content: Buffer | string;
      contentType?: string;
    }> = [];

    // Add certificate as attachment if URL is provided
    if (certificateUrl) {
      try {
        const certificateContent = await this.fetchPdfFromUrl(certificateUrl);
        if (certificateContent && certificateContent.length > 0) {
          attachments.push({
            filename: `Donation_Certificate_${receiptNumber}.pdf`,
            content: certificateContent,
            contentType: 'application/pdf'
          });
        } else {
          console.warn('Certificate PDF is empty or null, skipping attachment');
        }
      } catch (error) {
        console.warn('Failed to fetch certificate for email attachment:', error);
        // Continue without attachment rather than failing the email
      }
    }

    return this.sendEmail({
      to: donorEmail,
      subject,
      html,
      attachments: attachments.length > 0 ? attachments : undefined
    });
  }


  private static async fetchPdfFromUrl(url: string): Promise<Buffer | null> {
    try {
      // Convert relative URL to absolute URL
      let absoluteUrl = url;
      if (url.startsWith('/')) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3010';
        absoluteUrl = `${baseUrl}${url}`;
      }

      console.log('Fetching PDF from URL:', absoluteUrl);
      const response = await fetch(absoluteUrl);
      if (!response.ok) {
        console.warn('Failed to fetch PDF:', response.status, response.statusText);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('Error fetching PDF from URL:', error);
      return null;
    }
  }

  static async sendDonationNotificationToAdmin(donorName: string, amount: number, receiptNumber: string, poojaName: string, email: string, phone: string, gotra: string): Promise<{ success: boolean; error?: string }> {
    // Admin emails disabled - prioritizing user emails only
    console.log('Admin email notification disabled for donation:', receiptNumber);
    return { success: true };
  }

  static async sendPoojaBookingConfirmation(devoteeEmail: string, devoteeName: string, poojaName: string, receiptNumber: string, scheduledDate: string, amount: number): Promise<{ success: boolean; error?: string }> {
    const subject = `Pooja Booking Confirmation - ${receiptNumber}`;
    const html = this.generatePoojaBookingTemplate(devoteeName, poojaName, receiptNumber, scheduledDate, amount);

    return this.sendEmail({
      to: devoteeEmail,
      subject,
      html
    });
  }

  static async sendPoojaBookingNotificationToAdmin(devoteeName: string, poojaName: string, receiptNumber: string, scheduledDate: string, email: string, phone: string): Promise<{ success: boolean; error?: string }> {
    // Admin emails disabled - prioritizing user emails only
    console.log('Admin email notification disabled for pooja booking:', receiptNumber);
    return { success: true };
  }


  static async sendAstrologyConsultationConfirmation(clientEmail: string, clientName: string, consultationType: string, receiptNumber: string, scheduledDate: string, amount: number): Promise<{ success: boolean; error?: string }> {
    const subject = `Astrology Consultation Confirmation - ${receiptNumber}`;
    const html = this.generateAstrologyConfirmationTemplate(clientName, consultationType, receiptNumber, scheduledDate, amount);

    return this.sendEmail({
      to: clientEmail,
      subject,
      html
    });
  }

  static async sendAstrologyConsultationNotificationToAdmin(clientName: string, consultationType: string, receiptNumber: string, scheduledDate: string, email: string, phone: string, birthDetails: any): Promise<{ success: boolean; error?: string }> {
    // Admin emails disabled - prioritizing user emails only
    console.log('Admin email notification disabled for astrology consultation:', receiptNumber);
    return { success: true };
  }


  private static generateDonationReceiptTemplate(name: string, amount: number, receiptNumber: string, poojaName: string, gotra: string, certificateUrl?: string): string {
    const templeName = process.env.TEMPLE_NAME || "Shri Raghavendra Swamy Brundavana Sannidhi";
    const templeAddress = process.env.TEMPLE_ADDRESS || "9/2, Damodar Modaliar Road, Ulsoor, Bangalore - 560008";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Donation Receipt</title>
        <style>
          body { font-family: 'Georgia', serif; line-height: 1.6; color: #2c3e50; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 3px solid #d4af37; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #8b4513; font-size: 28px; margin: 0; }
          .content { background: #f9f5f0; padding: 30px; border-radius: 10px; border: 1px solid #d4af37; }
          .details { margin: 20px 0; }
          .details h3 { color: #8b4513; border-bottom: 2px solid #d4af37; padding-bottom: 5px; }
          .details p { margin: 10px 0; }
          .amount { font-size: 24px; font-weight: bold; color: #d4af37; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-style: italic; color: #666; }
          .certificate-link { text-align: center; margin: 20px 0; }
          .certificate-link a { background: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
          .attachment-notice { text-align: center; margin: 20px 0; padding: 15px; background: #f0f8ff; border: 2px dashed #d4af37; border-radius: 8px; }
          .attachment-notice p { margin: 5px 0; color: #8b4513; font-weight: 500; }
          .om-symbol { font-size: 48px; text-align: center; margin-bottom: 20px; color: #d4af37; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="om-symbol">ॐ</div>
          <div class="header">
            <h1>${templeName}</h1>
            <p>${templeAddress}</p>
          </div>

          <div class="content">
            <h2 style="text-align: center; color: #8b4513;">Donation Receipt</h2>
            <p style="text-align: center; font-style: italic;">May your generous contribution bring you divine blessings</p>

            <div class="details">
              <h3>Donor Information</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Gotra:</strong> ${gotra || 'Not specified'}</p>
              <p><strong>Receipt Number:</strong> ${receiptNumber}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div class="details">
              <h3>Donation Details</h3>
              <p><strong>Pooja:</strong> ${poojaName}</p>
              <p><strong>Amount:</strong> ₹${amount.toLocaleString('en-IN')}</p>
            </div>

            <div class="amount">
              Total Donation: ₹${amount.toLocaleString('en-IN')}
            </div>

            ${certificateUrl ? `
            <div class="attachment-notice">
              <p>📎 Your Sacred Certificate is Attached to this Email</p>
              <p style="font-size: 14px; color: #666;">Find the certificate PDF in the attachments of this email</p>
            </div>
            <div class="certificate-link">
              <a href="${certificateUrl}">Or Download Certificate Here</a>
            </div>
            ` : ''}

            <div style="text-align: center; margin-top: 30px;">
              <p style="font-style: italic;">"The hands that serve are holier than the lips that pray."</p>
              <p style="font-style: italic;">- Sri Sathya Sai Baba</p>
            </div>
          </div>

          <div class="footer">
            <p>This receipt is generated automatically and is valid for tax purposes.</p>
            <p>For any queries, please contact us at ${process.env.TEMPLE_PHONE_1 || 'temple phone'}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateDonationNotificationTemplate(donorName: string, amount: number, receiptNumber: string, poojaName: string, email: string, phone: string, gotra: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Donation Received</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #d4af37; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .details { margin: 20px 0; }
          .details h3 { color: #8b4513; }
          .amount { font-size: 20px; font-weight: bold; color: #d4af37; }
          .footer { text-align: center; margin-top: 30px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Donation Received</h1>
          </div>

          <div class="content">
            <div class="details">
              <h3>Donor Information</h3>
              <p><strong>Name:</strong> ${donorName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Gotra:</strong> ${gotra || 'Not specified'}</p>
            </div>

            <div class="details">
              <h3>Donation Details</h3>
              <p><strong>Receipt Number:</strong> ${receiptNumber}</p>
              <p><strong>Pooja:</strong> ${poojaName}</p>
              <p class="amount"><strong>Amount:</strong> ₹${amount.toLocaleString('en-IN')}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          <div class="footer">
            <p>Please ensure the receipt and certificate are sent to the donor.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generatePoojaBookingTemplate(name: string, poojaName: string, receiptNumber: string, scheduledDate: string, amount: number): string {
    const templeName = process.env.TEMPLE_NAME || "Shri Raghavendra Swamy Brundavana Sannidhi";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Pooja Booking Confirmation</title>
        <style>
          body { font-family: 'Georgia', serif; line-height: 1.6; color: #2c3e50; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 3px solid #d4af37; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #8b4513; font-size: 28px; margin: 0; }
          .content { background: #f9f5f0; padding: 30px; border-radius: 10px; border: 1px solid #d4af37; }
          .details { margin: 20px 0; }
          .details h3 { color: #8b4513; border-bottom: 2px solid #d4af37; padding-bottom: 5px; }
          .details p { margin: 10px 0; }
          .amount { font-size: 24px; font-weight: bold; color: #d4af37; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-style: italic; color: #666; }
          .om-symbol { font-size: 48px; text-align: center; margin-bottom: 20px; color: #d4af37; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="om-symbol">ॐ</div>
          <div class="header">
            <h1>${templeName}</h1>
          </div>

          <div class="content">
            <h2 style="text-align: center; color: #8b4513;">Pooja Booking Confirmation</h2>
            <p style="text-align: center; font-style: italic;">May your prayers be answered and blessings bestowed upon you</p>

            <div class="details">
              <h3>Devotee Information</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Receipt Number:</strong> ${receiptNumber}</p>
            </div>

            <div class="details">
              <h3>Pooja Details</h3>
              <p><strong>Pooja:</strong> ${poojaName}</p>
              <p><strong>Scheduled Date:</strong> ${new Date(scheduledDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Amount:</strong> ₹${amount.toLocaleString('en-IN')}</p>
            </div>

            <div class="amount">
              Total Paid: ₹${amount.toLocaleString('en-IN')}
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <p style="font-style: italic;">"Worship is the act of the soul trying to realize the presence of the Divine."</p>
              <p style="font-style: italic;">- Swami Vivekananda</p>
            </div>
          </div>

          <div class="footer">
            <p>Please arrive 15 minutes before the scheduled time.</p>
            <p>For any queries, please contact us at ${process.env.TEMPLE_PHONE_1 || 'temple phone'}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generatePoojaAdminNotificationTemplate(name: string, poojaName: string, receiptNumber: string, scheduledDate: string, email: string, phone: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Pooja Booking</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #d4af37; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .details { margin: 20px 0; }
          .details h3 { color: #8b4513; }
          .footer { text-align: center; margin-top: 30px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Pooja Booking</h1>
          </div>

          <div class="content">
            <div class="details">
              <h3>Devotee Information</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
            </div>

            <div class="details">
              <h3>Booking Details</h3>
              <p><strong>Receipt Number:</strong> ${receiptNumber}</p>
              <p><strong>Pooja:</strong> ${poojaName}</p>
              <p><strong>Scheduled Date:</strong> ${new Date(scheduledDate).toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          <div class="footer">
            <p>Please make necessary arrangements for the pooja.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateAstrologyConfirmationTemplate(name: string, consultationType: string, receiptNumber: string, scheduledDate: string, amount: number): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Astrology Consultation Confirmation</title>
        <style>
          body { font-family: 'Georgia', serif; line-height: 1.6; color: #2c3e50; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 3px solid #d4af37; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #8b4513; font-size: 28px; margin: 0; }
          .content { background: #f9f5f0; padding: 30px; border-radius: 10px; border: 1px solid #d4af37; }
          .details { margin: 20px 0; }
          .details h3 { color: #8b4513; border-bottom: 2px solid #d4af37; padding-bottom: 5px; }
          .details p { margin: 10px 0; }
          .amount { font-size: 24px; font-weight: bold; color: #d4af37; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-style: italic; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${process.env.TEMPLE_NAME || "Temple Astrology Services"}</h1>
          </div>

          <div class="content">
            <h2 style="text-align: center; color: #8b4513;">Astrology Consultation Confirmation</h2>
            <p style="text-align: center; font-style: italic;">May the stars guide you toward wisdom and clarity</p>

            <div class="details">
              <h3>Client Information</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Receipt Number:</strong> ${receiptNumber}</p>
            </div>

            <div class="details">
              <h3>Consultation Details</h3>
              <p><strong>Consultation Type:</strong> ${consultationType}</p>
              <p><strong>Scheduled Date:</strong> ${new Date(scheduledDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Amount:</strong> ₹${amount.toLocaleString('en-IN')}</p>
            </div>

            <div class="amount">
              Total Paid: ₹${amount.toLocaleString('en-IN')}
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <p style="font-style: italic;">"The stars incline us, they do not bind us."</p>
            </div>
          </div>

          <div class="footer">
            <p>Please have your birth details ready for the consultation.</p>
            <p>For any queries, please contact us at ${process.env.TEMPLE_PHONE_1 || 'temple phone'}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateAstrologyAdminNotificationTemplate(name: string, consultationType: string, receiptNumber: string, scheduledDate: string, email: string, phone: string, birthDetails: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Astrology Consultation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #d4af37; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .details { margin: 20px 0; }
          .details h3 { color: #8b4513; }
          .footer { text-align: center; margin-top: 30px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Astrology Consultation Booking</h1>
          </div>

          <div class="content">
            <div class="details">
              <h3>Client Information</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
            </div>

            <div class="details">
              <h3>Consultation Details</h3>
              <p><strong>Receipt Number:</strong> ${receiptNumber}</p>
              <p><strong>Consultation Type:</strong> ${consultationType}</p>
              <p><strong>Scheduled Date:</strong> ${new Date(scheduledDate).toLocaleDateString('en-IN')}</p>
            </div>

            ${birthDetails ? `
            <div class="details">
              <h3>Birth Details</h3>
              <p><strong>Date of Birth:</strong> ${birthDetails.dateOfBirth || 'Not provided'}</p>
              <p><strong>Time of Birth:</strong> ${birthDetails.timeOfBirth || 'Not provided'}</p>
              <p><strong>Place of Birth:</strong> ${birthDetails.placeOfBirth || 'Not provided'}</p>
            </div>
            ` : ''}
          </div>

          <div class="footer">
            <p>Please review the client details before the consultation.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}