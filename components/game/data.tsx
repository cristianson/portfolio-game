/**
 * Game Data & Content
 *
 * This file contains the static content for the portfolio game.
 * It defines the text, images, links, and specific configuration for each interaction zone (About, Projects, etc.).
 * It serves as the content management file for the game.
 */

import React from "react";
import Image from "next/image";
import { JobEntry } from "./job-entry";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "./icons";

export const ZONE_CONTENT = {
  ABOUT: {
    label: "About Me",
    color: "bg-blue-500",
    icon: "👤",
    content: {
      title: "About Me",
      body: (
        <div className="space-y-4">
          <div className="flex flex-col gap-6 items-start">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-[300px] h-[300px] flex-shrink-0 pixel-border-sm overflow-hidden">
                <Image
                  src="/avatar.webp"
                  alt="Profile photo"
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-4">
                <p className="text-mono-base leading-relaxed">
                  I'm a product designer who loves building thoughtful digital
                  experiences, belding design, AI and code.
                </p>
                <p className="text-mono-base leading-relaxed">
                  I've been designing for the past 5 years and worked with AI
                  startups, fintech, and B2B SaaS companies.
                </p>
                <p className="text-mono-base leading-relaxed font-semibold">
                  Founding Product Designer {""}
                  <a
                    href="https://www.lette.ai/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    @Lette AI
                  </a>
                </p>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="w-full pt-6 mt-2 border-t-4 border-dashed border-black/10">
              <div className="space-y-8">
                <JobEntry
                  title="Founding Product Designer"
                  period="Dec 2025 – Present"
                  company="Lette AI"
                  url="https://www.lette.ai/"
                  description="A solution for orchestrating AI agents that streamline property management operations, from leasing, maintenance, tenant support and more."
                  isCurrent={true}
                  isFirst={true}
                />

                <JobEntry
                  title="Product Design Lead"
                  period="Aug 2024 - Jul 2025"
                  company="FULLY AI (Acquired by Circus Group)"
                  url="https://www.gofully.ai/"
                  description="A no-code multi-agent platform to create brand-ready AI agents embedded in your product that learn, adapt, and improve across every stage of the customer lifecycle."
                />

                <JobEntry
                  title="Product Designer"
                  period="Feb 2023 - Mar 2024"
                  company="Spoke.ai (Acquired by Slack)"
                  url="https://www.spoke.ai/"
                  description="An AI inbox that centralizes notifications from Slack and other work tools, summarizes them, prioritizes tasks, and suggests next actions."
                />

                <JobEntry
                  title="Product Designer"
                  period="Oct 2021 - Jan 2023"
                  company="Sortlist"
                  url="https://www.sortlist.com/"
                  description="A matchmaking B2B SaaS platform that allows companies to find the most relevant digital agencies for their projects."
                  isLast={true}
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },
  },
  PROJECTS: {
    label: "Built Projects",
    color: "bg-purple-500",
    icon: "💻",
    content: {
      title: "Built Projects",
      body: (
        <div className="grid gap-6">
          <div className="border-2 border-black p-4 bg-white text-black">
            <h3 className="text-pixel-lg mb-2">Airbnb Listing Comparer</h3>
            <p className="text-mono-base leading-relaxed">
              An AI-powered Chrome extension that helps travelers compare and
              decide on the most relevant Airbnb listings, saving their time and
              reducing decision fatigue.
            </p>
            <a
              href="https://chromewebstore.google.com/detail/airbnb-listing-comparer/dfkpdnhihibjifejkhbpickfpkkciohe"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-6"
            >
              View Extension &gt;
            </a>
          </div>
          <div className="border-2 border-black p-4 bg-white text-black">
            <h3 className="text-pixel-lg mb-2">
              Public Transport Ticket Gallery
            </h3>
            <p className="text-mono-base leading-relaxed">
              A minimal website where I collect public transport tickets from
              places I visited. It's designed as a playground for myself to
              experiment with UI, motion, and front-end craft.
            </p>
            <a
              href="https://tickets-phi-one.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-6"
            >
              Visit Ticket Gallery &gt;
            </a>
          </div>
        </div>
      ),
    },
  },
  CASE_STUDIES: {
    label: "Case Studies",
    color: "bg-orange-500",
    icon: "📚",
    content: {
      title: "Case Studies",
      body: (
        <div className="space-y-6">
          <div>
            <h3 className="text-pixel-lg text-orange-500 mb-2">Spoke.ai</h3>
            <p className="text-mono-base leading-relaxed">
              I helped redesign an AI inbox for Slack into a native macOS app so
              it fits naturally into people’s daily workflow. By bringing AI
              summaries, a priority sidebar, and native notifications closer to
              where work happens, time spent focused in the app tripled and DAU
              grew by 147%.
            </p>
            <a
              href="https://www.figma.com/deck/XzPSjhrtDVSIyqK6fkwZP9/Spoke.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary mt-6"
            >
              More info &gt;
            </a>
          </div>
          <hr className="border-zinc-700" />
          <div>
            <h3 className="text-pixel-lg text-orange-500 mb-2">FULLY AI</h3>
            <p className="text-mono-base leading-relaxed">
              I created the vision and v1 of an AI-driven Bento dashboard that
              adapts content to each step of the customer journey. With modular
              blocks built for engagement and clarity, it set clear targets
              (+30% time on page, 40–60% FAQs resolved) and became a valuable
              asset in investor and acquisition discussions.
            </p>
            <a
              href="https://www.figma.com/deck/dxL9upoAsEYSZVEJ8eDp7A/FULLY-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary mt-6"
            >
              More info &gt;
            </a>
          </div>
        </div>
      ),
    },
  },
  SOCIALS: {
    label: "Socials",
    color: "bg-green-500",
    icon: "🌐",
    content: {
      title: "Socials",
      body: (
        <div className="flex flex-col gap-6 items-center justify-center py-8">
          <p className="text-mono-base text-center max-w-md mb-4">
            Feel free to connect with me on social media or check out my code
            repos :)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl">
            <a
              href="https://www.linkedin.com/in/crisiordan/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-6 bg-white border-2 border-black hover:bg-blue-50 transition-colors group"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-[#0077b5] text-white rounded mb-3 group-hover:scale-110 transition-transform">
                <LinkedinIcon size={24} />
              </div>
              <span className="text-pixel-sm">LinkedIn</span>
            </a>

            <a
              href="https://x.com/CristianIordan_"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-6 bg-white border-2 border-black hover:bg-gray-50 transition-colors group"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-black text-white rounded mb-3 group-hover:scale-110 transition-transform">
                <TwitterIcon size={24} />
              </div>
              <span className="text-pixel-sm">Twitter(X)</span>
            </a>

            <a
              href="https://github.com/cristianson"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-6 bg-white border-2 border-black hover:bg-gray-50 transition-colors group"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-[#333] text-white rounded mb-3 group-hover:scale-110 transition-transform">
                <GithubIcon size={24} />
              </div>
              <span className="text-pixel-sm">GitHub</span>
            </a>
          </div>
        </div>
      ),
    },
  },
};
