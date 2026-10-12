import type { Metadata } from 'next';
import './globals.css';
import '../public/assets/css/showcase.css';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'R. Gading Utama · Creative Marketer & Problem Solver',
  description: 'Campaign, visual, dan web-app oleh R. Gading Utama. Creative Marketing · Design · Digital Solutions.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'R. Gading Utama · Digital Portfolio',
    description: 'Creative Marketing · Design · Digital Solutions. Think. Create. Build. Improve.',
    type: 'website',
    url: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
      </head>
      <body className="relative bg-[#060706] text-[#f3f0e8] font-sans antialiased selection:bg-[#f3f0e8] selection:text-[#060706]">
        <ThemeProvider>
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>

          <div id="main-content">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
