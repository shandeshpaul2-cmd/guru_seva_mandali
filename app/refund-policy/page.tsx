import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Refund & Cancellation Policy | Shri Raghavendra Swamy Brundavana Sannidhi',
  description: 'Refund & Cancellation Policy for Shri Raghavendra Swamy Brundavana Sannidhi',
}

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-temple-cream via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-temple-maroon hover:text-temple-gold transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Home</span>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-temple-gold/20 overflow-hidden">
          <div className="bg-gradient-to-r from-temple-maroon to-orange-900 text-white px-6 py-8 sm:px-8">
            <h1 className="font-cinzel text-3xl sm:text-4xl font-bold mb-2">
              Refund & Cancellation Policy
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
                At Shri Raghavendra Swamy Brundavana Sannidhi, we value your trust and devotion. This
                Refund & Cancellation Policy outlines the terms and conditions for cancellations and
                refunds for donations, pooja bookings, and astrology consultations made through our platform.
              </p>
            </section>

            {/* Important Notice */}
            <section className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
              <h3 className="font-semibold text-orange-900 mb-2">Important Notice</h3>
              <p className="text-gray-700">
                Due to the religious and spiritual nature of our services, and the preparation involved
                in performing poojas and ceremonies, we have specific cancellation policies. Please read
                this policy carefully before making a donation or booking.
              </p>
            </section>

            {/* Donations Policy */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                1. Donations Policy
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">1.1 General Donations</h3>
                  <p className="mb-2">
                    All donations made to Shri Raghavendra Swamy Brundavana Sannidhi are considered
                    voluntary contributions for religious and charitable purposes.
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded p-3 mt-2">
                    <p className="font-semibold text-red-900">
                      ❌ Donations are NON-REFUNDABLE
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      As per Hindu religious traditions and Indian charitable practices, donations
                      once made to a temple are considered sacred offerings (dakshina) and cannot be returned.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">1.2 Special Purpose Donations</h3>
                  <p>
                    Donations made for specific purposes (Annadana, Vidyadana, Building Fund, etc.) will
                    be used exclusively for those purposes. These donations are also non-refundable.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">1.3 Exception - Technical Errors</h3>
                  <p>
                    If you are charged multiple times due to a technical error, or if the charged amount
                    is different from what you intended to donate, please contact us immediately. We will
                    investigate and process a refund for the erroneous amount within 7-10 business days.
                  </p>
                </div>
              </div>
            </section>

            {/* Pooja Bookings Policy */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                2. Pooja Bookings Policy
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">2.1 Cancellation Window</h3>

                  <div className="space-y-3 mt-3">
                    <div className="border-l-4 border-green-500 bg-green-50 p-3 rounded">
                      <p className="font-semibold text-green-900">
                        ✓ Cancellation 48+ hours before pooja: 90% refund
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        If you cancel at least 48 hours before the scheduled pooja time, you will receive
                        a 90% refund. 10% is retained to cover administrative and payment processing costs.
                      </p>
                    </div>

                    <div className="border-l-4 border-yellow-500 bg-yellow-50 p-3 rounded">
                      <p className="font-semibold text-yellow-900">
                        ⚠ Cancellation 24-48 hours before pooja: 50% refund
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        If you cancel between 24-48 hours before the scheduled pooja, you will receive
                        a 50% refund. Materials and preparations may have already begun.
                      </p>
                    </div>

                    <div className="border-l-4 border-red-500 bg-red-50 p-3 rounded">
                      <p className="font-semibold text-red-900">
                        ❌ Cancellation less than 24 hours: No refund
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        If you cancel less than 24 hours before the scheduled pooja, no refund will be
                        provided as materials have been purchased and priests have been scheduled.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">2.2 Rescheduling</h3>
                  <p className="mb-2">
                    Instead of cancellation, you may reschedule your pooja booking:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Rescheduling is allowed up to 24 hours before the original booking</li>
                    <li>You can reschedule once without any charges</li>
                    <li>The new date must be within 90 days of the original booking</li>
                    <li>Contact us as soon as possible to arrange rescheduling</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">2.3 Parihara Poojas</h3>
                  <p>
                    Parihara poojas (remedial rituals) require special materials and extensive preparation.
                    For parihara poojas:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Cancellation must be made at least 72 hours in advance for a 70% refund</li>
                    <li>Cancellation between 48-72 hours: 40% refund</li>
                    <li>Cancellation less than 48 hours: No refund</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">2.4 Temple-Initiated Cancellations</h3>
                  <p className="mb-2">
                    In rare cases, the temple may need to cancel or reschedule a pooja due to:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Unavailability of priests due to emergency</li>
                    <li>Temple closure due to unforeseen circumstances</li>
                    <li>Natural calamities or government orders</li>
                  </ul>
                  <p className="mt-2">
                    In such cases, you will receive a <strong>100% refund</strong> or the option to
                    reschedule to a mutually convenient date at no additional cost.
                  </p>
                </div>
              </div>
            </section>

            {/* Astrology Consultations */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                3. Astrology Consultations
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">3.1 Cancellation Before Scheduling</h3>
                  <p>
                    If you cancel before the consultation has been scheduled (i.e., before the temple
                    contacts you to set up the appointment), you will receive a 90% refund.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">3.2 Cancellation After Scheduling</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>24+ hours before appointment:</strong> 75% refund or free rescheduling</li>
                    <li><strong>12-24 hours before:</strong> 50% refund</li>
                    <li><strong>Less than 12 hours:</strong> No refund</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">3.3 Missed Appointments</h3>
                  <p>
                    If you miss your scheduled consultation without prior notice, no refund will be
                    provided. Please inform us at least 12 hours in advance if you cannot attend.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">3.4 Rescheduling</h3>
                  <p>
                    You may reschedule your consultation once without additional charges if you notify
                    us at least 24 hours before the scheduled time.
                  </p>
                </div>
              </div>
            </section>

            {/* Refund Process */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                4. Refund Process
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">4.1 How to Request a Refund</h3>
                  <p className="mb-2">To request a refund or cancellation:</p>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Contact us via phone or email with your booking details</li>
                    <li>Provide your receipt number and transaction details</li>
                    <li>State the reason for cancellation</li>
                    <li>Our team will process your request within 24 hours</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">4.2 Refund Timeline</h3>
                  <p className="mb-2">Once your refund is approved:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Refund will be initiated within 3-5 business days</li>
                    <li>Credit to your original payment method within 7-10 business days</li>
                    <li>Bank processing times may vary (additional 2-5 days)</li>
                    <li>You will receive a confirmation email once the refund is processed</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">4.3 Refund Method</h3>
                  <p>
                    Refunds will be credited to the same payment method used for the original transaction
                    (credit card, debit card, UPI, etc.). We do not provide cash refunds.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">4.4 Platform Fee</h3>
                  <p>
                    The 2% platform fee (payment gateway charges) is non-refundable in all cases except
                    temple-initiated cancellations or technical errors on our end.
                  </p>
                </div>
              </div>
            </section>

            {/* Failed Transactions */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                5. Failed or Duplicate Transactions
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">5.1 Payment Failed</h3>
                  <p>
                    If your payment fails but money was deducted from your account, it will be automatically
                    refunded by your bank within 5-7 business days. No action is required from your side.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">5.2 Duplicate Charges</h3>
                  <p>
                    If you were accidentally charged multiple times for the same transaction, please contact
                    us immediately with transaction details. We will refund the duplicate charges in full
                    within 3-5 business days.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">5.3 Incorrect Amount</h3>
                  <p>
                    If you were charged an amount different from what was displayed at checkout, please
                    contact us with your receipt. We will investigate and refund the difference if an
                    error occurred on our end.
                  </p>
                </div>
              </div>
            </section>

            {/* Special Circumstances */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                6. Special Circumstances
              </h2>

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-800">6.1 Medical Emergencies</h3>
                  <p>
                    In case of genuine medical emergencies preventing you from attending or continuing
                    with a booked service, please contact us with supporting documentation. We will
                    review on a case-by-case basis and may offer a full refund or rescheduling.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">6.2 Death in Family</h3>
                  <p>
                    In the unfortunate event of a death in your immediate family, please inform us with
                    appropriate documentation. We will provide a full refund or reschedule the service
                    without any charges.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">6.3 Force Majeure</h3>
                  <p>
                    In case of force majeure events (natural disasters, pandemics, government restrictions,
                    riots, etc.) that prevent either party from fulfilling the service, both parties will
                    work together to reschedule or issue appropriate refunds.
                  </p>
                </div>
              </div>
            </section>

            {/* Modification of Bookings */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                7. Modification of Booking Details
              </h2>

              <div className="space-y-3">
                <p>
                  Minor modifications to your booking (name spelling corrections, phone number updates,
                  gotra corrections) can be made free of charge by contacting us at least 24 hours before
                  the scheduled service.
                </p>
                <p>
                  Major modifications (changing pooja type, date, adding significant services) may be
                  treated as a new booking and subject to availability and pricing at the time of modification.
                </p>
              </div>
            </section>

            {/* No-Show Policy */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                8. No-Show Policy
              </h2>
              <p>
                If you fail to attend a scheduled consultation or do not respond to the temple's attempts
                to contact you for scheduling within 30 days of booking, the booking will be considered
                a "no-show" and no refund will be provided.
              </p>
            </section>

            {/* Disputes */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                9. Disputes and Complaints
              </h2>
              <p className="mb-3">
                If you are dissatisfied with our services or have a dispute regarding refunds:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Contact us directly via phone or email to discuss the issue</li>
                <li>We will respond within 48 hours and work towards a resolution</li>
                <li>Most issues can be resolved through direct communication</li>
                <li>If the issue cannot be resolved, you may escalate through legal channels as per
                    Indian law and our Terms & Conditions</li>
              </ol>
            </section>

            {/* Important Reminders */}
            <section className="bg-temple-cream/30 border-l-4 border-temple-maroon p-4 rounded">
              <h3 className="font-semibold text-temple-maroon mb-3">Important Reminders</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Always keep your booking confirmation and receipt for reference</li>
                <li>• Contact us as early as possible if you need to cancel or reschedule</li>
                <li>• Cancellation timings are calculated from the scheduled pooja/consultation time, not booking time</li>
                <li>• Refunds are processed only to the original payment method</li>
                <li>• The temple reserves the right to assess refund requests on a case-by-case basis for exceptional circumstances</li>
              </ul>
            </section>

            {/* Contact Information */}
            <section className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                10. Contact Us for Cancellations & Refunds
              </h2>
              <p className="mb-4">
                For cancellations, refunds, or rescheduling requests, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Shri Raghavendra Swamy Brundavana Sannidhi</strong></p>
                <p>9/2, Damodar Modaliar Road, Ulsoor</p>
                <p>Bangalore - 560008, Karnataka, India</p>
                <p>
                  <strong>Phone (Available 9 AM - 7 PM):</strong><br />
                  +91 99455 94845 / +91 99025 20105
                </p>
                <p>
                  <strong>Email (Response within 24 hours):</strong><br />
                  <a href="mailto:harishkumar@gurusevamandali.com"
                     className="text-temple-maroon hover:underline">
                    harishkumar@gurusevamandali.com
                  </a>
                </p>
                <p className="text-sm italic text-gray-600 mt-3">
                  Please have your receipt number and booking details ready when contacting us
                </p>
              </div>
            </section>

            {/* Policy Updates */}
            <section>
              <h2 className="font-cinzel text-2xl font-semibold text-temple-maroon mb-3">
                11. Policy Updates
              </h2>
              <p>
                This policy may be updated from time to time. Changes will be posted on this page with
                an updated "Last Updated" date. The policy applicable at the time of your booking will
                govern your transaction.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
