"use client";

import { SiteSandbox } from "@/components/shared/SiteSandbox";


export function PreviewView({ chromeUrl, siteName, files = {} }) {
  // Check App.js file
  const hasApp = Boolean(files["/App.js"]);

  return (
    <div className="flex min-h-0 flex-1 flex-col p-6.5">

      {/* Browser-like preview container */}
      <div className="flex h-full w-full max-w-245 mx-auto flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">

        {/* Fake browser header with controls and URL */}
        <div className="flex h-9.5 flex-none items-center gap-2 border-b border-gray-200 px-3.5">
          <div className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-(--dotr)!" />
            <span className="h-2 w-2 rounded-full bg-(--doty)!" />
            <span className="h-2 w-2 rounded-full bg-(--dotg)!" />
          </div>

          {/* Displays the preview URL */}
          <div className="flex h-5.5 flex-1 items-center rounded-[5px] bg-gray-100 px-2.5 font-mono text-[11px] text-gray-500">
            {chromeUrl}
          </div>
        </div>

        {/* Show the live preview if files are available */}
        {hasApp ? (
          <SiteSandbox files={files} />
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