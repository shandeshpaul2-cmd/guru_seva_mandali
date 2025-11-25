/**
 * Script to delete the newly created v3 WhatsApp templates
 * Run with: npx tsx scripts/delete-new-v3-templates.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
  console.error('❌ Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN');
  process.exit(1);
}

// New v3 template Content SIDs to delete
const v3TemplateSids = [
  'HX068de2a90d1e104ed5e93574e5da793c', // temple_donation_receipt_utility_v3
  'HX1efe8cfaaac5ec86a032fadafe711faa', // admin_donation_alert_utility_v3
  'HX0c5ca9e3331b976c90be679a402f3d1d', // temple_pooja_booking_utility_v3
  'HXe033ec6003dd95869830e7a50d07e142', // admin_pooja_alert_utility_v3
  'HXb32d765a2389311df892276a4d02aad7', // temple_parihara_booking_utility_v3
  'HX9f0efd7049df8c6b3b4c07f137dc4379', // admin_parihara_alert_utility_v3
  'HX529a30510ac606d17fb26ef4188df8d4', // temple_astrology_booking_utility_v3
  'HX302180886a63cb2d84faf354ff9e1f62'  // admin_astrology_alert_utility_v3
];

async function deleteTemplate(sid: string): Promise<void> {
  console.log(`\n🗑️  Deleting v3 template: ${sid}`);

  const url = `https://content.twilio.com/v1/Content/${sid}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`
      }
    });

    if (response.status === 204 || response.status === 200) {
      console.log(`✅ Deleted successfully`);
    } else if (response.status === 404) {
      console.log(`⚠️  Template not found (may have been deleted already)`);
    } else {
      const data = await response.json();
      console.error(`❌ Failed to delete: ${data.message || JSON.stringify(data)}`);
    }
  } catch (error) {
    console.error(`❌ Error deleting template: ${error}`);
  }
}

async function main() {
  console.log('🚀 Deleting New V3 Templates');
  console.log('   Reverting to old templates as requested\n');
  console.log(`📊 Templates to delete: ${v3TemplateSids.length}\n`);
  console.log('═'.repeat(60));

  for (const sid of v3TemplateSids) {
    await deleteTemplate(sid);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '═'.repeat(60));
  console.log('\n✅ V3 template deletion complete!');
  console.log('📋 Now using old templates from your previous configuration\n');
  console.log('Old templates in use:');
  console.log('  - TWILIO_TEMPLATE_DONATION_RECEIPT="HX0e6bdcb37ed0f708c17b931d709122de"');
  console.log('  - TWILIO_TEMPLATE_ADMIN_DONATION="HX31797dc77bd29acc9af99917bfad0afd"');
  console.log('  - TWILIO_TEMPLATE_POOJA_BOOKING="HX47e8bfb6c4849807d43a3d8729435529"');
  console.log('  - TWILIO_TEMPLATE_ADMIN_POOJA="HX813bd01e4a081ae9abb0be341a250084"');
  console.log('  - TWILIO_TEMPLATE_PARIHARA_BOOKING="HX41f562a7dbbfe065b7a407d5bf03f291"');
  console.log('  - TWILIO_TEMPLATE_ADMIN_PARIHARA="HX5511754b1535bd0782a451d7c35611d7"');
  console.log('  - TWILIO_TEMPLATE_ASTROLOGY_CONSULTATION="HXd3a4097563a7de25cdc95735515b160c"');
  console.log('  - TWILIO_TEMPLATE_ADMIN_ASTROLOGY="HX4696ece2aeb0b38cb338b2723806a607"');
  console.log('\n⚠️  IMPORTANT: Test mode is now DISABLED (WHATSAPP_TEST_MODE="false")');
  console.log('Messages will be sent for real. Make sure users opt-in first!\n');
}

main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
