"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Builder UI
import { BuilderTopBar } from "./BuilderTopBar";
import { ChatPanel } from "./ChatPanel";
import { GeneratingView } from "./GeneratingView";
import { LimitReachedView } from "./LimitReachedView";
import { GenerationErrorView } from "./GenerationErrorView";
import { FileFailedView } from "./FileFailedView";
import { PreviewView } from "./PreviewView";
import { CodeView } from "./CodeView";
import { PublishModal } from "./PublishModal";

// Custom hooks
import { useGeneration } from "@/hooks/useGeneration";
import { useChat } from "@/hooks/useChat";
import { useBuilderView } from "@/hooks/useBuilderView";
import { usePublishModal } from "@/hooks/usePublishModal";

// API for loading function from backend
import { getProjectBySlug, publishProject } from "@/api-client/projectService";
import { retryProjectFile } from "@/api-client/generationService";
import { PUBLIC_HOST } from "@/lib/constants";

export function BuilderPage({ projectSlug }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGenerating = searchParams.get("mode") === "generate";
  const fallbackName = searchParams.get("name") || toTitleCase(projectSlug);

  const view = useBuilderView(isGenerating ? "generating" : "preview");
  const generation = useGeneration();                                                             // Manage website generation process
  const chat = useChat([]);                                                                       // Manage chat message and revision prompt
  const publishModal = usePublishModal();                                                         // Manage publish modal's open and close state

  const [project, setProject] = useState(null);
  const [files, setFiles] = useState({});
  const [loadError, setLoadError] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [retryingPath, setRetryingPath] = useState(null);
  const [isRetryingAll, setIsRetryingAll] = useState(false);
  const [retryError, setRetryError] = useState("");
  const hasStartedGeneration = useRef(false);

  // Update builder with latest project data
  const applyProject = useCallback(
    (data) => {
      setProject(data);
      setFiles(data.files || {});
      chat.resetMessages(toChatMessages(data.messages));
    },
    // chat identity is stable (useCallback/useState setters), safe to omit
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Load the real project from backend when slug changes
  useEffect(() => {
    // prevent state updates after component is unmounted
    let cancelled = false;

    async function load() {
      try {
        const data = await getProjectBySlug(projectSlug);

        // Update UI only if the request is still active
        if (!cancelled) applyProject(data);
      } catch (err) {
        if (!cancelled) setLoadError(err.message || "Failed to load project");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectSlug]);

  // Handle completed generation; show failed files if any instead of opening the code view.
  function handleGenerationComplete(finishedProject) {
    applyProject(finishedProject);

    if (finishedProject.filesFailed?.length > 0) {
      chat.appendMessage({
        id: "generation-complete",
        role: "ai",
        text: `Built ${(finishedProject.filesPlanned?.length || 0) - finishedProject.filesFailed.length} of ${finishedProject.filesPlanned?.length || 0} files. A few couldn't be generated — you can retry them individually.`,
      });
      view.showFailed();
    } else {
      chat.appendMessage({
        id: "generation-complete",
        role: "ai",
        text: "Website generation complete! Take a look at the code — tell me what to change.",
      });
      view.showCode();
    }
  }

  // Monitor generation when URL contains "mode=generate"
  useEffect(() => {
    if (!isGenerating || hasStartedGeneration.current) return;
    hasStartedGeneration.current = true;

    // Check backend for generation process
    generation.start(projectSlug, handleGenerationComplete);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenerating, projectSlug]);

  // The AI's rate limit stopped generation partway through — switch to the
  // "AI limit reached" card as soon as the poller notices.
  useEffect(() => {
    if (generation.isLimited) {
      view.showLimit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generation.isLimited]);

  // Generation failed outright (not just rate-limited) — previously there
  // was no handling for this at all, so the UI stayed stuck on the
  // "generating" spinner forever with no way to retry. Resume now also
  // accepts a "failed" project server-side, so the same action works here.
  useEffect(() => {
    if (generation.error && !generation.isLimited && !generation.isComplete) {
      view.showGenerationError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generation.error]);

  const projectName = project?.name || fallbackName;
  const chromeUrl = `${PUBLIC_HOST}/${projectSlug}`; // Project URL shown in the sandbox chrome bar and publish modal

  // Update files after with one returned form chat
  function handleFilesUpdated(updatedFiles) {
    if (updatedFiles) setFiles(updatedFiles);
  }

  // Mark the project published (or re-publish after edits).
  async function handlePublish() {
    if (!project?._id || isPublishing) return;

    try {
      setIsPublishing(true);
      setPublishError("");
      const updated = await publishProject(project._id);
      setProject((current) => ({ ...current, ...updated }));
    } catch (err) {
      setPublishError(err.message || "Failed to publish the project");
    } finally {
      setIsPublishing(false);
    }
  }

  // Resume a generation that stopped on the AI limit. The hook flips the
  // project back to an active status server-side and starts polling again.
  function handleResume() {
    view.showGenerating();
    generation.resume().then(() => {
      // If resuming errors out synchronously (e.g. network), stay put —
      // useGeneration surfaces the error via generation.error.
    });
    // Once polling reports completion, handleGenerationComplete runs again
    // (same callback passed to generation.start on the initial mount).
  }

  function handleBackToProjects() {
    router.push("/dashboard");
  }

  // Retry a single file that fell back to a placeholder. Runs synchronously
  // server-side (one file), so we just swap in the updated project.
  async function handleRetryFile(path) {
    if (!project?.slug || retryingPath || isRetryingAll) return;

    setRetryingPath(path);
    setRetryError("");
    try {
      const updated = await retryProjectFile(project.slug, path);
      applyProject(updated);
      if (!updated.filesFailed || updated.filesFailed.length === 0) {
        view.showCode();
      }
    } catch (err) {
      setRetryError(err.message || `Failed to retry ${path}`);
    } finally {
      setRetryingPath(null);
    }
  }

  // Retry every failed file, one at a time (keeps the single-file retry
  // endpoint simple and gives the person a live "Retrying…" row per file).
  async function handleRetryAllFailed() {
    if (!project?.slug || isRetryingAll || retryingPath) return;

    setIsRetryingAll(true);
    setRetryError("");
    let latestProject = project;

    for (const path of latestProject.filesFailed || []) {
      setRetryingPath(path);
      try {
        latestProject = await retryProjectFile(project.slug, path);
        applyProject(latestProject);
      } catch (err) {
        setRetryError(err.message || `Failed to retry ${path}`);
        break;
      }
    }

    setRetryingPath(null);
    setIsRetryingAll(false);

    if (!latestProject.filesFailed || latestProject.filesFailed.length === 0) {
      view.showCode();
    }
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar with project name, view controls, and publish actions. */}
      <BuilderTopBar
        projectName={projectName}
        mainView={view.mainView}
        onShowCode={view.showCode}
        onShowPreview={view.showPreview}
        onPublish={publishModal.open}
        files={files}
      />

      <div className="flex min-h-0 flex-1">
        {/* Chat panel for sending prompts and viewing generated files. */}
        <ChatPanel
          sideTab={view.sideTab}
          onSideTabChange={view.setSideTab}
          messages={chat.messages}
          inputValue={chat.inputValue}
          onInputChange={chat.setInputValue}
          onSend={() => chat.sendMessage(projectSlug, handleFilesUpdated)}
          files={files}
          disabled={
            view.mainView === "limit" ||
            view.mainView === "generation-error" ||
            chat.isSending
          }
          isWaiting={chat.isSending}
        />

        {/* Main area for generation progress, preview, or code. */}
        <div className="flex min-w-0 flex-1 flex-col bg-gray-100">
          {/* Display a project loading error when one exists. */}
          {loadError && (
            <div className="m-4 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {loadError}
            </div>
          )}
          {retryError && (
            <div className="m-4 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {retryError}
            </div>
          )}

          {/* Show generation progress while the website is being created. */}
          {view.mainView === "generating" && (
            <GeneratingView
              projectName={projectName}
              percent={generation.percent}
              doneCount={generation.doneCount}
              total={generation.total}
              fileStatuses={generation.fileStatuses}
              plannedFiles={generation.plannedFiles}
            />
          )}

          {/* AI's free-model rate limit stopped generation partway through. */}
          {view.mainView === "limit" && (
            <LimitReachedView
              doneCount={generation.doneCount}
              total={generation.total}
              isResuming={generation.isResuming}
              onResume={handleResume}
              onBackToProjects={handleBackToProjects}
            />
          )}

          {/* Generation failed outright, before anything was produced. */}
          {view.mainView === "generation-error" && (
            <GenerationErrorView
              error={generation.error}
              isResuming={generation.isResuming}
              onResume={handleResume}
              onBackToProjects={handleBackToProjects}
            />
          )}

          {/* Generation finished, but one or more files needed a placeholder. */}
          {view.mainView === "failed" && (
            <FileFailedView
              plannedFiles={project?.filesPlanned || []}
              filesFailed={project?.filesFailed || []}
              retryingPath={retryingPath}
              isRetryingAll={isRetryingAll}
              onRetryFile={handleRetryFile}
              onRetryAllFailed={handleRetryAllFailed}
              onOpenPreview={view.showPreview}
            />
          )}

          {/* Show the live website preview. */}
          {view.mainView === "preview" && (
            <PreviewView
              chromeUrl={chromeUrl}
              siteSlug={projectSlug}
              siteName={projectName}
              files={files}
              isPublished={Boolean(project?.published)}
            />
          )}

          {/* Show the generated source code. */}
          {view.mainView === "code" && <CodeView files={files} />}
        </div>
      </div>

      {/* Modal for publishing the generated website. */}
      <PublishModal
        isOpen={publishModal.isOpen}
        onClose={publishModal.close}
        publishUrl={chromeUrl}
        isPublished={Boolean(project?.published)}
        isPublishing={isPublishing}
        publishError={publishError}
        onPublish={handlePublish}
      />
    </div>
  );
}

// Matches the backend's per-file log entries, e.g. `Created file "/App.js"`.
const CREATED_FILE_RE = /^Created file "(.+)"$/;

// Convert backend messages into the format expected by the chat UI.
// Backend logs one "Created file" entry per file, which would otherwise
// render as a separate "StackVibe" bubble for every single file. Collapse
// consecutive runs of those into one bubble with a checklist (statusLines),
// matching the look already used for revision results.
function toChatMessages(messages = []) {
  const result = [];

  messages.forEach((message, index) => {
    const match = message.role !== "user" && CREATED_FILE_RE.exec(message.content);

    if (match) {
      const lastGroup = result[result.length - 1];

      if (lastGroup?.isFileGroup) {
        lastGroup.statusLines.push(match[1]);
      } else {
        result.push({
          id: `${index}-files`,
          role: "ai",
          isFileGroup: true,
          statusLines: [match[1]],
        });
      }
      return;
    }

    result.push({
      id: `${index}-${message.role}`,                                         // Unique ID for each message
      role: message.role === "user" ? "user" : "ai",                          // convert backend role into user or AI
      text: message.content,                                                  // Message content as displayed text
    });
  });

  // Now that each group's final file count is known, give it a summary line.
  result.forEach((message) => {
    if (message.isFileGroup) {
      const count = message.statusLines.length;
      message.text = `Created ${count} file${count === 1 ? "" : "s"}`;
    }
  });

  return result;
}


// Convert URL slug into a readable project name
function toTitleCase(slug) {
  if (!slug) return "Untitled";                                                // Return default name if slug is missing

  return slug                                                                  // Splitting slug into words and capatalize each word
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}