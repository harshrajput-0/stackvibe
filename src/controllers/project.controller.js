import Project from "@/models/project.model.js";
import { hashContent } from "@/lib/utils/hashContent.js";
import { HttpError } from "@/lib/httpErrors.js";
import { generateProject } from "@/lib/generation/ai";

function requireUser(userId) {
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }
}

function filesToObject(files) {
  const filesObj = {};
  for (const [path, entry] of Object.entries(files || {})) {
    filesObj[path] = entry.content;
  }
  return filesObj;
}

// Create a new project from a prompt
export async function createProject(userId, prompt) {
  requireUser(userId);

  if (!prompt) {
    throw new HttpError(400, "Prompt is required!");
  }

  // Create the project in DB immediately with "pending" status
  const project = await Project.create({
    name: "Planning Project...",
    files: {},
    messages: [
      { role: "user", content: prompt },
      { role: "assistant", content: "Planning the project..." },
    ],
    version: 0,
    owner: userId,
    status: "pending",
    filesPlanned: [],
    filesGenerated: [],
    currentFile: null,
    error: null,
  });

  // Kick off generation in the background; failures are logged, not awaited
  runBackgroundGeneration(project._id.toString(), prompt).catch((err) => {
    console.error(
      `[Assistant] Unable to generate the project ${project._id}:`,
      err,
    );
  });

  return {
    _id: project._id,
    name: project.name,
    description: project.description,
    files: {},
    messages: project.messages,
    version: project.version,
    status: project.status,
    filesPlanned: project.filesPlanned,
    filesGenerated: project.filesGenerated,
  };
}

// Background AI generation job. Not yet implemented.
export async function runBackgroundGeneration(projectId, prompt) {
  try {
    console.log(`[Aissistant]: Start Generation for project ${projectId}`);

    const result = await generateProject(prompt, {
      onPlan: async (plan) => {
        console.log(`[Assistant] Plan created for the project ${projectId}.
          Planned ${plan.files.length} files`);
          
          const fileList = plan.files.map((f) => `- \`${f.path}\`: ${f.description}`).join("\n");

          await Project.findByIdAndUpdate(projectId, {
            name: plan.projectName || "Generated Project",
            status: "generating",
            filesPlanned: plan.files,
            $push: {
              messages: {
                role: "assistant",
                content: `Planned website structure:\n${fileList}`,
                timestamp: new Date(),
              }
            }
          })
      },


      onFileStart: async(path) => {
        console.log(`[Assistant] Starting file ${path} for project ${projectId}`);

        await Project.findByIdAndUpdate(projectId, {
          currentFile: path,
        })
      },

      onFileComplete: async (path, code) => {
        console.log(`[Assistant] Finished files ${path} for project ${projectId}`);

        const project = await Project.findById(projectId);

        if (!project) {
          project.files = project.files || {};
          project.files[path] = { content: code, hash: hashContent(code)};
          project.filesGenerated = [...(project.filesGenerated || []), path];
          project.messages.push({
            role: "assistant",
            content: `Created file "${path}"`,
            timestamp: new Date(),
          });
          project.currentFile = null;
          project.markModified("files");
          await project.save();
        }
      }
    })

    console.log(`[Assistant] Successfully generated project ${projectId}`);

    const project = await Project.findById(projectId);

    if (project) {
      project.status = "completed",
      project.version = 1;
      if (result.description) {
        project.name = result.description;
      }

      project.messages.push({
        role: "assistant",
        content: "Website generated sucessfully! You can view and edit files now",
        timestamp: new Date(),
      })
      await project.save();
    }
  } catch (error) {
    console.error(`[Assistant] Cannot generate files for project ${projectId}:`, error);

    await Project.findByIdAndUpdate(projectId, {
      status: "failed",
      error: error.message,
      $push: {
        messages: {
          role: "assistant",
          content: `Generation failed: ${error.message}`,
          timestamp: new Date(),
        }
      }
    })
  }
}

// List all projects owned by the user
export async function listProjects(userId) {
  requireUser(userId);

  return Project.find(
    { owner: userId },
    { name: 1, description: 1, version: 1, createdAt: 1, updatedAt: 1 },
  ).sort({ updatedAt: -1 });
}

// Get project details
export async function getProjectById(id, userId) {
  requireUser(userId);

  const project = await Project.findOne({ _id: id, owner: userId });

  if (!project) {
    throw new HttpError(404, "Project not found");
  }

  return {
    _id: project._id,
    name: project.name,
    description: project.description,
    files: filesToObject(project.files),
    messages: project.messages,
    version: project.version,
    status: project.status,
    filesPlanned: project.filesPlanned,
    filesGenerated: project.filesGenerated,
    currentFile: project.currentFile,
    error: project.error,
    createdAt: project.createdAt,
  };
}

// Delete a project
export async function deleteProject(id, userId) {
  requireUser(userId);

  const result = await Project.findOneAndDelete({ _id: id, owner: userId });

  if (!result) {
    throw new HttpError(404, "Project not found");
  }

  return { _id: id };
}

// Overwrite a project's files
export async function updateProjectFiles(id, userId, files) {
  requireUser(userId);

  if (!files || typeof files !== "object") {
    throw new HttpError(400, "Files object is required");
  }

  const project = await Project.findOne({ _id: id, owner: userId });

  if (!project) {
    throw new HttpError(404, "Project not found");
  }

  // Rebuild the project's files map with content + hashes
  const newFiles = {};
  for (const [path, content] of Object.entries(files)) {
    if (typeof content === "string") {
      newFiles[path] = { content, hash: hashContent(content) };
    }
  }

  project.files = newFiles;
  await project.save();

  return {
    _id: project._id,
    name: project.name,
    description: project.description,
    files: filesToObject(project.files),
    messages: project.messages,
    version: project.version,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

// Publish a project
export async function publishProject(id, userId) {
  requireUser(userId);

  const project = await Project.findOneAndUpdate(
    { _id: id, owner: userId },
    { published: true },
    { returnDocument: "after" },
  );

  if (!project) {
    throw new HttpError(404, "Project not found");
  }

  return {
    _id: project._id,
    name: project.name,
    description: project.description,
    version: project.version,
  };
}

// Get a publicly published project (no auth required)
export async function getPublicProject(id) {
  const project = await Project.findById(id);

  if (!project) {
    throw new HttpError(404, "Project not found");
  }

  if (!project.published) {
    throw new HttpError(403, "Project is not published");
  }

  return {
    _id: project._id,
    name: project.name,
    description: project.description,
    files: filesToObject(project.files),
    version: project.version,
  };
}
