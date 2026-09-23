"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { DEMO_EXAMPLES } from "@/lib/constants";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils/cn";

// Timings for the demo loop (ms).
const TYPE_INTERVAL = 34;
const REVEAL_START = 250;
const REVEAL_STEP = 240;
const HOLD_AFTER_REVEAL = 4500;

const ART = {
  plate: (
    <svg viewBox="0 0 100 85" className="size-full">
      <circle cx="50" cy="44" r="30" fill="#262626" />
      <circle
        cx="50"
        cy="44"
        r="19"
        fill="none"
        stroke="#a3a3a3"
        strokeWidth="2"
      />
    </svg>
  ),
  vase: (
    <svg viewBox="0 0 100 85" className="size-full">
      <path
        d="M42 74V52c0-12-8-14-8-24 0-8 8-10 8-16h16c0 6 8 8 8 16 0 10-8 12-8 24v22z"
        fill="#737373"
      />
    </svg>
  ),
  bowl: (
    <svg viewBox="0 0 100 85" className="size-full">
      <path d="M18 38h64c0 22-14 34-32 34S18 60 18 38z" fill="#404040" />
      <ellipse cx="50" cy="38" rx="32" ry="6" fill="#a3a3a3" />
    </svg>
  ),
};

// "lg" is the landing hero; "sm" is the compact version in the auth panel.
const SIZES = {
  lg: {
    root: "max-w-140",
    prompt: "h-13 text-[13.5px]",
    body: "min-h-85 px-5.5 pt-5 pb-5.5 max-[640px]:min-h-75 max-[640px]:p-4",
    nav: "text-[12.5px]",
    hero: "mt-6.5",
    heading: "text-[32px] max-[640px]:text-[26px]",
    text: "text-[13px]",
    cta: "h-7.5 px-3.5 text-xs",
    grid: "mt-5.5 gap-2.5",
  },
  sm: {
    root: "max-w-110",
    prompt: "h-12 text-[13px]",
    body: "px-4.5 pt-4 pb-4.5",
    nav: "text-[11px]",
    hero: "mt-4.5",
    heading: "text-[22px]",
    text: "text-[11.5px]",
    cta: "h-6.5 px-3 text-[11px]",
    grid: "mt-4 gap-2",
  },
};

/**
 * PromptDemo — a looping "prompt becomes a site" animation, shared by the
 * landing hero and the auth pages.
 *
 * examples:   list from DEMO_EXAMPLES (one example simply replays)
 * size:       "lg" | "sm"
 * showPicker: show the "Try an example" chips (landing only)
 */
export function PromptDemo({
  examples = DEMO_EXAMPLES,
  size = "lg",
  showPicker = false,
  className,
}) {
  const reduceMotion = useReducedMotion();
  const styles = SIZES[size];

  // `run.id` changes on every (re)start so the effect below replays even
  // when there is only one example.
  const [run, setRun] = useState({ index: 0, id: 0 });
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [typed, setTyped] = useState("");
  const [revealed, setRevealed] = useState(0);

  const example = examples[run.index];
  const totalSteps = 3 + example.tiles.length; // nav, hero, tiles…, live note

  useEffect(() => {
    if (reduceMotion) return;

    const timers = [];
    let count = 0;

    const typing = setInterval(() => {
      count += 1;
      setTyped(example.prompt.slice(0, count));
      if (count < example.prompt.length) return;

      clearInterval(typing);
      for (let step = 1; step <= totalSteps; step++) {
        timers.push(
          setTimeout(
            () => setRevealed(step),
            REVEAL_START + (step - 1) * REVEAL_STEP,
          ),
        );
      }

      if (autoAdvance) {
        timers.push(
          setTimeout(
            () => {
              setTyped("");
              setRevealed(0);
              setRun((current) => ({
                index: (current.index + 1) % examples.length,
                id: current.id + 1,
              }));
            },
            REVEAL_START + totalSteps * REVEAL_STEP + HOLD_AFTER_REVEAL,
          ),
        );
      }
    }, TYPE_INTERVAL);

    return () => {
      clearInterval(typing);
      timers.forEach(clearTimeout);
    };
  }, [run.id, autoAdvance, reduceMotion, example, examples.length, totalSteps]);

  function pick(index) {
    setAutoAdvance(false);
    setTyped("");
    setRevealed(0);
    setRun((current) => ({ index, id: current.id + 1 }));
  }

  const shownPrompt = reduceMotion ? example.prompt : typed;
  const shownSteps = reduceMotion ? totalSteps : revealed;

  // Each block fades in once its step has been reached.
  const reveal = (step) =>
    cn(
      "transition-[opacity,transform] duration-500 ease-out",
      shownSteps >= step
        ? "translate-y-0 opacity-100"
        : "translate-y-2 opacity-0",
    );

  return (
    <div className={cn("w-full", styles.root, className)}>
      <div aria-hidden="true">
        <div
          className={cn(
            "flex items-center rounded-md border border-white/16 bg-white/4 pr-2 pl-4 font-(family-name:--mono) text-(--gray-200)",
            styles.prompt,
          )}
        >
          <span className="truncate whitespace-pre">{shownPrompt}</span>
          <span className="ml-0.5 h-4 w-[1.5px] flex-none animate-blink bg-white" />
          <span className="ml-auto flex size-7.5 flex-none items-center justify-center rounded-full bg-white text-(--black)">
            <ArrowUp size={14} strokeWidth={2.2} />
          </span>
        </div>

        <div className="mt-3.5 overflow-hidden rounded-md bg-white text-(--black) shadow-[0_28px_60px_-24px_rgba(0,0,0,0.7)]">
          <div className="flex items-center gap-1.25 border-b border-(--gray-200) bg-(--gray-50) px-3 py-2.25">
            <i className="size-1.75 rounded-full bg-(--dotr)" /> 
            <i className="size-1.75 rounded-full bg-(--doty)" />
            <i className="size-1.75 rounded-full bg-(--dotg)" />
            <span className="ml-2.5 font-(family-name:--mono) text-[11px] text-(--gray-500)">
              {example.url}
            </span>
          </div>

          <div className={styles.body}>
            <div
              className={cn(
                "flex items-center justify-between font-bold tracking-[-0.01em]",
                styles.nav,
                reveal(1),
              )}
            >
              <span>{example.brand}</span>
              <span className="flex gap-3 font-medium text-(--gray-500)">
                {example.links.map((link) => (
                  <span key={link}>{link}</span>
                ))}
              </span>
            </div>

            <div className={cn(styles.hero, reveal(2))}>
              <h3
                className={cn(
                  "m-0 leading-[1.1] font-extrabold tracking-[-0.03em]",
                  styles.heading,
                )}
              >
                {example.heading[0]}
                <br />
                {example.heading[1]}
              </h3>
              <p className={cn("mt-1.5 text-(--gray-500)", styles.text)}>
                {example.text}
              </p>
              <b
                className={cn(
                  "mt-3 inline-flex items-center rounded-md bg-(--black) font-semibold text-white",
                  styles.cta,
                )}
              >
                {example.cta}
              </b>
            </div>

            <div className={cn("grid grid-cols-3", styles.grid)}>
              {example.tiles.map((tile, index) => (
                <div
                  key={`${run.id}-${index}`}
                  className={cn(
                    "aspect-[1/0.85] overflow-hidden rounded-md bg-(--gray-100)",
                    tile.art ? "" : "flex flex-col justify-end px-3 py-2.5",
                    reveal(3 + index),
                  )}
                >
                  {tile.art ? (
                    ART[tile.art]
                  ) : (
                    <>
                      <strong className="text-[15px] tracking-[-0.02em]">
                        {tile.title}
                      </strong>
                      <span className="mt-0.5 text-[11.5px] text-(--gray-500)">
                        {tile.meta}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className={cn(
            "mt-3 flex items-center gap-2 font-(family-name:--mono) text-[11.5px] text-(--gray-400) before:size-1.5 before:rounded-full before:bg-[#4ade80] before:content-['']",
            reveal(totalSteps),
          )}
        >
          Published and ready to share
        </div>
      </div>

      {showPicker && (
        <div
          role="group"
          aria-label="Try an example"
          className="mt-4.5 flex flex-wrap items-center gap-2"
        >
          <span className="mr-1 text-[13px] text-(--gray-500)">
            Try an example
          </span>
          {examples.map((item, index) => (
            <button
              key={item.label}
              type="button"
              aria-pressed={run.index === index}
              onClick={() => pick(index)}
              className={cn(
                "h-8 rounded-full border! px-3.5 text-[12.5px] font-medium transition-[background,color,border-color] duration-150",
                run.index === index
                  ? "border-white! bg-white! text-(--black)!"
                  : "border-white/18! text-(--gray-300)! hover:border-white/50! hover:text-white!",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
