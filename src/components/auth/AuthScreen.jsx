import { AuthLeftPanel } from "./AuthLeftPanel";

export function AuthScreen({ children }) {
  return (
    <div className="grid min-h-screen grid-cols-2 max-[860px]:grid-cols-1">
      <AuthLeftPanel />
      <div className="flex items-center justify-center bg-white p-10 max-[860px]:px-7 max-[860px]:py-9">{children}</div>
    </div>
  );
}
