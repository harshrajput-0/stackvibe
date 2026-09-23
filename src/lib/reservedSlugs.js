const RESERVED_SLUGS = new Set([
  // Our own pages and API
  "api",
  "builder",
  "dashboard",
  "sign-in",
  "sign-up",
  "sso-callback",
  "login",
  "logout",
  "signin",
  "signup",

  // Pages we'll probably add later
  "about",
  "admin",
  "blog",
  "contact",
  "docs",
  "help",
  "pricing",
  "privacy",
  "settings",
  "support",
  "terms",

  // Names that could confuse people (or look official)
  "app",
  "assets",
  "public",
  "static",
  "stackvibe",
  "www",
]);

// Returns true when `slug` can't be used as a published site's URL.
export function isReservedSlug(slug) {
  return RESERVED_SLUGS.has(slug);
}