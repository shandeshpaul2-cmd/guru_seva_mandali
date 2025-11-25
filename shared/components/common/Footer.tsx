import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm text-gray-600">
          <span className="text-gray-800 font-medium">
            {process.env.TEMPLE_NAME || 'Shri Raghavendra Swamy Brundavana Sannidhi'}
          </span>
          <span className="hidden sm:inline text-gray-400">|</span>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/terms-conditions"
              className="hover:text-orange-600 transition-colors underline"
            >
              Terms & Conditions
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              href="/privacy-policy"
              className="hover:text-orange-600 transition-colors underline"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              href="/refund-policy"
              className="hover:text-orange-600 transition-colors underline"
            >
              Refund & Cancellation
            </Link>
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 mt-4">
          © {new Date().getFullYear()} All rights reserved
        </div>
      </div>
    </footer>
  );
}
