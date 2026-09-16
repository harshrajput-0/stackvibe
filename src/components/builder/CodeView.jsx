"use client";

import { useEffect, useState } from "react";

export function CodeView({ files = {} }) {
  const paths = Object.keys(files).sort();
  const [selected, setSelected] = useState(paths[0] || null);

  // Keep the selection valid as files change (e.g. after a chat revision).
  useEffect(() => {
    if (!selected || !(selected in files)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelected(paths[0] || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  if (paths.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-6.5 text-sm text-gray-400">
        No files generated yet.
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 gap-4 p-5">
      <div className="w-47.5 flex-none overflow-y-auto rounded-md border border-gray-200 bg-white p-2.5">
        {paths.map((path) => (
          <button
            className={`flex w-full items-center gap-1.75 rounded-[5px] px-2 py-1.5 text-left font-mono text-xs ${
              path === selected
                ? "bg-gray-100 font-medium text-black"
                : "text-gray-700"
            }`}
            key={path}
            onClick={() => setSelected(path)}
          >
            {path}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto whitespace-pre rounded-md bg-gray-900 p-5 font-mono text-[12.5px] leading-[1.7] text-gray-200">
        {selected ? files[selected] : ""}
      </div>
    </div>
  );
}
