"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BuilderTopBar } from "./BuilderTopBar";
import { ChatPanel } from "./ChatPanel";
import { GeneratingView } from "./GeneratingView";
import { PreviewView } from "./PreviewView";
import { CodeView } from "./CodeView";
import { PublishModal } from "./PublishModal";
import { useGeneration } from "@/hooks/useGeneration";
import { useChat } from "@/hooks/useChat";
import { useBuilderView } from "@/hooks/useBuilderView";
import { usePublishModal } from "@/hooks/usePublishModal";
import { getProjectBySlug } from "@/api-client/projectService";

export function BuilderPage({ projectSlug }) {
  const searchParams = useSearchParams();
  const isGenerating = searchParams.get("mode") === "generate";
  const fallbackName = searchParams.get("name") || toTitleCase(projectSlug);

  const view = useBuilderView(isGenerating ? "generating" : "preview");
  const generation = useGeneration();
  const chat = useChat([]);
  const publishModal = usePublishModal();

  const [project, setProject] = useState(null);
  const [files, setFiles] = useState({});
  const [loadError, setLoadError] = useState("");
  const hasStartedGeneration = useRef(false);

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

  // Load the real project by slug on mount — this is the project the
  // dashboard just created (status "pending"/"generating") or an existing
  // one being reopened.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getProjectBySlug(projectSlug);
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

  // Poll the real generation pipeline (kicked off server-side when the
  // project was created) and reflect its actual progress.
  useEffect(() => {
    if (!isGenerating || hasStartedGeneration.current) return;
    hasStartedGeneration.current = true;

    generation.start(projectSlug, (finishedProject) => {
      applyProject(finishedProject);
      chat.appendMessage({
        id: "generation-complete",
        role: "ai",
        text: "Website generation complete! Take a look at the code — tell me what to change.",
      });
      view.showCode();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenerating, projectSlug]);

  const projectName = project?.name || fallbackName;
  const chromeUrl = `stackvibe.app/${projectSlug}`;

  function handleFilesUpdated(updatedFiles) {
    if (updatedFiles) setFiles(updatedFiles);
  }

  return (
    <div className="flex h-screen flex-col">
      <BuilderTopBar
        projectName={projectName}
        mainView={view.mainView}
        onShowCode={view.showCode}
        onShowPreview={view.showPreview}
        onOpenPublish={publishModal.open}
        onPublish={publishModal.open}
      />

      <div className="flex min-h-0 flex-1">
        <ChatPanel
          sideTab={view.sideTab}
          onSideTabChange={view.setSideTab}
          messages={chat.messages}
          inputValue={chat.inputValue}
          onInputChange={chat.setInputValue}
          onSend={() => chat.sendMessage(projectSlug, handleFilesUpdated)}
          files={files}
        />

        <div className="flex min-w-0 flex-1 flex-col bg-gray-100">
          {loadError && (
            <div className="m-4 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {loadError}
            </div>
          )}

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
          {view.mainView === "preview" && (
            <PreviewView
              chromeUrl={chromeUrl}
              siteName={projectName}
              description={project?.description}
            />
          )}
          {view.mainView === "code" && <CodeView files={files} />}
        </div>
      </div>

      <PublishModal
        isOpen={publishModal.isOpen}
        onClose={publishModal.close}
        publishUrl={chromeUrl}
      />
    </div>
  );
}

function toChatMessages(messages = []) {
  return messages.map((message, index) => ({
    id: `${index}-${message.role}`,
    role: message.role === "user" ? "user" : "ai",
    text: message.content,
  }));
}

function toTitleCase(slug) {
  if (!slug) return "Untitled";

  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
