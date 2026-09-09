import { Button } from "../ui/Button";

export const Hero = () => {
  return (
    <div className="flex flex-1 min-h-0 flex-col items-center justify-center text-center px-6 py-4">

      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 text-[12px] mb-5.5" 
      // style={{border: 1px solid rgba(255, 255, 255, 0.15);}}
      >
        ✦ AI-powered site builder</div>
      <h1 className="text-[clamp(30px,5vw,58px)] font-extrabold tracking-[-0.03em] leading-[1.08] max-w-205">Build your ideas on the web.</h1>
      <p className="mt-4 max-w-130 text-base leading-[1.6] text-(--gray-400)">
        Describe what you want, and StackVibe writes, previews, and publishes the site for you — no code
        required.
      </p>
      <div className="mt-7.5 flex gap-3 flex-wrap justify-center">
        <Button variant="secondary" href={"/sign-up"}>
          Start building — it&rsquo;s free
        </Button>
        <Button variant="outline" href={"/sign-up"}>
          Sign in
        </Button>

      </div>
    </div>
  );
}
