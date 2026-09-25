import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db.js";
import { resumeGenerationBySlug } from "@/controllers/project.controller.js";
import { HttpError } from "@/lib/httpErrors.js";

// Resume rate-limited generation in the background and return immediately.
// The builder polls the project until generation finishes.
export async function POST(req, { params }) {
  try {
    await connectDB();
    const { slug } = await params;
    const { userId } = await auth();
    const project = await resumeGenerationBySlug(slug, userId);
    return Response.json(project);
  } catch (err) {
    if (err instanceof HttpError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    console.error("[POST /api/projects/slug/:slug/resume]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
