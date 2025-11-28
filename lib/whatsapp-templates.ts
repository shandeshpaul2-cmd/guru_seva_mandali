/**
 * WhatsApp Message Templates Configuration
 * These templates must be pre-approved by WhatsApp Business API
 * Configure Content SIDs in environment variables after approval
 */

export type TemplateKey =
  | 'DONATION_RECEIPT_WITH_CERTIFICATE'
  | 'DONATION_CERTIFICATE_LINK'  // New template with PDF download link
  | 'ADMIN_DONATION_NOTIFICATION'
  | 'POOJA_BOOKING_CONFIRMATION'
  | 'ADMIN_POOJA_BOOKING_NOTIFICATION'
  | 'PARIHARA_POOJA_CONFIRMATION'
  | 'ADMIN_PARIHARA_POOJA_NOTIFICATION'
  | 'ASTROLOGY_CONSULTATION_CONFIRMATION'
  | 'ADMIN_ASTROLOGY_CONSULTATION_NOTIFICATION';

export interface WhatsAppTemplateVariable {
  [key: string]: string;
}

export interface WhatsAppTemplate {
  name: string;
  contentSid: string;
  variableCount: number;
  hasMedia: boolean;
  language: string;
  description: string;
}

/**
 * Template configurations mapped to Twilio Content SIDs
 * Update these Content SIDs after templates are approved in Twilio Console
 */
const TEMPLATES: Record<TemplateKey, WhatsAppTemplate> = {
  // Donation Receipt Template (with certificate attachment)
  // IMPORTANT: .trim() removes any accidental whitespace/newlines from env vars
  DONATION_RECEIPT_WITH_CERTIFICATE: {
    name: 'donation_receipt_certificate',
    contentSid: (process.env.TWILIO_TEMPLATE_DONATION_RECEIPT_V2 || process.env.TWILIO_TEMPLATE_DONATION_RECEIPT || 'HXxxxxxxxxxxxxxxxxxxxxxxxxxxxx').trim(),
    variableCount: process.env.TWILIO_TEMPLATE_DONATION_RECEIPT_V2 ? 5 : 7, // V2/V3: 5 vars, V1: 7 vars
    hasMedia: true, // Supports PDF certificate attachment
    language: 'en',
    description: 'Donation receipt with 80G certificate PDF attachment'
  },

  // Donation Certificate with Download Link (6 variables: name, amount, receipt, date, pdfUrl, contact)
  DONATION_CERTIFICATE_LINK: {
    name: 'donation_certificate_link',
    contentSid: (process.env.TWILIO_TEMPLATE_DONATION_CERT_LINK || 'HXxxxxxxxxxxxxxxxxxxxxxxxxxxxx').trim(),
    variableCount: 6,
    hasMedia: false, // PDF URL is passed as text variable, not media
    language: 'en',
    description: 'Donation receipt with certificate download link'
  },

  // Admin Donation Notification
  ADMIN_DONATION_NOTIFICATION: {
    name: 'admin_donation_notification',
    contentSid: (process.env.TWILIO_TEMPLATE_ADMIN_DONATION_V2 || process.env.TWILIO_TEMPLATE_ADMIN_DONATION || 'HXxxxxxxxxxxxxxxxxxxxxxxxxxxxx').trim(),
    variableCount: process.env.TWILIO_TEMPLATE_ADMIN_DONATION_V2 ? 5 : 7, // V2/V3: 5 vars, V1: 7 vars
    hasMedia: false,
    language: 'en',
    description: 'Admin notification for new donations'
  },

  // Pooja Booking Confirmation
  POOJA_BOOKING_CONFIRMATION: {
    name: 'pooja_booking_confirmation',
    contentSid: (process.env.TWILIO_TEMPLATE_POOJA_BOOKING_V2 || process.env.TWILIO_TEMPLATE_POOJA_BOOKING || 'HXxxxxxxxxxxxxxxxxxxxxxxxxxxxx').trim(),
    variableCount: 5, // V3: name, service, date, reference, contact
    hasMedia: false,
    language: 'en',
    description: 'Pooja booking confirmation for devotees'
  },

  // Admin Pooja Booking Notification
  ADMIN_POOJA_BOOKING_NOTIFICATION: {
    name: 'admin_pooja_booking_notification',
    contentSid: (process.env.TWILIO_TEMPLATE_ADMIN_POOJA_V2 || process.env.TWILIO_TEMPLATE_ADMIN_POOJA || 'HXxxxxxxxxxxxxxxxxxxxxxxxxxxxx').trim(),
    variableCount: 5, // V3: devotee, phone, service, date, reference
    hasMedia: false,
    language: 'en',
    description: 'Admin notification for new pooja bookings'
  },

  // Parihara Pooja Confirmation
  PARIHARA_POOJA_CONFIRMATION: {
    name: 'parihara_pooja_confirmation',
    contentSid: (process.env.TWILIO_TEMPLATE_PARIHARA_BOOKING_V2 || process.env.TWILIO_TEMPLATE_PARIHARA_BOOKING || 'HXxxxxxxxxxxxxxxxxxxxxxxxxxxxx').trim(),
    variableCount: 5, // V3: name, service, date, reference, contact
    hasMedia: false,
    language: 'en',
    description: 'Parihara pooja booking confirmation'
  },

  // Admin Parihara Pooja Notification
  ADMIN_PARIHARA_POOJA_NOTIFICATION: {
    name: 'admin_parihara_pooja_notification',
    contentSid: (process.env.TWILIO_TEMPLATE_ADMIN_PARIHARA_V2 || process.env.TWILIO_TEMPLATE_ADMIN_PARIHARA || 'HXxxxxxxxxxxxxxxxxxxxxxxxxxxxx').trim(),
    variableCount: 5, // V3: devotee, phone, service, date, reference
    hasMedia: false,
    language: 'en',
    description: 'Admin notification for parihara pooja bookings'
  },

  // Astrology Consultation Confirmation
  ASTROLOGY_CONSULTATION_CONFIRMATION: {
    name: 'astrology_consultation_confirmation',
    contentSid: (process.env.TWILIO_TEMPLATE_ASTROLOGY_BOOKING_V2 || process.env.TWILIO_TEMPLATE_ASTROLOGY_CONSULTATION || 'HXxxxxxxxxxxxxxxxxxxxxxxxxxxxx').trim(),
    variableCount: 5, // V3: name, type, date, reference, contact
    hasMedia: false,
    language: 'en',
    description: 'Astrology consultation request confirmation'
  },

  // Admin Astrology Consultation Notification
  ADMIN_ASTROLOGY_CONSULTATION_NOTIFICATION: {
    name: 'admin_astrology_consultation_notification',
    contentSid: (process.env.TWILIO_TEMPLATE_ADMIN_ASTROLOGY_V2 || process.env.TWILIO_TEMPLATE_ADMIN_ASTROLOGY || 'HXxxxxxxxxxxxxxxxxxxxxxxxxxxxx').trim(),
    variableCount: 5, // V3: client, phone, type, date, reference
    hasMedia: false,
    language: 'en',
    description: 'Admin notification for astrology consultation requests'
  }
};

/**
 * Get template configuration by key
 */
export function getTemplate(key: TemplateKey): WhatsAppTemplate {
  const template = TEMPLATES[key];
  if (!template) {
    throw new Error(`Template not found: ${key}`);
  }
  return template;
}

/**
 * Variable order mapping for each template
 * Twilio templates require variables in exact order: {{1}}, {{2}}, {{3}}, etc.
 */
const TEMPLATE_VARIABLE_ORDER: Record<TemplateKey, string[]> = {
  'DONATION_RECEIPT_WITH_CERTIFICATE': ['donorName', 'amount', 'receiptNumber', 'date', 'contact'],
  'DONATION_CERTIFICATE_LINK': ['donorName', 'amount', 'receiptNumber', 'date', 'certLink', 'contact'],
  'ADMIN_DONATION_NOTIFICATION': ['donorName', 'donorPhone', 'amount', 'receiptNumber', 'date'],
  'POOJA_BOOKING_CONFIRMATION': ['devoteeName', 'poojaName', 'bookingDate', 'receiptNumber', 'contact'],
  'ADMIN_POOJA_BOOKING_NOTIFICATION': ['devoteeName', 'devoteePhone', 'poojaName', 'bookingDate', 'receiptNumber'],
  'PARIHARA_POOJA_CONFIRMATION': ['devoteeName', 'poojaName', 'bookingDate', 'receiptNumber', 'contact'],
  'ADMIN_PARIHARA_POOJA_NOTIFICATION': ['devoteeName', 'devoteePhone', 'poojaName', 'bookingDate', 'receiptNumber'],
  'ASTROLOGY_CONSULTATION_CONFIRMATION': ['clientName', 'consultationType', 'requestDate', 'referenceNumber', 'contact'],
  'ADMIN_ASTROLOGY_CONSULTATION_NOTIFICATION': ['clientName', 'clientPhone', 'consultationType', 'requestDate', 'referenceNumber'],
};

/**
 * Prepare template variables in Twilio format
 * IMPORTANT: Variables MUST be in the exact order defined by the template
 */
export function prepareTemplateVariables(
  templateKey: TemplateKey,
  variables: WhatsAppTemplateVariable
): Record<string, string> {
  // Map variables to template format in the CORRECT ORDER
  const templateVariables: Record<string, string> = {};
  const variableOrder = TEMPLATE_VARIABLE_ORDER[templateKey];

  if (!variableOrder) {
    console.error(`No variable order defined for template: ${templateKey}`);
    // Fallback to object iteration (unreliable but better than nothing)
    Object.keys(variables).forEach((key, index) => {
      templateVariables[String(index + 1)] = variables[key];
    });
    return templateVariables;
  }

  // Map variables in the defined order
  variableOrder.forEach((key, index) => {
    const value = variables[key];
    if (value !== undefined) {
      templateVariables[String(index + 1)] = value;
    } else {
      console.warn(`Missing variable for template ${templateKey}: ${key}`);
      templateVariables[String(index + 1)] = '';
    }
  });

  console.log(`📋 Template ${templateKey} variables mapped:`, templateVariables);

  return templateVariables;
}

/**
 * Validate template variables
 */
export function validateTemplateVariables(
  templateKey: TemplateKey,
  variables: WhatsAppTemplateVariable
): { valid: boolean; missing: string[] } {
  const template = getTemplate(templateKey);
  const variableKeys = Object.keys(variables);

  // Check if we have the right number of variables
  if (variableKeys.length < template.variableCount) {
    return {
      valid: false,
      missing: [`Expected ${template.variableCount} variables, got ${variableKeys.length}`]
    };
  }

  return { valid: true, missing: [] };
}

/**
 * Check if all templates are configured (have real Content SIDs)
 */
export function areTemplatesConfigured(): boolean {
  const unconfigured = Object.entries(TEMPLATES).filter(
    ([_, template]) => template.contentSid.startsWith('HXxxxx')
  );

  if (unconfigured.length > 0) {
    console.warn(
      `⚠️ The following templates need Content SIDs configured: ${unconfigured.map(([key]) => key).join(', ')}`
    );
    return false;
  }

  return true;
}

/**
 * Get all template names (for documentation)
 */
export function getAllTemplateNames(): string[] {
  return Object.values(TEMPLATES).map(t => t.name);
}

/**
 * Check template status
 */
export function getTemplateStatus(): Record<string, { configured: boolean; contentSid: string }> {
  const status: Record<string, { configured: boolean; contentSid: string }> = {};

  Object.entries(TEMPLATES).forEach(([key, template]) => {
    status[key] = {
      configured: !template.contentSid.startsWith('HXxxxx'),
      contentSid: template.contentSid
    };
  });

  return status;
}
