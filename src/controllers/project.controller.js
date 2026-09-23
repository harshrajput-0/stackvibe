import mongoose from "mongoose";
import Project from "@/models/project.model.js";
import { slugify } from "@/lib/utils/slugify.js";
import { isReservedSlug } from "@/lib/reservedSlugs.js";
import { projectDetailsSchema } from "@/lib/validators/project.js";
import { hashContent } from "@/lib/utils/hashContent.js";
import { HttpError } from "@/lib/httpErrors.js";
import { generateProject, reviseProject } from "@/lib/generation/ai.js";
import { applyOperations } from "@/lib/generation/diff.js";

function requireUser(userId) {
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }
}

function createProjectName(prompt) {
  const words = prompt
    .trim()
    .split(/\s+/)
    .slice(0, 4);

  const name = words.join(" ");

  return name || "Untitled Project";
}

// Is this slug already used by another of the owner's projects?
async function isSlugTaken(owner, slug, excludeId) {
  const filter = { owner, slug };
  if (excludeId) filter._id = { $ne: excludeId };
  return Boolean(await Project.exists(filter));
}

// Is this slug already used by a *published* site (owned by anyone)?
//
// Slugs only have to be unique per owner while a project is a draft
// (see isSlugTaken above). But a published site is reached at
// stackvibe.vercel.app/<slug> for the whole world, so two published sites
// can never share a slug. `excludeId` lets a project ignore itself.
async function isPublishedSlugTaken(slug, excludeId) {
  const filter = { slug, published: true };
  if (excludeId) filter._id = { $ne: excludeId };
  return Boolean(await Project.exists(filter));
}

// Throws an error if `slug` can't be used as a public URL.
// Used when publishing a site and when changing a project's URL.
async function assertSlugIsAvailableForPublic(slug, projectId) {
  if (isReservedSlug(slug)) {
    throw new HttpError(
      400,
      "That URL is reserved. Pick a different one in the project details.",
    );
  }

  if (await isPublishedSlugTaken(slug, projectId)) {
    throw new HttpError(
      409,
      "That URL is already used by another published site. Pick a different one in the project details.",
    );
  }
}

// Slug for a new project: "coffee-shop", then "coffee-shop-2", "-3", …
async function createUniqueSlug(owner, name) {
  const base = slugify(name);
  let slug = base;
  for (let attempt = 2; await isSlugTaken(owner, slug); attempt++) {
    slug = `${base}-${attempt}`;
  }
  return slug;
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

  if (!prompt || !prompt.trim()) {
    throw new HttpError(400, "Prompt is required!");
  }

  // Generating slug from prompt
  const name = createProjectName(prompt);
  const slug = await createUniqueSlug(userId, name);

  // Create the project in DB immediately with "pending" status
const project = await Project.create({
  name,
  slug,
  description: prompt,
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

  // Kick off generation in the background 
  //
  //
  runBackgroundGeneration(project._id.toString(), prompt).catch((err) => {
    console.error(
      `[Assistant] Unable to generate the project ${project._id}:`,
      err,
    );
  });

  return {
    _id: project._id,
    name: project.name,
    slug: project.slug,
    description: project.description,
    files: project.files,
    messages: project.messages,
    version: project.version,
    status: project.status,
    filesPlanned: project.filesPlanned,
    filesGenerated: project.filesGenerated,
  };
}

// Background AI generation job
export async function runBackgroundGeneration(projectId, prompt) {
  try {
    console.log(`[Assistant]: Start Generation for project ${projectId}`);

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

      onFileStart: async (path) => {
        console.log(`[Assistant] Starting file ${path} for project ${projectId}`);

        await Project.findByIdAndUpdate(projectId, {
          currentFile: path,
        })
      },

      // FIXED: this condition was inverted (`if (!project)`), which meant
      // generated file content never got saved on the normal/happy path,
      // and threw on `project.files` when the project genuinely wasn't found.
      onFileComplete: async (path, code) => {
        console.log(`[Assistant] Finished file ${path} for project ${projectId}`);

        const project = await Project.findById(projectId);

        if (project) {
          project.files = project.files || {};
          project.files[path] = { content: code, hash: hashContent(code) };
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
      project.status = "completed";
      project.version = 1;
      if (result.description) {
        project.name = result.description;
      }

      project.messages.push({
        role: "assistant",
        content: "Website generated successfully! You can view and edit files now",
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
    {
      name: 1,
      slug: 1,
      description: 1,
      thumbnail: 1,
      version: 1,
      createdAt: 1,
      updatedAt: 1,
    },
  ).sort({ updatedAt: -1 });
}

function serializeProject(project) {
  return {
    _id: project._id,
    name: project.name,
    slug: project.slug,
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
    published: project.published,
  };
};

// Get project details
export async function getProjectById(id, userId) {
  requireUser(userId);

  const project = await Project.findOne({ _id: id, owner: userId });

  if (!project) {
    throw new HttpError(404, "Project not found");
  }

  return serializeProject(project);
}

//
//
export async function getProjectBySlug(slug, userId) {
  requireUser(userId);

  const project = await Project.findOne({ slug, owner: userId });

  if (!project) {
    throw new HttpError(404, "Project not found");
  }

  return serializeProject(project);
}

// Delete a project
export async function deleteProject(id, userId) {
  requireUser(userId);

  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(404, "Project not found");
  }

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

// Publish a project: after this, anyone can visit it at
// stackvibe.vercel.app/<slug> (see src/app/[slug]/page.js).
export async function publishProject(id, userId) {
  requireUser(userId);

  // An id that isn't a valid Mongo id can never match a project.
  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(404, "Project not found");
  }

  // Step 1: find the user's own project (we only need its slug here).
  const existing = await Project.findOne({ _id: id, owner: userId }).select(
    "slug",
  );

  if (!existing) {
    throw new HttpError(404, "Project not found");
  }

  // Step 2: make sure the slug is allowed to be public
  // (not a reserved word, not used by someone else's published site).
  await assertSlugIsAvailableForPublic(existing.slug, id);

  // Step 3: flip the switch. From now on the public page can find it.
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
    slug: project.slug,
    description: project.description,
    version: project.version,
    published: project.published,
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


export async function getPublicProjectBySlug(slug) {
  const project = await Project.findOne({ slug, published: true });

  if (!project) {
    throw new HttpError(404, "Site not found");
  }

  // Only send what the public page needs. Never send the owner's id,
  // the chat history, etc.
  return {
    name: project.name,
    description: project.description,
    files: filesToObject(project.files),
  };
}

// Build a compact manifest (path + hash + size) instead of sending full
// file contents — used to give the AI a cheap overview of the project.
export function buildManifest(files) {
  const manifest = [];

  for (const [path, entry] of Object.entries(files || {})) {
    manifest.push({ path, hash: entry.hash, size: entry.content.length });
  }
  return manifest;
}

// Send a revision prompt and apply the AI's resulting operations
export async function chatOnProject(id, userId, prompt) {
  requireUser(userId);

  if (!prompt || typeof prompt !== "string") {
    throw new HttpError(400, "Prompt is required");
  }

  const project = await Project.findOne({ _id: id, owner: userId });

  if (!project) {
    throw new HttpError(404, "Project not found");
  }

  return reviseAndSave(project, prompt);
}

async function reviseAndSave(project, prompt) {  
  // Set status to revising and save the user's prompt immediately
  project.status = "revising";
  project.messages.push({
    role: "user",
    content: prompt,
    timestamp: new Date(),
  });
  await project.save();

  try {
    // Build compact manifest (path + hash + size) instead of sending all code
    const manifest = buildManifest(project.files);

    const relevantFiles = {};
    for (const [path, entry] of Object.entries(project.files || {})) {
      relevantFiles[path] = entry.content;
    }

    // Recent messages for context
    const recentMessages = project.messages.slice(-4).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    console.log(
      `Revising project ${project._id}: "${prompt.slice(0, 80)}..." (${manifest.length} files)`,
    );

    // Call AI with manifest + relevant files
    const result = await reviseProject(
      prompt,
      manifest,
      relevantFiles,
      recentMessages,
    );

    console.log(
      `[Assistant] got ${result.operations.length} operations: ${result.description}`,
    );

    // Apply operations on file map
    const { files: updatedFiles, applied, errors } = applyOperations(
      project.files,
      result.operations,
    );

    if (errors.length > 0) {
      console.log(`[Diff] Error applying operations:`, errors);
    }

    // Update project in DB
    project.files = updatedFiles;
    project.markModified("files");
    project.version += 1;
    project.status = "completed";
    project.messages.push({
      role: "assistant",
      content:
        result.description +
        (errors.length > 0
          ? `\n\nSome operations failed: ${errors.join(", ")}`
          : ""),
      timestamp: new Date(),
    });

    await project.save();

    // Return the updated project
    const filesObj = {};
    for (const [path, entry] of Object.entries(project.files)) {
      filesObj[path] = entry.content;
    }

    return {
      _id: project._id,
      name: project.name,
      slug: project.slug,
      description: project.description,
      files: filesObj,
      messages: project.messages,
      version: project.version,
      status: project.status,
      applied,
      errors,
      aiDescription: result.description,
    };
  } catch (error) {
    console.error(`[AI Revision Error] ${error.message}`);

    await Project.findByIdAndUpdate(project._id, {
      status: "failed",
      error: error.message,
    });

    throw new HttpError(500, error.message || "Failed to process revision request");
  }
}



// Same as chatOnProject, but looks the project up by slug — this is what
// the builder page (slug-routed) actually calls.
export async function chatOnProjectBySlug(slug, userId, prompt) {
  requireUser(userId);

  if (!prompt || typeof prompt !== "string") {
    throw new HttpError(400, "Prompt is required");
  }

  const project = await Project.findOne({ slug, owner: userId });

  if (!project) {
    throw new HttpError(404, "Project not found");
  }

  return reviseAndSave(project, prompt);
}



// Update a project's name, description, URL slug and/or thumbnail.
// Only the fields present in `details` are validated and changed.
export async function updateProjectDetails(id, userId, details) {
  requireUser(userId);

  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(404, "Project not found");
  }

  // Same schema the edit dialog uses. Unknown fields are dropped.
  const parsed = projectDetailsSchema.safeParse(details ?? {});
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0].message);
  }

  const updates = parsed.data;

  if (updates.slug && (await isSlugTaken(userId, updates.slug, id))) {
    throw new HttpError(409, "That URL is already used by another project");
  }


  if (updates.slug) {
    await assertSlugIsAvailableForPublic(updates.slug, id);
  }

  if (Object.keys(updates).length === 0) {
    throw new HttpError(400, "Nothing to update");
  }

  const project = await Project.findOneAndUpdate(
    { _id: id, owner: userId },
    { $set: updates },
    { returnDocument: "after" },
  );

  if (!project) {
    throw new HttpError(404, "Project not found");
  }

  return {
    _id: project._id,
    name: project.name,
    slug: project.slug,
    description: project.description,
    thumbnail: project.thumbnail,
    version: project.version,
    updatedAt: project.updatedAt,
  };
}