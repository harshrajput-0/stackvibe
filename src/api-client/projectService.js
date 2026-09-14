import { MOCK_PROJECTS, DEFAULT_SITE_HERO } from "@/lib/constants";
import { slugify } from "@/lib/utils/slugify";

// Mock Project Data

export async function listProjects() {
  const response = await fetch("api/projects");

  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }

  return response.json();
}


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

export function getProjectBySlug(slug) {
  return (
    MOCK_PROJECTS.find((project) => slugify(project.name) === slug) || null
  );
}

export function getProjectHero(slug) {
  const project = getProjectBySlug(slug);
  return project?.hero ?? DEFAULT_SITE_HERO;
}
