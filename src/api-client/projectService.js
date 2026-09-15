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
