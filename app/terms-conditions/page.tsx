'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/shared/contexts/contexts/LanguageContext'
import { LanguageSelector } from '@/shared/components/common/LanguageSelector'

export default function TermsConditionsPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-temple-cream via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-temple-maroon hover:text-temple-gold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
          {/* Language Selector */}
          <LanguageSelector />
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-temple-gold/20 overflow-hidden">
          <div className="bg-gradient-to-r from-temple-maroon to-orange-900 text-white px-6 py-8 sm:px-8">
            <h1 className="font-cinzel text-3xl sm:text-4xl font-bold mb-2">
              {t.termsConditionsTitle}
            </h1>
            <p className="text-orange-100">
              Last Updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-8 sm:px-8 space-y-6 text-gray-700">
            {/* Introduction */}
            <section>
              <p className="leading-relaxed">
                {t.termsConditionsIntro}
              </p>
            </section>

            {/* Acceptance of Terms */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using our services, you acknowledge that you have read, understood, and agree
                to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, please
                do not use our services.
              </p>
            </section>

            {/* Services Offered */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                2. Services Offered
              </h2>
              <p className="mb-3">We provide the following services through our platform:</p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">2.1 Online Donations</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>General donations to the temple</li>
                    <li>Special purpose donations (Annadana, Vidyadana, etc.)</li>
                    <li>Building and maintenance fund contributions</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">2.2 Pooja Bookings</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Daily poojas and archanas</li>
                    <li>Special occasion poojas</li>
                    <li>Parihara poojas (remedial rituals)</li>
                    <li>Satyanarayana Pooja, Rudrabhisheka, and other ceremonies</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">2.3 Astrology Consultations</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Horoscope reading and analysis</li>
                    <li>Nakshatra and planetary position guidance</li>
                    <li>Parihara recommendations</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* User Eligibility */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                3. User Eligibility
              </h2>
              <p>
                You must be at least 18 years of age to make donations or book services through our platform.
                By using our services, you represent and warrant that you meet this age requirement and have
                the legal capacity to enter into binding contracts.
              </p>
            </section>

            {/* User Obligations */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                4. User Obligations
              </h2>
              <p className="mb-3">When using our services, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Update your information promptly if it changes</li>
                <li>Maintain the confidentiality of your account and booking details</li>
                <li>Use the platform only for lawful purposes</li>
                <li>Not impersonate any person or entity</li>
                <li>Not interfere with or disrupt the platform's functionality</li>
                <li>Not attempt unauthorized access to our systems</li>
                <li>Respect the religious and cultural nature of our services</li>
              </ul>
            </section>

            {/* Payments and Pricing */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                5. Payments and Pricing
              </h2>

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-800">5.1 Payment Processing</h3>
                  <p>
                    All payments are processed securely through Razorpay, a PCI DSS compliant payment gateway.
                    We accept credit cards, debit cards, UPI, net banking, and digital wallets.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">5.2 Platform Fee</h3>
                  <p>
                    A 2% platform fee is deducted from each transaction to cover payment gateway charges and
                    operational costs. The remaining 98% goes directly to the temple.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">5.3 Pricing</h3>
                  <p>
                    All prices are displayed in Indian Rupees (INR) and include applicable taxes. Pooja
                    booking prices are determined by the temple and may vary based on the type of service
                    and materials required.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">5.4 Failed Transactions</h3>
                  <p>
                    If a payment fails, your booking will not be confirmed. If money was deducted from your
                    account but the transaction failed on our end, it will be automatically refunded by your
                    bank within 5-7 business days.
                  </p>
                </div>
              </div>
            </section>

            {/* Booking Confirmation */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                6. Booking Confirmation and Receipts
              </h2>

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-800">6.1 Confirmation</h3>
                  <p>
                    Upon successful payment, you will receive an instant booking confirmation and receipt
                    via WhatsApp and/or Email. This confirmation serves as proof of your donation or booking.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">6.2 Receipt Details</h3>
                  <p>
                    Receipts include a unique receipt number, transaction details, your information, and
                    service details. Please preserve your receipt for your records and for any future inquiries.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">6.3 80G Tax Exemption</h3>
                  <p>
                    Donations made to the temple may be eligible for tax deductions under Section 80G of the
                    Income Tax Act, 1961 (subject to the temple's 80G registration status). Please consult
                    your tax advisor for specific guidance.
                  </p>
                </div>
              </div>
            </section>

            {/* Service Delivery */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                7. Service Delivery
              </h2>

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-800">7.1 Pooja Performance</h3>
                  <p>
                    All poojas will be performed by qualified temple priests on the date and time specified
                    in your booking. The temple reserves the right to make minor adjustments to timing based
                    on auspicious muhurtas and temple schedules.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">7.2 Prasadam and Materials</h3>
                  <p>
                    Prasadam (blessed offerings) and materials from poojas can be collected from the temple
                    or may be delivered to your address (if delivery service is available and selected).
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">7.3 Consultation Scheduling</h3>
                  <p>
                    For astrology consultations, the temple will contact you within 24-48 hours to schedule
                    an appointment at a mutually convenient time.
                  </p>
                </div>
              </div>
            </section>

            {/* Cancellations and Modifications */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                8. Cancellations and Modifications
              </h2>
              <p>
                Please refer to our{' '}
                <Link href="/refund-policy" className="text-temple-maroon hover:underline font-semibold">
                  Refund & Cancellation Policy
                </Link>
                {' '}for detailed information about cancellations, modifications, and refunds.
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                9. Intellectual Property
              </h2>
              <p>
                All content on this website, including text, images, logos, graphics, and software, is the
                property of Shri Raghavendra Swamy Brundavana Sannidhi and is protected by Indian and
                international copyright laws. You may not reproduce, distribute, or create derivative works
                without our express written permission.
              </p>
            </section>

            {/* Disclaimer of Warranties */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                10. Disclaimer of Warranties
              </h2>
              <p className="mb-3">
                Our services are provided on an "as is" and "as available" basis. While we strive to ensure
                accuracy and reliability, we make no warranties or representations regarding:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>The accuracy, completeness, or reliability of content</li>
                <li>Uninterrupted or error-free operation of the platform</li>
                <li>Specific outcomes or results from religious services</li>
                <li>Third-party service providers (payment gateway, messaging services)</li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                11. Limitation of Liability
              </h2>
              <p>
                To the fullest extent permitted by law, Shri Raghavendra Swamy Brundavana Sannidhi shall not
                be liable for any indirect, incidental, special, consequential, or punitive damages arising
                from your use of our services, including but not limited to loss of data, loss of profits,
                or service interruptions. Our maximum liability shall not exceed the amount paid by you for
                the specific service in question.
              </p>
            </section>

            {/* Religious Nature of Services */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                12. Religious Nature of Services
              </h2>
              <p>
                You acknowledge that our services are religious in nature and based on Hindu traditions
                and practices. Results, outcomes, and spiritual benefits cannot be guaranteed and are
                subject to individual faith, karma, and divine will. Astrology consultations and parihara
                recommendations are provided for guidance purposes only.
              </p>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                13. Indemnification
              </h2>
              <p>
                You agree to indemnify, defend, and hold harmless Shri Raghavendra Swamy Brundavana Sannidhi,
                its trustees, priests, employees, and agents from any claims, damages, losses, liabilities,
                and expenses arising from your violation of these Terms or misuse of our services.
              </p>
            </section>

            {/* Privacy */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                14. Privacy
              </h2>
              <p>
                Your use of our services is also governed by our{' '}
                <Link href="/privacy-policy" className="text-temple-maroon hover:underline font-semibold">
                  Privacy Policy
                </Link>
                . Please review it to understand how we collect, use, and protect your personal information.
              </p>
            </section>

            {/* Modifications to Terms */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                15. Modifications to Terms
              </h2>
              <p>
                We reserve the right to modify these Terms at any time. Changes will be posted on this page
                with an updated "Last Updated" date. Your continued use of our services after changes
                constitutes acceptance of the modified Terms. We recommend reviewing these Terms periodically.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                16. Termination
              </h2>
              <p>
                We reserve the right to suspend or terminate your access to our services at any time,
                without prior notice, for conduct that we believe violates these Terms, is harmful to
                other users, or is otherwise inappropriate.
              </p>
            </section>

            {/* Dispute Resolution */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                17. Dispute Resolution
              </h2>

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-800">17.1 Informal Resolution</h3>
                  <p>
                    In the event of any dispute, we encourage you to first contact us directly to seek
                    an informal resolution.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">17.2 Governing Law</h3>
                  <p>
                    These Terms are governed by the laws of India. Any disputes shall be subject to the
                    exclusive jurisdiction of the courts in Bangalore, Karnataka.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">17.3 Severability</h3>
                  <p>
                    If any provision of these Terms is found to be invalid or unenforceable, the remaining
                    provisions shall remain in full force and effect.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                18. {t.contactUsPolicies}
              </h2>
              <p className="mb-4">
                If you have questions about these Terms & Conditions, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Shri Raghavendra Swamy Brundavana Sannidhi</strong></p>
                <p>{t.policyAddress}</p>
                <p>{t.policyPhone}: +91 7019337306 / +91 99025 20105</p>
                <p>
                  {t.policyEmail}:{' '}
                  <a href="mailto:harishkumar@gurusevamandali.com"
                     className="text-temple-maroon hover:underline">
                    harishkumar@gurusevamandali.com
                  </a>
                </p>
              </div>
            </section>

            {/* Acknowledgment */}
            <section className="bg-temple-cream/30 border-l-4 border-temple-maroon p-4 rounded">
              <p className="text-gray-700">
                <strong>By using our services, you acknowledge that you have read, understood, and agree
                to be bound by these Terms and Conditions.</strong>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
