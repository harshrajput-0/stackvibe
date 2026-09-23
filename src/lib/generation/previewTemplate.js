// Shared scaffold for running the AI-generated `/App.js`-style files as a
// React app — used by both the live Sandpack preview and the downloadable
// project zip, so the two stay in sync.

export const PREVIEW_ENTRY_CODE = `import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
`;

// Minimum HTML required by the React app.
export const PREVIEW_INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;
// ---- Added for the downloadable project (Vite) ----

// Root index.html for Vite. Mirrors the CDN resources the live preview uses
// (see EXTERNAL_RESOURCES in PreviewView.jsx) so the site looks the same.
export const DOWNLOAD_INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>App</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.js"></script>
  </body>
</html>
`;

// Generated files are .js but contain JSX, so Vite must treat .js as JSX.
export const DOWNLOAD_VITE_CONFIG = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react({ include: /\\.(js|jsx)$/ })],
  esbuild: {
    loader: "jsx",
    include: /src\\/.*\\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: { loader: { ".js": "jsx" } },
  },
});
`;