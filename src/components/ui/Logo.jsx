/**
 * StackVibe logo.
 *
 * Static mark: three stacked layers (black in front, lighter toward the
 * back) with a "vibe" wave on the front layer. Matches app/favicon.ico and
 * public/logos/*.svg.
 *
 * Animated mark ("Pulse Vibe"): three bars pulsing out of phase, like a
 * small equalizer — used anywhere the app needs a "working / generating"
 * indicator. The CSS lives in globals.css (.logo-pulse-*), and stops when
 * the user prefers reduced motion.
 *
 * Props
 *  - size      width in px. Height is calculated so the static mark is
 *              never stretched; the animated mark is drawn on a square grid.
 *  - color     "black" (default, for light backgrounds) or "white" (for dark ones).
 *  - animated  swaps the static mark for the Pulse Vibe loading animation.
 */

// The static artwork is drawn on a 90 x 92 grid.
const VIEW_W = 90;
const VIEW_H = 92;

// Layer opacity (back, middle, front) gives the "black to lighter" look.
const LAYERS = [
  { name: "back", d: "M45 4 L86 24 L45 44 L4 24 Z", opacity: 0.25 },
  { name: "middle", d: "M45 26 L86 46 L45 66 L4 46 Z", opacity: 0.55 },
  { name: "front", d: "M45 48 L86 68 L45 88 L4 68 Z", opacity: 1 },
];

// Pulse Vibe is drawn on its own square grid, independent of the static mark.
const PULSE_VIEW = 44;
const PULSE_BARS = [
  { x: 8, opacityClass: "logo-pulse-b1" },
  { x: 19, opacityClass: "logo-pulse-b2" },
  { x: 30, opacityClass: "logo-pulse-b3" },
];

export function Logo({
  size = 19,
  color = "black",
  animated = false,
  className,
}) {
  const fill = color === "white" ? "#FFFFFF" : "#111111";

  if (animated) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${PULSE_VIEW} ${PULSE_VIEW}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={className}
      >
        {PULSE_BARS.map((bar) => (
          <rect
            key={bar.x}
            className={`logo-pulse-bar ${bar.opacityClass}`}
            x={bar.x}
            y="19"
            width="6"
            height="6"
            rx="3"
            fill={fill}
          />
        ))}
      </svg>
    );
  }

  // The wave sits on the front layer, so it uses the opposite color.
  const wave = color === "white" ? "#0A0A0A" : "#FFFFFF";
  const [back, middle, front] = LAYERS;

  return (
    <svg
      width={size}
      height={(size * VIEW_H) / VIEW_W}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path d={back.d} fill={fill} opacity={back.opacity} />
      <path d={middle.d} fill={fill} opacity={middle.opacity} />
      <path d={front.d} fill={fill} />
      <path
        d="M18 68 Q27 58 36 68 T54 68 T72 68"
        stroke={wave}
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.95"
      />
    </svg>
  );
}
