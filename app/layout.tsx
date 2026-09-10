import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { Header } from '@/components/public/Header';

export const metadata: Metadata = {
  title: 'Gading Utama | Marketing Communication Portfolio & Creative Systems',
  description: "Gading's portfolio in marketing communication, graphic design, Meta Ads, creative systems, and web development.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Gading Utama | Portfolio',
    description: 'Marketing Communication, Graphic Design, Meta Ads & Web Development.',
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
    <html lang="en" suppressHydrationWarning>
      <head>
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
      <body>
        <ThemeProvider>
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>

          <Header />

          <div className="ambient-layer" aria-hidden="true">
            <div className="ambient-orb ambient-orb--amber" />
            <div className="ambient-orb ambient-orb--teal" />
          </div>

          <main id="main-content">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
