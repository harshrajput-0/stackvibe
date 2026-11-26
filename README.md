# StackVibe

StackVibe is an AI-powered Web Application Builder that enables users to quickly prompt, generate, preview, and export full-stack web applications. Featuring a interactive builder environment, real-time code generation, live previews, and project export utilities, StackVibe streamlines web application development using modern stack architectures.

---

## 🚀 Features

- **Interactive AI Prompting:** Transform natural language prompts into structured web application files.
- **In-Browser Code Preview & Editing:** Inspect generated project files, view live code outputs, and make iterative changes via chat.
- **Project Management:** Create, save, manage, and retrieve projects by unique IDs or custom URL slugs.
- **Publish & Share:** Publish a project to a live public URL (`/<owner-prefix>/<slug>`). Slugs only need to be unique within your own account, and renaming a slug moves the live link automatically.
- **Export & Download:** Download completed project builds directly as ZIP files.
- **Authentication Support:** Built-in sign-in and sign-up flows with social auth/SSO callback support.
- **Responsive Workspace UI:** Drag-and-drop resizable panels for chat, code view, and live app preview.
- **Branded Placeholders:** Projects without a thumbnail show the StackVibe mark on a black ground instead of a generic blank card.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & PostCSS
- **Database / Models:** MongoDB / Mongoose (via project models & controller layer)
- **AI Infrastructure:** Custom AI Generation Engine (`ai.js`, `prompt.js`, schema validation, diff/normalizer engines)
- **Formatting & Linting:** ESLint, Prettier

---

## 📂 Project Structure

```text
stackvibe/
├── public/                 # Static assets and icons
├── src/
│   ├── api-client/         # Client-side API wrappers (chat, generation, project)
│   ├── app/                # Next.js App Router (auth, builder, dashboard, API routes,
│   │                       #   [slug]/[projectSlug] = published sites)
│   ├── components/         # Reusable React components
│   │   ├── auth/           # Sign in, Sign up, SSO callbacks
│   │   ├── builder/        # Code editor, Chat panel, Preview pane, File tree
│   │   ├── dashboard/      # Project list, Prompt box, Top navigation
│   │   ├── landing/        # Hero, Header, Footer
│   │   └── ui/             # Buttons, Inputs, Logo, Brand icons
│   ├── controllers/        # Backend business logic & controllers
│   ├── hooks/              # Custom React hooks (chat, generation, resizable panels)
│   ├── lib/                # Utility modules
│   │   ├── generation/     # AI prompt engines, schema validators, diff calculators
│   │   └── utils/          # Formatting, ZIP downloads, slug & public URL utilities
│   └── models/             # Mongoose database models (User, Project, Message, PlannedFiles)
├── env.example             # Environment variables template
├── next.config.mjs         # Next.js configuration
├── package.json            # Node dependencies and scripts
└── postcss.config.mjs      # Tailwind/PostCSS configuration
```

---

## ⚙️ Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js**: v18.x or later
- **npm** or **yarn** / **pnpm**
- **MongoDB**: Local instance or MongoDB Atlas connection string

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/harshrajput-0/stackvibe-development.git
   cd stackvibe-development
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the `env.example` file to `.env.local` and fill in the necessary keys:
   ```bash
   cp env.example .env.local
   ```

   *Example Configuration:*
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=

   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

   MONGODB_URI=

   OPENROUTER_KEY=api-key
   OPENROUTER_MODEL=model-name
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

5. **Access the Application:**
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🔗 Project URLs & Publishing

Every project has a **slug** (its URL name, e.g. `coffee-shop`). You can change it from the dashboard's edit-project dialog.

| What | URL |
| --- | --- |
| Builder | `/builder/<slug>` |
| Live (published) site | `/<ownerHandle>/<slug>` — e.g. `/a3f9c21b/coffee-shop` |

How it works:

- **Owner prefix (`ownerHandle`):** a short, stable hash of the user's Clerk id (see `src/lib/utils/ownerHandle.js`). Because the prefix is different for every user, **slugs only need to be unique within one account** — two users can both publish `coffee-shop`. The real user id is never shown in URLs.
- **Always up to date:** the live URL is built from the project's *current* slug (see `src/lib/utils/publicUrl.js`), so renaming the slug updates the live link, the dashboard link and the builder preview address bar.
- **Renaming a published site:** the previous prefixed URL stops working. The edit dialog warns you before saving.
- **Old links:** sites published before prefixes existed (`/<slug>`) redirect to the new `/<ownerHandle>/<slug>` URL. Older projects get their prefix filled in automatically the first time their owner opens the dashboard or builder.
- **Database:** `Project` has a unique index on `(owner, slug)`. If you're upgrading an existing database, make sure it has no duplicate slugs for a single user, or the index can't be built.