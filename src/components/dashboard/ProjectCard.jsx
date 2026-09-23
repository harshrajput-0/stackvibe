import moment from "moment";
import { ProjectThumb } from "./ProjectThumb";
import { ProjectMenu } from "./ProjectMenu";

export const ProjectCard = ({ project, onOpen, onEdit, onDelete }) => {
  const edited = moment(project.updatedAt ?? project.createdAt).fromNow();

  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-[border-color,transform] duration-150 ease focus-within:border-gray-700 hover:-translate-y-0.5 hover:border-gray-700">
      {/* The card body is the "open" button; the menu sits beside it, not inside it. */}
      <button
        type="button"
        className="block w-full text-left"
        onClick={() => onOpen(project)}
      >
        <ProjectThumb src={project.thumbnail} />
        <div className="bg-white px-3.75 py-3.25">
          <div className="text-sm font-semibold">{project.name}</div>
          {project.description && (
            <p className="mt-0.75 line-clamp-2 text-xs text-(--gray-500)">
              {project.description}
            </p>
          )}
          <div className="mt-0.75 text-xs text-(--gray-500)">
            {project.meta ?? `Edited ${edited}`}
          </div>
        </div>
      </button>

      <ProjectMenu
        project={project}
        onEdit={onEdit}
        onDelete={onDelete}
        className="absolute top-2 right-2 z-10"
      />
    </div>
  );
};