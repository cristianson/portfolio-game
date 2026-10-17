/**
 * Static Portfolio
 *
 * The whole portfolio as plain, server-rendered HTML, built from the same
 * section pages the game opens. It is always in the page so search engines
 * and link previews can read it; it stays visually hidden while the 3D game
 * runs and becomes the page when WebGL is missing, the game crashes, or
 * JavaScript is off (see game-loader.tsx and city.css).
 */

"use client";

import React from "react";
import { JOBS, SOCIALS } from "./content";
import { SECTION_SUBTITLE, SectionPage } from "./sections";
import { ZONES } from "./world";

const SITE_URL = "https://cristianiordan.design";

// Structured data so search engines know whose portfolio this is
const PERSON_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Cristian Iordan",
  jobTitle: "Product Designer",
  url: SITE_URL,
  image: `${SITE_URL}/avatar-560.webp`,
  worksFor: { "@type": "Organization", name: JOBS[0].company, url: JOBS[0].url },
  sameAs: SOCIALS.map((s) => s.url),
};

export function StaticPortfolio() {
  return (
    <div id="static-portfolio" className="static-portfolio bg-[#111111] text-[#ece7dd] font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_JSON_LD) }} />
      <div className="max-w-4xl mx-auto px-5 md:px-10 pt-[max(40px,env(safe-area-inset-top))] pb-16">
        <header className="pb-10 border-b border-white/10">
          <p className="font-gta text-[14px] tracking-[0.3em] text-[#8f8a80]">WELCOME TO DESIGN DISTRICT</p>
          <h1 className="mt-2 font-gta gta-stroke-lg text-white uppercase leading-[0.85] text-[64px] md:text-[112px]">
            Cristian Iordan
          </h1>
          <p className="inline-block mt-4 bg-[#ff4fa3] border-[3px] border-black px-3 py-1 font-gta text-[20px] md:text-[26px] text-black">
            PRODUCT DESIGNER
          </p>
          <p className="fallback-only mt-6 max-w-xl text-[15px] leading-relaxed text-[#a8a297]">
            You're seeing the text version of my portfolio. The 3D street needs WebGL, which isn't available in this
            browser right now.
          </p>
          <nav aria-label="Sections" className="mt-8 flex flex-wrap gap-2">
            {ZONES.map((z) => (
              <a
                key={z.id}
                href={`#${z.id.toLowerCase()}`}
                className="font-gta text-[16px] tracking-[0.08em] uppercase px-3 py-1.5 border border-white/15 hover:text-black transition-colors hover:bg-[var(--accent)]"
                style={{ ["--accent" as string]: z.color }}
              >
                {z.label}
              </a>
            ))}
          </nav>
        </header>

        {ZONES.map((z) => (
          <section key={z.id} id={z.id.toLowerCase()} aria-labelledby={`${z.id}-title`} className="pt-14 scroll-mt-4">
            <h2
              id={`${z.id}-title`}
              className="font-gta gta-stroke-lg uppercase text-[44px] md:text-[64px] leading-[0.9]"
              style={{ color: z.color }}
            >
              {z.label}
            </h2>
            <div className="mt-3 mb-8 flex items-center gap-3">
              <span className="h-1 w-12" style={{ background: z.color }} />
              <span className="text-[15px] text-[#a8a297]">{SECTION_SUBTITLE[z.id]}</span>
            </div>
            <SectionPage zone={z.id} accent={z.color} />
          </section>
        ))}

        <footer className="mt-16 pt-6 border-t border-white/10 font-gta tracking-[0.18em] text-[13px] text-white/40">
          CRISTIAN IORDAN · PRODUCT DESIGNER
        </footer>
      </div>
    </div>
  );
}
