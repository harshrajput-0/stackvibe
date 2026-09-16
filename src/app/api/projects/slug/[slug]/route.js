import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db.js";
import { getProjectBySlug } from "@/controllers/project.controller.js";
import { HttpError } from "@/lib/httpErrors.js";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { slug } = await params;
    const { userId } = await auth();
    const project = await getProjectBySlug(slug, userId);
    return Response.json(project);
  } catch (err) {
    if (err instanceof HttpError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    console.error("[GET /api/projects/slug/:slug]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
