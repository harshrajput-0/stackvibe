"use client";

import { useCallback, useState } from "react";
import { updateProjectFiles } from "@/api-client/projectService";

/**
 * Manages the Code tab's editable files.
 *
 * Two copies of the file map are kept:
 *  - `files`  — what's shown on screen right now (edited or not). Preview,
 *               the file tree, and Download all read from this, so typing
 *               in the editor shows up there immediately, with nothing
 *               sent to the server yet.
 *  - `saved`  — the last content actually confirmed on the backend. Used
 *               to work out which paths are dirty, and what "Discard"
 *               reverts a file to.
 *
 * Whenever the server is the source of truth for a fresh set of files
 * (loading the project, finishing a generation, a chat revision), call
 * `setFromServer` so both copies move together and nothing is left
 * marked dirty by content the user never typed.
 */
export function useFileEditor() {
  const [files, setFiles] = useState({});
  const [saved, setSaved] = useState({});
  const [dirtyPaths, setDirtyPaths] = useState(() => new Set());

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Server is the source of truth for this file set (initial load,
  // generation finishing, a chat revision) — nothing here is "unsaved",
  // since the backend already has it.
  const setFromServer = useCallback((nextFiles = {}) => {
    setFiles(nextFiles);
    setSaved(nextFiles);
    setDirtyPaths(new Set());
  }, []);

  // The user typed in the editor for `path`. Updates the in-memory copy
  // immediately (so Preview can reflect it) and tracks whether that file
  // now differs from what's saved on the backend.
  const editFile = useCallback(
    (path, content) => {
      setFiles((prev) => ({ ...prev, [path]: content }));
      setDirtyPaths((prev) => {
        const next = new Set(prev);
        if (content === saved[path]) next.delete(path);
        else next.add(path);
        return next;
      });
    },
    [saved],
  );

  // Revert one file back to its last-saved content.
  const discardFile = useCallback(
    (path) => {
      setFiles((prev) => ({ ...prev, [path]: saved[path] ?? "" }));
      setDirtyPaths((prev) => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
    },
    [saved],
  );

  const openSaveModal = useCallback(() => {
    setSaveError("");
    setIsSaveModalOpen(true);
  }, []);

  const closeSaveModal = useCallback(() => {
    if (isSaving) return; // don't let the backdrop close it mid-request
    setIsSaveModalOpen(false);
  }, [isSaving]);

  // Persist the edits. The backend's PUT /api/projects/:id replaces the
  // *entire* files map it's given (it doesn't merge), so this always
  // sends the full current `files` — not just the dirty subset — or
  // every untouched file would be wiped out. "All modified files get
  // saved" still holds: they're the ones actually different inside that
  // full map.
  const save = useCallback(
    async (projectId) => {
      setIsSaving(true);
      setSaveError("");

      try {
        await updateProjectFiles(projectId, files);
        setSaved(files);
        setDirtyPaths(new Set());
        setIsSaveModalOpen(false);
        return true;
      } catch (err) {
        setSaveError(err.message || "Failed to save changes");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [files],
  );

  return {
    files,
    dirtyPaths,
    setFromServer,
    editFile,
    discardFile,
    isSaveModalOpen,
    openSaveModal,
    closeSaveModal,
    isSaving,
    saveError,
    save,
  };
}
