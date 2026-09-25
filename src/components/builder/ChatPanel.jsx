"use client";

import { useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { FileTree } from "./FileTree";
import { Button } from "@/components/ui/Button";
import { useResizablePanel } from "@/hooks/useResizablePanel";

// STYLES
const tabBtn =
  "h-7.5 flex-1 rounded-[5px] text-[13px] font-medium transition-[background,color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]";
const activeTab = "bg-white! text-black! shadow-[0_1px_2px_rgba(0,0,0,0.06)]!";
const chatInput =
  "flex items-end gap-2 rounded-md border border-gray-300 py-2 pl-3.5 pr-2 transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:border-black";

export function ChatPanel({
  sideTab,
  onSideTabChange,
  messages,
  inputValue,
  onInputChange,
  onSend,
  files,
  disabled = false,
}) {
  const logRef = useRef(null);

  // Draggable width, clamped between 260px and 30% of the screen width.
  const { width, startResizing } = useResizablePanel({
    initialWidth: 320,
    minWidth: 260,
    maxWidthRatio: 0.3,
  });

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages]);

  const textareaRef = useRef(null);

  function handleInputChange(event) {
    const textarea = event.target;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;

    onInputChange(textarea.value);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    if (disabled || !inputValue.trim()) return;

    onSend();
    onInputChange("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }
  return (
    <aside
      className="relative flex flex-none flex-col border-r border-gray-200 bg-white"
      style={{ width }}
    >
      {/* Drag handle for resizing the panel, capped at 30% of screen width. */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize chat panel"
        onMouseDown={startResizing}
        onTouchStart={startResizing}
        className="absolute top-0 -right-1 z-10 h-full w-2 cursor-col-resize touch-none select-none"
      >
        <div className="mx-auto h-full w-px bg-transparent transition-colors duration-150 hover:bg-gray-300 active:bg-gray-400" />
      </div>

      <div className="m-3 flex flex-none gap-0.5 rounded-sm bg-gray-100 p-0.75">
        <button
          className={`${tabBtn} ${sideTab === "chat" ? activeTab : "text-gray-500"}`}
          onClick={() => onSideTabChange("chat")}
        >
          Chat
        </button>
        <button
          className={`${tabBtn} ${sideTab === "files" ? activeTab : "text-gray-500"}`}
          onClick={() => onSideTabChange("files")}
        >
          Files
        </button>
      </div>

      <div
        className={`min-h-0 flex-1 ${sideTab === "chat" ? "flex flex-col" : "hidden"}`}
      >
        <div
          className="flex flex-1 flex-col gap-3.5 overflow-y-auto p-4.5 overflow-x-hidden"
          ref={logRef}
        >
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
        <div className="flex-none border-t border-gray-200 p-3">
          <div
            className={`${chatInput} ${disabled ? "pointer-events-none opacity-55" : ""}`}
          >
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Ask StackVibe to modify..."
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              className="max-h-50 min-h-9 flex-1 resize-none overflow-y-auto scrollbar-none border-none bg-transparent text-[13.5px] leading-normal placeholder:text-(--gray-400) focus:outline-none items-center"
            />
            <Button
              variant="primary"
              size="icon"
              className="rounded-lg"
              onClick={handleSend}
              disabled={disabled}
              aria-label="Send"
            >
              <ArrowUp size={14} strokeWidth={2} />
            </Button>
          </div>
        </div>
      </div>

      <div
        className={`min-h-0 flex-1 ${sideTab === "files" ? "flex flex-col" : "hidden"}`}
      >
        <FileTree files={files} />
      </div>
    </aside>
  );
}