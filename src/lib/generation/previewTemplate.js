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