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
    statusLines: [
      "Created project structure",
      "Generated homepage and components",
    ],
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



// Host shown in project URLs. Set NEXT_PUBLIC_URL in .env — this only
// falls back to the hardcoded value if that's missing (e.g. local setup).
export const PUBLIC_HOST = process.env.NEXT_PUBLIC_URL || "stackvibe.vercel.app";

// Examples animation data
export const DEMO_EXAMPLES = [
  {
    label: "Ceramics studio",
    prompt: "A portfolio for a ceramics studio",
    url: "terra.stackvibe.app",
    brand: "Terra Studio",
    links: ["Shop", "About", "Visit"],
    heading: ["Hand-thrown", "in Lisbon."],
    text: "Plates, vases and bowls, made in small batches.",
    cta: "Shop the studio",
    tiles: [{ art: "plate" }, { art: "vase" }, { art: "bowl" }],
  },
  {
    label: "Dog walker",
    prompt: "A booking page for a dog walker",
    url: "pawline.stackvibe.app",
    brand: "Pawline",
    links: ["Walks", "Prices", "Contact"],
    heading: ["Walks your dog", "will wait for."],
    text: "Book a 30 or 60 minute walk in two taps.",
    cta: "Book a walk",
    tiles: [
      { title: "30 min", meta: "$15" },
      { title: "60 min", meta: "$25" },
      { title: "Group walk", meta: "$12" },
    ],
  },
  {
    label: "Jazz night",
    prompt: "A menu and RSVP page for a jazz night",
    url: "bluehour.stackvibe.app",
    brand: "Blue Hour",
    links: ["Lineup", "Menu", "Find us"],
    heading: ["Live jazz,", "every Thursday."],
    text: "Doors at 7, music at 8. Save a table for your group.",
    cta: "RSVP",
    tiles: [
      { title: "Oct 1", meta: "Trio" },
      { title: "Oct 8", meta: "Quartet" },
      { title: "Oct 15", meta: "Open jam" },
    ],
  },
];


// Rotating status copy shown in the generating view's activity panel.
export const PLANNING_MESSAGES = [
  "Reading your idea",
  "Planning the structure",
  "Deciding which files you need",
  "Still planning, almost there",
];

export const BUILD_MESSAGES = [
  "Sketching the layout",
  "Choosing colors and type",
  "Wiring up components",
  "Polishing the details",
  "Still working on it",
];

export const MESSAGE_ROTATE_MS = 3200;
export const SLOW_GENERATION_NOTE_MS = 14000;