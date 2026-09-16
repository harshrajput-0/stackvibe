// Import the function that fetches a project from the backend using its slug.
// This function is used to check the current status of the AI generation.
import { getProjectBySlug } from "./projectService";

const POLL_INTERVAL_MS = 1500;
// As long as the project has one of these statuses, we keep checking
// the backend for updates.
const ACTIVE_STATUSES = ["pending", "generating"];

// Checks the project status repeatedly while AI generation is running.
export function pollProjectGeneration(slug, { onUpdate, onComplete, onError }) {
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
