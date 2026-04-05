import type { Metadata } from 'next';
import { Syne, Instrument_Sans } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-instrument',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NexusAI | Find Your Perfect AI Model',
  description:
    'Discover, compare, and deploy 525+ AI models with guided discovery, custom agent builder, and real-time analytics. The ultimate AI model marketplace for builders.',
  keywords: 'AI models, ChatGPT, Claude, Gemini, model marketplace, AI agents, LLM',
  openGraph: {
    title: 'NexusAI | Find Your Perfect AI Model',
    description: 'Discover and deploy 525+ AI models with guided discovery and custom agent builder.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${instrumentSans.variable}`}
    >
      <body
        className="min-h-screen antialiased"
        style={{ fontFamily: 'var(--font-instrument, Instrument Sans, sans-serif)' }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
