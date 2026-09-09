import { CHAT_REPLY_DELAY_MS } from "@/lib/constants";


export function requestAssistantReply(userText, onReply) {
  const timeoutId = setTimeout(() => {
    onReply({
      statusLine: "Updated the page",
      text: "Done — take a look at the preview.",
    });
  }, CHAT_REPLY_DELAY_MS);

  return () => clearTimeout(timeoutId);
}
