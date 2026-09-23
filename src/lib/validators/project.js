import { z } from "zod";
import { slugify } from "@/lib/utils/slugify";

// ===| LIMITERS FOR PROJECT DETAILS |------------------
export const MAX_NAME_LENGTH = 80;
export const MAX_DESCRIPTION_LENGTH = 2000;
export const MAX_SLUG_LENGTH = 60;
export const MAX_THUMBNAIL_LENGTH = 600_000;
export const THUMBNAIL_PATTERN = /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/;

// ===| PROJECT DETAILS SCHEMA |------------------
export const projectDetailsSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(
        MAX_NAME_LENGTH,
        `Title must be ${MAX_NAME_LENGTH} characters or fewer`,
      ),
    description: z
      .string()
      .trim()
      .max(
        MAX_DESCRIPTION_LENGTH,
        `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer`,
      ),
    slug: z
      .string()
      .transform((value) => slugify(value, ""))
      .pipe(
        z
          .string()
          .min(1, "Slug is required")
          .max(
            MAX_SLUG_LENGTH,
            `Slug must be ${MAX_SLUG_LENGTH} characters or fewer`,
          ),
      ),
    thumbnail: z
      .string()
      .max(MAX_THUMBNAIL_LENGTH, "Thumbnail must be under 450 KB")
      .regex(THUMBNAIL_PATTERN, "Thumbnail must be a PNG, JPG or WebP image")
      .nullable(),
  })
  .partial();
