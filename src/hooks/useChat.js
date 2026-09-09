"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { INITIAL_CHAT_MESSAGES } from "@/lib/constants";
import { requestAssistantReply } from "@/lib/services/chatService";

let messageIdCounter = 0;
function nextId() {
  messageIdCounter += 1;
  return `msg-${messageIdCounter}`;
}


// Owns the chat panel's message list and input value.
// Delegates the "what does the assistant say back" decision to chatService.

export function useChat(initialMessages = INITIAL_CHAT_MESSAGES) {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const cancelRef = useRef(null);

  useEffect(() => () => cancelRef.current?.(), []);

  const resetMessages = useCallback((next = INITIAL_CHAT_MESSAGES) => {
    setMessages(next);
  }, []);

  const appendMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const sendMessage = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;

    appendMessage({ id: nextId(), role: "user", text });
    setInputValue("");

    cancelRef.current?.();
    cancelRef.current = requestAssistantReply(text, (reply) => {
      appendMessage({
        id: nextId(),
        role: "ai",
        statusLines: [reply.statusLine],
        text: reply.text,
      });
    });
  }, [inputValue, appendMessage]);

  return {
    messages,
    inputValue,
    setInputValue,
    sendMessage,
    resetMessages,
    appendMessage,
  };
}
