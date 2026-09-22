import { Button, Container } from "@/components/ui";
import { PromptDemo } from "@/components/shared/PromptDemo";

export const Hero = () => {
  return (
    <Container
      as="main"
      className="grid flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] items-center gap-16 pt-4 pb-8 max-[900px]:grid-cols-1 max-[900px]:gap-11 max-[900px]:pt-6 max-[900px]:pb-12"
    >
      <div> 
        <h1 className="max-w-135 text-[clamp(38px,5vw,60px)] leading-[1.04] font-extrabold tracking-[-0.035em]">
          Build your ideas on the web.
        </h1>
        <p className="mt-5 max-w-115 text-[17px] leading-[1.55] text-(--gray-400)">
          Describe what you want. StackVibe writes the code, shows a live
          preview, and publishes the site when you&rsquo;re ready. No code
          needed.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="secondary" href="/sign-up">
            Start building — it&rsquo;s free
          </Button>
          <Button variant="outline" href="/sign-in">
            Sign in
          </Button>
        </div>
        <p className="mt-3.5 text-[13px] text-(--gray-500)">
          Free to start. No card needed.
        </p>
      </div>

      <PromptDemo
        size="lg"
        showPicker
        className="justify-self-end max-[900px]:max-w-none max-[900px]:justify-self-stretch"
      />
    </Container>
  );
};
