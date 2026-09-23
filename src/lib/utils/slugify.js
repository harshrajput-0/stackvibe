// Converts a project name into a URL-safe slug.
// For example, "Coffee Shop" becomes "coffee-shop".

export function slugify(value, fallback = "site") {
  const slug = (value || "")
    .toLowerCase()
    .trim()
    .replace(/['\u2019]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || fallback;
}




export function sanitizeSlugInput(value) {
  return (value || "")
    .toLowerCase()
    .replace(/['\u2019]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "");
}