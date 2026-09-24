// Import the function that fetches a project from the backend using its slug.
// This function is used to check the current status of the AI generation.
import { getProjectBySlug } from "./projectService";

const POLL_INTERVAL_MS = 1500;
// As long as the project has one of these statuses, we keep checking
// the backend for updates.
const ACTIVE_STATUSES = ["pending", "generating"];

// Checks the project status repeatedly while AI generation is running.
export function pollProjectGeneration(slug, { onUpdate, onComplete, onLimit, onError }) {
  let cancelled = false;
  let timeoutId; //    Stores the ID returned by setTimeout().

  // Performs one project status check.
  async function tick() {
    if (cancelled) return;

    try {
      const project = await getProjectBySlug(slug);
      if (cancelled) return;

      // Send the latest project data to the caller
      onUpdate?.(project);

      if (project.status === "completed") {
        onComplete?.(project);
        return;
      }

      // The AI's free-model rate limit kicked in — stop polling and let the
      // caller show "AI limit reached" with a Resume action. Progress made
      // so far is already saved on the project.
      if (project.status === "limit") {
        onLimit?.(project);
        return;
      }

      // Check whether the backend reported a generation failure.
      if (project.status === "failed") {
        // Create an Error object containing the backend's error message with fallback
        onError?.(new Error(project.error || "Generation Failed"));
        return;
      }

      // Check whether the project is still being generated.
      if (ACTIVE_STATUSES.includes(project.status)) {
        // setTimeout() returns an ID, which we store so that
        timeoutId = setTimeout(tick, POLL_INTERVAL_MS);
      } else {
        // Any other status
        onComplete?.(project);
      }
    } catch (error) {
      if (!cancelled) onError?.(error);
    }
  }

  tick();

  // Return function to cancel polling
  return function cancel() {
    cancelled = true;
    clearTimeout(timeoutId);
  };
}

// Read the server's `{ error }` message off a failed response.
async function toApiError(response, fallback) {
  const body = await response.json().catch(() => ({}));
  const error = new Error(body.error || fallback);
  error.status = response.status;
  return error;
}

// Resume a generation that stopped on the AI limit. The backend flips the
// project back to an active status and continues in the background — the
// caller should go back to polling (pollProjectGeneration) right after.
export async function resumeProjectGeneration(slug) {
  const response = await fetch(`/api/projects/slug/${slug}/resume`, {
    method: "POST",
  });

  if (!response.ok) {
    throw await toApiError(response, "Failed to resume generation");
  }

  return response.json();
}

// Regenerate a single file that fell back to a placeholder. Resolves with
// the updated project once the file is done — no polling involved.
export async function retryProjectFile(slug, path) {
  const response = await fetch(`/api/projects/slug/${slug}/retry-file`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
  });

  if (!response.ok) {
    throw await toApiError(response, "Failed to retry the file");
  }

  return response.json();
}
