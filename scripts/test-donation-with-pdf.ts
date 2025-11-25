/**
 * Test script to send donation receipt with PDF attachment
 * Run with: npx tsx scripts/test-donation-with-pdf.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables FIRST before any imports
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function testDonationWithPDF() {
  // Import services AFTER env vars are loaded
  const { productionWhatsAppService } = await import('../lib/whatsapp-production');
  const { certificateService } = await import('../lib/certificate-service');

  console.log('\n🚀 Testing Donation Receipt with PDF Attachment\n');
  console.log('═'.repeat(60));

  // Test donation details
  const testDonation = {
    donorName: 'Shandesh Kumar',
    donorPhone: '+917019337306', // Your phone number - CHANGE THIS to your number
    amount: 1000,
    receiptNumber: 'DN-TEST-001',
    donationType: 'General Donation',
    date: new Date(),
    paymentId: 'test_pay_123456'
  };

  console.log('\n📋 Test Donation Details:');
  console.log(`   Donor: ${testDonation.donorName}`);
  console.log(`   Phone: ${testDonation.donorPhone}`);
  console.log(`   Amount: ₹${testDonation.amount.toLocaleString('en-IN')}`);
  console.log(`   Receipt: ${testDonation.receiptNumber}`);
  console.log(`   Date: ${testDonation.date.toLocaleDateString('en-IN')}`);

  try {
    // Step 1: Generate PDF Certificate
    console.log('\n📄 Step 1: Generating PDF Certificate...');

    const certificateResult = await certificateService.generateCertificate({
      donor_name: testDonation.donorName,
      amount: testDonation.amount,
      donation_id: testDonation.receiptNumber,
      donation_date: testDonation.date.toISOString().split('T')[0], // YYYY-MM-DD format
      phone_number: testDonation.donorPhone,
      reason_text: 'for their valued contribution'
    });

    if (!certificateResult.success || !certificateResult.pdf_base64) {
      throw new Error('Failed to generate PDF certificate');
    }

    console.log('✅ PDF Certificate generated successfully');
    console.log(`   Size: ${Math.round(Buffer.from(certificateResult.pdf_base64, 'base64').length / 1024)} KB`);

    // Step 2: Send WhatsApp message with PDF
    console.log('\n📱 Step 2: Sending WhatsApp message with PDF attachment...');
    console.log(`   Using template: DONATION_RECEIPT_V2`);
    console.log(`   To: ${testDonation.donorPhone}`);

    const whatsappResult = await productionWhatsAppService.sendDonationReceiptTemplate(
      testDonation.donorName,
      testDonation.donorPhone,
      testDonation.receiptNumber,
      testDonation.amount,
      testDonation.donationType,
      testDonation.date,
      `pay_test_${Date.now()}`, // paymentId
      undefined, // pdfUrl - not using URL
      certificateResult.pdf_base64 // pdfBase64 - will be uploaded to Twilio
    );

    console.log('\n' + '═'.repeat(60));
    console.log('\n📊 RESULT:\n');

    if (whatsappResult.success) {
      console.log('✅ SUCCESS! WhatsApp message sent with PDF attachment');
      console.log(`\n📨 Message IDs:`);
      console.log(`   Receipt Message: ${whatsappResult.receiptMessageId}`);
      if (whatsappResult.adminMessageId) {
        console.log(`   Admin Notification: ${whatsappResult.adminMessageId}`);
      }

      console.log('\n📱 Check your WhatsApp now!');
      console.log(`   Phone: ${testDonation.donorPhone}`);
      console.log(`   You should receive:`);
      console.log(`   1. Message with donor name: "${testDonation.donorName}"`);
      console.log(`   2. Amount: "₹${testDonation.amount.toLocaleString('en-IN')}"`);
      console.log(`   3. Receipt number: "${testDonation.receiptNumber}"`);
      console.log(`   4. Date: "${testDonation.date.toLocaleDateString('en-IN')}"`);
      console.log(`   5. 📎 PDF certificate attachment`);
    } else {
      console.log('❌ FAILED to send WhatsApp message');
      console.log(`\n   Error: ${whatsappResult.error}`);

      if (whatsappResult.error?.includes('not configured')) {
        console.log('\n⚠️  Template not configured or not approved yet.');
        console.log('   Check Twilio Console → Content Editor for template status');
      }
    }

  } catch (error) {
    console.log('\n' + '═'.repeat(60));
    console.log('\n❌ ERROR:\n');
    console.log(error instanceof Error ? error.message : 'Unknown error');
    console.error('\nFull error:', error);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('\n💡 Tips:');
  console.log('   - Make sure WHATSAPP_TEST_MODE=false in .env.local');
  console.log('   - Templates must be approved in Twilio Console');
  console.log('   - Phone number must be in E.164 format (+country code)');
  console.log('   - PDF attachment may take a few seconds to upload\n');
}

// Run the test
testDonationWithPDF().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
