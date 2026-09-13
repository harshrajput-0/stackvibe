export const ProjectCard = ({ project, onOpen }) => {
  return (
    <button
      className="overflow-hidden rounded-lg border! border-gray-200! bg-white text-left transition-[border-color,transform] duration-150 ease hover:-translate-y-0.5 hover:border-gray-700!"
      onClick={() => onOpen(project)}
    >
      <div className="flex aspect-16/10 items-end border-b border-gray-200! bg-[repeating-linear-gradient(135deg,var(--gray-100)_0_2px,var(--gray-50)_2px_14px)] p-3">
        <div className="w-full rounded-md border border-gray-200 bg-white p-1.5">
          <div className="flex gap-0.75 mb-1.25">
            <span className="size-1.25 shrink-0 rounded-full bg-(--gray-300)" />
            <span className="size-1.25 shrink-0 rounded-full bg-(--gray-300)" />
            <span className="size-1.25 shrink-0 rounded-full bg-(--gray-300)" />
          </div>
          <div className="mb-1 h-1.25 rounded-xs bg-gray-200" />
          <div className="mb-1 h-1.25 w-[55%] rounded-xs bg-gray-200" />
        </div>
      </div>
      <div className="px-3.75 py-3.25 bg-white">
        <div className="text-sm font-semibold">{project.name}</div>
        <div className="mt-0.75 text-xs text-(--gray-500)">{project.meta}</div>
      </div>
    </button>
  );
};
