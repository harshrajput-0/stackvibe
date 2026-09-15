// Sends the revision prompt to the AI pipeline using chatOnProjectBySlug.
// Returns the updated project, including files, messages, description, and more.
export async function sendChatMessage(slug, prompt) {
  const response = fetch(`/api/projects/slug/${slug}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.Error || "Failed to send message");
  }

  return response.json();
}
