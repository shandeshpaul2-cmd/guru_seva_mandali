/**
 * Script to delete old WhatsApp templates with incorrect names
 * Run with: npx tsx scripts/delete-old-templates.ts
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

// Old template Content SIDs to delete
const oldTemplateSids = [
  'HX82048384a1d89fa04b7cf9225410dfd8',
  'HXd42e9de3fe5c15feb421a690b97a9a17',
  'HXa9c3b83fbcf119331cc2d0e6ebfe243d',
  'HX46528971c99a03ab4a1f2521cadb87bf',
  'HX357bec92e6f954ca14175fc733f904a7',
  'HX3ce3c0073c395cf01dd03d4455b3cf56',
  'HXed5c7140609f37498137f2e034bc34a2',
  'HXa136fd353658c3d761ce102f4f986b01'
];

async function deleteTemplate(sid: string): Promise<void> {
  console.log(`\n🗑️  Deleting template: ${sid}`);

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
  console.log('🚀 Starting Template Deletion');
  console.log(`📊 Templates to delete: ${oldTemplateSids.length}\n`);
  console.log('═'.repeat(60));

  for (const sid of oldTemplateSids) {
    await deleteTemplate(sid);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '═'.repeat(60));
  console.log('\n✅ Template deletion complete!');
  console.log('Now run: npx tsx scripts/create-twilio-templates.ts\n');
}

main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
