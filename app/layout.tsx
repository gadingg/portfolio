import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'R. Gading Utama · Creative Marketer & Digital Problem Solver',
  description: "Portfolio of R. Gading Utama. Creative Marketer and Digital Problem Solver bridging marketing, design, technology, and AI to build practical business solutions.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'R. Gading Utama · Digital Portfolio',
    description: 'Creative Marketing, Graphic Design, Meta Ads & Web Development.',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('theme');
                const theme = saved || 'dark';
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="relative bg-[#060706] text-[#f3f0e8] antialiased selection:bg-[#f3f0e8] selection:text-[#060706]">
        {/* Load Tailwind CDN before interactive */}
        <Script
          src="https://cdn.tailwindcss.com"
          strategy="beforeInteractive"
        />
        <Script
          id="tailwind-config"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      bg: '#060706',
                      panel: '#10110f',
                      'panel-2': '#151713',
                      cream: '#f3f0e8',
                      orange: '#ff5a1f',
                    },
                    fontFamily: {
                      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                    },
                  },
                },
              };
            `,
          }}
        />

        <ThemeProvider>
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>

          <div className="noise" aria-hidden="true" />
          <div className="grid-veil" aria-hidden="true" />
          <div className="page-rail" aria-hidden="true">Creative Marketing · Tech · AI</div>

          <main id="main-content">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
