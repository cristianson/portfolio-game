/**
 * Portfolio Content
 *
 * Plain data for every section (text, links, jobs, projects), rendered by
 * sections.tsx. Edit copy and links here.
 */

export const ABOUT_PARAGRAPHS = [
  "I'm a product designer who loves building thoughtful digital experiences and working across design, AI and code.",
  "I've been designing for the past 5 years and have worked with AI startups, fintech and B2B SaaS companies.",
];

export interface Job {
  title: string;
  period: string;
  company: string;
  url: string;
  description: string;
  isCurrent?: boolean;
}

export const JOBS: Job[] = [
  {
    title: "Founding Product Designer",
    period: "Dec 2025 – Present",
    company: "Lette AI",
    url: "https://www.lette.ai/",
    description:
      "A platform that orchestrates AI agents to streamline property management, from leasing and maintenance to tenant support.",
    isCurrent: true,
  },
  {
    title: "Product Design Lead",
    period: "Aug 2024 – Jul 2025",
    company: "FULLY AI (Acquired by Circus Group)",
    url: "https://www.gofully.ai/",
    description:
      "A no-code, multi-agent platform for creating brand-ready AI agents that live inside your product and learn, adapt and improve across every stage of the customer lifecycle.",
  },
  {
    title: "Product Designer",
    period: "Feb 2023 – Mar 2024",
    company: "Spoke.ai (Acquired by Slack)",
    url: "https://www.spoke.ai/",
    description:
      "An AI inbox that centralizes notifications from Slack and other work tools, summarizes them, prioritizes tasks, and suggests next actions.",
  },
  {
    title: "Product Designer",
    period: "Oct 2021 – Jan 2023",
    company: "Sortlist",
    url: "https://www.sortlist.com/",
    description:
      "A B2B SaaS matchmaking platform that helps companies find the most relevant digital agencies for their projects.",
  },
];

export interface Project {
  title: string;
  /** Short label for the kind of thing it is. */
  kind: string;
  description: string;
  url: string;
  cta: string;
  /**
   * Cover image hung as a painting in the Built Projects gallery, e.g.
   * "/projects/draw-a-run.webp" (16:10). Without one the painting shows a title card.
   */
  cover?: string;
}

/** Newest first. */
export const PROJECTS: Project[] = [
  {
    title: "Draw a Run",
    kind: "Web app",
    description:
      "Draw a shape or pick one from the list, and the app finds runnable routes on real streets that trace it at the distance you want. Routes export as GPX for Strava, Garmin, Coros or any sport watch.",
    url: "https://drawarun.com",
    cta: "Visit Draw a Run",
    cover: "/projects/draw-a-run.webp",
  },
  {
    title: "Airbnb Listing Comparer",
    kind: "Chrome extension",
    description:
      "An AI-powered Chrome extension that helps travelers compare Airbnb listings and pick the most relevant one, saving time and reducing decision fatigue.",
    url: "https://chromewebstore.google.com/detail/airbnb-listing-comparer/dfkpdnhihibjifejkhbpickfpkkciohe",
    cta: "View Extension",
    cover: "/projects/airbnb-listing-comparer.webp",
  },
  {
    title: "Public Transport Ticket Gallery",
    kind: "Website",
    description:
      "A minimal website where I collect public transport tickets from places I've visited. It's my playground for experimenting with UI, motion and front-end craft.",
    url: "https://tickets-phi-one.vercel.app/",
    cta: "Visit Ticket Gallery",
    cover: "/projects/ticket-gallery.webp",
  },
];

/** Lines spoken and shown inside the Built Projects gallery (see museum.tsx). */
export const GALLERY = {
  name: "Projects Gallery",
  guard: "Welcome to the gallery. Walk up to a painting to see what it is. The exit is right behind you.",
  soonTitle: "Next project",
  soonText: "In progress. Check back soon.",
  guestbookTitle: "Sign the guestbook",
  guestbookText: "Enjoyed the gallery? Leave me a note on LinkedIn.",
  guestbookCta: "Sign on LinkedIn",
};

export interface CaseStudy {
  company: string;
  summary: string;
  url: string;
  /** Headline numbers pulled from the summary. */
  metrics: { value: string; label: string }[];
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    company: "Spoke.ai",
    summary:
      "I helped turn an AI inbox for Slack into a native macOS app that fits naturally into people’s daily workflow. By bringing AI summaries, a priority sidebar and native notifications closer to where work happens, focused time in the app tripled and DAU grew by 147%.",
    url: "https://www.figma.com/deck/XzPSjhrtDVSIyqK6fkwZP9/Spoke.ai",
    metrics: [
      { value: "3×", label: "Focused time in the app" },
      { value: "+147%", label: "Daily active users" },
    ],
  },
  {
    company: "FULLY AI",
    summary:
      "I created the vision and v1 of an AI-driven Bento dashboard that adapts content to each step of the customer journey. With modular blocks built for engagement and clarity, it set clear targets (+30% time on page, 40–60% FAQs resolved) and became a valuable asset in investor and acquisition discussions.",
    url: "https://www.figma.com/deck/dxL9upoAsEYSZVEJ8eDp7A/FULLY-AI",
    metrics: [
      { value: "+30%", label: "Time on page (target)" },
      { value: "40–60%", label: "FAQs resolved (target)" },
    ],
  },
];

export const SOCIALS_INTRO = "Feel free to connect with me on social media or check out my code repos :)";

export interface Social {
  name: string;
  /** Short name for buttons, e.g. "Go to X". */
  short: string;
  handle: string;
  url: string;
  /** Brand color, used for the icon tile and the street pickup. */
  color: string;
}

export const SOCIALS: Social[] = [
  { name: "LinkedIn", short: "LinkedIn", handle: "in/crisiordan", url: "https://www.linkedin.com/in/crisiordan/", color: "#0a66c2" },
  { name: "X", short: "X", handle: "@CristianIordan_", url: "https://x.com/CristianIordan_", color: "#000000" },
  { name: "GitHub", short: "GitHub", handle: "cristianson", url: "https://github.com/cristianson", color: "#181717" },
];
