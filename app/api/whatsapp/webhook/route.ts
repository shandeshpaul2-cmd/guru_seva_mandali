/**
 * WhatsApp Webhook Handler for Production
 * Handles incoming messages, delivery reports, and status updates
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { productionWhatsAppService } from '@/lib/whatsapp-production';

interface WhatsAppWebhookEvent {
  SmsSid?: string;
  SmsStatus?: string;
  MessageStatus?: string;
  To?: string;
  From?: string;
  Body?: string;
  NumMedia?: string;
  MediaUrl?: string;
  MediaContentType?: string;
  ErrorCode?: string;
  ErrorMessage?: string;
}

/**
 * Verify webhook signature (if webhook token is configured)
 */
function verifyWebhook(request: NextRequest): boolean {
  const webhookToken = process.env.WHATSAPP_WEBHOOK_TOKEN;
  if (!webhookToken) {
    return true; // Skip verification if no token configured
  }

  const signature = request.headers.get('X-Twilio-Signature');
  if (!signature) {
    console.warn('⚠️ Webhook signature missing');
    return false;
  }

  const url = request.url;
  const params = Object.fromEntries(request.nextUrl.searchParams);

  // Create the string to sign
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}${params[key]}`)
    .join('');

  const stringToSign = url + sortedParams;

  // Calculate expected signature
  const expectedSignature = crypto
    .createHmac('sha1', webhookToken)
    .update(Buffer.from(stringToSign, 'utf-8'))
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Handle webhook verification (GET request)
 */
export async function GET(request: NextRequest) {
  // For Twilio webhook verification
  const challenge = request.nextUrl.searchParams.get('hub.challenge');

  if (challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  return NextResponse.json({ error: 'Invalid webhook verification request' }, { status: 400 });
}

/**
 * Handle incoming WhatsApp messages and status updates (POST request)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    if (!verifyWebhook(request)) {
      console.error('❌ Webhook signature verification failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const data: WhatsAppWebhookEvent = Object.fromEntries(formData.entries());

    console.log('📱 WhatsApp webhook received:', {
      from: data.From,
      messageStatus: data.MessageStatus || data.SmsStatus,
      hasBody: !!data.Body,
      hasMedia: !!data.MediaUrl
    });

    // Handle message status updates (delivery reports)
    if (data.MessageStatus || data.SmsStatus) {
      await handleDeliveryReport(data);
    }

    // Handle incoming messages
    if (data.Body && data.From) {
      await handleIncomingMessage(data);
    }

    // Respond with TwiML to acknowledge receipt
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>
    <Body>Thank you for your message. We have received it and will respond shortly.</Body>
  </Message>
</Response>`;

    return new NextResponse(twimlResponse, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' }
    });

  } catch (error) {
    console.error('❌ Error handling WhatsApp webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle delivery reports for sent messages
 */
async function handleDeliveryReport(data: WhatsAppWebhookEvent) {
  const messageId = data.SmsSid;
  const status = data.MessageStatus || data.SmsStatus;
  const to = data.To;
  const errorCode = data.ErrorCode;
  const errorMessage = data.ErrorMessage;

  console.log(`📊 Delivery report for message ${messageId}:`, {
    status,
    to,
    errorCode,
    errorMessage
  });

  // Here you can:
  // 1. Update message status in database
  // 2. Track delivery metrics
  // 3. Handle failed deliveries (retry logic)
  // 4. Update analytics

  // Example: Log delivery metrics
  if (status === 'delivered') {
    console.log(`✅ Message delivered successfully to ${to}`);
  } else if (status === 'failed' || status === 'undelivered') {
    console.error(`❌ Message delivery failed to ${to}:`, {
      errorCode,
      errorMessage
    });

    // Optionally send notification to admin about failed delivery
    if (to !== process.env.TWILIO_WHATSAPP_NUMBER) {
      await notifyAdminAboutFailedDelivery(data);
    }
  }

  // You can also store this data in your database for analytics
  // await updateMessageStatusInDatabase(messageId, status, errorCode, errorMessage);
}

/**
 * Handle incoming messages from users
 */
async function handleIncomingMessage(data: WhatsAppWebhookEvent) {
  const from = data.From; // User's phone number
  const body = data.Body; // Message content
  const hasMedia = parseInt(data.NumMedia || '0') > 0;
  const mediaUrl = data.MediaUrl;
  const mediaContentType = data.MediaContentType;

  // Guard: ensure from is defined
  if (!from) {
    console.error('No sender phone number in webhook data');
    return;
  }

  console.log(`📨 Incoming message from ${from}:`, {
    message: body?.substring(0, 100),
    hasMedia,
    mediaContentType
  });

  try {
    // Parse and categorize incoming message
    const messageCategory = categorizeIncomingMessage(body || '');

    switch (messageCategory) {
      case 'donation_inquiry':
        await handleDonationInquiry(from, body || '');
        break;

      case 'pooja_booking':
        await handlePoojaBookingInquiry(from, body || '');
        break;

      case 'certificate_request':
        await handleCertificateRequest(from, body || '');
        break;

      case 'opt_out':
        await handleOptOut(from);
        break;

      case 'help':
        await sendHelpMessage(from);
        break;

      default:
        await sendDefaultResponse(from, body || '');
        break;
    }

    // Handle media if present
    if (hasMedia && mediaUrl) {
      await handleIncomingMedia(from, mediaUrl, mediaContentType || '');
    }

  } catch (error) {
    console.error('Error handling incoming message:', error);

    // Send error response to user
    await productionWhatsAppService.sendMessage({
      phoneNumber: from,
      message: 'Sorry, we encountered an error processing your message. Please try again or contact us directly.',
      type: 'template',
      priority: 'high'
    });
  }
}

/**
 * Categorize incoming messages for appropriate routing
 */
function categorizeIncomingMessage(message: string): string {
  const lowerMessage = message.toLowerCase().trim();

  // Donation related keywords
  if (lowerMessage.includes('donation') || lowerMessage.includes('donate') || lowerMessage.includes('receipt')) {
    return 'donation_inquiry';
  }

  // Pooja booking keywords
  if (lowerMessage.includes('pooja') || lowerMessage.includes('booking') || lowerMessage.includes('puja')) {
    return 'pooja_booking';
  }

  // Certificate request keywords
  if (lowerMessage.includes('certificate')) {
    return 'certificate_request';
  }

  // Opt out keywords
  if (lowerMessage.includes('stop') || lowerMessage.includes('unsubscribe') || lowerMessage.includes('opt out')) {
    return 'opt_out';
  }

  // Help keywords
  if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('menu')) {
    return 'help';
  }

  return 'general';
}

/**
 * Handle donation-related inquiries
 */
async function handleDonationInquiry(from: string, message: string) {
  const response = `🙏 *Thank you for your interest in donating!* 🙏

To make a donation to ${process.env.TEMPLE_NAME || 'our temple'}:

1. Visit our website: ${process.env.NEXT_PUBLIC_BASE_URL || 'https://our-website.com'}/donate
2. Call us: ${process.env.TEMPLE_PHONE_1 || '9945594845'}
3. Visit us in person

Your contributions help us continue our spiritual services and community work.

📞 For assistance: ${process.env.TEMPLE_PHONE_2 || '9902520105'}
🏠 Address: ${process.env.TEMPLE_ADDRESS || '9/2, Damodar Modaliar Road, Ulsoor, Bangalore - 560008'}`;

  await productionWhatsAppService.sendMessage({
    phoneNumber: from,
    message: response,
    type: 'template',
    priority: 'normal'
  });
}

/**
 * Handle pooja booking inquiries
 */
async function handlePoojaBookingInquiry(from: string, message: string) {
  const response = `🙏 *Pooja Booking Services* 🙏

We offer various pooja services at ${process.env.TEMPLE_NAME || 'our temple'}:

📿 *Available Poojas:*
• General Pooja
• Satyanarayana Pooja
• Ganapathi Homam
• Navagraha Shanti
• Personalized Poojas

📞 *To Book:*
1. Call: ${process.env.TEMPLE_PHONE_1 || '9945594845'}
2. Website: ${process.env.NEXT_PUBLIC_BASE_URL || 'https://our-website.com'}/book-pooja
3. Visit: ${process.env.TEMPLE_ADDRESS || '9/2, Damodar Modaliar Road, Ulsoor, Bangalore - 560008'}

Our pandits will guide you through the process and suggest auspicious dates.`;

  await productionWhatsAppService.sendMessage({
    phoneNumber: from,
    message: response,
    type: 'template',
    priority: 'normal'
  });
}

/**
 * Handle certificate requests
 */
async function handleCertificateRequest(from: string, message: string) {
  const response = `📄 *Donation Certificate Request* 📄

For donation receipts and certificates:

📧 *Email us:*
• Your name and phone number
• Donation date and amount
• Receipt number (if available)
• Purpose: Certificate Request

Email: ${process.env.TEMPLE_EMAIL || 'contact@temple.org'}

📞 *Or Call:* ${process.env.TEMPLE_PHONE_2 || '9902520105'}

We'll send your certificate within 2-3 business days.`;

  await productionWhatsAppService.sendMessage({
    phoneNumber: from,
    message: response,
    type: 'template',
    priority: 'normal'
  });
}

/**
 * Handle opt-out requests
 */
async function handleOptOut(from: string) {
  // Here you would typically update user preferences in database
  console.log(`🛑 User ${from} opted out from WhatsApp communications`);

  const response = `🛑 *Opt-Out Confirmation*

You have been successfully opted out from WhatsApp notifications.

If you wish to receive updates again:
1. Send "START" to this number
2. Or call: ${process.env.TEMPLE_PHONE_1 || '9945594845'}

Thank you for your understanding.

🙏 *${process.env.TEMPLE_NAME || 'Shri Raghavendra Swamy Brundavana Sannidhi'}*`;

  await productionWhatsAppService.sendMessage({
    phoneNumber: from,
    message: response,
    type: 'template',
    priority: 'high'
  });
}

/**
 * Send help message with menu options
 */
async function sendHelpMessage(from: string) {
  const response = `🙏 *Welcome to ${process.env.TEMPLE_NAME || 'Our Temple'}* 🙏

How can we help you today?

💝 *Donate:* "donate" or "donation"
📿 *Book Pooja:* "pooja" or "booking"
📄 *Certificate:* "certificate"
📞 *Call Us:* ${process.env.TEMPLE_PHONE_1 || '9945594845'}
🏠 *Visit Us:* ${process.env.TEMPLE_ADDRESS || '9/2, Damodar Modaliar Road, Ulsoor, Bangalore - 560008'}

Type "help" anytime to see this menu again.
Type "stop" to opt out of messages.

May Sri Raghavendra Swamy's blessings be with you! 🙏`;

  await productionWhatsAppService.sendMessage({
    phoneNumber: from,
    message: response,
    type: 'template',
    priority: 'normal'
  });
}

/**
 * Send default response for unrecognized messages
 */
async function sendDefaultResponse(from: string, message: string) {
  const response = `🙏 *Thank you for your message!*

We have received your message and our team will get back to you shortly.

For immediate assistance:
📞 Call: ${process.env.TEMPLE_PHONE_1 || '9945594845'}
📧 Email: ${process.env.TEMPLE_EMAIL || 'contact@temple.org'}
🌐 Website: ${process.env.NEXT_PUBLIC_BASE_URL || 'https://our-website.com'}

Type "help" to see available services.`;

  await productionWhatsAppService.sendMessage({
    phoneNumber: from,
    message: response,
    type: 'template',
    priority: 'normal'
  });
}

/**
 * Handle incoming media files
 */
async function handleIncomingMedia(from: string, mediaUrl: string, contentType: string) {
  console.log(`📎 Received media from ${from}:`, {
    url: mediaUrl,
    contentType
  });

  // Here you can:
  // 1. Download and store media
  // 2. Process images/documents
  // 3. Acknowledge receipt

  const response = `📎 *Media Received*

Thank you for sending the ${contentType.split('/')[0]}. Our team will review it and respond accordingly.

For faster processing, please also include a description of what you've sent.`;

  await productionWhatsAppService.sendMessage({
    phoneNumber: from,
    message: response,
    type: 'template',
    priority: 'normal'
  });
}

/**
 * Notify admin about failed message delivery
 */
async function notifyAdminAboutFailedDelivery(data: WhatsAppWebhookEvent) {
  const adminMessage = `⚠️ *WhatsApp Delivery Failure*

❌ *Message failed to deliver:*
• To: ${data.To}
• Status: ${data.MessageStatus || data.SmsStatus}
• Error: ${data.ErrorMessage || 'Unknown error'}
• Code: ${data.ErrorCode || 'N/A'}

Please check the recipient's number and message content.

📅 Time: ${new Date().toLocaleString('en-IN')}`;

  await productionWhatsAppService.sendMessage({
    phoneNumber: process.env.ADMIN_PHONE_NUMBER || '+918310408797',
    message: adminMessage,
    type: 'template',
    priority: 'high'
  });
}