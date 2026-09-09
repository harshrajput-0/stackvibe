// Generates a short project name from the first few words of the user's prompt
// Fallbact to "New site" when the prompt is empty.

export function deriveProjectName(promptText) {
  if (!promptText || !promptText.trim()) return "New site";
  const words = promptText.trim().split(/\s+/).slice(0, 3).join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
