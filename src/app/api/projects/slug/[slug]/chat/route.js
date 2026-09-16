import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db.js";
import { chatOnProjectBySlug } from "@/controllers/project.controller.js";
import { HttpError } from "@/lib/httpErrors.js";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { slug } = await params;
    const { userId } = await auth();
    const { prompt } = await req.json();
    const result = await chatOnProjectBySlug(slug, userId, prompt);
    return Response.json(result);
  } catch (err) {
    if (err instanceof HttpError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    console.error("[POST /api/projects/slug/:slug/chat]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}