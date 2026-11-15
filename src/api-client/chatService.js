// Sends the revision prompt to the AI pipeline using chatOnProjectBySlug.
// Returns the updated project, including files, messages, description, and more.
export async function sendChatMessage(slug, prompt) {
  const response = await fetch(`/api/projects/slug/${slug}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "Failed to send message");
  }

  try {
    return await response.json();
  } catch {
    throw new Error("Received an unexpected response from the server.");
  }
}
