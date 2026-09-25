import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import pMap from "p-map";
import {
  FileCodeSchema,
  FilePlanSchema,
  RevisionResultSchema,
} from "@/lib/validators/aiSchema.js";
import { buildFileCodeSystem, FILE_PLAN_SYSTEM, REVISE_SYSTEM } from "./prompt.js";
import { normalizeContent } from "./contentNormalizer.js";
import { validateAndFixCode, validateRevisionContent, findUnresolvedImports } from "./codeValidator.js";

// ----------------------- OpenRouter Model Client Setup --------
const MODEL = process.env.OPENROUTER_MODEL || "openrouter/free";
const MAX_CONCURRENCY = parseInt(process.env.AI_MAX_CONCURRENCY || "6", 10);

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_KEY,
});

const model = openrouter(MODEL);

// ----------------------- Rate limit detection -----------------------
// Stop on rate limits instead of wasting retries or creating placeholders.
// The builder shows "AI limit reached" so generation can be resumed later.
export function isRateLimitError(error) {
  if (!error) return false;

  const status =
    error.statusCode ?? error.status ?? error?.cause?.statusCode ?? error?.cause?.status;
  if (status === 429) return true;

  const message = String(error.message || error?.cause?.message || "").toLowerCase();
  return (
    message.includes("rate limit") ||
    message.includes("rate-limit") ||
    message.includes("too many requests") ||
    message.includes("429")
  );
}

// Tag an error as a rate limit so callers up the stack (the controller) can
// branch on it without re-parsing messages.
function markRateLimit(error, fallbackMessage) {
  const tagged =
    error instanceof Error ? error : new Error(fallbackMessage);
  tagged.isRateLimit = true;
  if (!tagged.message) tagged.message = fallbackMessage;
  return tagged;
}

export async function generateSingleFile(
  file,
  allFiles,
  prompt,
  alreadyGeneratedFiles,
) {
  // Create the system instructions for generating this file
  const system = buildFileCodeSystem(allFiles, alreadyGeneratedFiles);

  const userMessage = `
    Project: ${prompt}

Write the complete code for: ${file.path}
Purpose: ${file.description}
`;

  console.log(`[AI] Creating file: ${file.path}...`);

  // Ask AI to generate structured data
  const { object } = await generateObject({
    model,
    schema: FileCodeSchema,
    system,
    prompt: userMessage,
    maxRetries: 2,
  });

  // Extract and normalize the generated code
  let code = normalizeContent(object.code);

  if (code.trim().length === 0) {
    throw new Error("Generated code is empty after normalization");
  }

  // VALIDATE CODE POST GENERATION
  const validation = validateAndFixCode(code, file.path, {
    allPlannedFiles: allFiles,
  });

  // Use validator's final version of code
  code = validation.code;

  // Log any adjustments the validator made
  if (validation.warnings.length > 0) {
    console.log(
      `[Validator] Code adjustments for ${file.path}:\n  - ${validation.warnings.join(
        "\n  - ",
      )}`,
    );
  }

  console.log(`[Assistant] Created file: ${file.path} (${code.length} chars)`);

  // Return generated file
  return {
    path: file.path,
    code,
  };
}
// Generate pending files with retries, shared by fresh builds and resumes.
// Stops immediately on rate limits so remaining files can be resumed later.
async function runGenerationRounds({
  pendingFiles,
  allFiles,
  prompt,
  files,
  callbacks,
  maxRetryRounds = 2,
}) {
  pendingFiles = pendingFiles.map((f) => ({ ...f }));

  for (let round = 0; round <= maxRetryRounds; round++) {
    if (pendingFiles.length === 0) break;

    if (round > 0) {
      console.log(
        `[Assistant]: Retrying ${round}/${maxRetryRounds} for ${pendingFiles.length} failed files: ${pendingFiles.map((f) => f.path).join(", ")}`,
      );
    }

    const results = await pMap(
      pendingFiles,
      async (file) => {
        try {
          if (callbacks?.onFileStart) {
            await callbacks.onFileStart(file.path);
          }

          const singleResult = await generateSingleFile(
            file,
            allFiles,
            prompt,
            files,
          );

          if (callbacks?.onFileComplete) {
            await callbacks.onFileComplete(file.path, singleResult.code);
          }

          return { success: true, file, result: singleResult };
        } catch (error) {
          return { success: false, file, error };
        }
      },
      { concurrency: MAX_CONCURRENCY },
    );

    const stillPending = [];
    let rateLimitHit = false;

    for (const entry of results) {
      if (entry.success) {
        const { path, code } = entry.result;
        files[path.startsWith("/") ? path : "/" + path] = code;
      } else {
        if (isRateLimitError(entry.error)) rateLimitHit = true;

        console.warn(
          `[Assistant]: File ${entry.file.path} failed in round ${round}: ${
            entry.error?.message || entry.error
          }`,
        );
        stillPending.push(entry.file);
      }
    }

    pendingFiles = stillPending;

    // Stop the whole run the moment we see a rate limit — retrying into a
    // limit just burns more of it, and the remaining files (this round's
    // stragglers plus anything not yet attempted) need to wait, not fail.
    if (rateLimitHit) {
      return { files, failedFiles: [], limited: true, pendingFiles };
    }
  }

  // Anything still pending after every round is a genuine failure (not a
  // rate limit) — placeholder it so the site still loads, and report it so
  // the builder can offer a per-file retry.
  const failedFiles = [];
  if (pendingFiles.length > 0) {
    const failedPath = pendingFiles.map((f) => f.path).join(", ");
    console.error(
      `[Assistant]: Failed to generate ${pendingFiles.length} files after all retry rounds: ${failedPath}`,
    );

    for (const file of pendingFiles) {
      const extension = file.path.split(".").pop()?.toLowerCase();

      if (extension === "css") {
        files[file.path] =
          `/* ${file.description} — Generation failed, please retry */\n`;
      } else {
        files[file.path] =
          "import React from 'react';\n\n" +
          `// ⚠️ This file could not be generated. Please retry.\n` +
          `// Purpose: ${file.description}\n\n` +
          "export default function Placeholder() {\n" +
          "  return (\n" +
          "    <div className='p-8 text-center text-zinc-400'>\n" +
          "      <p>⚠️ Component failed to generate. Please try again.</p>\n" +
          "    </div>\n" +
          "  );\n" +
          "}\n";
      }

      failedFiles.push(file.path);
    }
  }

  return { files, failedFiles, limited: false, pendingFiles: [] };
}

// Stub any imports that still don't resolve (a component the model
// referenced but never planned/generated) so the preview loads with a
// visible gap instead of a hard crash.
function stubUnresolvedImports(files) {
  const unresolvedImports = findUnresolvedImports(files);
  if (unresolvedImports.length === 0) return;

  console.warn(
    `[Assistant]: Stubbing ${unresolvedImports.length} unresolved import(s): ${unresolvedImports
      .map((u) => `'${u.importTarget}' from ${u.fromFile}`)
      .join(", ")}`,
  );

  for (const { resolvedPath, isCss } of unresolvedImports) {
    const alreadyStubbed =
      files[resolvedPath] ||
      files[`${resolvedPath}.jsx`] ||
      files[`${resolvedPath}.css`];
    if (alreadyStubbed) continue; // two files importing the same missing module

    if (isCss) {
      files[`${resolvedPath}.css`] =
        "/* Referenced by an import but never generated. */\n";
    } else {
      const rawName = resolvedPath.split("/").pop() || "Missing";
      const name = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(rawName)
        ? rawName
        : "MissingComponent";

      files[`${resolvedPath}.jsx`] =
        "import React from 'react';\n\n" +
        `// ⚠️ Referenced by an import but never generated.\n\n` +
        `export default function ${name}() {\n` +
        "  return (\n" +
        "    <div className='p-8 text-center text-zinc-400'>\n" +
        `      <p>⚠️ "${name}" was referenced but never generated. Try regenerating.</p>\n` +
        "    </div>\n" +
        "  );\n" +
        "}\n";
    }
  }
}

// Generate Project Files: plan -> build with fallback retries
export async function generateProject(prompt, callbacks) {
  // Planning
  console.log(
    `Phase 1: Planning file structure for: "${prompt.slice(0, 80)}..."`,
  );

  // PHASE 1: PLANNING FILE STRUCTURE
  let plan;
  try {
    const { object } = await generateObject({
      model,
      schema: FilePlanSchema,
      system: FILE_PLAN_SYSTEM,
      prompt: `Plan for: ${prompt}`,
      maxRetries: 2,
    });
    plan = object;
  } catch (error) {
    if (isRateLimitError(error)) {
      throw markRateLimit(
        error,
        "AI limit reached while planning the project.",
      );
    }
    throw error;
  }

  // ENSURE REQUIRED FILES EXIST
  if (!plan.files.find((f) => f.path === "/App.js")) {
    // Add missing App.js
    plan.files.unshift({
      path: "/App.js",
      description: "Main entry point",
      exports: "default App",
      imports: ["./styles.css"],
    });
  }

  if (!plan.files.find((f) => f.path === "/styles.css")) {
    // Add missing stylesheet
    plan.files.push({
      path: "/styles.css",
      description: "Global CSS",
      exports: "none",
      imports: [],
    });
  }

  // Notify if plan is ready
  if (callbacks?.onPlan) {
    await callbacks.onPlan(plan);
  }

  // PHASE 2: GENERATION OF FILES
  console.log(
    `Phase 2: Generating ${plan.files.length} files in parallel (concurrency=${MAX_CONCURRENCY}): ${plan.files.map((f) => f.path).join(", ")}`,
  );

  const files = {};

  const { failedFiles, limited, pendingFiles } = await runGenerationRounds({
    pendingFiles: plan.files,
    allFiles: plan.files,
    prompt,
    files,
    callbacks,
  });

  // Hit the AI's rate limit partway through — stop here with whatever was
  // written so far. The caller persists this as a "limit" state; nothing is
  // placeholdered, so a resume just picks up the remaining files.
  if (limited) {
    return {
      limited: true,
      files,
      pendingFiles,
      plan,
    };
  }

  // SAFETY NET: some imports still won't resolve even after fixImportPaths —
  // that happens when the model references a component it never actually
  // planned/generated (not just planned-but-misplaced). Left alone, this is
  // what crashes the Sandpack preview with "Could not find module in path".
  stubUnresolvedImports(files);

  // FINAL VALIDATION
  // Checking if App.js exists
  if (!files["/App.js"]) {
    throw new Error("Assistant didn't generate App.js");
  }

  // Return the generated project
  return {
    files,
    description: plan.projectDescription,
    failedFiles,
  };
}

// Resume a generation that previously stopped on an AI limit: continues
// writing only the files that are still missing, reusing the plan and the
// files that already made it through. Goes through the exact same
// rate-limit-aware round logic as the initial build.
export async function generateRemainingFiles(
  prompt,
  plannedFiles,
  alreadyGeneratedFiles,
  pendingFiles,
  callbacks,
) {
  console.log(
    `[Assistant]: Resuming generation for ${pendingFiles.length} remaining file(s): ${pendingFiles.map((f) => f.path).join(", ")}`,
  );

  const files = { ...alreadyGeneratedFiles };

  const {
    failedFiles,
    limited,
    pendingFiles: stillPending,
  } = await runGenerationRounds({
    pendingFiles,
    allFiles: plannedFiles,
    prompt,
    files,
    callbacks,
  });

  if (limited) {
    return { limited: true, files, pendingFiles: stillPending };
  }

  stubUnresolvedImports(files);

  return { files, failedFiles };
}

// ==========================================================
// REVISE PROJECT
// ==========================================================
export async function reviseProject(
  prompt,
  manifest,
  relevantFiles,
  recentMessages,
) {
  // Holds all context for AI
  const contextParts = [];

  contextParts.push("## Current Project Files (manifest)");

  // Add markdown code block
  contextParts.push("```");

  for (const f of manifest) {
    contextParts.push(`${f.path} (${f.hash}, ${f.size}B)`);
  }

  // Close markdown code block
  contextParts.push("```");

  // ADDING RELEVANT CONTENT
  if (Object.keys(relevantFiles).length > 0) {
    contextParts.push("\n## File Content (for reference)");

    // Loop through every file and its content
    for (const [path, content] of Object.entries(relevantFiles)) {
      contextParts.push(`\n### ${path}\n\`\`\`\n${content}\n\`\`\``);
    }
  }

  // ADDING RECENT CONVERSATION HISTORY
  if (recentMessages.length > 0) {
    contextParts.push("\n## Recent Conversation");

    // Keep only last 3 messages
    for (const msg of recentMessages.slice(-3)) {
      // Adding message along with the role
      contextParts.push(`${msg.role}: ${msg.content}`);
    }
  }

  // Adding current revision request
  contextParts.push(`\n## Revision Request\n${prompt}`);
  console.log(`[Assistant]: Revising the project...`);

  // ASK AI FOR STRUCTURED REVISION OPERATIONS
  const { object: rawParsed } = await generateObject({
    model,
    schema: RevisionResultSchema,
    system: REVISE_SYSTEM,
    prompt: contextParts.join("\n"),
    maxRetries: 2,
  });

  // Check AI returned an operations array
  if (rawParsed && Array.isArray(rawParsed.operations)) {
    // Process every operation returned by AI
    rawParsed.operations = rawParsed.operations.map((op) => {
      if (!op || typeof op !== "object") {
        return op;
      }

      // Convert operation name to trimmed lowercase string
      let opStr = String(op.op || "")
        .trim()
        .toLowerCase();

      // Converting operation names to standard names
      if (["create", "add", "new"].includes(opStr)) {
        op.op = "create";
      } else if (["update", "edit", "modify", "patch"].includes(opStr)) {
        op.op = "update";
      } else if (["delete", "remove", "del", "rm"].includes(opStr)) {
        op.op = "delete";
      }

      // Normalizing file path
      if (op.path && typeof op.path === "string" && !op.path.startsWith("/")) {
        op.path = "/" + op.path;
      }

      // Normalize content of newly created file
      if (op.content) {
        op.content = normalizeContent(op.content);
      }

      // Normalize code that should be searched for during revision/update operation
      if (op.search) {
        op.search = normalizeContent(op.search);
      }

      // Normalize the replacement code after revision/update operation
      if (op.replace) {
        op.replace = normalizeContent(op.replace);
      }

      // VALIDATE CREATE OPERATION
      if (op.op === "create" && op.content) {
        const validation = validateRevisionContent(
          op.content,
          op.path,
          "create",
        );

        // Replace original content with validated content
        op.content = validation.content;

        if (validation.warnings.length > 0) {
          console.log(
            `[Validator] Revision create adjustment for ${op.path}:\n - ${validation.warnings.join("\n - ")}`,
          );
        }
      } else if (op.op === "update" && op.replace) {
        // Validate replacement code
        // "update" tells validator that this is intended to replace part of an existing file
        const validation = validateRevisionContent(
          op.replace,
          op.path,
          "update",
        );

        // Store the corrected replacement content
        op.replace = validation.content;

        if (validation.warnings.length > 0) {
          console.log(
            `[Validator] Revision update adjustment for ${op.path}:\n - ${validation.warnings.join("\n - ")}`,
          );
        }
      }

      // Return normalized operation
      // The map() function uses this returned value to create
      // the new operations array.
      return op;
    });
  }
  // Return the final parsed revision result.
  return rawParsed;
}