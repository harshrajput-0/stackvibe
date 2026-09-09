export const PROMPT_CHIPS = [
  {
    label: "Portfolio",
    prompt: "A minimal portfolio site with a project grid and an about page.",
  },
  {
    label: "SaaS",
    prompt: "A SaaS landing page with pricing tiers and a feature comparison.",
  },
  {
    label: "Restaurant",
    prompt: "A restaurant site with a menu, hours, and a reservation form.",
  },
  {
    label: "Blog",
    prompt: "A clean writing blog with a post list and an archive page.",
  },
];



export const MOCK_PROJECTS = [
  {
    id: "portfolio",
    name: "Portfolio",
    meta: "Edited 2h ago",
    hero: {
      h1: "Work that speaks for itself.",
      sub: "A collection of recent projects across product, brand, and interaction design.",
    },
  },
  {
    id: "coffee-shop",
    name: "Coffee Shop",
    meta: "Edited 1d ago",
    hero: {
      h1: "Good coffee, made slow.",
      sub: "A small neighborhood roastery serving single-origin coffee and fresh pastry daily.",
    },
  },
];

export const DEFAULT_SITE_HERO = {
  h1: "Good coffee, made slow.",
  sub: "A small neighborhood roastery serving single-origin coffee and fresh pastry daily.",
};


export const INITIAL_CHAT_MESSAGES = [
  {
    id: "welcome-status",
    role: "ai",
    statusLines: ["Created project structure", "Generated homepage and components"],
  },
  {
    id: "welcome-text",
    role: "ai",
    text: "Your site is ready to preview. Tell me what to change — layout, copy, sections, anything.",
  },
];

export const CODE_TREE = [
  "app/page.jsx",
  "components/Navbar.jsx",
  "components/Hero.jsx",
  "components/Features.jsx",
  "components/Footer.jsx",
];

export const PLANNED_FILES = [
  {
    file: "App.js",
    description: "Root component wiring up layout and page sections.",
  },
  {
    file: "components/Header.js",
    description: "Sticky nav with logo, links, and a primary CTA button.",
  },
  {
    file: "components/Hero.js",
    description: "Full-bleed hero with headline, subcopy, and two buttons.",
  },
  {
    file: "components/Features.js",
    description: "Grid showcase highlighting key offerings and benefits.",
  },
  {
    file: "components/Testimonials.js",
    description: "Customer quotes with ratings and avatars to build trust.",
  },
  {
    file: "components/Footer.js",
    description: "Site footer with links, contact info, and a copyright line.",
  },
];

export const SIDEBAR_FILE_TREE = [
  { type: "file", name: "App.js", ext: "js" },
  { type: "folder", name: "components" },
  { type: "file", name: "Header.js", ext: "js", indent: true },
  { type: "file", name: "Hero.js", ext: "js", indent: true },
  { type: "file", name: "Features.js", ext: "js", indent: true },
  { type: "file", name: "CallToAction.js", ext: "js", indent: true },
  { type: "file", name: "Testimonials.js", ext: "js", indent: true },
  { type: "file", name: "Pricing.js", ext: "js", indent: true },
  { type: "file", name: "Footer.js", ext: "js", indent: true },
  { type: "file", name: "styles.css", ext: "css" },
];

export const GENERATION_STEP_DELAY_MS = 420;
export const GENERATION_COMPLETE_DELAY_MS = 450;
export const CHAT_REPLY_DELAY_MS = 700;