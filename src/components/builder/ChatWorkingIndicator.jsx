import { Logo } from "@/components/ui/Logo";

// Shown in the chat log in place of the AI's reply while a revision
// request is in flight. Mirrors the "StackVibe" label used by real
// messages so it reads as part of the same log, not a separate spinner.
export function ChatWorkingIndicator() {
  return (
    <div className="max-w-[92%] text-[13.5px] leading-[1.55] text-gray-800">
      <div className="mb-1.25 text-[11px] font-semibold tracking-[0.01em] text-gray-400">
        StackVibe
      </div>
      <div className="flex items-center gap-2">
        <span className="flex h-5.5 w-5.5 flex-none items-center justify-center rounded-[7px] border border-gray-200">
          <Logo size={13} animated />
        </span>
        <span className="text-[12.5px] text-gray-500">
          Revising the project
          <span aria-hidden="true">
            <span className="animate-[dot-blink_1.4s_infinite]">.</span>
            <span className="animate-[dot-blink_1.4s_infinite] [animation-delay:0.2s]">
              .
            </span>
            <span className="animate-[dot-blink_1.4s_infinite] [animation-delay:0.4s]">
              .
            </span>
          </span>
        </span>
      </div>
    </div>
  );
}
