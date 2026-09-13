import { Check } from "lucide-react";

export function ChatMessage({ message }) {
  if (message.role === "user") {
    return (
      <div className="max-w-[85%] self-end rounded-tl-xl rounded-tr-xl rounded-br-xs rounded-bl-xl bg-black px-3.25 py-2.25 text-[13.5px] leading-[1.55] text-white">
        {message.text}
      </div>
    );
  }

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
      {message.text}
    </div>
  );
}
