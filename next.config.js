/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Security: Whitelist specific domains instead of allowing all ('**')
    // Add domains as needed for your CDN or image hosting
    remotePatterns: [
      // Example: Uncomment and add your specific image domains
      // {
      //   protocol: 'https',
      //   hostname: 'res.cloudinary.com',
      // },
      // {
      //   protocol: 'https',
      //   hostname: 'your-cdn-domain.com',
      // },
    ],
    // Allow images from the app itself
    domains: [],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Add security headers with permissions policy for Razorpay
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=*, microphone=*, geolocation=*, payment=*'
          },
        ],
      },
    ]
  },
  // Development origins for hot reload
  ...(process.env.NODE_ENV === 'development' && {
    allowedDevOrigins: [
      'http://106.51.129.224:3000',
      'http://192.168.0.149:3000',
      'http://localhost:3000',
      'http://localhost:8010',
    ],
  }),
}

module.exports = nextConfig
