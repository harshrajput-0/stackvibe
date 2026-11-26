import { useId } from "react";

/**
 * StackVibe logo: three stacked layers (black in front, lighter toward the
 * back) with a "vibe" wave on the front layer. Matches app/favicon.ico and
 * public/logos/*.svg.
 *
 * Props
 *  - size      width in px. Height is calculated so the logo is never stretched.
 *  - color     "black" (default, for light backgrounds) or "white" (for dark ones).
 *  - animated  plays the loading animation: layers lift back -> front and the
 *              wave flows. The CSS lives in globals.css (.logo-*), and stops
 *              when the user prefers reduced motion.
 */

// The artwork is drawn on a 90 x 92 grid.
const VIEW_W = 90;
const VIEW_H = 92;

// Layer opacity (back, middle, front) gives the "black to lighter" look.
const LAYERS = [
  { name: "back", d: "M45 4 L86 24 L45 44 L4 24 Z", opacity: 0.25 },
  { name: "middle", d: "M45 26 L86 46 L45 66 L4 46 Z", opacity: 0.55 },
  { name: "front", d: "M45 48 L86 68 L45 88 L4 68 Z", opacity: 1 },
];

export function Logo({
  size = 19,
  color = "black",
  animated = false,
  className,
}) {
  // useId gives each logo on the page its own mask/gradient ids.
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const fadeId = `logo-fade-${id}`;
  const maskId = `logo-mask-${id}`;

  const fill = color === "white" ? "#FFFFFF" : "#111111";
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
      {animated && (
        <defs>
          {/* Fades the flowing wave out at both ends. */}
          <linearGradient
            id={fadeId}
            gradientUnits="userSpaceOnUse"
            x1="14"
            y1="0"
            x2="76"
            y2="0"
          >
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.22" stopColor="#fff" stopOpacity="1" />
            <stop offset="0.78" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={VIEW_W}
            height={VIEW_H}
          >
            <rect x="14" y="40" width="62" height="50" fill={`url(#${fadeId})`} />
          </mask>
        </defs>
      )}

      <path
        d={back.d}
        fill={fill}
        opacity={back.opacity}
        className={animated ? "logo-layer logo-back" : undefined}
      />
      <path
        d={middle.d}
        fill={fill}
        opacity={middle.opacity}
        className={animated ? "logo-layer logo-middle" : undefined}
      />

      {animated ? (
        // Front layer and wave lift together.
        <g className="logo-layer logo-front">
          <path d={front.d} fill={fill} />
          <g mask={`url(#${maskId})`}>
            {/* 3 wave periods wide; slid by exactly one period (36) so the
                loop is seamless. */}
            <path
              className="logo-wave"
              d="M-18 68 Q-9 58 0 68 T18 68 T36 68 T54 68 T72 68 T90 68 T108 68"
              stroke={wave}
              strokeWidth="3.2"
              strokeLinecap="round"
              opacity="0.95"
            />
          </g>
        </g>
      ) : (
        <>
          <path d={front.d} fill={fill} />
          <path
            d="M18 68 Q27 58 36 68 T54 68 T72 68"
            stroke={wave}
            strokeWidth="3.2"
            strokeLinecap="round"
            opacity="0.95"
          />
        </>
      )}
    </svg>
  );
}
