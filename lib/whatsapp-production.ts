/**
 * Production-Ready WhatsApp Service for Twilio WhatsApp Business API
 * Includes rate limiting, error handling, delivery tracking, and compliance features
 */

import {
  getTemplate,
  prepareTemplateVariables,
  validateTemplateVariables,
  areTemplatesConfigured,
  type TemplateKey,
  type WhatsAppTemplateVariable
} from './whatsapp-templates';

export interface ProductionWhatsAppConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  webhookUrl?: string;
  webhookToken?: string;
  rateLimitPerSecond: number;
  rateLimitPerMinute: number;
  businessProfileId?: string;
  enableDeliveryReports: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface MessageMetrics {
  sent: number;
  delivered: number;
  failed: number;
  read: number;
  lastSentTime?: Date;
  averageDeliveryTime?: number;
}

export interface DeliveryReport {
  messageId: string;
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed' | 'undelivered';
  timestamp: Date;
  errorCode?: string;
  errorMessage?: string;
  deliveryTime?: number;
}

export interface WhatsAppTemplate {
  name: string;
  namespace?: string;
  language: {
    code: string;
    policy: 'deterministic' | 'fallback';
  };
  components: Array<{
    type: 'body' | 'header' | 'footer';
    text?: string;
    parameters?: Array<{ type: string; text: string }>;
  }>;
}

export interface ProductionWhatsAppMessage {
  phoneNumber: string;
  message: string;
  type: 'donation' | 'pooja_booking' | 'parihara_pooja' | 'astrology_consultation' | 'template';
  templateName?: string;
  templateParams?: string[];
  mediaUrl?: string;
  priority?: 'high' | 'normal' | 'low';
  deliveryCallbackUrl?: string;
  metadata?: Record<string, any>;
}

export interface RateLimiter {
  tokens: number;
  lastRefill: Date;
  windowStart: Date;
  countInWindow: number;
}

class ProductionWhatsAppService {
  private config: ProductionWhatsAppConfig;
  private adminPhoneNumber = '+917760118171';
  private templeName = 'Shri Raghavendra Swamy Brundavana Sannidhi';

  // Rate limiting
  private rateLimiter: RateLimiter = {
    tokens: 50,
    lastRefill: new Date(),
    windowStart: new Date(),
    countInWindow: 0
  };

  // Metrics tracking
  private metrics: MessageMetrics = {
    sent: 0,
    delivered: 0,
    failed: 0,
    read: 0
  };

  // Message queue for high-priority messages
  private messageQueue: ProductionWhatsAppMessage[] = [];
  private isProcessingQueue = false;

  constructor() {
    this.config = {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      phoneNumber: process.env.TWILIO_WHATSAPP_NUMBER || '',
      webhookUrl: process.env.WHATSAPP_WEBHOOK_URL,
      webhookToken: process.env.WHATSAPP_WEBHOOK_TOKEN,
      rateLimitPerSecond: parseInt(process.env.WHATSAPP_RATE_LIMIT_PER_SECOND || '50'),
      rateLimitPerMinute: parseInt(process.env.WHATSAPP_RATE_LIMIT_PER_MINUTE || '1000'),
      businessProfileId: process.env.WHATSAPP_BUSINESS_PROFILE_ID,
      enableDeliveryReports: process.env.WHATSAPP_ENABLE_DELIVERY_REPORTS === 'true',
      logLevel: (process.env.WHATSAPP_LOG_LEVEL as any) || 'info'
    };

    this.validateConfiguration();
    this.startMetricsInterval();
  }

  /**
   * Validate production configuration
   */
  private validateConfiguration(): void {
    const required = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_WHATSAPP_NUMBER'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(`Missing required WhatsApp configuration: ${missing.join(', ')}`);
    }

    if (process.env.NODE_ENV === 'production' && process.env.WHATSAPP_TEST_MODE === 'true') {
      this.log('warn', '⚠️ WhatsApp test mode is enabled in production environment');
    }

    // Validate phone number format
    if (!this.config.phoneNumber.startsWith('+')) {
      throw new Error('TWILIO_WHATSAPP_NUMBER must be in E.164 format (e.g., +1234567890)');
    }
  }

  /**
   * Enhanced logging with levels
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    if (levels[level] >= levels[this.config.logLevel]) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [WhatsApp-${level.toUpperCase()}] ${message}`;

      if (data) {
        console.log(logMessage, data);
      } else {
        console.log(logMessage);
      }
    }
  }

  /**
   * Rate limiting with token bucket algorithm
   */
  private async checkRateLimit(): Promise<boolean> {
    const now = new Date();

    // Refill tokens based on time elapsed
    const timeSinceRefill = now.getTime() - this.rateLimiter.lastRefill.getTime();
    const tokensToAdd = Math.floor(timeSinceRefill / 1000) * this.config.rateLimitPerSecond;

    this.rateLimiter.tokens = Math.min(
      this.config.rateLimitPerSecond,
      this.rateLimiter.tokens + tokensToAdd
    );
    this.rateLimiter.lastRefill = now;

    // Check per-minute limit
    if (now.getTime() - this.rateLimiter.windowStart.getTime() > 60000) {
      this.rateLimiter.windowStart = now;
      this.rateLimiter.countInWindow = 0;
    }

    if (this.rateLimiter.countInWindow >= this.config.rateLimitPerMinute) {
      this.log('warn', 'Rate limit exceeded: per-minute limit reached');
      return false;
    }

    if (this.rateLimiter.tokens < 1) {
      this.log('warn', 'Rate limit exceeded: no tokens available');
      return false;
    }

    this.rateLimiter.tokens--;
    this.rateLimiter.countInWindow++;
    return true;
  }

  /**
   * Enhanced phone number validation and formatting
   */
  private validateAndFormatPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }

    // Remove any non-digit characters
    let cleanPhone = phoneNumber.replace(/\D/g, '');

    // Validate length and format
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      throw new Error(`Invalid phone number length: ${phoneNumber}`);
    }

    // Add country code if not present (assuming India for temple use case)
    if (!cleanPhone.startsWith('91')) {
      if (cleanPhone.length === 10) {
        cleanPhone = '91' + cleanPhone;
      } else {
        throw new Error(`Invalid Indian phone number: ${phoneNumber}. Please include country code or use 10-digit number.`);
      }
    }

    // Ensure it starts with +
    const formattedPhone = '+' + cleanPhone;

    // Additional validation for Indian numbers
    if (cleanPhone.startsWith('91') && cleanPhone.length !== 12) {
      throw new Error(`Invalid Indian phone number: ${phoneNumber}`);
    }

    return formattedPhone;
  }

  /**
   * Send WhatsApp message with production features
   */
  public async sendMessage(messageData: ProductionWhatsAppMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Validate phone number
      const formattedPhone = this.validateAndFormatPhoneNumber(messageData.phoneNumber);

      // Check rate limiting
      const canSend = await this.checkRateLimit();
      if (!canSend) {
        return { success: false, error: 'Rate limit exceeded. Please try again later.' };
      }

      // Log message attempt
      this.log('info', `Sending WhatsApp message to ${formattedPhone}`, {
        type: messageData.type,
        messageLength: messageData.message.length,
        hasMedia: !!messageData.mediaUrl,
        priority: messageData.priority
      });

      // Check test mode
      if (process.env.WHATSAPP_TEST_MODE === 'true') {
        this.log('info', '🧪 TEST MODE - Message would be sent:', {
          to: formattedPhone,
          message: messageData.message.substring(0, 100) + '...',
          mediaUrl: messageData.mediaUrl
        });
        this.metrics.sent++;
        return { success: true, messageId: `test_${Date.now()}` };
      }

      // Prepare message payload
      const formData = new URLSearchParams();
      formData.append('To', `whatsapp:${formattedPhone}`);
      formData.append('From', `whatsapp:${this.config.phoneNumber}`);

      if (messageData.templateName && messageData.templateParams) {
        // Send template message
        formData.append('ContentSid', messageData.templateName);
        formData.append('ContentVariables', JSON.stringify(
          messageData.templateParams.reduce((acc, param, index) => {
            acc[index + 1] = param;
            return acc;
          }, {} as Record<string, string>)
        ));
      } else {
        // Send regular message
        formData.append('Body', messageData.message);
      }

      // Add media if provided (skip localhost URLs as Twilio cannot access them)
      if (messageData.mediaUrl && !messageData.mediaUrl.includes('localhost') && !messageData.mediaUrl.includes('127.0.0.1')) {
        formData.append('MediaUrl', messageData.mediaUrl);
      } else if (messageData.mediaUrl) {
        this.log('warn', 'Skipping media attachment - localhost URLs not accessible by Twilio', { mediaUrl: messageData.mediaUrl });
      }

      // Add delivery callback if enabled
      if (this.config.enableDeliveryReports && messageData.deliveryCallbackUrl) {
        formData.append('StatusCallback', messageData.deliveryCallbackUrl);
      }

      // Send message via Twilio API
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': `${this.templeName} WhatsApp Service/1.0`
          },
          body: formData.toString()
        }
      );

      const data = await response.json();

      if (!response.ok) {
        this.metrics.failed++;
        this.log('error', '❌ Twilio API error - MESSAGE NOT SENT', {
          status: response.status,
          errorCode: data.code,
          errorMessage: data.message,
          moreInfo: data.more_info,
          phoneNumber: formattedPhone,
          fromNumber: this.config.phoneNumber
        });

        return {
          success: false,
          error: `Twilio Error ${data.code}: ${data.message}` || 'Twilio API error',
          messageId: data.sid
        };
      }

      this.metrics.sent++;
      this.metrics.lastSentTime = new Date();

      this.log('info', '✅ WhatsApp message sent successfully', {
        messageId: data.sid,
        to: formattedPhone,
        status: data.status
      });

      return { success: true, messageId: data.sid };

    } catch (error) {
      this.metrics.failed++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.log('error', 'Error sending WhatsApp message', {
        error: errorMessage,
        phoneNumber: messageData.phoneNumber
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send donation receipt with certificate link (production version)
   */
  public async sendDonationReceipt(
    details: any,
    pdfUrl?: string,
    certificateUrl?: string
  ): Promise<{ success: boolean; receiptMessageId?: string; certificateMessageId?: string; error?: string }> {
    try {
      this.log('info', '🔄 FALLBACK: sendDonationReceipt called (non-template)', {
        donorName: details.donorName,
        donorPhone: details.donorPhone,
        receiptNumber: details.receiptNumber,
        hasPdfUrl: !!pdfUrl
      });

      const recipient = this.validateAndFormatPhoneNumber(details.donorPhone);
      this.log('info', `📞 Fallback phone validated: ${details.donorPhone} → ${recipient}`);

      // Send receipt message with PDF certificate attachment
      const receiptMessage = `🙏 *Donation Receipt* 🙏

Dear ${details.donorName},

Thank you for your generous contribution to ${this.templeName}!

🧾 *Receipt Details:*
• Receipt Number: ${details.receiptNumber}
• Amount: ₹${details.amount.toLocaleString('en-IN')}
• Donation Type: ${details.donationType}
• Date: ${new Date(details.date).toLocaleDateString('en-IN')}

${pdfUrl ? `📄 *Your Donation Certificate*

Please find your official donation certificate attached to this message.

📥 Tap on the PDF attachment above to download and save it.

` : ''}🙏 *May Sri Raghavendra Swamy bless you and your family!*

For any queries, please contact: ${this.adminPhoneNumber}

---
*${this.templeName}*
*Service to Humanity is Service to God*`;

      this.log('info', '📤 Sending fallback donation receipt message', {
        to: recipient,
        messageLength: receiptMessage.length,
        hasPdfUrl: !!pdfUrl
      });

      const receiptResult = await this.sendMessage({
        phoneNumber: recipient,
        message: receiptMessage,
        type: 'donation',
        mediaUrl: pdfUrl, // PDF sent as WhatsApp file attachment
        priority: 'high',
        metadata: {
          receiptNumber: details.receiptNumber,
          amount: details.amount,
          type: 'receipt'
        }
      });

      this.log('info', '📥 Fallback receipt message result:', {
        success: receiptResult.success,
        messageId: receiptResult.messageId,
        error: receiptResult.error
      });

      if (!receiptResult.success) {
        this.log('error', '❌ Fallback receipt message FAILED', { error: receiptResult.error });
        return { success: false, error: receiptResult.error };
      }

      this.log('info', '✅ Fallback receipt message sent successfully');

      let certificateMessageId: string | undefined;

      // Optional: Send backup certificate link message if separate URL provided
      // (This is now optional since PDF is already attached above)
      if (certificateUrl && !pdfUrl) {
        // Only send link if PDF attachment wasn't available
        const certificateMessage = `📄 *Download Your Donation Certificate*\n\nDear ${details.donorName},\n\nThank you once again for your generous donation to ${this.templeName}.\n\nYou can download your official donation certificate using the secure link below:\n${certificateUrl}\n\nIf you have any trouble accessing the certificate, reply to this message and our team will assist you.\n\n🙏 May Sri Raghavendra Swamy bless you and your family!`;

        const certificateResult = await this.sendMessage({
          phoneNumber: recipient,
          message: certificateMessage,
          type: 'donation',
          priority: 'high',
          metadata: {
            receiptNumber: details.receiptNumber,
            amount: details.amount,
            type: 'certificate'
          }
        });

        if (certificateResult.success) {
          certificateMessageId = certificateResult.messageId;
        }
      }

      // Send admin notification
      await this.sendAdminNotification(details);

      return {
        success: true,
        receiptMessageId: receiptResult.messageId,
        certificateMessageId
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.log('error', 'Error sending donation receipt', { error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send admin notification
   */
  private async sendAdminNotification(details: any): Promise<void> {
    const adminMessage = `🙏 *New Donation Received* 🙏

📝 *Donor Details:*
• Name: ${details.donorName}
• Phone: ${details.donorPhone}
• Amount: ₹${details.amount.toLocaleString('en-IN')}
• Type: ${details.donationType}

🧾 *Transaction Details:*
• Receipt Number: ${details.receiptNumber}
• Payment ID: ${details.paymentId}
• Date: ${new Date(details.date).toLocaleDateString('en-IN')}

📍 *Temple:* ${this.templeName}
📅 *Notification Time:* ${new Date().toLocaleString('en-IN')}`;

    await this.sendMessage({
      phoneNumber: this.adminPhoneNumber,
      message: adminMessage,
      type: 'donation',
      priority: 'normal'
    });
  }

  /**
   * Get current metrics
   */
  public getMetrics(): MessageMetrics {
    return { ...this.metrics };
  }

  /**
   * Test connection and configuration
   */
  public async testConnection(): Promise<{ success: boolean; details: any }> {
    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}.json`,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString('base64')}`
          }
        }
      );

      const accountData = await response.json();

      return {
        success: response.ok,
        details: {
          accountStatus: accountData.status,
          friendlyName: accountData.friendly_name,
          type: accountData.type,
          whatsappNumber: this.config.phoneNumber,
          rateLimits: {
            perSecond: this.config.rateLimitPerSecond,
            perMinute: this.config.rateLimitPerMinute
          },
          testMode: process.env.WHATSAPP_TEST_MODE === 'true',
          metrics: this.metrics
        }
      };

    } catch (error) {
      return {
        success: false,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Start metrics collection interval
   */
  private startMetricsInterval(): void {
    setInterval(() => {
      if (this.metrics.sent > 0) {
        this.log('info', 'WhatsApp metrics summary', {
          sent: this.metrics.sent,
          delivered: this.metrics.delivered,
          failed: this.metrics.failed,
          deliveryRate: ((this.metrics.delivered / this.metrics.sent) * 100).toFixed(2) + '%'
        });
      }
    }, 60000); // Log metrics every minute
  }

  /**
   * Queue high-priority messages
   */
  public queueMessage(messageData: ProductionWhatsAppMessage): void {
    this.messageQueue.push(messageData);
    this.processMessageQueue();
  }

  /**
   * Process message queue
   */
  private async processMessageQueue(): Promise<void> {
    if (this.isProcessingQueue || this.messageQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      await this.sendMessage(message);
      // Small delay between queued messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isProcessingQueue = false;
  }

  // ==================== MEDIA UPLOAD METHODS ====================

  /**
   * Upload PDF to Twilio Media storage and get public URL
   * This allows Twilio to access the PDF for WhatsApp message attachments
   */
  public async uploadPDFToTwilio(
    pdfBase64: string,
    filename: string = 'certificate.pdf'
  ): Promise<{ success: boolean; mediaUrl?: string; error?: string }> {
    try {
      this.log('info', 'Uploading PDF to Twilio Media storage', { filename });

      // Convert base64 to buffer
      const pdfBuffer = Buffer.from(pdfBase64, 'base64');

      // Create form data for multipart upload
      const formData = new FormData();
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      formData.append('file', blob, filename);

      // Upload to Twilio Media API
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}/Messages/Media.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString('base64')}`
          },
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        this.log('error', 'Failed to upload PDF to Twilio', {
          status: response.status,
          error: data
        });
        return {
          success: false,
          error: data.message || 'Failed to upload PDF to Twilio'
        };
      }

      // The media URL from Twilio
      const mediaUrl = data.uri.replace('.json', '');
      const publicMediaUrl = `https://api.twilio.com${mediaUrl}`;

      this.log('info', '✅ PDF uploaded to Twilio successfully', {
        mediaUrl: publicMediaUrl,
        sid: data.sid
      });

      return {
        success: true,
        mediaUrl: publicMediaUrl
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.log('error', 'Error uploading PDF to Twilio', { error: errorMessage });
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // ==================== TEMPLATE MESSAGE METHODS ====================

  /**
   * Send message using approved WhatsApp Content Template
   */
  public async sendTemplateMessage(
    phoneNumber: string,
    templateKey: TemplateKey,
    variables: WhatsAppTemplateVariable,
    mediaUrl?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      this.log('info', '🔵 sendTemplateMessage called', {
        phoneNumber,
        templateKey,
        variableCount: Object.keys(variables).length,
        hasMediaUrl: !!mediaUrl
      });

      // Validate phone number
      const formattedPhone = this.validateAndFormatPhoneNumber(phoneNumber);
      this.log('info', `📞 Phone validated: ${phoneNumber} → ${formattedPhone}`);

      // Get template configuration
      const template = getTemplate(templateKey);
      this.log('info', `📋 Template retrieved: ${template.name} (${template.contentSid})`);

      // Validate variables
      const validation = validateTemplateVariables(templateKey, variables);
      if (!validation.valid) {
        this.log('error', `❌ Template variable validation failed: ${validation.missing.join(', ')}`);
        return {
          success: false,
          error: `Missing required template variables: ${validation.missing.join(', ')}`
        };
      }
      this.log('info', `✅ Template variables validated successfully`);

      // Check if template is configured
      if (template.contentSid.startsWith('HXxxxx')) {
        this.log('error', `❌ Template not configured: ${templateKey}. Content SID starts with HXxxxx`);
        return {
          success: false,
          error: `Template ${templateKey} not configured. Please set up in Twilio Console first.`
        };
      }
      this.log('info', `✅ Template is configured with Content SID: ${template.contentSid}`);

      // Check rate limiting
      const canSend = await this.checkRateLimit();
      if (!canSend) {
        return { success: false, error: 'Rate limit exceeded. Please try again later.' };
      }

      // Log template message attempt
      this.log('info', `Sending WhatsApp template message to ${formattedPhone}`, {
        templateKey,
        templateName: template.name,
        hasMedia: template.hasMedia,
        variableCount: template.variableCount
      });

      // Check test mode
      if (process.env.WHATSAPP_TEST_MODE === 'true') {
        this.log('info', '🧪 TEST MODE - Template message would be sent:', {
          to: formattedPhone,
          template: template.name,
          contentSid: template.contentSid,
          variables,
          mediaUrl
        });
        this.metrics.sent++;
        return { success: true, messageId: `test_template_${Date.now()}` };
      }

      // Prepare template variables
      const templateVariables = prepareTemplateVariables(templateKey, variables);
      this.log('info', '📝 Template variables prepared:', templateVariables);

      // Prepare message payload
      // NOTE: For WhatsApp messages with ContentSid, we MUST use whatsapp: prefix
      const formData = new URLSearchParams();
      formData.append('To', `whatsapp:${formattedPhone}`);
      formData.append('From', `whatsapp:${this.config.phoneNumber}`);
      formData.append('ContentSid', template.contentSid);
      formData.append('ContentVariables', JSON.stringify(templateVariables));

      // Add media (PDF) if provided - this is how PDFs get attached to WhatsApp messages
      // Skip localhost URLs as Twilio cannot access them
      if (mediaUrl && !mediaUrl.includes('localhost') && !mediaUrl.includes('127.0.0.1')) {
        formData.append('MediaUrl', mediaUrl);
        this.log('debug', 'Adding PDF attachment to template message', { mediaUrl });
      } else if (mediaUrl) {
        this.log('warn', 'Skipping PDF attachment - localhost URLs not accessible by Twilio', { mediaUrl });
      }

      // Add delivery callback if enabled
      if (this.config.enableDeliveryReports) {
        formData.append('StatusCallback', this.config.webhookUrl || '');
      }

      this.log('info', '🚀 Sending template message to Twilio API', {
        to: `whatsapp:${formattedPhone}`,
        from: `whatsapp:${this.config.phoneNumber}`,
        contentSid: template.contentSid,
        variablesCount: Object.keys(templateVariables).length
      });

      // Send template message via Twilio API
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': `${this.templeName} WhatsApp Service/2.0`
          },
          body: formData.toString()
        }
      );

      this.log('info', `📡 Twilio API response status: ${response.status}`);

      const data = await response.json();

      if (!response.ok) {
        this.metrics.failed++;
        this.log('error', '❌ Twilio template API error - TEMPLATE MESSAGE NOT SENT', {
          status: response.status,
          errorCode: data.code,
          errorMessage: data.message,
          moreInfo: data.more_info,
          phoneNumber: formattedPhone,
          fromNumber: this.config.phoneNumber,
          template: template.name,
          contentSid: template.contentSid
        });

        return {
          success: false,
          error: `Twilio Template Error ${data.code}: ${data.message}` || 'Twilio template API error',
          messageId: data.sid
        };
      }

      this.metrics.sent++;
      this.metrics.lastSentTime = new Date();

      this.log('info', '✅ WhatsApp template message sent successfully', {
        messageId: data.sid,
        to: formattedPhone,
        template: template.name,
        status: data.status
      });

      return { success: true, messageId: data.sid };

    } catch (error) {
      this.metrics.failed++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.log('error', 'Error sending WhatsApp template message', {
        error: errorMessage,
        phoneNumber,
        templateKey
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Upload PDF base64 to a temporary public URL that Twilio can access
   * Uses file.io for temporary hosting (single download, then deleted)
   */
  private async uploadPdfToTwilio(pdfBase64: string, filename: string): Promise<string | null> {
    try {
      // Remove data URL prefix if present
      const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, '');

      this.log('info', '📤 Attempting to create public URL for PDF', {
        filename,
        sizeKB: Math.round(Buffer.from(base64Data, 'base64').length / 1024)
      });

      const pdfBuffer = Buffer.from(base64Data, 'base64');

      // Method 1: Try file.io (most reliable, single download then deleted)
      this.log('debug', '📤 Uploading PDF to file.io for temporary public URL');
      try {
        const formData = new FormData();
        const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
        formData.append('file', blob, filename);

        const fileIoResponse = await fetch('https://file.io', {
          method: 'POST',
          body: formData
        });

        if (fileIoResponse.ok) {
          const fileIoData = await fileIoResponse.json();
          if (fileIoData.success && fileIoData.link) {
            this.log('info', '✅ PDF uploaded to file.io successfully', {
              url: fileIoData.link
            });
            return fileIoData.link;
          }
        }
        this.log('warn', '⚠️ file.io upload failed, trying alternative');
      } catch (fileIoError) {
        this.log('warn', '⚠️ file.io error, trying alternative', { error: fileIoError });
      }

      // Method 2: Try tmpfiles.org with proper multipart form data
      this.log('debug', '📤 Uploading PDF to tmpfiles.org as fallback');
      try {
        const formData2 = new FormData();
        const blob2 = new Blob([pdfBuffer], { type: 'application/pdf' });
        formData2.append('file', blob2, filename);

        const tmpResponse = await fetch('https://tmpfiles.org/api/v1/upload', {
          method: 'POST',
          body: formData2
        });

        if (tmpResponse.ok) {
          const tmpData = await tmpResponse.json();
          if (tmpData.status === 'success' && tmpData.data?.url) {
            // tmpfiles.org returns URLs in format: https://tmpfiles.org/1234/file.pdf
            // We need to change it to direct download: https://tmpfiles.org/dl/1234/file.pdf
            const directUrl = tmpData.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
            this.log('info', '✅ PDF uploaded to tmpfiles.org (expires in 1h)', {
              url: directUrl
            });
            return directUrl;
          }
        }
        this.log('warn', '⚠️ tmpfiles.org upload failed');
      } catch (tmpError) {
        this.log('warn', '⚠️ tmpfiles.org error', { error: tmpError });
      }

      // Method 3: Try 0x0.st as last resort
      this.log('debug', '📤 Uploading PDF to 0x0.st as last resort');
      try {
        const formData3 = new FormData();
        const blob3 = new Blob([pdfBuffer], { type: 'application/pdf' });
        formData3.append('file', blob3, filename);

        const altResponse = await fetch('https://0x0.st', {
          method: 'POST',
          body: formData3
        });

        if (altResponse.ok) {
          const uploadUrl = await altResponse.text();
          this.log('info', '✅ PDF uploaded to 0x0.st (expires in 1 day)', {
            url: uploadUrl.trim()
          });
          return uploadUrl.trim();
        }
      } catch (altError) {
        this.log('warn', '⚠️ 0x0.st upload also failed');
      }

      this.log('warn', '⚠️ All upload methods failed, PDF will not be attached');
      return null;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.log('error', '❌ Error uploading PDF', { error: errorMessage });
      return null;
    }
  }

  /**
   * Send donation receipt using template (with PDF certificate)
   * Automatically falls back to regular messages if templates aren't approved
   */
  public async sendDonationReceiptTemplate(
    donorName: string,
    donorPhone: string,
    receiptNumber: string,
    amount: number,
    donationType: string,
    date: Date,
    paymentId: string,
    pdfUrl?: string,
    pdfBase64?: string
  ): Promise<{ success: boolean; receiptMessageId?: string; adminMessageId?: string; certificateLinkMessageId?: string; error?: string }> {
    try {
      this.log('info', '🚀 sendDonationReceiptTemplate called', {
        donorName,
        donorPhone,
        receiptNumber,
        amount,
        donationType,
        hasPdfUrl: !!pdfUrl,
        hasPdfBase64: !!pdfBase64
      });

      // Check if we should force fallback (skip templates)
      const forceFallback = process.env.WHATSAPP_FORCE_FALLBACK === 'true';
      if (forceFallback) {
        this.log('info', '⚠️ WHATSAPP_FORCE_FALLBACK enabled - skipping templates, using regular messages');
      }

      // Format date as DD/MM/YYYY
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;

      const formattedAmount = amount.toLocaleString('en-IN');

      // PDF attachments - handle both public URLs and base64 encoded PDFs
      let twilioMediaUrl: string | undefined = undefined;

      // Check if we're in localhost/development mode
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');

      if (pdfUrl && !pdfUrl.includes('localhost') && !pdfUrl.includes('127.0.0.1')) {
        // Use provided URL if it's publicly accessible (not localhost)
        twilioMediaUrl = pdfUrl;
        this.log('info', '📎 Attaching certificate PDF from public URL', { pdfUrl });
      } else if (pdfBase64) {
        // Always try to upload PDF to temporary file hosting service
        // This works even from localhost since we're uploading to an external service
        this.log('info', '📤 Uploading base64 PDF to temporary file hosting for attachment');
        try {
          const uploadedMediaUrl = await this.uploadPdfToTwilio(pdfBase64, `${receiptNumber}.pdf`);
          if (uploadedMediaUrl) {
            twilioMediaUrl = uploadedMediaUrl;
            this.log('info', '✅ PDF uploaded successfully', { mediaUrl: uploadedMediaUrl });
          } else {
            this.log('warn', '⚠️ PDF upload failed - sending message without attachment');
          }
        } catch (error) {
          this.log('error', '❌ Error uploading PDF:', error);
          this.log('warn', '⚠️ Continuing without PDF attachment');
        }
      } else {
        this.log('info', '📝 No PDF available for attachment', {
          receiptNumber,
          hasPdfUrl: !!pdfUrl,
          hasPdfBase64: !!pdfBase64
        });
      }

      // If force fallback is enabled, skip template and go straight to regular messages
      if (forceFallback) {
        this.log('info', '📨 Skipping template, sending regular WhatsApp message directly');

        const fallbackDetails = {
          donorName,
          donorPhone,
          receiptNumber,
          amount,
          donationType,
          date: formattedDate
        };

        const fallbackResult = await this.sendDonationReceipt(fallbackDetails, twilioMediaUrl, twilioMediaUrl);

        if (!fallbackResult.success) {
          this.log('error', `❌ Fallback message failed for ${donorPhone}`);
          return { success: false, error: fallbackResult.error };
        }

        this.log('info', `✅ Fallback message sent successfully to ${donorPhone}`);
        return {
          success: true,
          receiptMessageId: fallbackResult.receiptMessageId,
          adminMessageId: fallbackResult.certificateMessageId
        };
      }

      // Strategy: Try template with PDF link first (works outside 24h window)
      // If that fails, fall back to regular template + separate PDF message
      let receiptResult: { success: boolean; messageId?: string; error?: string };

      // Check if we have the new template with PDF link configured and we have a PDF URL
      const hasCertLinkTemplate = !!process.env.TWILIO_TEMPLATE_DONATION_CERT_LINK &&
                                   !process.env.TWILIO_TEMPLATE_DONATION_CERT_LINK.startsWith('HXxxxx');

      if (hasCertLinkTemplate && twilioMediaUrl) {
        // Try template with PDF download link (6 variables: name, amount, receipt, date, pdfUrl, contact)
        this.log('info', '📨 Attempting to send template with certificate link', {
          to: donorPhone,
          templateKey: 'DONATION_CERTIFICATE_LINK',
          pdfUrl: twilioMediaUrl
        });

        const certLinkVariables: WhatsAppTemplateVariable = {
          donorName,
          amount: formattedAmount,
          receiptNumber,
          date: formattedDate,
          pdfUrl: twilioMediaUrl,
          contact: this.adminPhoneNumber
        };

        receiptResult = await this.sendTemplateMessage(
          donorPhone,
          'DONATION_CERTIFICATE_LINK',
          certLinkVariables
        );

        if (receiptResult.success) {
          this.log('info', '✅ Template with certificate link sent successfully', {
            messageId: receiptResult.messageId
          });
        } else {
          this.log('warn', `⚠️ Certificate link template failed (${receiptResult.error}), trying regular template`);
        }
      }

      // If cert link template wasn't used or failed, use regular template
      if (!receiptResult! || !receiptResult.success) {
        // Check if using V2/V3 (5 variables) or V1 (7 variables)
        const isV2OrV3 = !!process.env.TWILIO_TEMPLATE_DONATION_RECEIPT_V2;

        let receiptVariables: WhatsAppTemplateVariable;

        if (isV2OrV3) {
          // V2/V3: 5 variables - Name, Amount, Receipt, Date, Contact
          receiptVariables = {
            donorName,
            amount: formattedAmount,
            receiptNumber,
            date: formattedDate,
            contact: this.adminPhoneNumber
          };
        } else {
          // V1: 7 variables - Name, Amount, Receipt, Type, Date, Temple, Admin Phone
          receiptVariables = {
            donorName,
            amount: formattedAmount,
            receiptNumber,
            donationType,
            date: formattedDate,
            templeName: this.templeName,
            adminPhone: this.adminPhoneNumber
          };
        }

        this.log('info', '📨 Attempting to send donation receipt template', {
          to: donorPhone,
          templateKey: 'DONATION_RECEIPT_WITH_CERTIFICATE',
          variables: receiptVariables,
          hasMediaUrl: !!twilioMediaUrl
        });

        receiptResult = await this.sendTemplateMessage(
          donorPhone,
          'DONATION_RECEIPT_WITH_CERTIFICATE',
          receiptVariables
        );
      }

      this.log('info', '📨 Template send result:', {
        success: receiptResult.success,
        error: receiptResult.error,
        messageId: receiptResult.messageId
      });

      // If template fails for ANY reason, fallback to regular message
      if (!receiptResult.success) {
        this.log('warn', `⚠️ Template message failed (${receiptResult.error}), falling back to regular WhatsApp message`);

        const fallbackDetails = {
          donorName,
          donorPhone,
          receiptNumber,
          amount,
          donationType,
          date: formattedDate
        };

        // Use fallback with regular message instead of template
        const fallbackResult = await this.sendDonationReceipt(fallbackDetails, twilioMediaUrl, twilioMediaUrl);

        if (!fallbackResult.success) {
          this.log('error', `❌ Both template AND fallback failed for ${donorPhone}`);
          return { success: false, error: `Template failed: ${receiptResult.error}. Fallback also failed: ${fallbackResult.error}` };
        }

        this.log('info', `✅ Fallback message sent successfully to ${donorPhone}`);
        return {
          success: true,
          receiptMessageId: fallbackResult.receiptMessageId,
          adminMessageId: fallbackResult.certificateMessageId
        };
      }

      // Send admin notification
      this.log('info', '📨 Sending admin notification template');
      const adminResult = await this.sendDonationAdminNotificationTemplate(
        donorName,
        donorPhone,
        amount,
        donationType,
        receiptNumber,
        paymentId,
        date
      );

      this.log('info', '📨 Admin notification result:', {
        success: adminResult.success,
        messageId: adminResult.messageId,
        error: adminResult.error
      });

      // Check if admin notification failed
      if (!adminResult.success) {
        this.log('warn', '⚠️ Donor receipt sent but admin notification failed', {
          adminError: adminResult.error
        });
      }

      // Send PDF as a separate message (WhatsApp templates don't support dynamic media)
      let certificateLinkMessageId: string | undefined = undefined;
      if (twilioMediaUrl && receiptResult.success) {
        this.log('info', '📤 Sending PDF certificate as separate message', { mediaUrl: twilioMediaUrl });
        try {
          const pdfMessage = `📄 *Your Donation Certificate*\n\nDear ${donorName},\n\nPlease find your official donation certificate attached above.\n\nSave this document for your records and tax purposes.\n\n🙏 Thank you for your generous contribution to ${this.templeName}!`;

          const pdfResult = await this.sendMessage({
            phoneNumber: donorPhone,
            message: pdfMessage,
            type: 'donation',
            mediaUrl: twilioMediaUrl,
            priority: 'high'
          });

          if (pdfResult.success) {
            certificateLinkMessageId = pdfResult.messageId;
            this.log('info', '✅ PDF certificate sent successfully', { messageId: pdfResult.messageId });
          } else {
            this.log('warn', '⚠️ Failed to send PDF certificate', { error: pdfResult.error });
          }
        } catch (pdfError) {
          this.log('warn', '⚠️ Error sending PDF certificate', { error: pdfError });
        }
      } else if (pdfBase64 && isLocalhost && pdfUrl) {
        // Localhost fallback - send download link
        this.log('info', '📤 Sending follow-up message with certificate download link (localhost workaround)');
        try {
          const followUpMessage = `📄 *Download Your Donation Certificate*\n\nDear ${donorName},\n\nYour donation certificate is ready for download:\n${pdfUrl}\n\n*Note:* This link is valid for 5 minutes. If it expires, please contact ${this.adminPhoneNumber}\n\n🙏 Thank you for your generous contribution!`;

          const followUpResult = await this.sendMessage({
            phoneNumber: donorPhone,
            message: followUpMessage,
            type: 'donation',
            priority: 'high'
          });

          if (followUpResult.success) {
            certificateLinkMessageId = followUpResult.messageId;
            this.log('info', '✅ Certificate download link sent successfully');
          }
        } catch (followUpError) {
          this.log('warn', '⚠️ Failed to send certificate download link', { error: followUpError });
        }
      }

      const overallSuccess = receiptResult.success && adminResult.success;
      this.log('info', `📊 Final result: Donor=${receiptResult.success}, Admin=${adminResult.success}, Overall=${overallSuccess}`);

      return {
        success: overallSuccess,
        receiptMessageId: receiptResult.messageId,
        adminMessageId: adminResult.messageId,
        certificateLinkMessageId,
        error: !overallSuccess ? `Donor: ${receiptResult.success ? 'OK' : receiptResult.error}, Admin: ${adminResult.success ? 'OK' : adminResult.error}` : undefined
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.log('error', 'Error sending donation receipt template', { error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send donation admin notification using template
   */
  public async sendDonationAdminNotificationTemplate(
    donorName: string,
    donorPhone: string,
    amount: number,
    donationType: string,
    receiptNumber: string,
    paymentId: string,
    date: Date
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Format date as DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    const requestReceivedTime = new Date().toLocaleString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Check if using V2/V3 (5 variables) or V1 (7 variables)
    const isV2OrV3 = !!process.env.TWILIO_TEMPLATE_ADMIN_DONATION_V2;

    let variables: WhatsAppTemplateVariable;

    if (isV2OrV3) {
      // V2/V3: 5 variables - Donor, Phone, Amount, Receipt, Date
      variables = {
        donorName,
        donorPhone,
        amount: amount.toLocaleString('en-IN'),
        receiptNumber,
        date: formattedDate
      };
    } else {
      // V1: 7 variables - Donor, Phone, Amount, Type, Receipt, PaymentID, Date
      variables = {
        donorName,
        donorPhone,
        amount: amount.toLocaleString('en-IN'),
        donationType,
        receiptNumber,
        paymentId,
        date: formattedDate
      };
    }

    return await this.sendTemplateMessage(
      this.adminPhoneNumber,
      'ADMIN_DONATION_NOTIFICATION',
      variables
    );
  }

  /**
   * Send pooja booking confirmation using template
   * Automatically falls back to regular messages if templates aren't approved
   */
  public async sendPoojaBookingConfirmationTemplate(
    devoteeName: string,
    devoteePhone: string,
    receiptNumber: string,
    poojaName: string,
    amount: number,
    bookingDate: Date,
    preferredDate?: string,
    preferredTime?: string,
    nakshatra?: string
  ): Promise<{ success: boolean; devoteeMessageId?: string; adminMessageId?: string; error?: string }> {
    try {
      // Format date as DD/MM/YYYY
      const day = bookingDate.getDate().toString().padStart(2, '0');
      const month = (bookingDate.getMonth() + 1).toString().padStart(2, '0');
      const year = bookingDate.getFullYear();
      const formattedBookingDate = `${day}/${month}/${year}`;

      // Send confirmation to devotee
      // Variable mapping for POOJA_BOOKING_CONFIRMATION: 5 variables (V3)
      // Template: Name: {{1}}, Service: {{2}}, Date: {{3}}, Reference: {{4}}, Questions: {{5}}
      const devoteeVariables: WhatsAppTemplateVariable = {
        devoteeName,
        poojaName,
        bookingDate: formattedBookingDate,
        receiptNumber,
        contact: this.adminPhoneNumber
      };

      const devoteeResult = await this.sendTemplateMessage(
        devoteePhone,
        'POOJA_BOOKING_CONFIRMATION',
        devoteeVariables
      );

      // If template fails (not approved), fallback to regular message
      if (!devoteeResult.success && devoteeResult.error?.includes('not configured')) {
        this.log('warn', '⚠️ Template not approved, falling back to regular WhatsApp message');

        const message = `🙏 *Pooja Booking Confirmed* 🙏

Dear ${devoteeName},

Thank you for booking pooja at ${this.templeName}!

📝 *Booking Details:*
• Booking Number: ${receiptNumber}
• Pooja: ${poojaName}
• Amount: ₹${amount.toLocaleString('en-IN')}
• Booking Date: ${formattedBookingDate}
• Preferred Date: ${preferredDate || 'As per temple calendar'}
• Preferred Time: ${preferredTime || 'Morning session'}
${nakshatra ? `• Nakshatra: ${nakshatra}` : ''}

Our temple staff will contact you shortly to confirm the pooja date and time.

🙏 *May Sri Raghavendra Swamy bless you and your family!*

For any queries, contact: ${this.adminPhoneNumber}

---
*${this.templeName}*`;

        const fallbackResult = await this.sendMessage({
          phoneNumber: devoteePhone,
          message,
          type: 'pooja_booking',
          priority: 'high'
        });

        if (fallbackResult.success) {
          await this.sendPoojaAdminFallback(devoteeName, devoteePhone, poojaName, amount, receiptNumber, formattedBookingDate, preferredDate, preferredTime, nakshatra);
        }

        return {
          success: fallbackResult.success,
          devoteeMessageId: fallbackResult.messageId,
          error: fallbackResult.error
        };
      }

      if (!devoteeResult.success) {
        return { success: false, error: devoteeResult.error };
      }

      // Send admin notification
      const adminResult = await this.sendPoojaBookingAdminNotificationTemplate(
        devoteeName,
        devoteePhone,
        poojaName,
        amount,
        receiptNumber,
        'payment_id_here',
        bookingDate,
        preferredDate,
        preferredTime,
        nakshatra,
        '' // gotra
      );

      return {
        success: true,
        devoteeMessageId: devoteeResult.messageId,
        adminMessageId: adminResult.messageId
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.log('error', 'Error sending pooja booking template', { error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send admin notification for pooja booking (fallback)
   */
  private async sendPoojaAdminFallback(
    devoteeName: string,
    devoteePhone: string,
    poojaName: string,
    amount: number,
    receiptNumber: string,
    bookingDate: string,
    preferredDate?: string,
    preferredTime?: string,
    nakshatra?: string
  ): Promise<void> {
    const adminMessage = `🙏 *New Pooja Booking* 🙏

📝 *Devotee Details:*
• Name: ${devoteeName}
• Phone: ${devoteePhone}
• Pooja: ${poojaName}
• Amount: ₹${amount.toLocaleString('en-IN')}

📅 *Booking Details:*
• Booking Number: ${receiptNumber}
• Booking Date: ${bookingDate}
• Preferred Date: ${preferredDate || 'As per temple calendar'}
• Preferred Time: ${preferredTime || 'Morning session'}
${nakshatra ? `• Nakshatra: ${nakshatra}` : ''}

📍 *Temple:* ${this.templeName}`;

    await this.sendMessage({
      phoneNumber: this.adminPhoneNumber,
      message: adminMessage,
      type: 'pooja_booking',
      priority: 'normal'
    });
  }

  /**
   * Send pooja booking admin notification using template
   */
  public async sendPoojaBookingAdminNotificationTemplate(
    devoteeName: string,
    devoteePhone: string,
    poojaName: string,
    amount: number,
    receiptNumber: string,
    paymentId: string,
    bookingDate: Date,
    preferredDate?: string,
    preferredTime?: string,
    nakshatra?: string,
    gotra?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Format date as DD/MM/YYYY
    const day = bookingDate.getDate().toString().padStart(2, '0');
    const month = (bookingDate.getMonth() + 1).toString().padStart(2, '0');
    const year = bookingDate.getFullYear();
    const formattedBookingDate = `${day}/${month}/${year}`;

    // Variable mapping for ADMIN_POOJA_BOOKING_NOTIFICATION: 5 variables (V3)
    // Template: Devotee: {{1}}, Phone: {{2}}, Service: {{3}}, Date: {{4}}, Reference: {{5}}
    const variables: WhatsAppTemplateVariable = {
      devoteeName,
      devoteePhone,
      poojaName,
      bookingDate: formattedBookingDate,
      receiptNumber
    };

    return await this.sendTemplateMessage(
      this.adminPhoneNumber,
      'ADMIN_POOJA_BOOKING_NOTIFICATION',
      variables
    );
  }

  /**
   * Send parihara pooja confirmation using template
   * Automatically falls back to regular messages if templates aren't approved
   */
  public async sendPariharaPoojaConfirmationTemplate(
    devoteeName: string,
    devoteePhone: string,
    receiptNumber: string,
    poojaName: string,
    amount: number,
    bookingDate: Date,
    paymentId: string
  ): Promise<{ success: boolean; devoteeMessageId?: string; adminMessageId?: string; error?: string }> {
    try {
      // Format date as DD/MM/YYYY
      const day = bookingDate.getDate().toString().padStart(2, '0');
      const month = (bookingDate.getMonth() + 1).toString().padStart(2, '0');
      const year = bookingDate.getFullYear();
      const formattedBookingDate = `${day}/${month}/${year}`;

      // Send confirmation to devotee
      // Variable mapping for PARIHARA_POOJA_CONFIRMATION: 5 variables (V3)
      // Template: Name: {{1}}, Service: {{2}}, Date: {{3}}, Reference: {{4}}, Questions: {{5}}
      const devoteeVariables: WhatsAppTemplateVariable = {
        devoteeName,
        poojaName,
        bookingDate: formattedBookingDate,
        receiptNumber,
        contact: this.adminPhoneNumber
      };

      const devoteeResult = await this.sendTemplateMessage(
        devoteePhone,
        'PARIHARA_POOJA_CONFIRMATION',
        devoteeVariables
      );

      // If template fails (not approved), fallback to regular message
      if (!devoteeResult.success && devoteeResult.error?.includes('not configured')) {
        this.log('warn', '⚠️ Template not approved, falling back to regular WhatsApp message');

        const message = `🙏 *Parihara Pooja Booking Confirmed* 🙏

Dear ${devoteeName},

Your Parihara pooja has been successfully booked at ${this.templeName}!

📝 *Booking Details:*
• Booking Number: ${receiptNumber}
• Parihara Pooja: ${poojaName}
• Amount: ₹${amount.toLocaleString('en-IN')}
• Booking Date: ${formattedBookingDate}

Our temple staff will contact you soon to finalize the pooja schedule and requirements.

🙏 *May Sri Raghavendra Swamy remove all obstacles and bless you!*

For any queries, contact: ${this.adminPhoneNumber}

---
*${this.templeName}*`;

        const fallbackResult = await this.sendMessage({
          phoneNumber: devoteePhone,
          message,
          type: 'parihara_pooja',
          priority: 'high'
        });

        if (fallbackResult.success) {
          const adminMessage = `🙏 *New Parihara Pooja Booking* 🙏

📝 *Devotee Details:*
• Name: ${devoteeName}
• Phone: ${devoteePhone}
• Parihara Pooja: ${poojaName}
• Amount: ₹${amount.toLocaleString('en-IN')}

📅 *Booking Details:*
• Booking Number: ${receiptNumber}
• Payment ID: ${paymentId}
• Booking Date: ${formattedBookingDate}

📍 *Temple:* ${this.templeName}`;

          await this.sendMessage({
            phoneNumber: this.adminPhoneNumber,
            message: adminMessage,
            type: 'parihara_pooja',
            priority: 'normal'
          });
        }

        return {
          success: fallbackResult.success,
          devoteeMessageId: fallbackResult.messageId,
          error: fallbackResult.error
        };
      }

      if (!devoteeResult.success) {
        return { success: false, error: devoteeResult.error };
      }

      // Send admin notification
      // Variable mapping for ADMIN_PARIHARA_POOJA_NOTIFICATION: 5 variables (V3)
      // Template: Devotee: {{1}}, Phone: {{2}}, Service: {{3}}, Date: {{4}}, Reference: {{5}}
      const adminVariables: WhatsAppTemplateVariable = {
        devoteeName,
        devoteePhone,
        poojaName,
        bookingDate: formattedBookingDate,
        receiptNumber
      };

      const adminResult = await this.sendTemplateMessage(
        this.adminPhoneNumber,
        'ADMIN_PARIHARA_POOJA_NOTIFICATION',
        adminVariables
      );

      return {
        success: true,
        devoteeMessageId: devoteeResult.messageId,
        adminMessageId: adminResult.messageId
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.log('error', 'Error sending parihara pooja template', { error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send astrology consultation confirmation using template
   * Automatically falls back to regular messages if templates aren't approved
   */
  public async sendAstrologyConsultationConfirmationTemplate(
    clientName: string,
    clientPhone: string,
    referenceNumber: string,
    consultationType: string,
    dateOfBirth: string,
    timeOfBirth: string,
    birthPlace: string,
    moonSign?: string,
    preferredDate?: string,
    preferredTime?: string
  ): Promise<{ success: boolean; clientMessageId?: string; adminMessageId?: string; error?: string }> {
    try {
      // Format date as DD/MM/YYYY
      const now = new Date();
      const day = now.getDate().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear();
      const requestDate = `${day}/${month}/${year}`;

      // Send confirmation to client
      // Variable mapping for ASTROLOGY_CONSULTATION_CONFIRMATION: 5 variables (V3)
      // Template: Name: {{1}}, Type: {{2}}, Date: {{3}}, Reference: {{4}}, Questions: {{5}}
      const clientVariables: WhatsAppTemplateVariable = {
        clientName,
        consultationType,
        requestDate,
        referenceNumber,
        contact: this.adminPhoneNumber
      };

      const clientResult = await this.sendTemplateMessage(
        clientPhone,
        'ASTROLOGY_CONSULTATION_CONFIRMATION',
        clientVariables
      );

      // If template fails (not approved), fallback to regular message
      if (!clientResult.success && clientResult.error?.includes('not configured')) {
        this.log('warn', '⚠️ Template not approved, falling back to regular WhatsApp message');

        const message = `🌟 *Astrology Consultation Request Received* 🌟

Dear ${clientName},

Your astrology consultation request has been received at ${this.templeName}!

📝 *Request Details:*
• Reference Number: ${referenceNumber}
• Consultation Type: ${consultationType}
• Request Date: ${requestDate}

🎂 *Birth Details:*
• Date of Birth: ${dateOfBirth}
• Time of Birth: ${timeOfBirth}
• Birth Place: ${birthPlace}
${moonSign ? `• Moon Sign: ${moonSign}` : ''}

Our astrologer will review your details and contact you soon to schedule the consultation.

🙏 *May Sri Raghavendra Swamy guide you on the right path!*

For any queries, contact: ${this.adminPhoneNumber}

---
*${this.templeName}*`;

        const fallbackResult = await this.sendMessage({
          phoneNumber: clientPhone,
          message,
          type: 'astrology_consultation',
          priority: 'high'
        });

        if (fallbackResult.success) {
          const requestReceivedTime = new Date().toLocaleString('en-IN', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          const adminMessage = `🌟 *New Astrology Consultation Request* 🌟

👤 *Client Details:*
• Name: ${clientName}
• Phone: ${clientPhone}
• Consultation Type: ${consultationType}

🎂 *Birth Details:*
• DOB: ${dateOfBirth}
• Time: ${timeOfBirth}
• Place: ${birthPlace}
${moonSign ? `• Moon Sign: ${moonSign}` : ''}

📅 *Request Info:*
• Reference Number: ${referenceNumber}
• Preferred Date: ${preferredDate || 'Not specified'}
• Preferred Time: ${preferredTime || 'Not specified'}
• Request Time: ${requestReceivedTime}`;

          await this.sendMessage({
            phoneNumber: this.adminPhoneNumber,
            message: adminMessage,
            type: 'astrology_consultation',
            priority: 'normal'
          });
        }

        return {
          success: fallbackResult.success,
          clientMessageId: fallbackResult.messageId,
          error: fallbackResult.error
        };
      }

      if (!clientResult.success) {
        return { success: false, error: clientResult.error };
      }

      // Send admin notification
      // Variable mapping for ADMIN_ASTROLOGY_CONSULTATION_NOTIFICATION: 5 variables (V3)
      // Template: Client: {{1}}, Phone: {{2}}, Type: {{3}}, Date: {{4}}, Reference: {{5}}
      const adminVariables: WhatsAppTemplateVariable = {
        clientName,
        clientPhone,
        consultationType,
        requestDate,
        referenceNumber
      };

      const adminResult = await this.sendTemplateMessage(
        this.adminPhoneNumber,
        'ADMIN_ASTROLOGY_CONSULTATION_NOTIFICATION',
        adminVariables
      );

      return {
        success: true,
        clientMessageId: clientResult.messageId,
        adminMessageId: adminResult.messageId
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.log('error', 'Error sending astrology consultation template', { error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Check template configuration status
   */
  public checkTemplateStatus(): void {
    const templatesConfigured = areTemplatesConfigured();
    if (!templatesConfigured) {
      this.log('warn', '⚠️ Some WhatsApp templates are not configured. Please set up Content SIDs in environment variables.');
    } else {
      this.log('info', '✅ All WhatsApp templates are configured and ready to use.');
    }
  }
}

// Export singleton instance
export const productionWhatsAppService = new ProductionWhatsAppService();
export default productionWhatsAppService;
