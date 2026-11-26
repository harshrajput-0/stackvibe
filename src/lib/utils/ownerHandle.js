import crypto from "crypto";

// Generates a short, stable prefix for a user's public URLs.
// Clerk user ID -> "a3f9c21b"
// Public URL   -> stackvibe.vercel.app/a3f9c21b/coffee-shop
//
// To let different user have same project slug
export function getOwnerHandle(userId) {
  return crypto
    .createHash("sha1")
    .update(String(userId))
    .digest("hex")
    .slice(0, 8);
}
