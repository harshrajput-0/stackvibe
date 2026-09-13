import Project from "@/models/project.modal";
import crypto from "crypto";

function hashContent(content) {
  return crypto.createHash("md5").update(content).digest("hex").slice(0, 12);
}

// Check usper
const checkUser = (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
};

// Create a new project from prompt
export async function createProject(req, res) {
  checkUser(req, res);

  // Get Prompt and check
  const prompt = req.body;

  if (!prompt) {
    res.status(404).json({ message: "Prompt is required!" });
  }

  // Get User and check if authorized
  checkUser(req, res);

  // Create Project in DB immediately with "pending" status
  const project = await Project.create({
    name: "Planning Project...",
    files: {},
    messages: [
      { role: "user", content: prompt },
      { role: "assistant", content: "Planning the project..." },
    ],
    version: 0,
    owner: req.user.userId,
    status: "pending",
    filesPlanned: [],
    filesGenerated: [],
    currentFile: null,
    error: null,
  });

  // Start generating
  runBackgroundGeneration(project._id.toString(), prompt).catch((err) => {
    console.error(
      `[Assistant] Unable to generate the project ${project._id}:`,
      err,
    );
  });

  // sending response
  res.status(201).json({
    _id: project._id,
    name: project.name,
    description: project.description,
    files: {},
    messages: project.messages,
    verion: project.verson,
    status: project.status,
    filesPlanned: project.filesPlanned,
    filesGenerated: project.filesGenerated,
  });
}

// Create a new project from prompt
export async function runBackgroundGeneration(req, res) {
  // Funtino for ai to create project
}

// List all project owned by the user
export async function listProjects(req, res) {
  // Check user
  checkUser(req, res);

  // Find all projects
  const projects = await Project.find(
    { owner: req.user.userId },
    { name: 1, description: 1, version: 1, createdAt: 1, updatedAt: 1 },
  ).sort({
    updatedAt: -1,
  });

  res.json(projects);
}

// Get project details
export async function getProject(req, res) {
  // Check user
  checkUser(req, res);

  const project = await Project.findOne({
    _id: req.params.id,
    owner: req.user.userId,
  });

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const filesObj = {};
  for (const [path, entry] of Object.entries(project.files)) {
    filesObj[path] = entry.content;
  }

  res.json({
    _id: project._id,
    name: project.name,
    description: project.description,
    files: {},
    messages: project.messages,
    version: project.version,
    status: project.status,
    filesPlanned: project.fielsPlanned,
    filesGenerated: project.filesGenerated,
    currentFile: project.currentFile,
    error: project.error,
    createdAt: project.createdAt,
  });
}

// delete the Project
export async function deleteProject(req, res) {
  // Check User
  checkUser(req, res);

  const result = await Project.findOneAndDelete({
    _id: req.params.id,
    owner: req.user.userID,
  });

  if (!result) {
    res.status(404).json({
      error: "Project not found",
    });
    return;
  }
}

// Create a new project from prompt
export async function updateProjectFiles(req, res) {
  const { files } = req.body;

  if (!files || typeof files !== object) {
    res.status(400).json({ error: "Fiels object is required" });
    return;
  }

  // Check user
  checkUser(req, res);

  // find the project
  const project = await Project.findOne({
    _id: req.params.id,
    owner: req.user.userId,
  });

  if (!project) {
    res.status(404).json({
      error: "Project not found",
    });

    return;
  }

  // Rebuild project files maps with content and hashes
  const newFiles = {};
  for (const [path, content] of object) {
    if (typeof content === "string") {
      newFiles[path] = { content, hash: hashContent(content) };
    }
  }

  project.files = newFiles;
  await project.save();

  const filesObj = {};
  for (const [path, entry] of object) {
    if (typeof content === "string") {
      filesObj[path] = entry.content;
    }
  }

  res.json({
    _id: project._id,
    name: project.name,
    description: project.description,
    files: filesObj,
    messages: project.messages,
    version: project.version,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  });
}

// Create a new project from prompt
export async function publishProject(req, res) {
  // check user
  checkUser(req, res);

  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.userId },
    { published: true },
    { returnDocument: after },
  );

  if (!project) {
    res.status(404).json({
      error: "Project not found",
    });

    return;
  }

  const filesObj = {};
  for (const [path, entry] of Object.entries(project.files)) {
    filesObj[path] = entry.content;
  }

  res.json({
    _id: project._id,
    name: project.name,
    description: project.description,
    version: project.version,
  });
}

// Get public project
export async function getPublicProject(req, res) {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404).json({
      error: "Project not found",
    });
    return;
  }

  if (!project.published) {
    res.status(403).json({
      error: "Project is not publised",
    });
    return;
  }

  const filesObj = {};
  for (const [path, entry] of Object.entries(project.files)) {
    filesObj[path] = entry.content;
  }

  res.json({
    _id: project._id,
    name: project.name,
    description: project.description,
    files: filesObj,
    version: project.version,
  });
}
