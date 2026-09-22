import { Button } from "../ui";
import { GitHubIcon, GoogleIcon } from "@/components/ui/BrandIcons";

export function SocialButtons({ onGoogle, onGithub }) {
  return (
    <div className="mt-7 grid grid-cols-2 gap-2.5">
      <Button type="button" variant="social" onClick={onGoogle}>
        <GoogleIcon size={16} />
        Google
      </Button>
      <Button type="button" variant="social" onClick={onGithub}>
        <GitHubIcon size={16} />
        GitHub
      </Button>
    </div>
  );
}
