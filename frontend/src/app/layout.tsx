import '../globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'MeoGli - AI Video Generator',
  description: 'Generate professional videos with AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-darkBg via-slate-900 to-darkBg">
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
