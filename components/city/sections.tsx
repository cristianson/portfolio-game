/**
 * Section Pages
 *
 * What opens when you step into a marker: one page per section, laid out for
 * the dark GTA-style panel. Copy and links come from content.ts.
 */

"use client";

import React from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import {
  ABOUT_PARAGRAPHS,
  CASE_STUDIES,
  JOBS,
  PROJECTS,
  SOCIALS,
  SOCIALS_INTRO,
} from "./content";
import { SOCIAL_ICON } from "./icons";
import type { ZoneId } from "./world";

const pad2 = (n: number) => String(n).padStart(2, "0");

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`font-gta text-[13px] tracking-[0.22em] uppercase text-[#8f8a80] ${className}`}>{children}</div>;
}

function Cta({ href, accent, children }: { href: string; accent: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2 px-4 py-2.5 font-gta text-[17px] tracking-[0.06em] uppercase text-black border-2 border-black shadow-[3px_3px_0_#000] hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_#000] transition-all"
      style={{ background: accent }}
    >
      {children}
      <ArrowUpRight size={18} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}

// ── About ───────────────────────────────────────────────────────────────────

function About({ accent }: { accent: string }) {
  const acquisitions = JOBS.filter((j) => /acquired/i.test(j.company)).length;
  const stats = [
    { value: "5+", label: "Years designing" },
    { value: String(JOBS.length), label: "Product teams" },
    { value: String(acquisitions), label: "Acquisitions" },
  ];
  return (
    <div className="space-y-12">
      <div className="grid gap-8 md:grid-cols-[240px_1fr] items-start">
        <figure className="relative w-[220px] md:w-full -rotate-2">
          <div className="absolute inset-0 translate-x-2 translate-y-2" style={{ background: accent }} />
          <div className="relative border-[3px] border-black bg-[#e9e4d8] p-2">
            {/* Pre-sized file served straight from the CDN (preloaded in app/(city)/layout.tsx) */}
            <Image
              src="/avatar-560.webp"
              alt="Cristian Iordan"
              width={560}
              height={560}
              unoptimized
              priority
              className="w-full aspect-square object-cover bg-[#cbbf9a]"
            />
            <figcaption className="pt-2 pb-1 text-center font-gta text-[20px] tracking-wide text-black">CRISTIAN IORDAN</figcaption>
          </div>
        </figure>
        <div className="space-y-5">
          {ABOUT_PARAGRAPHS.map((text) => (
            <p key={text} className="text-[18px] md:text-[20px] leading-relaxed text-[#ece7dd]">
              {text}
            </p>
          ))}
          <div className="grid grid-cols-3 gap-2 pt-3">
            {stats.map((s) => (
              <div key={s.label} className="bg-[#1b1b1b] border border-white/10 px-3 py-3">
                <div className="font-gta text-[34px] md:text-[42px] leading-none" style={{ color: accent }}>
                  {s.value}
                </div>
                <div className="mt-1 text-[12px] md:text-[13px] text-[#a8a297] leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section>
        <Label className="mb-4">Career</Label>
        <ol className="border-l-2 border-white/10">
          {JOBS.map((job) => (
            <li key={job.company} className="relative pl-6 pb-8 last:pb-0">
              <span
                className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full border-2 border-[#111]"
                style={{ background: job.isCurrent ? accent : "#5a5650" }}
              />
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-mono text-[13px] text-[#a8a297]">{job.period}</span>
                {job.isCurrent && (
                  <span className="font-gta text-[12px] tracking-[0.15em] px-1.5 text-black" style={{ background: accent }}>
                    NOW
                  </span>
                )}
              </div>
              <h4 className="mt-1 text-[20px] md:text-[22px] font-bold text-white leading-snug">{job.title}</h4>
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[16px] font-semibold hover:underline"
                style={{ color: accent }}
              >
                {job.company}
                <ArrowUpRight size={15} />
              </a>
              <p className="mt-2 text-[15px] md:text-[16px] leading-relaxed text-[#bdb7ab] max-w-2xl">{job.description}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

// ── Case studies ────────────────────────────────────────────────────────────

function CaseStudies({ accent }: { accent: string }) {
  return (
    <div className="space-y-6">
      {CASE_STUDIES.map((study, i) => (
        <article key={study.company} className="relative bg-[#1a1a1a] border border-white/10 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: accent }} />
          <div className="p-6 md:p-8 pl-8 md:pl-10 grid gap-8 md:grid-cols-[1fr_220px]">
            <div>
              <Label>Case study {pad2(i + 1)}</Label>
              <h3 className="mt-1 font-gta text-[42px] md:text-[56px] leading-none text-white">{study.company}</h3>
              <p className="mt-5 text-[16px] md:text-[17px] leading-relaxed text-[#cfc9bd]">{study.summary}</p>
              <div className="mt-6">
                <Cta href={study.url} accent={accent}>
                  View case study
                </Cta>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-3 content-start">
              {study.metrics.map((m) => (
                <div key={m.label} className="bg-black/40 border border-white/10 p-4">
                  <div className="font-gta text-[40px] md:text-[48px] leading-none" style={{ color: accent }}>
                    {m.value}
                  </div>
                  <div className="mt-2 text-[13px] text-[#a8a297] leading-tight">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

// ── Built projects ──────────────────────────────────────────────────────────

function Projects({ accent }: { accent: string }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {PROJECTS.map((project, i) => (
        <a
          key={project.title}
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`group relative flex flex-col bg-[#1a1a1a] border border-white/10 p-6 hover:border-white/30 hover:-translate-y-0.5 transition-all ${
            i === 0 ? "md:col-span-2" : ""
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-gta text-[13px] tracking-[0.18em] uppercase px-2 py-0.5 border border-white/20 text-[#cfc9bd]">
              {project.kind}
            </span>
            {i === 0 ? (
              <span className="font-gta text-[13px] tracking-[0.18em] px-2 py-0.5 text-black" style={{ background: accent }}>
                NEWEST
              </span>
            ) : (
              <span className="font-gta text-[20px] text-white/25">{pad2(i + 1)}</span>
            )}
          </div>
          <h3 className={`mt-4 font-gta leading-none text-white ${i === 0 ? "text-[40px] md:text-[52px]" : "text-[32px]"}`}>
            {project.title}
          </h3>
          <p className={`mt-3 leading-relaxed text-[#cfc9bd] ${i === 0 ? "text-[17px] max-w-2xl" : "text-[15px]"}`}>
            {project.description}
          </p>
          <span
            className="mt-auto pt-6 inline-flex items-center gap-1.5 font-gta text-[17px] tracking-[0.06em] uppercase"
            style={{ color: accent }}
          >
            {project.cta}
            <ArrowUpRight size={18} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </a>
      ))}
    </div>
  );
}

// ── Socials ─────────────────────────────────────────────────────────────────

function Socials({ accent }: { accent: string }) {
  return (
    <div className="space-y-6">
      <p className="text-[18px] md:text-[20px] leading-relaxed text-[#ece7dd]">{SOCIALS_INTRO}</p>
      <ul className="border-t border-white/10">
        {SOCIALS.map((s) => {
          const Icon = SOCIAL_ICON[s.name];
          return (
            <li key={s.name} className="border-b border-white/10">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 py-4 px-2 -mx-2 hover:bg-white/[0.04] transition-colors"
              >
                <span className="w-14 h-14 shrink-0 flex items-center justify-center text-white border border-white/15" style={{ background: s.color }}>
                  <Icon size={26} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-gta text-[28px] leading-none text-white">{s.name}</span>
                  <span className="block mt-1 font-mono text-[14px] text-[#a8a297] truncate">{s.handle}</span>
                </span>
                <span
                  className="w-11 h-11 shrink-0 flex items-center justify-center border-2 border-white/20 text-white group-hover:text-black group-hover:border-black group-hover:bg-[var(--accent)] transition-colors"
                  style={{ ["--accent" as string]: accent }}
                >
                  <ArrowUpRight size={20} strokeWidth={2.5} />
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export const SECTION_SUBTITLE: Record<ZoneId, string> = {
  ABOUT: "Product designer · design, AI and code",
  CASE_STUDIES: "Selected work and the results it drove",
  PROJECTS: "Things I designed and built",
  SOCIALS: "Say hi",
};

export function SectionPage({ zone, accent }: { zone: ZoneId; accent: string }) {
  switch (zone) {
    case "ABOUT":
      return <About accent={accent} />;
    case "CASE_STUDIES":
      return <CaseStudies accent={accent} />;
    case "PROJECTS":
      return <Projects accent={accent} />;
    case "SOCIALS":
      return <Socials accent={accent} />;
  }
}
