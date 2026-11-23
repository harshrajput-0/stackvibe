import mongoose from "mongoose";
import crypto from "crypto";
import Project from "@/models/project.model.js";
import { slugify } from "@/lib/utils/slugify.js";
import { isReservedSlug } from "@/lib/reservedSlugs.js";
import { projectDetailsSchema } from "@/lib/validators/project.js";
import { hashContent } from "@/lib/utils/hashContent.js";
import { HttpError } from "@/lib/httpErrors.js";
import {
  generateProject,
  generateRemainingFiles,
  generateSingleFile,
  isRateLimitError,
  reviseProject,
} from "@/lib/generation/ai.js";
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

// Check whether this PUBLIC slug is already used by any published site.
// `excludeId` lets the current project ignore itself (e.g. on republish).
async function isPublicSlugTaken(publicSlug, excludeId) {
  const filter = { publicSlug, published: true };
  if (excludeId) filter._id = { $ne: excludeId };
  return Boolean(await Project.exists(filter));
}

// Short, stable, per-owner suffix. Two different users can both have a
// project named "Coffee Shop" (and both keep that as their private slug) —
// this only kicks in to disambiguate the public URL, so it doesn't need to
// be secret, just short and consistent for the same owner.
function ownerSuffix(owner) {
  return crypto.createHash("sha1").update(String(owner)).digest("hex").slice(0, 6);
}

// Build a public slug that's guaranteed unique across ALL users' published
// sites, starting from the project's own (per-owner-unique) slug:
//   "coffee-shop"            — free, use as-is
//   "coffee-shop-4f9a2c"     — taken, so disambiguate with the owner's suffix
//   "coffee-shop-4f9a2c-2"   — even that's taken (rare), number it
// Republishing the same project keeps whatever publicSlug it already has.
async function createUniquePublicSlug(baseSlug, owner, excludeId) {
  if (!(await isPublicSlugTaken(baseSlug, excludeId))) return baseSlug;

  const withOwner = `${baseSlug}-${ownerSuffix(owner)}`;
  let slug = withOwner;
  for (let attempt = 2; await isPublicSlugTaken(slug, excludeId); attempt++) {
    slug = `${withOwner}-${attempt}`;
  }
  return slug;
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

// Shared progress callbacks for fresh builds and resumes to track the plan,
// current file, and generated file content.
function makeGenerationCallbacks(projectId) {
  return {
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

    // FIXED: The condition was inverted, so successful generations weren't saved
// and missing projects caused an error when accessing `project.files`.
    onFileComplete: async (path, code) => {
      console.log(`[Assistant] Finished file ${path} for project ${projectId}`);

      // Files generate concurrently (MAX_CONCURRENCY), so several
      // onFileComplete calls can be in flight at once. A read-mutate-save
      // here would race: two calls reading the same snapshot and saving
      // back would make the later save silently clobber the earlier one's
      // appended message, which splits what should be one contiguous run
      // of "Created file" messages into two — rendering as two separate
      // "Created N files" bubbles. Use one atomic update per file instead,
      // so concurrent completions can never overwrite each other.
      //
      // Note: file paths contain dots (e.g. "/components/Footer.js"), so a
      // classic `$set: {[`files.${path}`]: ...}` would be misread by Mongo
      // as nested fields split on every ".". $setField takes `field` as a
      // literal key instead, which is what we need here (requires Mongo 5+).
      // Mongoose 9 requires opting in to pipeline-style updates (an array
      // as the update argument) via `updatePipeline: true` — otherwise it
      // throws "Cannot pass an array to query updates unless the
      // `updatePipeline` option is set." See:
      // https://mongoosejs.com/docs/migrating_to_9.html#update-pipelines-disallowed-by-default
      await Project.findByIdAndUpdate(
        projectId,
        [
          {
            $set: {
              files: {
                $setField: {
                  field: path,
                  input: { $ifNull: ["$files", {}] },
                  value: { content: code, hash: hashContent(code) },
                },
              },
              filesGenerated: {
                $concatArrays: [{ $ifNull: ["$filesGenerated", []] }, [path]],
              },
              messages: {
                $concatArrays: [
                  "$messages",
                  [
                    {
                      role: "assistant",
                      content: `Created file "${path}"`,
                      timestamp: new Date(),
                    },
                  ],
                ],
              },
              currentFile: null,
            },
          },
        ],
        { updatePipeline: true },
      );
    }
  };
}

// Save the rate-limited state while keeping completed files untouched,
// so Resume can continue from where generation stopped.
async function markGenerationLimited(projectId, remainingCount) {
  await Project.findByIdAndUpdate(projectId, {
    status: "limit",
    currentFile: null,
    $push: {
      messages: {
        role: "assistant",
        content:
          remainingCount > 0
            ? `AI limit reached. ${remainingCount} file${remainingCount === 1 ? "" : "s"} still need${remainingCount === 1 ? "s" : ""} to be written — resume building once the limit clears.`
            : "AI limit reached while planning the project. Resume building once the limit clears.",
        timestamp: new Date(),
      },
    },
  });
}

// Save the completed generation and track files that fell back to
// placeholders so the builder can show incomplete files with retry actions.
async function markGenerationComplete(projectId, result) {
  const project = await Project.findById(projectId);
  if (!project) return;

  const total = project.filesPlanned?.length || 0;
  const failedFiles = result.failedFiles || [];

  project.status = "completed";
  project.version = project.version || 1;
  project.filesFailed = failedFiles;
  if (result.description) {
    project.name = result.description;
  }

  project.messages.push({
    role: "assistant",
    content:
      failedFiles.length > 0
        ? `Built ${total - failedFiles.length} of ${total} files. ${failedFiles.length} couldn't be generated and use a placeholder for now — you can retry them individually.`
        : "Website generated successfully! You can view and edit files now",
    timestamp: new Date(),
  });
  await project.save();
}

// Persist a hard failure (not a rate limit, not a per-file fallback — the
// whole run threw, e.g. no App.js could be produced at all).
async function markGenerationFailed(projectId, error) {
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

// Background AI generation job
export async function runBackgroundGeneration(projectId, prompt) {
  try {
    console.log(`[Assistant]: Start Generation for project ${projectId}`);

    const result = await generateProject(prompt, makeGenerationCallbacks(projectId));

    if (result.limited) {
      await markGenerationLimited(projectId, result.pendingFiles?.length || 0);
      return;
    }

    console.log(`[Assistant] Successfully generated project ${projectId}`);
    await markGenerationComplete(projectId, result);
  } catch (error) {
    if (error.isRateLimit || isRateLimitError(error)) {
      await markGenerationLimited(projectId, 0);
      return;
    }
    await markGenerationFailed(projectId, error);
  }
}

// Continue a rate-limited generation in the background by generating only
// missing files, or restarting the plan if no plan was created yet.
export async function runBackgroundResume(projectId, prompt) {
  try {
    const project = await Project.findById(projectId);
    if (!project) return;

    const hasPlan = (project.filesPlanned || []).length > 0;

    let result;
    if (!hasPlan) {
      result = await generateProject(prompt, makeGenerationCallbacks(projectId));
    } else {
      const alreadyGenerated = {};
      for (const [path, entry] of Object.entries(project.files || {})) {
        alreadyGenerated[path] = entry.content;
      }
      const generatedSet = new Set(project.filesGenerated || []);
      const pending = project.filesPlanned.filter((f) => !generatedSet.has(f.path));

      result = await generateRemainingFiles(
        prompt,
        project.filesPlanned,
        alreadyGenerated,
        pending,
        makeGenerationCallbacks(projectId),
      );
    }

    if (result.limited) {
      await markGenerationLimited(projectId, result.pendingFiles?.length || 0);
      return;
    }

    console.log(`[Assistant] Resumed generation complete for project ${projectId}`);
    await markGenerationComplete(projectId, result);
  } catch (error) {
    if (error.isRateLimit || isRateLimitError(error)) {
      await markGenerationLimited(projectId, 0);
      return;
    }
    await markGenerationFailed(projectId, error);
  }
}

// Resume generation after an AI limit by restarting the project and
// continuing the remaining files in the background.
export async function resumeGenerationBySlug(slug, userId) {
  requireUser(userId);

  const project = await Project.findOne({ slug, owner: userId });
  if (!project) {
    throw new HttpError(404, "Project not found");
  }

  // "limit" = rate-limited partway through, resumes the remaining files.
  // "failed" = the run threw outright (often the same underlying cause,
  // just not always classified as a rate limit) — runBackgroundResume
  // already restarts cleanly from scratch when there's no saved plan, so
  // it's safe to retry from here too.
  if (project.status !== "limit" && project.status !== "failed") {
    throw new HttpError(
      400,
      "This project isn't waiting on the AI limit or a failed build.",
    );
  }

  project.status = (project.filesPlanned || []).length > 0 ? "generating" : "pending";
  await project.save();

  runBackgroundResume(project._id.toString(), project.description).catch((err) => {
    console.error(`[Assistant] Unable to resume generation for project ${project._id}:`, err);
  });

  return serializeProject(project);
}

// Regenerate a single placeholder file and return the updated project immediately.
export async function retryFileBySlug(slug, userId, path) {
  requireUser(userId);

  if (!path || typeof path !== "string") {
    throw new HttpError(400, "File path is required");
  }

  const project = await Project.findOne({ slug, owner: userId });
  if (!project) {
    throw new HttpError(404, "Project not found");
  }

  const plannedFile = (project.filesPlanned || []).find((f) => f.path === path);
  if (!plannedFile) {
    throw new HttpError(404, "That file isn't part of this project's plan");
  }

  const alreadyGenerated = {};
  for (const [p, entry] of Object.entries(project.files || {})) {
    if (p !== path) alreadyGenerated[p] = entry.content;
  }

  try {
    const singleResult = await generateSingleFile(
      plannedFile,
      project.filesPlanned,
      project.description,
      alreadyGenerated,
    );

    project.files = project.files || {};
    project.files[path] = {
      content: singleResult.code,
      hash: hashContent(singleResult.code),
    };
    project.filesFailed = (project.filesFailed || []).filter((p) => p !== path);
    if (!(project.filesGenerated || []).includes(path)) {
      project.filesGenerated = [...(project.filesGenerated || []), path];
    }
    project.messages.push({
      role: "assistant",
      content: `Retried "${path}" — generated successfully.`,
      timestamp: new Date(),
    });
    project.markModified("files");
    await project.save();

    return serializeProject(project);
  } catch (error) {
    if (isRateLimitError(error)) {
      throw new HttpError(429, "AI limit reached. Try retrying this file again shortly.");
    }
    console.error(`[Assistant] Retry failed for ${path} on project ${project._id}:`, error);
    throw new HttpError(500, error.message || "Failed to regenerate the file");
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
      published: 1,
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
    publicSlug: project.publicSlug,
    description: project.description,
    files: filesToObject(project.files),
    messages: project.messages,
    version: project.version,
    status: project.status,
    filesPlanned: project.filesPlanned,
    filesGenerated: project.filesGenerated,
    filesFailed: project.filesFailed,
    currentFile: project.currentFile,
    error: project.error,
    createdAt: project.createdAt,
    published: project.published,
    thumbnail: project.thumbnail,
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
    "slug publicSlug",
  );

  if (!existing) {
    throw new HttpError(404, "Project not found");
  }

  if (isReservedSlug(existing.slug)) {
    throw new HttpError(
      400,
      "That URL is reserved. Pick a different one in the project details.",
    );
  }

  // Step 2: resolve the public URL. If this project already has one (e.g.
  // a republish), keep it — otherwise derive one from the slug, automatically
  // disambiguating it from anyone else's project with the same name.
  const publicSlug =
    existing.publicSlug ||
    (await createUniquePublicSlug(existing.slug, userId, id));

  // Step 3: flip the switch. From now on the public page can find it.
  const project = await Project.findOneAndUpdate(
    { _id: id, owner: userId },
    { published: true, publicSlug },
    { returnDocument: "after" },
  );

  if (!project) {
    throw new HttpError(404, "Project not found");
  }

  return {
    _id: project._id,
    name: project.name,
    slug: project.slug,
    publicSlug: project.publicSlug,
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
  // Published sites are looked up by their `publicSlug`. The `slug` branch
  // here is only a fallback for projects published before `publicSlug`
  // existed (where it was never set and the private slug doubled as the
  // public one) — keeps their old links working.
  const project = await Project.findOne({
    published: true,
    $or: [{ publicSlug: slug }, { publicSlug: null, slug }],
  });

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

    // Only send full content for files the prompt actually mentions by name
    // (or, if nothing matches, a small fallback set) — sending every file's
    // full content on every revision bloats the request and makes the AI
    // gateway far more likely to time out mid-response, which is what
    // produces the "Invalid JSON response" error (a truncated/non-JSON
    // HTTP body, not a bad AI answer).
    const allPaths = Object.keys(project.files || {});
    const mentioned = allPaths.filter((path) => {
      const base = path.split("/").pop();
      return prompt.includes(path) || (base && prompt.includes(base));
    });
    const MAX_RELEVANT_FILES = 8;
    const pathsToSend = (mentioned.length > 0 ? mentioned : allPaths).slice(
      0,
      MAX_RELEVANT_FILES,
    );

    const relevantFiles = {};
    for (const path of pathsToSend) {
      relevantFiles[path] = project.files[path].content;
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

  if (updates.slug && isReservedSlug(updates.slug)) {
    throw new HttpError(
      400,
      "That URL is reserved. Pick a different one in the project details.",
    );
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