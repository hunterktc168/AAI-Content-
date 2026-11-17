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
    <html lang="en">
      <body
        suppressHydrationWarning
        className="min-h-screen bg-zinc-50 font-sans text-zinc-900 antialiased selection:bg-blue-100 selection:text-blue-900"
      >
        {children}
      </body>
    </html>
  );
}
