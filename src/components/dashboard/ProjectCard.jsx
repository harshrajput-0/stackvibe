import moment from "moment";
import { ExternalLink } from "lucide-react";
import { ProjectThumb } from "./ProjectThumb";
import { ProjectMenu } from "./ProjectMenu";
import { Button } from "@/components/ui";

export const ProjectCard = ({ project, onOpen, onEdit, onDelete }) => {
  const edited = moment(project.updatedAt ?? project.createdAt).fromNow();

  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-[border-color,transform] duration-150 ease focus-within:border-gray-700 hover:-translate-y-0.5 hover:border-gray-700">
      {/* The card body is the "open" button; the menu and site link sit
          beside it as overlays, not nested inside it (a button can't
          contain another button/link). Fixed content height + flex keeps
          every card the same size regardless of title/description length,
          with the "Edited..." line always pinned to the bottom. */}
      <button
        type="button"
        className="flex h-full w-full flex-col text-left"
        onClick={() => onOpen(project)}
      >
        <ProjectThumb src={project.thumbnail} />
        <div className="flex min-h-30 flex-1 flex-col bg-white px-3.75 py-3.25">
          <div
            className="line-clamp-2 text-sm leading-5 font-semibold"
            title={project.name}
          >
            {project.name}
          </div>
          {project.description && (
            <p className="mt-0.75 line-clamp-3 text-xs leading-4.5 text-(--gray-500)">
              {project.description}
            </p>
          )}
          <div className="mt-auto pt-1 text-xs text-(--gray-500)">
            {project.meta ?? `Edited ${edited}`}
          </div>
        </div>
      </button>

      {/* ONLY PUBLISHED PROJECTS HAVE VISIT LINK */}
      {project.published && (
        <Button
          href={`/${project.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.stopPropagation()}
          variant="overlay"
          size="iconSm"
          aria-label={`Visit ${project.name}`}
          className="absolute top-2 left-2 z-10"
        >
          <ExternalLink size={14} />
        </Button>
      )}

      <ProjectMenu
        project={project}
        onEdit={onEdit}
        onDelete={onDelete}
        className="absolute top-2 right-2 z-10"
      />
    </div>
  );
};