import crypto from "crypto";

export function hashContent(content) {
  return crypto.createHash("md5").update(content).digest("hex").slice(0, 12);
}
