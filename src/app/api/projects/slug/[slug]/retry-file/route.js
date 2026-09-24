import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db.js";
import { retryFileBySlug } from "@/controllers/project.controller.js";
import { HttpError } from "@/lib/httpErrors.js";

// Regenerate a single file that fell back to a placeholder. Runs
// synchronously (it's one file) and returns the updated project straight
// away — no polling needed for this one.
export async function POST(req, { params }) {
  try {
    await connectDB();
    const { slug } = await params;
    const { userId } = await auth();
    const { path } = await req.json();
    const project = await retryFileBySlug(slug, userId, path);
    return Response.json(project);
  } catch (err) {
    if (err instanceof HttpError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    console.error("[POST /api/projects/slug/:slug/retry-file]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
