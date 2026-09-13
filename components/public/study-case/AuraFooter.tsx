import React from 'react';
import Link from 'next/link';

export function AuraFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="footer-section relative overflow-hidden px-5 py-16 md:px-8 lg:px-12 border-t border-[#f3f0e8]/10 bg-[#060706]">
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        {/* Top / Wordmark */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-10 border-b border-[#f3f0e8]/10">
          <div className="section-label">R. Gading Utama · Digital Portfolio</div>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#f3f0e8]/45">
            Xavier Marks Tjandra Patos · {currentYear}
          </span>
        </div>

        <div className="overflow-hidden py-8 sm:py-12">
          <h2 className="text-[clamp(3.5rem,14vw,10rem)] font-black leading-none tracking-[-0.08em] text-[#f3f0e8] select-none">
            Gading.
          </h2>
        </div>

        {/* Links Grid */}
        <div className="grid gap-10 border-t border-[#f3f0e8]/10 pt-10 md:grid-cols-12">
          <div className="md:col-span-6 lg:col-span-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#ff5a1f]">
              Creative Marketer &amp; Digital Problem Solver / {currentYear}
            </p>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-[1.1] tracking-[-0.05em] text-[#f3f0e8]">
              Let us design, build, and solve the next challenge together.
            </h3>

            <div className="mt-8 grid max-w-lg grid-cols-2 border-y border-[#f3f0e8]/10 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f3f0e8]/40">
                  Name
                </p>
                <p className="mt-2 text-sm font-semibold text-[#f3f0e8]/85">
                  R. Gading Utama
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f3f0e8]/40">
                  Focus
                </p>
                <p className="mt-2 text-sm font-semibold text-[#f3f0e8]/85">
                  Creative Marketing · Tech · AI
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-6 lg:col-span-4 lg:col-start-7">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f3f0e8]/45">
              About This Practice
            </p>
            <p className="mt-4 text-sm font-medium leading-[1.75] text-[#f3f0e8]/65">
              I help companies, agents, and teams turn operational bottlenecks into working tools, high-converting Meta Ads, and structured marketing campaigns.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/#contact"
                className="group flex items-center justify-between border-b border-[#f3f0e8]/10 pb-3 text-sm font-bold text-[#f3f0e8] hover:border-[#ff5a1f] hover:text-[#ff5a1f] transition"
              >
                <span>Start a project</span>
                <span className="text-[#ff5a1f] group-hover:translate-x-1 transition duration-300">→</span>
              </Link>
              <a
                href="mailto:contact@gadingutama.com"
                className="group flex items-center justify-between border-b border-[#f3f0e8]/10 pb-3 text-sm font-bold text-[#f3f0e8]/65 hover:border-[#f3f0e8]/40 hover:text-[#f3f0e8] transition"
              >
                <span>contact@gadingutama.com</span>
                <span className="text-[#ff5a1f] group-hover:translate-x-1 transition duration-300">↗</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 md:col-span-12 lg:col-span-2 lg:col-start-11">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f3f0e8]/45">
                Social
              </p>
              <div className="mt-4 space-y-2.5 text-sm font-bold text-[#f3f0e8]/75">
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="block hover:text-[#ff5a1f] transition">
                  LinkedIn ↗
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="block hover:text-[#ff5a1f] transition">
                  Instagram ↗
                </a>
                <a href="https://wa.me/628123456789" target="_blank" rel="noreferrer" className="block hover:text-[#ff5a1f] transition">
                  WhatsApp ↗
                </a>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f3f0e8]/45">
                Index
              </p>
              <div className="mt-4 space-y-2.5 text-sm font-bold text-[#f3f0e8]/75">
                <Link href="/#work" className="block hover:text-[#ff5a1f] transition">
                  Works
                </Link>
                <Link href="/#web-apps" className="block hover:text-[#ff5a1f] transition">
                  Apps
                </Link>
                <Link href="/#studio" className="block hover:text-[#ff5a1f] transition">
                  About
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#f3f0e8]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#f3f0e8]/40">
          <p>© {currentYear} R. Gading Utama. All rights reserved.</p>
          <p>Designed with Aura DNA · Crafted without slop.</p>
        </div>
      </div>
    </footer>
  );
}
