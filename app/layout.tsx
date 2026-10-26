import { siteURL } from '@/lib/site-url';
import type { Metadata } from 'next';
import './globals.css';
import '../public/assets/css/showcase.css';
import '../public/assets/css/visual-content.css';
import { ThemeProvider } from '@/context/ThemeContext';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'R. Gading Utama · Creative Marketer & Problem Solver',
  description: 'Campaign, visual, dan web-app oleh R. Gading Utama. Creative Marketing · Design · Digital Solutions.',
  metadataBase: new URL(siteURL()),
  openGraph: {
    title: 'R. Gading Utama · Digital Portfolio',
    description: 'Creative Marketing · Design · Digital Solutions. Think. Create. Build. Improve.',
    type: 'website',
    images: [{url:'/opengraph-image',width:1200,height:630,alt:'Gading Utama, Creative Marketing & Digital Solutions'}],
    url: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth" suppressHydrationWarning>
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
        <Script src="/assets/js/engagement.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
