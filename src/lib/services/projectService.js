import { MOCK_PROJECTS, DEFAULT_SITE_HERO } from "@/lib/constants";
import { slugify } from "@/lib/utils/slugify";

// Mock Project Data

export function listProjects() {
  return MOCK_PROJECTS;
}

export function getProjectBySlug(slug) {
  return MOCK_PROJECTS.find((project) => slugify(project.name) === slug) || null;
}

export function getProjectHero(slug) {
  const project = getProjectBySlug(slug);
  return project?.hero ?? DEFAULT_SITE_HERO;
}
