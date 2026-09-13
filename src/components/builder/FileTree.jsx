import { SIDEBAR_FILE_TREE } from "@/lib/constants";

const DOT_COLORS = {
  js: "bg-[#f0b429]",
  css: "bg-[#4c9aff]",
};

export function FileTree() {
  return (
    <div className="flex-1 overflow-y-auto px-3 pb-4.5 pt-1.5">
      {SIDEBAR_FILE_TREE.map((item) =>
        item.type === "folder" ? (
          <div
            className="flex items-center gap-1.75 px-2 pb-1.5 pt-2.5 text-[11px] font-semibold tracking-[0.04em] text-gray-400"
            key={item.name}
          >
            {item.name}
          </div>
        ) : (
          <div
            className={`flex items-center gap-2.25 rounded-md px-2 py-1.75 font-mono text-[12.5px] text-gray-700 hover:bg-gray-100 ${
              item.indent ? "pl-6.5" : ""
            }`}
            key={item.name}
          >
            <span
              className={`h-2 w-2 flex-none rounded-sm ${DOT_COLORS[item.ext] ?? "bg--gray-300"}`}
            />
            {item.name}
          </div>
        ),
      )}
    </div>
  );
}
