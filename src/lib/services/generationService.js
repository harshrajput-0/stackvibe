import { GENERATION_STEP_DELAY_MS, GENERATION_COMPLETE_DELAY_MS, PLANNED_FILES } from "@/lib/constants";

export function runGenerationSequence({ onFileStart, onFileComplete, onComplete }) {
  const files = PLANNED_FILES;
  let step = 0;
  let cancelled = false;
  let timeoutId;

  function advance() {
    if (cancelled) return;

    if (step > 0) {
      const prevIndex = step - 1;
      const percent = Math.round((step / files.length) * 100);
      onFileComplete?.(prevIndex, files[prevIndex], percent);
    }

    if (step < files.length) {
      onFileStart?.(step, files[step]);
      step += 1;
      timeoutId = setTimeout(advance, GENERATION_STEP_DELAY_MS);
    } else {
      timeoutId = setTimeout(() => {
        if (!cancelled) onComplete?.();
      }, GENERATION_COMPLETE_DELAY_MS);
    }
  }

  advance();

  return function cancel() {
    cancelled = true;
    clearTimeout(timeoutId);
  };
}
