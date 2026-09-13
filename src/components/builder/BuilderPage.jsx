"use client";

import { useEffect, useRef } from "react";
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
import { getProjectHero } from "@/app/services/projectService";
import { INITIAL_CHAT_MESSAGES } from "@/lib/constants";

export function BuilderPage({ projectSlug }) {
  const searchParams = useSearchParams();
  const isGenerating = searchParams.get("mode") === "generate";
  const projectName = searchParams.get("name") || toTitleCase(projectSlug);

  const view = useBuilderView(isGenerating ? "generating" : "preview");
  const generation = useGeneration();
  const chat = useChat(isGenerating ? [] : INITIAL_CHAT_MESSAGES);
  const publishModal = usePublishModal();

  const appendedFileCount = useRef(0);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!isGenerating || hasStarted.current) return;
    hasStarted.current = true;
    generation.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenerating]);

  // Mirror each completed generation step into the chat log, then reveal
  // the preview once every file has been "written".
  useEffect(() => {
    if (!isGenerating) return;
    const newEntries = generation.logEntries.slice(appendedFileCount.current);
    if (newEntries.length === 0) return;
    appendedFileCount.current = generation.logEntries.length;
    newEntries.forEach((entry) => {
      chat.appendMessage({
        id: `${entry.id}-status`,
        role: "ai",
        statusLines: [`Created file "${entry.file}"`],
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generation.logEntries, isGenerating]);

  useEffect(() => {
    if (!isGenerating || !generation.isComplete) return;
    chat.appendMessage({
      id: "generation-complete",
      role: "ai",
      text: "Website generation complete! Take a look at the preview — tell me what to change.",
    });
    view.showPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generation.isComplete, isGenerating]);

  const hero = getProjectHero(projectSlug);
  const chromeUrl = `stackvibe.app/${projectSlug}`;

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
          onSend={chat.sendMessage}
        />

        <div className="flex min-w-0 flex-1 flex-col bg-gray-100">
          {view.mainView === "generating" && (
            <GeneratingView
              projectName={projectName}
              percent={generation.percent}
              doneCount={generation.doneCount}
              total={generation.total}
              fileStatuses={generation.fileStatuses}
            />
          )}
          {view.mainView === "preview" && (
            <PreviewView chromeUrl={chromeUrl} siteName={projectName} hero={hero} />
          )}
          {view.mainView === "code" && <CodeView />}
        </div>
      </div>

      <PublishModal isOpen={publishModal.isOpen} onClose={publishModal.close} publishUrl={chromeUrl} />
    </div>
  );
}

function toTitleCase(slug) {
  if (!slug) return "Untitled";

  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
