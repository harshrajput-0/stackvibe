import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db.js";
import { resumeGenerationBySlug } from "@/controllers/project.controller.js";
import { HttpError } from "@/lib/httpErrors.js";

// Resume a generation that stopped on an AI limit. Kicks the rest off in
// the background and returns immediately — the builder keeps polling the
// project (same as it does for a fresh build) until it settles again.
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
