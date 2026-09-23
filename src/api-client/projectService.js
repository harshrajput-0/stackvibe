// GET PROJECT LIST
export async function listProjects() {
  const response = await fetch("/api/projects");

  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }

  return response.json();
}

// CREATE PROJECT
export async function createProject(prompt) {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error("Failed to create project");
  }

  return response.json();
}

// GET PROJECT BY SLUG
export async function getProjectBySlug(slug) {
  const response = await fetch(`/api/projects/slug/${slug}`);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.Error || "Failded to fetch the projects");
  }

  return response.json();
}

// Read the server's `{ error }` message off a failed response. The thrown
// Error carries `status` so callers can react to specific cases (e.g. 409).
async function toApiError(response, fallback) {
  const body = await response.json().catch(() => ({}));
  const error = new Error(body.error || fallback);
  error.status = response.status;
  return error;
}

// UPDATE PROJECT DETAILS — send only the fields that changed:
// { name, description, slug, thumbnail }
export async function updateProjectDetails(id, details) {
  const response = await fetch(`/api/projects/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(details),
  });

  if (!response.ok) {
    throw await toApiError(response, "Failed to update the project");
  }

  return response.json();
}

// DELETE PROJECT
export async function deleteProject(id) {
  const response = await fetch(`/api/projects/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw await toApiError(response, "Failed to delete the project");
  }
}
