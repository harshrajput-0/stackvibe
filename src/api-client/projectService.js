// Read the server's `{ error }` message off a failed response. The thrown
// Error carries `status` so callers can react to specific cases (e.g. 409).
async function toApiError(response, fallback) {
  const body = await response.json().catch(() => ({}));
  const error = new Error(body.error || fallback);
  error.status = response.status;
  return error;
}

// GET PROJECT LIST
export async function listProjects() {
  const response = await fetch("/api/projects");

  if (!response.ok) {
    throw await toApiError(response, "Failed to fetch projects");
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
    throw await toApiError(response, "Failed to create project");
  }

  return response.json();
}

// GET PROJECT BY SLUG
export async function getProjectBySlug(slug) {
  const response = await fetch(`/api/projects/slug/${slug}`);

  if (!response.ok) {
    throw await toApiError(response, "Failed to fetch the project");
  }

  return response.json();
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

// SAVE EDITED FILES — replaces the project's entire files map, so the
// caller must send the full current file set (edited + untouched), not
// just the files that changed.
export async function updateProjectFiles(id, files) {
  const response = await fetch(`/api/projects/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ files }),
  });

  if (!response.ok) {
    throw await toApiError(response, "Failed to save changes");
  }

  return response.json();
}

// PUBLISH PROJECT
export async function publishProject(id) {
  const response = await fetch(`/api/projects/${id}/publish`, {
    method: "POST",
  });

  if (!response.ok) {
    throw await toApiError(response, "Failed to publish the project");
  }

  return response.json();
}