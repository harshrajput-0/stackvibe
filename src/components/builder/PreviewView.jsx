"use client";

import { useMemo } from "react";
import { SandpackProvider, SandpackPreview } from "@codesandbox/sandpack-react";

// Sandback runs AI-generated React files in a live preview
// Tailwind CSS and Font Awesome loaded via CDN
const ENTRY_CODE = `import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
`;

// Minimum HTML Required by React application
const INDEX_HTML = `<!DOCTYPE html>
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

// External Resouces used for generating website
const EXTERNAL_RESOURCES = [
  "https://cdn.tailwindcss.com",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
];

export function PreviewView({ chromeUrl, siteName, files = {} }) {
  // Check App.js file
  const hasApp = Boolean(files["/App.js"]);

  // Prepare files that sandpack will use
  const sandpackFiles = useMemo(() => {
    if (!hasApp) return null;                          // No App.js means no preview

    // Sandpack's React template uses /src/index.js as its entry point.
    const entries = { "/public/index.html": INDEX_HTML, "/src/index.js": ENTRY_CODE };

    // Move generated files into /src folder
    for (const [path, content] of Object.entries(files)) {
      entries[`/src${path}`] = content;
    }
    return entries;
  }, [files, hasApp]);

  return (
    <div className="flex min-h-0 flex-1 flex-col p-6.5">

      {/* Browser-like preview container */}
      <div className="flex h-full w-full max-w-245 mx-auto flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">

        {/* Fake browser header with controls and URL */}
        <div className="flex h-9.5 flex-none items-center gap-2 border-b border-gray-200 px-3.5">
          <div className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-gray-200" />
            <span className="h-2 w-2 rounded-full bg-gray-200" />
            <span className="h-2 w-2 rounded-full bg-gray-200" />
          </div>

          {/* Displays the preview URL */}
          <div className="flex h-5.5 flex-1 items-center rounded-[5px] bg-gray-100 px-2.5 font-mono text-[11px] text-gray-500">
            {chromeUrl}
          </div>
        </div>

        {/* Show the live preview if files are available */}
        {sandpackFiles ? (
          <SandpackProvider
            template="react"
            files={sandpackFiles}
            customSetup={{ entry: "/src/index.js" }}
            options={{ externalResources: EXTERNAL_RESOURCES }}
            style={{ height: "100%", flex: 1, minHeight: 0 }}
          >

            {/* Renders the generated website */}
            <SandpackPreview
              showNavigator={false}
              showOpenInCodeSandbox={false}
              showRefreshButton
              style={{ height: "100%" }}
            />
          </SandpackProvider>
        ) : (
          // Display a message when no files have been generated.
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-10 py-17.5 text-center">
            <h1 className="text-[clamp(20px,3vw,26px)] font-bold tracking-[-0.02em]">
              {siteName}
            </h1>
            <p className="text-sm text-gray-400">
              No files generated yet — nothing to preview.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
