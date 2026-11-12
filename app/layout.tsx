import type { Metadata } from 'next';
import { JetBrains_Mono, Space_Mono } from 'next/font/google';
import './globals.css';

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GENERATICS CTF // NEXUS OF INNOVATION',
  description: 'Platform Mini CTF Real-time Generatics TDI HMIF - High-Stakes Survival Protocol',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`dark ${spaceMono.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-surface-container-lowest text-on-surface antialiased font-mono min-h-screen flex justify-center selection:bg-primary-container selection:text-surface-container-lowest">
        {children}
      </body>
    </html>
  );
}
