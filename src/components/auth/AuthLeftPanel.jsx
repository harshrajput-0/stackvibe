import { Logo } from "@/components/ui/Logo";

export function AuthLeftPanel() {
  return (
    <div className="flex flex-col justify-between bg-gray-900 text-white p-14 max-[860px]:min-h-70 max-[860px]:px-7 max-[860px]:py-9 w-full">
      <div className="flex items-center gap-2.5">
        <Logo width={19} height={21.4} color="white" />
        <span className="text-[16px] font-bold tracking-[-0.01em]">StackVibe</span>
      </div>
      <div className="max-w-105">
        <h1 className="text-[clamp(32px,4vw,44px)] leading-[1.15] font-bold tracking-[-0.02em] max-[640px]:text-[28px]">Build your ideas on the web.</h1>
        <p className="mt-3.5 max-w-85 text-[15px] leading-[1.6] text-gray-400 max-[640px]:mt-2.5 max-[640px]:text-sm">Describe what you want, and StackVibe writes, previews, and publishes the site for you.</p>
      </div>
      <div className="text-[13px] text-gray-500 max-[640px]:hiddent">© 2026 StackVibe</div>
    </div>
  );
}
