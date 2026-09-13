import React from 'react';
import Link from 'next/link';

export function AuraFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="footer-section relative px-5 py-14 sm:py-20 md:px-8 lg:px-12 overflow-hidden border-t border-[#f3f0e8]/10 bg-[#060706]">
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        {/* Floating Glass Card (Image 4 Design with Aura DNA) */}
        <div className="footer-card relative overflow-hidden rounded-[32px] sm:rounded-[40px] border border-[#f3f0e8]/10 bg-[#0c0e0c]/90 p-8 sm:p-12 lg:p-14 backdrop-blur-2xl shadow-2xl">
          {/* Subtle ambient glow inside card */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#ff5a1f]/10 blur-3xl" />

          {/* 3-Column Grid matching Image 4 */}
          <div className="relative z-10 grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8 lg:gap-12 items-start">
            {/* Col 1: Brand, Tagline & CTA (Image 4 Left) */}
            <div className="md:col-span-5 flex flex-col justify-between">
              <div>
                {/* Brand Badge / Logo */}
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff5a1f] to-[#e0450b] text-white font-black text-lg shadow-lg shadow-[#ff5a1f]/25">
                    G
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold tracking-[-0.03em] text-[#f3f0e8]">R. Gading Utama</h3>
                    <p className="text-[11px] font-semibold text-[#f3f0e8]/45">Creative Marketing · Tech · AI</p>
                  </div>
                </div>

                {/* Tagline */}
                <h4 className="mt-6 text-2xl sm:text-3xl lg:text-[32px] font-black leading-[1.15] tracking-[-0.05em] text-[#f3f0e8]">
                  Imaginative minds for high-growth brands.
                </h4>
                <p className="mt-3 text-xs sm:text-sm font-medium leading-[1.7] text-[#f3f0e8]/65 max-w-md">
                  Turning operational bottlenecks into custom software tools, high-converting Meta Ads, and creative campaigns.
                </p>
              </div>

              {/* CTA: Contact ME */}
              <div className="mt-8 pt-6 border-t border-[#f3f0e8]/10 flex flex-wrap items-center gap-3">
                <Link
                  href="/#contact"
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#ff5a1f] px-6 py-3.5 text-xs sm:text-sm font-black uppercase tracking-[0.08em] text-white shadow-lg shadow-[#ff5a1f]/25 hover:bg-[#ff733f] hover:shadow-[#ff5a1f]/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
                >
                  <span>Contact ME</span>
                  <span className="text-sm font-bold">→</span>
                </Link>
                <a
                  href="mailto:contact@gadingutama.com"
                  className="inline-flex items-center gap-2 rounded-full border border-[#f3f0e8]/15 bg-white/[0.04] px-5 py-3.5 text-xs sm:text-sm font-semibold text-[#f3f0e8]/80 hover:border-[#f3f0e8]/30 hover:bg-white/[0.08] hover:text-[#f3f0e8] transition-all duration-200"
                >
                  <span>contact@gadingutama.com</span>
                  <span className="text-xs text-[#ff5a1f]">↗</span>
                </a>
              </div>
            </div>

            {/* Col 2: Navigation Columns (Image 4 Middle) */}
            <div className="md:col-span-5 md:border-l md:border-[#f3f0e8]/10 md:pl-8 lg:pl-10 grid grid-cols-2 gap-6 sm:gap-8">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff5a1f] mb-4">
                  Explore +
                </p>
                <ul className="space-y-3 text-sm font-medium text-[#f3f0e8]/70">
                  <li><Link href="/#work" className="hover:text-[#ff5a1f] transition duration-150">Featured Works</Link></li>
                  <li><Link href="/work/internal-listing-hub" className="hover:text-[#ff5a1f] transition duration-150">Listing Hub</Link></li>
                  <li><Link href="/#experience" className="hover:text-[#ff5a1f] transition duration-150">Experience</Link></li>
                  <li><Link href="/#pricing" className="hover:text-[#ff5a1f] transition duration-150">Capabilities</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f3f0e8]/45 mb-4">
                  Navigation
                </p>
                <ul className="space-y-3 text-sm font-medium text-[#f3f0e8]/70">
                  <li><Link href="/#studio" className="hover:text-[#ff5a1f] transition duration-150">About Me</Link></li>
                  <li><Link href="/#testimonials" className="hover:text-[#ff5a1f] transition duration-150">Reviews</Link></li>
                  <li><Link href="/#contact" className="hover:text-[#ff5a1f] transition duration-150">Contact</Link></li>
                  <li><Link href="/#home" className="hover:text-[#ff5a1f] transition duration-150">Back to Top ↑</Link></li>
                </ul>
              </div>
            </div>

            {/* Col 3: Circular Social Buttons (Image 4 Right) */}
            <div className="md:col-span-2 md:border-l md:border-[#f3f0e8]/10 md:pl-6 lg:pl-8 flex flex-row md:flex-col items-center md:items-center justify-start gap-4">
              <p className="hidden md:block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f3f0e8]/45 mb-2 text-center w-full">
                Connect
              </p>
              
              {/* Dribbble */}
              <a
                href="https://dribbble.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Dribbble"
                title="Dribbble"
                className="group flex h-12 w-12 items-center justify-center rounded-full border border-[#f3f0e8]/15 bg-white/[0.04] text-[#f3f0e8]/75 hover:bg-[#ea4c89] hover:border-[#ea4c89] hover:text-white hover:scale-110 active:scale-95 transition-all duration-300 shadow-sm"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 0 1 1.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 0 0-.565-1.238c3.14-1.274 4.542-3.14 4.762-3.36zm-6.444-2.454c2.25 0 4.305.86 5.856 2.27-.196.206-1.5 1.967-4.52 3.194-1.39-2.553-2.91-4.781-3.23-5.244.606-.142 1.24-.22 1.894-.22zm-3.953 1.258c.28.406 1.77 2.613 3.17 5.127-3.98 1.09-7.51.98-7.94.97a8.528 8.528 0 0 1 4.77-6.097zm-4.747 8.046c.39.01 3.25.07 6.94-.85.34.87.65 1.76.92 2.64-3.79 2.05-5.32 5.09-5.46 5.38a8.507 8.507 0 0 1-2.4-7.17zm8.47 8.44c.14-.26 1.48-2.96 5.07-4.88 1.01 2.64 1.45 5.01 1.55 5.59a8.497 8.497 0 0 1-6.62-.71zm8.26-2.02c-.11-.47-.52-2.61-1.45-5.1 2.63-.39 4.95.27 5.25.36a8.517 8.517 0 0 1-3.8 4.74z" clipRule="evenodd" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
                className="group flex h-12 w-12 items-center justify-center rounded-full border border-[#f3f0e8]/15 bg-white/[0.04] text-[#f3f0e8]/75 hover:bg-[#0077b5] hover:border-[#0077b5] hover:text-white hover:scale-110 active:scale-95 transition-all duration-300 shadow-sm"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                title="Instagram"
                className="group flex h-12 w-12 items-center justify-center rounded-full border border-[#f3f0e8]/15 bg-white/[0.04] text-[#f3f0e8]/75 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:border-transparent hover:text-white hover:scale-110 active:scale-95 transition-all duration-300 shadow-sm"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Bottom bar inside card */}
          <div className="mt-10 pt-6 border-t border-[#f3f0e8]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#f3f0e8]/40">
            <p>© {currentYear} R. Gading Utama. All rights reserved.</p>
            <p>Surabaya / Remote · Designed with Aura DNA</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
