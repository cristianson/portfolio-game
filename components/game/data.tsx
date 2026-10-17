/**
 * Game Data & Content
 *
 * This file defines how each interaction zone (About, Projects, etc.) looks in the 2D game:
 * labels, colors, icons and the JSX for each modal. The text and links themselves live in
 * content.ts, which the 3D version reads too.
 */

import React from "react";
import Image from "next/image";
import { JobEntry } from "./job-entry";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "./icons";
import { ABOUT_PARAGRAPHS, CASE_STUDIES, JOBS, PROJECTS, SOCIALS, SOCIALS_INTRO } from "./content";

const SOCIAL_STYLE: Record<string, { icon: React.ReactNode; bg: string; hover: string }> = {
  LinkedIn: { icon: <LinkedinIcon size={24} />, bg: "bg-[#0077b5]", hover: "hover:bg-blue-50" },
  "Twitter(X)": { icon: <TwitterIcon size={24} />, bg: "bg-black", hover: "hover:bg-gray-50" },
  GitHub: { icon: <GithubIcon size={24} />, bg: "bg-[#333]", hover: "hover:bg-gray-50" },
};

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
                  priority
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-4">
                {ABOUT_PARAGRAPHS.map((text) => (
                  <p key={text} className="text-mono-base leading-relaxed">
                    {text}
                  </p>
                ))}
              </div>
            </div>

            {/* Timeline Section */}
            <div className="w-full pt-6 mt-2 border-t-4 border-dashed border-black/10">
              <div className="space-y-8">
                {JOBS.map((job, i) => (
                  <JobEntry
                    key={job.company}
                    {...job}
                    isFirst={i === 0}
                    isLast={i === JOBS.length - 1}
                  />
                ))}
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
          {PROJECTS.map((project) => (
            <div key={project.title} className="border-2 border-black p-4 bg-white text-black">
              <h3 className="text-pixel-lg mb-2">{project.title}</h3>
              <p className="text-mono-base leading-relaxed">{project.description}</p>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-6"
              >
                {project.cta} &gt;
              </a>
            </div>
          ))}
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
          {CASE_STUDIES.map((study, i) => (
            <React.Fragment key={study.company}>
              {i > 0 && <hr className="border-zinc-700" />}
              <div>
                <h3 className="text-pixel-lg text-orange-500 mb-2">{study.company}</h3>
                <p className="text-mono-base leading-relaxed">{study.summary}</p>
                <a
                  href={study.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary mt-6"
                >
                  More info &gt;
                </a>
              </div>
            </React.Fragment>
          ))}
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
          <p className="text-mono-base text-center max-w-md mb-4">{SOCIALS_INTRO}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl">
            {SOCIALS.map((social) => {
              const style = SOCIAL_STYLE[social.name];
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center p-6 bg-white border-2 border-black ${style.hover} transition-colors group`}
                >
                  <div
                    className={`w-12 h-12 flex items-center justify-center ${style.bg} text-white rounded mb-3 group-hover:scale-110 transition-transform`}
                  >
                    {style.icon}
                  </div>
                  <span className="text-pixel-sm">{social.name}</span>
                </a>
              );
            })}
          </div>
        </div>
      ),
    },
  },
};
