import { ProjectCard } from "./ProjectCard";

export const ProjectGrid = ({
  projects,
  onOpenProject,
  onEditProject,
  onDeleteProject,
}) => {
  return (
    <>
      <div className="mt-16 mb-4.5 flex items-baseline justify-between">
        <h2 className="text-[15px] font-semibold text-(--gray-800)">
          Your projects
        </h2>
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-(--gray-500)">
          No projects yet. Describe a site above to create your first one.
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4 max-[640px]:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onOpen={onOpenProject}
              onEdit={onEditProject}
              onDelete={onDeleteProject}
            />
          ))}
        </div>
      )}
    </>
  );
};
