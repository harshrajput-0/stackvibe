/**
 * The StackVibe brand mark — three stacked layers with a "vibe" wave
 * notch cut through the front layer. `color` selects white (for dark
 * backgrounds) or black (for light backgrounds), matching the mockup's
 * two variants. The wave notch always renders in the color that reads
 * as the page background showing through the front layer.
 */
export function Logo({
  width = 19,
  height = 19.4,
  color = "white",
  className,
}) {
  const fill = color === "white" ? "#FFFFFF" : "#111111";
  const notch = color === "white" ? "#0A0A0A" : "#FFFFFF";

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
      <path d="M45 4 L86 24 L45 44 L4 24 Z" fill={fill} opacity="0.25" />
      <path d="M45 26 L86 46 L45 66 L4 46 Z" fill={fill} opacity="0.55" />
      <path d="M45 48 L86 68 L45 88 L4 68 Z" fill={fill} />
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
