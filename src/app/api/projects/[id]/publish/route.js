import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db.js";
import { publishProject } from "@/controllers/project.controller";
import { HttpError } from "@/lib/httpErrors";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { userId } = await auth();
    const project = await publishProject(id, userId);
    return Response.json(project);
  } catch (err) {
    if (err instanceof HttpError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    console.error("[POST /api/projects/:id/publish]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}