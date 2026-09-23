"use client";

import { useState } from "react";
import { Button, FormError, Input, Modal } from "@/components/ui";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import { PUBLIC_HOST } from "@/lib/constants";
import { sanitizeSlugInput, slugify } from "@/lib/utils/slugify";
import { projectDetailsSchema } from "@/lib/validators/project";
import { ThumbnailField } from "./ThumbnailField";

function EditProjectForm({ project, isSaving, onSave, onClose }) {
  const [title, setTitle] = useState(project.name ?? "");
  const [description, setDescription] = useState(project.description ?? "");
  const [slug, setSlug] = useState(project.slug ?? "");
  const [thumbnail, setThumbnail] = useState(project.thumbnail ?? null);

  // While linked, the slug follows the title. An existing project only starts
  // out linked if its URL already matches its title, so renaming never
  // silently changes a URL people may already be using.
  const [slugLinked, setSlugLinked] = useState(
    (project.slug ?? "") === slugify(project.name, ""),
  );

  const [serverError, setServerError] = useState({ field: "", message: "" });
  const { errors, validate, clear } = useFieldErrors();

  function handleTitleChange(value) {
    setTitle(value);
    clear("name");
    if (slugLinked) {
      setSlug(slugify(value, ""));
      clear("slug");
    }
  }

  function handleSlugChange(value) {
    setSlug(sanitizeSlugInput(value));
    setSlugLinked(false);
    clear("slug");
    setServerError({ field: "", message: "" });
  }

  function resetSlugToTitle() {
    setSlug(slugify(title, ""));
    setSlugLinked(true);
    clear("slug");
    setServerError({ field: "", message: "" });
  }

  // Only send what actually changed.
  const changes = {};
  if (title.trim() !== (project.name ?? "")) changes.name = title.trim();
  if (description.trim() !== (project.description ?? "")) {
    changes.description = description.trim();
  }
  if (slug !== (project.slug ?? "")) changes.slug = slugify(slug, "");
  if (thumbnail !== (project.thumbnail ?? null)) changes.thumbnail = thumbnail;
  const hasChanges = Object.keys(changes).length > 0;

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError({ field: "", message: "" });

    if (
      !validate({ title, slug }, { title: validateTitle, slug: validateSlug })
    ) {
      return;
    }
    if (!hasChanges) return;

    try {
      await onSave(changes);
    } catch (err) {
      // 409 = the slug belongs to another project; show it on the slug field.
      setServerError({
        field: err.status === 409 ? "slug" : "form",
        message: err.message,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-5">
      <ThumbnailField
        value={thumbnail}
        onChange={setThumbnail}
        disabled={isSaving}
      />

      <Input
        id="edit-title"
        label="Title"
        placeholder="My project"
        value={title}
        onChange={(event) => handleTitleChange(event.target.value)}
        error={errors.name}
        disabled={isSaving}
        data-autofocus
        className="mt-5"
      />

      <Input
        id="edit-desc"
        label="Description"
        placeholder="What is this project about?"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        disabled={isSaving}
        className="mt-5"
      />

      <Input
        id="edit-slug"
        label="Slug"
        prefix={`${PUBLIC_HOST}/`}
        inputClassName="font-(family-name:--mono) text-[13.5px]"
        autoComplete="off"
        spellCheck={false}
        value={slug}
        onChange={(event) => handleSlugChange(event.target.value)}
        error={
          errors.slug || (serverError.field === "slug" && serverError.message)
        }
        disabled={isSaving}
        className="mt-5"
      />
      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-(--gray-500)">
        <span>
          {slugLinked
            ? "Auto-generated from title."
            : "Custom URL, no longer follows the title."}
        </span>
        {!slugLinked && (
          <button
            type="button"
            onClick={resetSlugToTitle}
            disabled={isSaving}
            className="font-semibold text-(--gray-700)! hover:text-(--black)! hover:underline"
          >
            Reset to title
          </button>
        )}
      </div>

      <FormError>
        {serverError.field === "form" && serverError.message}
      </FormError>

      <div className="mt-6 flex gap-2.5">
        <Button variant="secondary" block onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          block
          loading={isSaving}
          disabled={!hasChanges}
        >
          Save changes
        </Button>
      </div>
    </form>
  );
}

/**
 * EditProjectModal — edit a project's thumbnail, title, description and URL.
 * Open it by passing the project; pass null to close it.
 *
 * `onSave(changes)` should return a promise and reject on failure, so the
 * error can be shown inside the dialog.
 */
export function EditProjectModal({ project, isSaving, onSave, onClose }) {
  return (
    <Modal
      open={Boolean(project)}
      onClose={onClose}
      title="Edit project details"
      description="Update the name, description, and URL for this project."
      dismissible={!isSaving}
    >
      {project && (
        <EditProjectForm
          key={project._id}
          project={project}
          isSaving={isSaving}
          onSave={onSave}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}
