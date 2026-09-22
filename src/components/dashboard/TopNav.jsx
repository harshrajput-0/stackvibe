import { UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/ui/Logo";

export const TopNav = () => {
  return (
    <div className="flex items-center justify-between border-b border-(--gray-200) bg-(--white) px-8 py-5 max-[640px]:px-5 max-[640px]:py-4">
      <div className="flex items-center gap-2.5">
        <Logo width={19} height={18} color="black" className="block" />
        <span className="font-bold">StackVibe</span>
      </div>
      <UserButton
        appearance={{
          elements: {
            userButtonAvatarBox: { width: 34, height: 34 },
          },
        }}
      />
    </div>
  );
};
