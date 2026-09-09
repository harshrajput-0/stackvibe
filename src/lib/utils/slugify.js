// Converts a project name into a URL-safe slug.
// For example, "Coffee Shop" becomes "coffee-shop".

export function slugify(value) {
  const slug = (value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || "site";
}
