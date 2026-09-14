import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db.js";
import {
  createProject,
  listProjects,
} from "@/controllers/project.controller.js";
import { HttpError } from "@/lib/httpErrors.js";

export async function GET() {
  try {
    await connectDB();
    const { userId } = await auth();
//     console.log("Clerk userId:", userId);
    const projects = await listProjects(userId);
    return Response.json(projects);
  } catch (err) {
    if (err instanceof HttpError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    console.error("[GET /api/projects]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { userId } = await auth();
    const { prompt } = await req.json();
    const project = await createProject(userId, prompt);
    return Response.json(project, { status: 201 });
  } catch (err) {
    if (err instanceof HttpError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    console.error("[POST /api/projects]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
