/**
 * The StackVibe brand mark — three stacked layers with a "vibe" wave
 * notch cut through the front layer. `color` selects white (for dark
 * backgrounds) or black (for light backgrounds), matching the mockup's
 * two variants. The wave notch always renders in the color that reads
 * as the page background showing through the front layer.
 *
 * `animated` makes the three layers "breathe" in sequence (back layer
 * first, front layer last) on a continuous loop — use this anywhere the
 * AI agent is actively working, so the UI reads as alive rather than
 * stuck. Purely decorative: it's driven by CSS only (no JS, no timers),
 * and respects prefers-reduced-motion via the global override in
 * globals.css.
 *
 * `variant="flow"` swaps the default "pulse" behavior (back layer dim,
 * front layer locked at full opacity) for one where every layer,
 * including the front one, dips down and back up, staggered — the
 * color visibly travels through the stack instead of the bottom layer
 * sitting fixed. Pairs with a muted gray fill rather than solid
 * black/white, for small inline indicators (e.g. a chat log row) where
 * a stark black mark would feel heavier than the surrounding text.
 */
export function Logo({
  width = 19,
  height = 19.4,
  color = "white",
  animated = false,
  variant = "pulse",
  className,
}) {
  const isFlow = variant === "flow";
  const fill = isFlow ? "#4B5563" : color === "white" ? "#FFFFFF" : "#111111";
  const notch = color === "white" ? "#0A0A0A" : "#FFFFFF";

  // Each layer pulses in turn, back to front, so the stack reads as a
  // continuous ripple rather than three things blinking in unison.
  // Flow uses a wider, even stagger (0s/0.3s/0.6s) since all three layers
  // play the same dip, whereas pulse only needs to offset the two layers
  // that actually move (the front layer stays locked at full opacity).
  const layerStyle = (opacity, pulseDelay, flowDelay) =>
    animated
      ? isFlow
        ? {
            "--logo-min": 0.2,
            animation: "logo-flow 1.8s var(--ease) infinite",
            animationDelay: flowDelay,
          }
        : {
            "--logo-opacity": opacity,
            animation: "logo-pulse 1.8s var(--ease) infinite",
            animationDelay: pulseDelay,
          }
      : undefined;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 90 92"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M45 4 L86 24 L45 44 L4 24 Z"
        fill={fill}
        opacity={isFlow ? undefined : "0.25"}
        style={layerStyle(0.25, "0s", "0s")}
      />
      <path
        d="M45 26 L86 46 L45 66 L4 46 Z"
        fill={fill}
        opacity={isFlow ? undefined : "0.55"}
        style={layerStyle(0.55, "0.2s", "0.3s")}
      />
      <path
        d="M45 48 L86 68 L45 88 L4 68 Z"
        fill={fill}
        style={layerStyle(1, "0.4s", "0.6s")}
      />
      <path
        d="M18 68 Q27 58 36 68 T54 68 T72 68"
        fill="none"
        stroke={notch}
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.95"
      />
    </svg>
  );
}
