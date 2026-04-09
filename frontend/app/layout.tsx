import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'MeoGli - AI Video Generator',
  description: 'Generate stunning AI-powered videos with MeoGli',
  robots: 'index, follow',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Root Layout Component
 *
 * Provides the base HTML structure for the entire application.
 * - suppressHydrationWarning: Prevents hydration mismatch errors
 *   caused by browser extensions (e.g. Chrome injecting attributes)
 * - Metadata: Configured for SEO best practices
 * - Viewport: Moved to separate export (Next.js 15 best practice)
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
