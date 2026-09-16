"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sendChatMessage } from "@/api-client/chatService";

let messageIdCounter = 0;
// Generate uniqueId for each message
function nextId() {
  messageIdCounter += 1;
  return `msg-${messageIdCounter}`;
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

        // Diesplay errro message 
        appendMessage({
          id: nextId(),
          role: "ai",
          text: `Something went wrong: ${err.message}`,
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
