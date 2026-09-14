import { ProjectCard } from "./ProjectCard";

export const ProjectGrid = ({ projects, onOpenProject }) => {
  return (
    <>
      <div className="mt-16 mb-4.5 flex items-baseline justify-between">
        <h2 className="text-[15px] font-semibold text-(--gray-800)">
          Your projects
        </h2>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
        {projects.map((project) => (
          <ProjectCard
            key={project._id}
            project={project}
            onOpen={onOpenProject}
          />
        ))}
      </div>
    </>
  );
};