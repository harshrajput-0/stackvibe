import { Logo } from "@/components/ui/Logo";
import { Button } from "../ui/Button";

export const Header = () => {
  return (
    <div className="flex flex-none items-center justify-between px-12 py-5.5">
      <div className="flex items-center gap-2.5">
        <Logo width={19} height={21.4} color="white" />
        <span className="font-bold">StackVibe</span>
      </div>
      <div className="flex items-center gap-2.5">
        <Button variant="outline" size="sm" href={"/sign-in"}>
          Sign in
        </Button>
        <Button variant="secondary" size="sm" href={"/sign-in"}>
          Sign up
        </Button>
      </div>
    </div>
  );
};
