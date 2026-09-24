"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

// Builder UI
import { BuilderTopBar } from "./BuilderTopBar";
import { ChatPanel } from "./ChatPanel";
import { GeneratingView } from "./GeneratingView";
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
import { PUBLIC_HOST } from "@/lib/constants";

export function BuilderPage({ projectSlug }) {
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



  // Runs once generation finishes successfully — shared by the initial
  // kickoff below and by a manual retry after a failure.
  const handleGenerationComplete = useCallback(
    (finishedProject) => {
      // Update UI with completed project
      applyProject(finishedProject);
      chat.appendMessage({
        id: "generation-complete",
        role: "ai",
        text: "Website generation complete! Take a look at the code — tell me what to change.",
      });
      view.showCode(); // Switch to code view after completion
    },
    // chat/view identities are stable; applyProject already excluded above
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Monitor generation when URL contains "mode=generate"
  useEffect(() => {
    if (!isGenerating || hasStartedGeneration.current) return;
    hasStartedGeneration.current = true;

    // Check backend for generation process
    generation.start(projectSlug, handleGenerationComplete);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenerating, projectSlug]);

  // Re-runs the same generation job after a failure. The backend restarts
  // from scratch today (step 4+ will make this resume from saved files).
  const handleGenerationRetry = useCallback(() => {
    generation.start(projectSlug, handleGenerationComplete);
  }, [generation, projectSlug, handleGenerationComplete]);

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

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar with project name, view controls, and publish actions. */}
      <BuilderTopBar
        projectName={projectName}
        mainView={view.mainView}
        onShowCode={view.showCode}
        onShowPreview={view.showPreview}
        onOpenPublish={publishModal.open}
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
        />

        {/* Main area for generation progress, preview, or code. */}
        <div className="flex min-w-0 flex-1 flex-col bg-gray-100">
          {/* Display a project loading error when one exists. */}
          {loadError && (
            <div className="m-4 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {loadError}
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
              error={generation.error}
              onRetry={handleGenerationRetry}
            />
          )}

          {/* Show the live website preview. */}
          {view.mainView === "preview" && (
            <PreviewView
              chromeUrl={chromeUrl}
              siteName={projectName}
              files={files}
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

// Convert backend messages into the format expected by the chat UI.
function toChatMessages(messages = []) {
  return messages.map((message, index) => ({
    id: `${index}-${message.role}`,                                           // Unique ID for each message
    role: message.role === "user" ? "user" : "ai",                            // convert backend role into user or AI
    text: message.content,                                                    // Message content as displayed text
  }));
}


// Convert URL slug into a readable project name
function toTitleCase(slug) {
  if (!slug) return "Untitled";                                                // Return default name if slug is missing

  return slug                                                                  // Splitting slug into words and capatalize each word
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}