import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db.js";
import {
  getProjectById,
  updateProjectFiles,
  updateProjectDetails,
  deleteProject,
} from "@/controllers/project.controller";
import { HttpError } from "@/lib/httpErrors";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { userId } = await auth();
    const project = await getProjectById(id, userId);
    return Response.json(project);
  } catch (err) {
    if (err instanceof HttpError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    console.error("[GET /api/projects/:id]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { userId } = await auth();
    const { files } = await req.json();
    const project = await updateProjectFiles(id, userId, files);
    return Response.json(project);
  } catch (err) {
    if (err instanceof HttpError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    console.error("[PUT /api/projects/:id]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { userId } = await auth();
    const details = await req.json();
    const project = await updateProjectDetails(id, userId, details);
    return Response.json(project);
  } catch (err) {
    if (err instanceof HttpError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    console.error("[PATCH /api/projects/:id]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { userId } = await auth();
    await deleteProject(id, userId);
    return new Response(null, { status: 204 });
  } catch (err) {
    if (err instanceof HttpError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    console.error("[DELETE /api/projects/:id]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}