'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/shared/contexts/contexts/LanguageContext'
import { LanguageSelector } from '@/shared/components/common/LanguageSelector'

export default function PrivacyPolicyPage() {
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
              {t.privacyPolicyTitle}
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
                {t.privacyPolicyIntro}
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                {t.privacySection1Title}
              </h2>

              <h3 className="font-semibold text-lg text-gray-800 mb-2 mt-4">
                1.1 Personal Information
              </h3>
              <p className="mb-3">When you make a donation or book a pooja, we collect:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Full name</li>
                <li>Phone number</li>
                <li>Email address (optional)</li>
                <li>Gotra (for religious services)</li>
                <li>Nakshatra and Rashi (for astrology consultations)</li>
                <li>Special instructions or preferences</li>
              </ul>

              <h3 className="font-semibold text-lg text-gray-800 mb-2 mt-4">
                1.2 Payment Information
              </h3>
              <p className="mb-3">
                Payment processing is handled by Razorpay, a certified PCI DSS compliant payment gateway.
                We do not store your credit card, debit card, or bank account details on our servers.
                Payment information is encrypted and securely transmitted to Razorpay for processing.
              </p>

              <h3 className="font-semibold text-lg text-gray-800 mb-2 mt-4">
                1.3 Automatically Collected Information
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Access times and dates</li>
                <li>Pages viewed and navigation patterns</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                2. How We Use Your Information
              </h2>
              <p className="mb-3">We use your information to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Process your donations and pooja bookings</li>
                <li>Send receipts and booking confirmations via WhatsApp or Email</li>
                <li>Perform religious ceremonies and poojas as per your requests</li>
                <li>Provide astrology consultations and parihara pooja recommendations</li>
                <li>Communicate important updates about your bookings</li>
                <li>Maintain records for accounting and legal compliance</li>
                <li>Improve our services and user experience</li>
                <li>Prevent fraud and ensure platform security</li>
              </ul>
            </section>

            {/* Data Storage and Security */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                3. Data Storage and Security
              </h2>
              <p className="mb-3">
                We implement industry-standard security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>SSL/TLS encryption for all data transmission</li>
                <li>Secure database storage with access controls</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal data by authorized personnel only</li>
                <li>Payment data is handled exclusively by PCI-compliant payment processors</li>
              </ul>
              <p className="mt-3 text-sm italic">
                While we strive to protect your information, no method of transmission over the Internet
                or electronic storage is 100% secure. We cannot guarantee absolute security.
              </p>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                4. Third-Party Services
              </h2>
              <p className="mb-3">We use the following third-party services:</p>

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-800">Razorpay (Payment Gateway)</h3>
                  <p className="text-sm">
                    For secure payment processing. View Razorpay's Privacy Policy at{' '}
                    <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer"
                       className="text-temple-maroon hover:underline">
                      razorpay.com/privacy
                    </a>
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">Email Service Provider</h3>
                  <p className="text-sm">
                    For sending receipts and booking confirmations via email
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">WhatsApp Business API</h3>
                  <p className="text-sm">
                    For sending receipts and booking confirmations via WhatsApp
                  </p>
                </div>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                5. Data Retention
              </h2>
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes
                outlined in this Privacy Policy, comply with legal obligations, resolve disputes, and
                enforce our agreements. Donation and booking records are maintained for a minimum of
                7 years as per Indian accounting and tax regulations.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                6. Your Rights
              </h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of your personal data we hold</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Deletion:</strong> Request deletion of your data (subject to legal obligations)</li>
                <li><strong>Objection:</strong> Object to processing of your personal data</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
              </ul>
              <p className="mt-3">
                To exercise these rights, please contact us at the details provided below.
              </p>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                7. Cookies and Tracking
              </h2>
              <p>
                Our website uses essential cookies to ensure proper functionality. We do not use
                third-party advertising or tracking cookies. Session cookies are used to maintain
                your session during booking and donation processes.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                8. Children's Privacy
              </h2>
              <p>
                Our services are not directed to individuals under 18 years of age. We do not
                knowingly collect personal information from children. If you are a parent or guardian
                and believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                9. Changes to This Privacy Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes
                by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                Continued use of our services after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Contact Information */}
            <section className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                10. {t.contactUsPolicies}
              </h2>
              <p className="mb-4">
                If you have questions about this Privacy Policy or wish to exercise your rights,
                please contact us:
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

            {/* Governing Law */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                11. Governing Law
              </h2>
              <p>
                This Privacy Policy is governed by the laws of India. Any disputes arising from this
                policy shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
