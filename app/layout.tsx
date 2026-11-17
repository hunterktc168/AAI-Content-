import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Verbatim — Universal Content Transformation Engine',
  description:
    'Universal content transformation engine for restructuring text across style, tone, audience, and depth with strict factual fidelity.',
  openGraph: {
    title: 'Verbatim — Universal Content Transformation Engine',
    description:
      'Universal content transformation engine for restructuring text across style, tone, audience, and depth with strict factual fidelity.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Verbatim — Universal Content Transformation Engine',
    description:
      'Universal content transformation engine for restructuring text across style, tone, audience, and depth with strict factual fidelity.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#080B11] font-sans text-[#F1F5F9] antialiased selection:bg-cyan-500/20 selection:text-cyan-200"
      >
        {children}
      </body>
    </html>
  );
}
