import { ProjectCard } from "./ProjectCard";

export const ProjectGrid = ({ projects, onOpenProject }) => {
  return (
    <>
      <div className="flex items-baseline justify-between mt-16 mb-4.5">
        <h2 className="text-[15px] font-semibold text-(--gray-800)">
          Your projects
        </h2>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onOpen={onOpenProject}
          />
        ))}
      </div>
    </>
  );
};
