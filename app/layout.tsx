import type { Metadata, Viewport } from 'next';
import { Syne, Plus_Jakarta_Sans, Space_Mono } from 'next/font/google';
import '@/styles/globals.css';

const syne = Syne({
  subsets: ['latin'],
  weight: ['500', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DRACONIS — The Ancient Dragon',
  description: 'A scroll-driven cinematic dragon evolution inspired by Junni and Ancient Dragon.',
  keywords: ['3D dragon', 'Three.js', 'React Three Fiber', 'GSAP ScrollTrigger', 'interactive web'],
  authors: [{ name: 'Ancient Dragon' }],
  openGraph: {
    title: 'DRACONIS — The Ancient Dragon',
    description: 'A scroll-driven cinematic dragon evolution inspired by Junni and Ancient Dragon.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${plusJakartaSans.variable} ${spaceMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
