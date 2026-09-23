export const Divider = ({ children }) => {
  return (
    <div className="mt-5 flex items-center gap-3 text-[13px] text-gray-400 before:h-px before:flex-1 before:bg-gray-200 before:content-[''] after:h-px after:flex-1 after:bg-gray-200 after:content-['']">
      {children}
    </div>
  );
};
