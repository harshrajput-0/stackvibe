import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { chatOnProject } from "@/controllers/project.controller";
import { HttpError } from "@/lib/httpErrors";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { userId } = await auth();
    const { prompt } = await req.json();
    const result = await chatOnProject(id, userId, prompt);
    return Response.json(result);
  } catch (err) {
    if (err instanceof HttpError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    console.error("[POST /api/projects/:id/chat]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}