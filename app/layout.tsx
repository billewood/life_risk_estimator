import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Life Risk Estimator - Educational Mortality Risk Assessment',
  description: 'Privacy-preserving educational tool for estimating life expectancy and mortality risk based on population data and published risk factors.',
  keywords: ['life expectancy', 'mortality risk', 'health assessment', 'educational tool', 'privacy'],
  authors: [{ name: 'Life Risk Estimator Team' }],
  robots: 'noindex, nofollow', // Prevent indexing for privacy
  openGraph: {
    title: 'Life Risk Estimator - Educational Tool',
    description: 'Educational mortality risk assessment tool with privacy protection',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-neutral-50">
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div>
                  <h1 className="text-xl font-semibold text-neutral-900">
                    Life Risk Estimator
                  </h1>
                  <p className="text-sm text-neutral-600">
                    Educational mortality risk assessment
                  </p>
                </div>
                <div className="text-xs text-neutral-500">
                  Privacy-first • Client-side computation
                </div>
              </div>
            </div>
          </header>
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          
          <footer className="bg-white border-t mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-4">
                    About This Tool
                  </h3>
                  <p className="text-xs text-neutral-600">
                    This educational tool estimates life expectancy and mortality risk 
                    based on population data and published risk factors. It is not 
                    medical advice and should not be used for medical decisions.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-4">
                    Privacy & Safety
                  </h3>
                  <ul className="text-xs text-neutral-600 space-y-1">
                    <li>• All calculations performed on your device</li>
                    <li>• No personal data transmitted or stored</li>
                    <li>• Educational use only</li>
                    <li>• Not for medical decisions</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-4">
                    Important Disclaimers
                  </h3>
                  <ul className="text-xs text-neutral-600 space-y-1">
                    <li>• Not a medical device or diagnosis</li>
                    <li>• Not for insurance underwriting</li>
                    <li>• Not for employment screening</li>
                    <li>• Consult healthcare providers for medical advice</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-neutral-200">
                <p className="text-xs text-neutral-500 text-center">
                  © 2025 Life Risk Estimator. Educational tool for mortality risk assessment. 
                  Not intended for medical, insurance, or employment purposes.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
