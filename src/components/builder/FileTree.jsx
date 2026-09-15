const DOT_COLORS = {
  js: "bg-[#f0b429]",
  jsx: "bg-[#f0b429]",
  css: "bg-[#4c9aff]",
};

export function FileTree({ files = {} }) {
  const paths = Object.keys(files).sort();

  if (paths.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-3 pb-4.5 pt-1.5 text-[12.5px] text-gray-400">
        No files yet.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 pb-4.5 pt-1.5">
      {paths.map((path) => {
        const ext = path.split(".").pop()?.toLowerCase();
        return (
          <div
            className="flex items-center gap-2.25 rounded-md px-2 py-1.75 font-mono text-[12.5px] text-gray-700 hover:bg-gray-100"
            key={path}
          >
            <span
              className={`h-2 w-2 flex-none rounded-sm ${DOT_COLORS[ext] ?? "bg--gray-300"}`}
            />
            {path}
          </div>
        );
      })}
    </div>
  );
}
