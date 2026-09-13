"use client";

import { useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { FileTree } from "./FileTree";
import { Button } from "@/components/ui/Button";

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
}) {
  const logRef = useRef(null);

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
    if (!inputValue.trim()) return;

    onSend();
    onInputChange("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }
  return (
    <aside className="flex w-80 flex-none flex-col border-r border-gray-200 bg-white">
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
          <div className={chatInput}>
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Ask StackVibe to modify..."
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="max-h-50 min-h-9 flex-1 resize-none overflow-y-auto scrollbar-none border-none bg-transparent text-[13.5px] leading-normal placeholder:text-(--gray-400) focus:outline-none items-center"
            />
            <Button
              variant="primary"
              size="icon"
              className="rounded-lg"
              onClick={handleSend}
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
        <FileTree />
      </div>
    </aside>
  );
}
