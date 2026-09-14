import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import pMap from "p-map";
import {
  FileCodeSchema,
  FilePlanSchema,
  RevisionResultSchema,
} from "../validators/aiSchema";
import { buildFileCodeSystem, FILE_PLAN_SYSTEM, REVISE_SYSTEM } from "./prompt";
import { normalizeContent } from "./contentNormalizer";
import { validateAndFixCode, validateRevisionContent } from "./codeValidator";

// ----------------------- OpenRouter Model Client Setup --------
const MODEL = process.env.OPENROUTER_MODEL || "openrouter/free";
const MAX_CONCURRENCY = parseInt(process.env.AI_MAX_CONCURRENCY || "6", 10);

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_KEY,
});

const model = openrouter(MODEL);

async function generateSingleFile(
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

// Generate Project Files: plan -> build with fallback retries
export async function generateProject(prompt, callbacks) {
  // Planning
  console.log(
    `Phase 1: Planning file structure for: "${prompt.slice(0, 80)}..."`,
  );

  // PHASE 1: PLANNING FILE STRUCTURE
  const { object: plan } = await generateObject({
    model,
    schema: FilePlanSchema,
    system: FILE_PLAN_SYSTEM,
    prompt: `Plan for: ${prompt}`,
    maxRetries: 2,
  });

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
  let pendingFiles = plan.files.map((f) => ({ ...f })); // List pendingFiles

  const maxRetryRounds = 2;

  // Generating files and retry
  for (let round = 0; round <= maxRetryRounds; round++) {
    if (pendingFiles.length === 0) break;

    // Display when retrying
    if (round > 0) {
      console.log(
        `[Assistant]: Retrying ${round}/${maxRetryRounds} for ${pendingFiles.length} failed files: ${pendingFiles.map((f) => f.path).join(", ")}`,
      );
    }

    // GENERATING PENDING FILES
    const results = await pMap(
      pendingFiles,
      async (file) => {
        try {
          if (callbacks?.onFileStart) {
            await callbacks.onFileStart(file.path);
          }

          const singleResult = await generateSingleFile(
            file,
            plan.files,
            prompt,
            files,
          );

          // Notify that file is finished
          if (callbacks?.onFileComplete) {
            await callbacks.onFileComplete(file.path, singleResult.code);
          }

          return {
            success: true,
            file,
            result: singleResult,
          };
        } catch (error) {
          return {
            success: false,
            file,
            error,
          };
        }
      },

      {
        concurrency: MAX_CONCURRENCY,
      },
    );

    // PROCESSING THE RESULT OF GENERATION
    const failedFiles = [];

    for (const entry of results) {
      if (entry.success) {
        const { path, code } = entry.result;

        files[path.startsWith("/") ? path : "/" + path] = code;
      } else {
        console.warn(
          `[Assistant]: File ${entry.file.path} failed in round ${round}: ${
            entry.error?.message || entry.error
          }`,
        );

        // Add failed files to retry list
        failedFiles.push(entry.file);
      }
    }

    // Replace pendingFiles with failed files, for next round
    pendingFiles = failedFiles;
  }

  // HANDLE FILES THAT FAILED AT ALL ROUNDS — placeholder every one of them,
  // not just /App.js, so nothing silently vanishes from the project.
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
    }
  }

  // FINAL VALIDATION
  // Checking if App.js exists
  if (!files["/App.js"]) {
    throw new Error("Assistant didn't generate App.js");
  }

  // Return the generated project
  return {
    files,
    description: plan.projectDescription,
  };
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