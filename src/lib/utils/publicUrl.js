// Public URL path for a project, e.g. "/a3f9c21b/coffee-shop".
// Uses the current slug, so renaming a project updates its URL.
// (Safe to use in the browser — no Node-only imports.)
export function publicPath(project) {
  if (!project) return "";

  if (project.ownerHandle && project.slug) {
    return `/${project.ownerHandle}/${project.slug}`;
  }

  // Old projects that haven't been given a handle yet.
  return `/${project.publicSlug || project.slug || ""}`;
}
