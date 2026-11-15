"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sendChatMessage } from "@/api-client/chatService";

let messageIdCounter = 0;
// Generate uniqueId for each message
function nextId() {
  messageIdCounter += 1;
  return `msg-${messageIdCounter}`;
}

// Backend errors are short, human-written sentences ("AI limit reached...",
// "Prompt is required"). A raw JS/runtime failure (a thrown TypeError that
// slipped past the API layer, a minified "x.json is not a function") is not
// something a user should ever see. Treat messages that look like code as
// unreadable and swap in a plain-language fallback instead.
function toDisplayErrorMessage(err) {
  const message = err?.message || "";
  const looksTechnical =
    !message ||
    /is not a function|undefined is not|cannot read propert|unexpected token|\bnan\b/i.test(
      message,
    );
  return looksTechnical
    ? "Something went wrong and the request couldn't be completed. Please try again."
    : message;
}

// Manage chat/messages

export function useChat(initialMessages = []) {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Tracks whether the component is still mounted.
  const mountedRef = useRef(true);


  // Updates the mounted status when the component mounts or unmounts.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);


  // Replaces the current messages with a new list.
  const resetMessages = useCallback((next = []) => {
    setMessages(next);
  }, []);

  // Adds a new message to the end of the chat
  const appendMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);


  // Sends a revision prompt for the specified project.
  // Receive updated files by AI on onFilesUpdated
  const sendMessage = useCallback(
    async (slug, onFilesUpdated) => {
      const text = inputValue.trim();
      if (!text || isSending || !slug) return;

      // Add the user's message to the chat immediately.
      appendMessage({ id: nextId(), role: "user", text });
      setInputValue("");
      setIsSending(true);

      try {
        // Send the revision prompt to the backend.
        const result = await sendChatMessage(slug, text);
        if (!mountedRef.current) return;

        // Add the AI's response and applied changes to the chat.
        appendMessage({
          id: nextId(),
          role: "ai",
          statusLines:
            result.applied?.length > 0 ? result.applied : undefined,
          text: result.aiDescription || "Done — take a look at the preview.",
        });

        // Send updated files
        onFilesUpdated?.(result.files);
      } 
      catch (err) {
        if (!mountedRef.current) return;

        // Display a readable error message — never raw JS/runtime text.
        appendMessage({
          id: nextId(),
          role: "ai",
          text: toDisplayErrorMessage(err),
        });
      } 
      finally {
        // Stop after request finished
        if (mountedRef.current) setIsSending(false);
      }
    },
    [inputValue, isSending, appendMessage],
  );

  return {
    messages,
    inputValue,
    setInputValue,
    sendMessage,
    resetMessages,
    appendMessage,
    isSending,
  };
}
