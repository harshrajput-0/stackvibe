"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import {
  deleteProject,
  updateProjectDetails,
} from "@/api-client/projectService";

/**
 * State + API calls behind the project "⋮" menu (edit details / delete).
 * The dashboard owns the project list; this hook only needs its setter.
 *
 *   const actions = useProjectActions(setProjects);
 *   <ProjectGrid onEditProject={actions.startEdit} onDeleteProject={actions.startDelete} />
 *   <EditProjectModal project={actions.editing} … />
 */
export function useProjectActions(setProjects) {
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Rejects on failure so the edit form can show the message.
  const saveDetails = useCallback(
    async (changes) => {
      if (!editing) return;

      setIsSaving(true);
      try {
        const updated = await updateProjectDetails(editing._id, changes);
        setProjects((projects) =>
          projects.map((project) =>
            project._id === updated._id ? { ...project, ...updated } : project,
          ),
        );
        setEditing(null);
        toast.success("Changes saved");
      } finally {
        setIsSaving(false);
      }
    },
    [editing, setProjects],
  );

  const confirmDelete = useCallback(async () => {
    if (!deleting) return;

    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteProject(deleting._id);
      setProjects((projects) =>
        projects.filter((project) => project._id !== deleting._id),
      );
      setDeleting(null);
      toast.success("Project deleted");
    } catch (error) {
      setDeleteError(error.message);
    } finally {
      setIsDeleting(false);
    }
  }, [deleting, setProjects]);

  const closeDelete = useCallback(() => {
    setDeleting(null);
    setDeleteError("");
  }, []);

  return {
    editing,
    startEdit: setEditing,
    closeEdit: () => setEditing(null),
    saveDetails,
    isSaving,
    deleting,
    startDelete: setDeleting,
    closeDelete,
    confirmDelete,
    isDeleting,
    deleteError,
  };
}
