/**
 * StackVibe logo with three stacked layers and a wave notch.
 * `color` controls the logo fill; the notch matches the background.
 *
 * `animated` enables a staggered CSS pulse while the AI works.
 * Respects prefers-reduced-motion via globals.css.
 *
 * `variant="flow"` animates all layers in sequence with a muted gray
 * fill, ideal for subtle inline loading indicators.
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

// Stagger layers back-to-front for a continuous ripple. Keep the front
// layer below full opacity so it animates too. Flow uses an even
// 0s/0.3s/0.6s stagger across all layers.
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
        style={layerStyle(0.75, "0.4s", "0.6s")}
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
