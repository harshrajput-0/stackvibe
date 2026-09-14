"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { TopNav } from "./TopNav";
import { PromptBox } from "./PromptBox";
import { ChipRow } from "./ChipRow";
import { ProjectGrid } from "./ProjectGrid";

import { useDashboardPrompt } from "@/hooks/useDashboardPrompt";
import { slugify } from "@/lib/utils/slugify";

import {
  listProjects,
  createProject,
} from "@/api-client/projectService";




export const DashboardPage = () => {
  const router = useRouter();

  const { value, setValue, fillFromChip } = useDashboardPrompt();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  // Load the current user's projects when the dashboard opens.
  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        setError("");

        const data = await listProjects();

        setProjects(data);
      } catch (error) {
        console.error("Failed to load projects", error);
        setError("Failed to load projects.");
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

// Create a new project from the current prompt.
async function handleGenerate() {
  const prompt = value.trim();

  // Do not submit an empty prompt or submit twice.
  if (!prompt || creating) return;

  try {
    setCreating(true);
    setError("");

    const newProject = await createProject(prompt);

    // Add the new project to the beginning of the list.
    setProjects((currentProjects) => [
      newProject,
      ...currentProjects,
    ]);

    // Clear the prompt after successful creation.
    setValue("");

    // Open the newly created project using its MongoDB ID.
    router.push(`/builder/${newProject._id}`);
  } catch (error) {
    console.error("Failed to create project", error);
    setError("Failed to create project.");
  } finally {
    setCreating(false);
  }
}

  // Open an existing project from the project grid.
  function handleOpenProject(project) {
    router.push(`/builder/${project._id}`);
  }

  return (
    <div className="bg-gray-50">
      <TopNav />

      <main className="mx-auto max-w-230 px-6 pt-18 pb-20 max-[640px]:px-4.5 max-[640px]:pt-12 max-[640px]:pb-20">
        <div className="text-center">
          <h1 className="text-[clamp(32px,5vw,48px)] font-bold tracking-tight">
            Build with AI
          </h1>

          <p className="mt-1.5 text-[17px] text-(--gray-500)">
            Turn your idea into a website.
          </p>
        </div>

        <PromptBox
          value={value}
          onChange={setValue}
          onSubmit={handleGenerate}
        />

        <ChipRow onSelect={fillFromChip} />

        {loading ? (
          <p className="mt-16 text-center text-(--gray-500)">
            Loading projects...
          </p>
        ) : error ? (
          <p className="mt-16 text-center text-red-500">
            {error}
          </p>
        ) : (
          <ProjectGrid
            projects={projects}
            onOpenProject={handleOpenProject}
          />
        )}
      </main>
    </div>
  );
};