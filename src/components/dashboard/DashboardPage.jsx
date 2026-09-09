"use client";

import { useRouter } from "next/navigation";
import { TopNav } from "./TopNav";
import { PromptBox } from "./PromptBox";
import { ChipRow } from "./ChipRow";
import { ProjectGrid } from "./ProjectGrid";
import { useDashboardPrompt } from "@/hooks/useDashboardPrompt";
import { listProjects } from "@/lib/services/projectService";
import { slugify } from "@/lib/utils/slugify";
import { deriveProjectName } from "@/lib/utils/deriveProjectName";

export const DashboardPage = () => {
  const router = useRouter();
  const { value, setValue, fillFromChip } = useDashboardPrompt();
  const projects = listProjects();

  // Generate a new project from current prompt
  function handleGenerate() {
    const projectName = deriveProjectName(value);
    const slug = slugify(projectName);
    router.push(`/builder/${slug}?mode=generate&name=${encodeURIComponent(projectName)}`);
  }

  // Open an existing project form project grid
  function handleOpenProject(project) {
    const slug = slugify(project.name);
    router.push(`/builder/${slug}`);
  }

  return (
    <div className="bg-gray-50">
      <TopNav />
      <main className="mx-auto max-w-230 px-6 pt-18 pb-20 max-[640px]:px-4.5 max-[640px]:pt-12 max-[640px]:pb-20">
        <div className="text-center">
          <h1 className="text-[clamp(32px,5vw,48px)] font-bold tracking-tight">Build with AI</h1>
          <p className="mt-1.5 text-[17px] text-(--gray-500)">Turn your idea into a website.</p>
        </div>

        <PromptBox value={value} onChange={setValue} onSubmit={handleGenerate} />
        <ChipRow onSelect={fillFromChip} />
        <ProjectGrid projects={projects} onOpenProject={handleOpenProject} />
      </main>
    </div>
  );
}