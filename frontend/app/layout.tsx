import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FitTracker - Your Personal Fitness Journey',
  description: 'Track your workouts, nutrition, and fitness goals with our comprehensive fitness tracker app.',
  keywords: 'fitness, tracker, health, workout, nutrition, goals',
  authors: [{ name: 'FitTracker Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0ea5e9',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'FitTracker - Your Personal Fitness Journey',
    description: 'Track your workouts, nutrition, and fitness goals with our comprehensive fitness tracker app.',
    type: 'website',
    url: 'https://fittracker.com',
    images: [
      {
        url: '/og-image.png',
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
    images: ['/twitter-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
