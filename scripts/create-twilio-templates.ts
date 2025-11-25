/**
 * Script to create WhatsApp templates in Twilio following UTILITY category guidelines
 * Run with: npx tsx scripts/create-twilio-templates.ts
 *
 * CRITICAL: These templates MUST be UTILITY category, NOT MARKETING
 * - NO promotional words (thank you, blessed, generous, divine, etc.)
 * - Keep language factual and transactional
 * - Include realistic sample content for all variables
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from app/.env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
  console.error('❌ Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN in environment variables');
  process.exit(1);
}

// Template definitions following UTILITY category strict guidelines
const templates = [
  // Template 1: DONATION RECEIPT (User) - with PDF attachment support
  {
    friendly_name: 'temple_donation_receipt_utility_v3',
    types: {
      'whatsapp/card': {
        header_text: 'Receipt Confirmation',
        body: `Donation Receipt

Name: {{1}}
Amount: ₹{{2}}
Receipt: {{3}}
Date: {{4}}

Your donation has been processed. Receipt number {{3}}.

For questions, contact the temple office.`,
        footer: 'Shri Raghavendra Swamy Temple'
      }
    },
    language: 'en',
    variables: {
      '1': 'Ramesh Kumar',
      '2': '501',
      '3': 'DN-2025-001234',
      '4': '23/11/2025'
    }
  },

  // Template 2: ADMIN DONATION NOTIFICATION
  {
    friendly_name: 'admin_donation_alert_utility_v3',
    types: {
      'whatsapp/card': {
        header_text: 'New Transaction Alert',
        body: `New Donation Received

Donor: {{1}}
Phone: {{2}}
Amount: {{3}}
Receipt: {{4}}
Date: {{5}}

Check admin dashboard for details.`,
        footer: 'Temple Admin System'
      }
    },
    language: 'en',
    variables: {
      '1': 'Ramesh Kumar',
      '2': '+917760118171',
      '3': '₹501',
      '4': 'DN-2025-001234',
      '5': '23/11/2025'
    }
  },

  // Template 3: POOJA BOOKING (User)
  {
    friendly_name: 'temple_pooja_booking_utility_v3',
    types: {
      'whatsapp/card': {
        header_text: 'Booking Confirmation',
        body: `Pooja Booking Confirmed

Name: {{1}}
Pooja: {{2}}
Date: {{3}}
Booking ID: {{4}}

Your pooja has been scheduled. Booking reference {{4}}.

For changes, contact the temple office.`,
        footer: 'Shri Raghavendra Swamy Temple'
      }
    },
    language: 'en',
    variables: {
      '1': 'Sita Devi',
      '2': 'Satyanarayan Pooja',
      '3': '25/11/2025',
      '4': 'PJ-2025-001234'
    }
  },

  // Template 4: ADMIN POOJA NOTIFICATION
  {
    friendly_name: 'admin_pooja_alert_utility_v3',
    types: {
      'whatsapp/card': {
        header_text: 'New Booking Alert',
        body: `New Pooja Booking

Devotee: {{1}}
Phone: {{2}}
Pooja: {{3}}
Date: {{4}}
Booking ID: {{5}}

Check admin dashboard for details.`,
        footer: 'Temple Admin System'
      }
    },
    language: 'en',
    variables: {
      '1': 'Sita Devi',
      '2': '+919876543210',
      '3': 'Satyanarayan Pooja',
      '4': '25/11/2025',
      '5': 'PJ-2025-001234'
    }
  },

  // Template 5: PARIHARA BOOKING (User)
  {
    friendly_name: 'temple_parihara_booking_utility_v3',
    types: {
      'whatsapp/card': {
        header_text: 'Booking Confirmation',
        body: `Parihara Pooja Confirmed

Name: {{1}}
Pooja: {{2}}
Date: {{3}}
Booking ID: {{4}}

Your parihara pooja has been scheduled. Reference {{4}}.

For changes, contact the temple office.`,
        footer: 'Shri Raghavendra Swamy Temple'
      }
    },
    language: 'en',
    variables: {
      '1': 'Lakshmi Narayan',
      '2': 'Navagraha Parihara',
      '3': '26/11/2025',
      '4': 'PR-2025-001234'
    }
  },

  // Template 6: ADMIN PARIHARA NOTIFICATION
  {
    friendly_name: 'admin_parihara_alert_utility_v3',
    types: {
      'whatsapp/card': {
        header_text: 'New Booking Alert',
        body: `New Parihara Booking

Devotee: {{1}}
Phone: {{2}}
Pooja: {{3}}
Date: {{4}}
Booking ID: {{5}}

Check admin dashboard for details.`,
        footer: 'Temple Admin System'
      }
    },
    language: 'en',
    variables: {
      '1': 'Lakshmi Narayan',
      '2': '+919123456789',
      '3': 'Navagraha Parihara',
      '4': '26/11/2025',
      '5': 'PR-2025-001234'
    }
  },

  // Template 7: ASTROLOGY CONSULTATION (User)
  {
    friendly_name: 'temple_astrology_booking_utility_v3',
    types: {
      'whatsapp/card': {
        header_text: 'Consultation Confirmation',
        body: `Astrology Consultation Confirmed

Name: {{1}}
Type: {{2}}
Date: {{3}}
Reference: {{4}}

Your consultation has been scheduled. Reference number {{4}}.

For changes, contact the temple office.`,
        footer: 'Shri Raghavendra Swamy Temple'
      }
    },
    language: 'en',
    variables: {
      '1': 'Venkata Raman',
      '2': 'Horoscope Reading',
      '3': '27/11/2025',
      '4': 'AS-2025-001234'
    }
  },

  // Template 8: ADMIN ASTROLOGY NOTIFICATION
  {
    friendly_name: 'admin_astrology_alert_utility_v3',
    types: {
      'whatsapp/card': {
        header_text: 'New Booking Alert',
        body: `New Astrology Booking

Client: {{1}}
Phone: {{2}}
Type: {{3}}
Date: {{4}}
Reference: {{5}}

Check admin dashboard for details.`,
        footer: 'Temple Admin System'
      }
    },
    language: 'en',
    variables: {
      '1': 'Venkata Raman',
      '2': '+918765432109',
      '3': 'Horoscope Reading',
      '4': '27/11/2025',
      '5': 'AS-2025-001234'
    }
  }
];

async function createTemplate(template: any, index: number): Promise<any> {
  const templateNames = [
    'temple_donation_receipt_utility_v3',
    'admin_donation_alert_utility_v3',
    'temple_pooja_booking_utility_v3',
    'admin_pooja_alert_utility_v3',
    'temple_parihara_booking_utility_v3',
    'admin_parihara_alert_utility_v3',
    'temple_astrology_booking_utility_v3',
    'admin_astrology_alert_utility_v3'
  ];

  console.log(`\n📝 Creating template: ${template.friendly_name}`);
  console.log(`   Template Name: ${templateNames[index]}`);

  const url = `https://content.twilio.com/v1/Content`;

  const payload = {
    friendly_name: template.friendly_name,
    language: template.language,
    types: template.types,
    variables: template.variables
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(`❌ Failed to create ${template.friendly_name}`);
    console.error(`   Error: ${data.message || JSON.stringify(data, null, 2)}`);
    return {
      success: false,
      error: data,
      templateName: templateNames[index],
      friendlyName: template.friendly_name
    };
  }

  console.log(`✅ Created successfully!`);
  console.log(`   Content SID: ${data.sid}`);
  console.log(`   Status: ${data.approval_requests?.status || 'Created - Ready for submission'}`);

  return {
    success: true,
    data,
    templateName: templateNames[index],
    friendlyName: template.friendly_name,
    contentSid: data.sid
  };
}

async function main() {
  console.log('🚀 Starting Twilio WhatsApp Template Creation');
  console.log('   Following UTILITY Category Guidelines (STRICT MODE)\n');
  console.log(`📊 Total templates to create: ${templates.length}`);
  console.log(`🔑 Using Twilio Account: ${TWILIO_ACCOUNT_SID}\n`);
  console.log('═'.repeat(70));

  const results = [];

  for (let i = 0; i < templates.length; i++) {
    const result = await createTemplate(templates[i], i);
    results.push(result);

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log('\n' + '═'.repeat(70));
  console.log('\n📊 SUMMARY\n');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successfully created: ${successful.length}/${templates.length}`);
  console.log(`❌ Failed: ${failed.length}/${templates.length}\n`);

  if (successful.length > 0) {
    console.log('📋 ENVIRONMENT VARIABLES (add these to .env.local and .env.production.local):\n');
    console.log('# WhatsApp Content Template SIDs V3 (UTILITY Category - Nov 2025)');

    const envMapping: Record<string, string> = {
      'temple_donation_receipt_utility_v3': 'TWILIO_TEMPLATE_DONATION_RECEIPT_V2',
      'admin_donation_alert_utility_v3': 'TWILIO_TEMPLATE_ADMIN_DONATION_V2',
      'temple_pooja_booking_utility_v3': 'TWILIO_TEMPLATE_POOJA_BOOKING_V2',
      'admin_pooja_alert_utility_v3': 'TWILIO_TEMPLATE_ADMIN_POOJA_V2',
      'temple_parihara_booking_utility_v3': 'TWILIO_TEMPLATE_PARIHARA_BOOKING_V2',
      'admin_parihara_alert_utility_v3': 'TWILIO_TEMPLATE_ADMIN_PARIHARA_V2',
      'temple_astrology_booking_utility_v3': 'TWILIO_TEMPLATE_ASTROLOGY_BOOKING_V2',
      'admin_astrology_alert_utility_v3': 'TWILIO_TEMPLATE_ADMIN_ASTROLOGY_V2'
    };

    successful.forEach(r => {
      const envName = envMapping[r.templateName];
      if (envName) {
        console.log(`${envName}="${r.contentSid}"`);
      }
    });

    console.log('\n# Set to false to enable live WhatsApp messages');
    console.log('WHATSAPP_TEST_MODE="false"');
  }

  if (failed.length > 0) {
    console.log('\n❌ Failed Templates:\n');
    failed.forEach(r => {
      console.log(`   - ${r.friendlyName} (${r.templateName})`);
      console.log(`     Error: ${r.error?.message || 'Unknown error'}`);
    });
  }

  console.log('\n' + '═'.repeat(70));
  console.log('\n⚠️  CRITICAL NEXT STEPS:\n');
  console.log('1. Go to Twilio Console: https://console.twilio.com/us1/develop/sms/content-editor');
  console.log('2. For EACH template created:');
  console.log('   a. Click on the template');
  console.log('   b. Click "Submit for Approval" button');
  console.log('   c. Wait for WhatsApp approval (15 min - 48 hours)');
  console.log('3. Check that Category shows "UTILITY" (NOT MARKETING)');
  console.log('4. Once all approved, copy the environment variables above');
  console.log('5. Add them to .env.local and .env.production.local');
  console.log('6. Set WHATSAPP_TEST_MODE="false" to enable live sending');
  console.log('7. Deploy to Vercel with updated environment variables\n');

  console.log('📚 Troubleshooting:');
  console.log('   - If templates show MARKETING category, they were auto-classified');
  console.log('   - Delete and recreate with even more boring/factual language');
  console.log('   - Avoid ALL friendly words - keep it robotic and transactional');
  console.log('   - Contact Twilio support if issues persist\n');
}

main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
