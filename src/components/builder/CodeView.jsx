"use client";

import { useEffect, useRef, useState } from "react";

export function CodeView({
  files = {},
  dirtyPaths = new Set(),
  onChange,
  onDiscard,
  onSaveClick,
  isSaving = false,
}) {
  const paths = Object.keys(files).sort();
  const [selected, setSelected] = useState(paths[0] || null);
  const textareaRef = useRef(null);

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

  const content = selected ? (files[selected] ?? "") : "";
  const lineCount = content.split("\n").length;
  const isSelectedDirty = selected ? dirtyPaths.has(selected) : false;
  const hasAnyDirty = dirtyPaths.size > 0;

  return (
    <div className="flex min-h-0 flex-1 gap-4 p-5">
      {/* File list — an orange dot marks any file with unsaved edits,
          not just the one currently open. */}
      <div className="w-47.5 flex-none overflow-y-auto rounded-md border border-gray-200 bg-white p-2.5">
        {paths.map((path) => (
          <button
            className={`flex w-full items-center gap-1.75 rounded-[5px] border-l-2 px-2 py-1.5 text-left font-mono text-xs ${
              path === selected
                ? "border-l-black bg-gray-900 font-medium text-white"
                : "border-l-transparent text-gray-700 hover:bg-gray-100"
            }`}
            key={path}
            onClick={() => setSelected(path)}
          >
            <span className="min-w-0 flex-1 truncate">{path}</span>
            {dirtyPaths.has(path) && (
              <span className="h-1.5 w-1.5 flex-none rounded-full bg-[#f0b429]" />
            )}
          </button>
        ))}
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-md border border-gray-200">
        {/* Toolbar: path, "unsaved" pill, discard/save for the whole set
            of edited files (not just this one). */}
        <div className="flex flex-none items-center gap-2.5 border-b border-gray-200 bg-white px-3 py-2">
          <span className="truncate font-mono text-xs text-gray-700">
            {selected}
          </span>
          {isSelectedDirty && (
            <span className="flex-none rounded-full bg-amber-100 px-1.75 py-0.5 text-[10.5px] font-medium text-amber-800">
              Unsaved changes
            </span>
          )}
          <span className="flex-1" />
          <button
            className="rounded-md px-2.75 py-1.25 text-xs font-medium text-gray-500 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
            onClick={() => selected && onDiscard?.(selected)}
            disabled={!isSelectedDirty || isSaving}
          >
            Discard
          </button>
          <button
            className="rounded-md bg-black px-3 py-1.25 text-xs font-medium text-white disabled:pointer-events-none disabled:opacity-40"
            onClick={onSaveClick}
            disabled={!hasAnyDirty || isSaving}
          >
            Save
          </button>
        </div>

        {/* Editor: plain textarea (no syntax highlighting) with its own
            line-number gutter, over the same dark background the old
            read-only view used. */}
        <div className="code-editor-dark flex min-h-0 flex-1 overflow-auto bg-gray-900">
          <div
            aria-hidden="true"
            className="flex-none select-none whitespace-pre px-3.5 py-5 text-right font-mono text-[12.5px] leading-[1.7] text-gray-600"
          >
            {Array.from({ length: lineCount }, (_, i) => i + 1).join("\n")}
          </div>
          <textarea
            ref={textareaRef}
            className="min-h-full flex-1 resize-none border-none bg-transparent px-5 py-5 font-mono text-[12.5px] leading-[1.7] text-gray-200 outline-none"
            spellCheck={false}
            value={content}
            onChange={(event) =>
              selected && onChange?.(selected, event.target.value)
            }
          />
        </div>
      </div>
    </div>
  );
}
