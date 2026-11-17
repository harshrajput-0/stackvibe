import { Check, FileCode2 } from "lucide-react";

// Matches one planned-file line from the backend's plan message, e.g.
// "- `/App.js`: Main application component...".
const PLAN_ITEM_RE = /^-\s*`([^`]+)`:\s*(.+)$/;


// The backend sends the project plan as a newline-joined string.
// Parse it into a heading and structured file list for proper rendering,
// instead of displaying it as a collapsed paragraph.
function parsePlanMessage(text) {
  if (!text) return null;

  const items = [];
  const headingLines = [];

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    const match = PLAN_ITEM_RE.exec(line);
    if (match) {
      items.push({ path: match[1], description: match[2] });
    } else if (items.length === 0) {
      // Only collect heading text that comes before the first list item —
      // anything after belongs to a malformed item, not the heading.
      headingLines.push(line);
    }
  }

  if (items.length === 0) return null;
  return { heading: headingLines.join(" "), items };
}







export function ChatMessage({ message }) {
  if (message.role === "user") {
    return (
      <div className="max-w-[85%] self-end rounded-tl-xl rounded-tr-xl rounded-br-xs rounded-bl-xl bg-black px-3.25 py-2.25 text-[13.5px] leading-[1.55] text-white">
        {message.text}
      </div>
    );
  }


  // File-group bubbles have their own statusLines and are just one-line summaries,
  // so skip plan parsing.
  const plan = message.statusLines?.length ? null : parsePlanMessage(message.text);


  return (
    <div className="max-w-[92%] text-[13.5px] leading-[1.55] text-gray-800">
      <div className="mb-1.25 text-[11px] font-semibold tracking-[0.01em] text-gray-400">
        StackVibe
      </div>
      {message.statusLines?.map((line, index) => (
        <div
          className="flex items-center gap-1.75 py-0.5 font-mono text-xs text-gray-500"
          key={`${message.id}-status-${index}`}
        >
          <Check size={13} strokeWidth={1.8} className="flex-none" />
          {line}
        </div>
      ))}
      {plan ? (
        <>
          {plan.heading && (
            <div className="mb-1.5 font-medium text-gray-700">
              {plan.heading}
            </div>
          )}
          <div className="rounded-md border border-gray-200 bg-white p-1.5">
            {plan.items.map((file, index) => (
              <div
                className="flex items-start gap-2.5 rounded-md border-t border-t-gray-100 px-2.5 py-2.25 first:border-t-0"
                key={`${message.id}-plan-${index}`}
              >
                <FileCode2
                  size={13.5}
                  strokeWidth={1.8}
                  className="mt-px flex-none text-gray-400"
                />
                <div className="min-w-0">
                  <div className="font-mono text-xs font-semibold text-black">
                    {file.path}
                  </div>
                  <div className="mt-0.5 text-[11.5px] leading-[1.4] text-gray-500">
                    {file.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="whitespace-pre-wrap">{message.text}</div>
      )}
    </div>
  );
}
