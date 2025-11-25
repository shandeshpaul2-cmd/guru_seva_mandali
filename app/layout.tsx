import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/shared/components/providers/Providers'
import Footer from '@/shared/components/common/Footer'

export const metadata: Metadata = {
  title: 'Sri Raghavendra Brindavana Sannidhi',
  description: 'Sri Raghavendra Brindavana Sannidhi - Donations & Pooja Bookings',
  keywords: ['temple', 'donation', 'pooja', 'booking', 'sri raghavendra', 'brindavana sannidhi'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Google API for Sign-In */}
        <script src="https://apis.google.com/js/platform.js" async defer></script>
      </head>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
