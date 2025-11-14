import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'FitTracker - Your Personal Fitness Journey',
  description: 'Track your workouts, nutrition, and fitness goals with our comprehensive fitness tracker app.',
  keywords: 'fitness, tracker, health, workout, nutrition, goals',
  authors: [{ name: 'FitTracker Team' }],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'FitTracker - Your Personal Fitness Journey',
    description: 'Track your workouts, nutrition, and fitness goals with our comprehensive fitness tracker app.',
    type: 'website',
    url: 'https://fittracker.com',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'FitTracker App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FitTracker - Your Personal Fitness Journey',
    description: 'Track your workouts, nutrition, and fitness goals with our comprehensive fitness tracker app.',
    images: ['/twitter-image.svg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0ea5e9',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
