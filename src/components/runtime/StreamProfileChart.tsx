import type { CrossSectionPoint } from "@/types/visit";

const VIEW_W = 320;
const VIEW_H = 180;
const MARGIN = { top: 16, right: 12, bottom: 26, left: 36 };
const PLOT_W = VIEW_W - MARGIN.left - MARGIN.right;
const PLOT_H = VIEW_H - MARGIN.top - MARGIN.bottom;

export function StreamProfileChart({
  points,
  distanceUnit = "m",
  depthUnit = "m",
  className,
}: {
  points: CrossSectionPoint[];
  distanceUnit?: string;
  depthUnit?: string;
  className?: string;
}) {
  const valid = points.filter(
    (p) => typeof p.distance === "number" && typeof p.depth === "number",
  );

  if (valid.length < 2) {
    return (
      <div
        className={`flex h-40 items-center justify-center rounded-lg border border-dashed border-border-soft text-sm text-slate-500 ${className ?? ""}`}
      >
        Add at least 2 points to see the profile
      </div>
    );
  }

  const sorted = [...valid].sort((a, b) => a.distance - b.distance);
  const maxDistance = Math.max(sorted[sorted.length - 1].distance, 0.001);
  const maxDepth = Math.max(...sorted.map((p) => p.depth), 0.001);
  const depthScale = maxDepth * 1.2;

  const x = (d: number) => MARGIN.left + (d / maxDistance) * PLOT_W;
  const y = (depth: number) => MARGIN.top + (depth / depthScale) * PLOT_H;
  const surfaceY = y(0);

  const bedPath = sorted.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.distance)} ${y(p.depth)}`).join(" ");
  const fillPath = `M ${x(sorted[0].distance)} ${surfaceY} ${sorted
    .map((p) => `L ${x(p.distance)} ${y(p.depth)}`)
    .join(" ")} L ${x(sorted[sorted.length - 1].distance)} ${surfaceY} Z`;

  const deepest = sorted.reduce((max, p) => (p.depth > max.depth ? p : max), sorted[0]);

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className={className}
      role="img"
      aria-label={`Stream depth profile with ${sorted.length} points, deepest ${deepest.depth}${depthUnit}`}
    >
      {/* surface line */}
      <line
        x1={MARGIN.left}
        y1={surfaceY}
        x2={MARGIN.left + PLOT_W}
        y2={surfaceY}
        stroke="var(--color-ocean-300, #6fcfd6)"
        strokeDasharray="4 3"
        strokeWidth="1"
      />
      <text
        x={MARGIN.left}
        y={surfaceY - 4}
        fontSize="8"
        fill="var(--color-ocean-500, #1f8fa0)"
      >
        surface
      </text>

      {/* water fill */}
      <path d={fillPath} fill="var(--color-ocean-400, #3bb0bd)" opacity="0.35" />
      {/* streambed line */}
      <path d={bedPath} fill="none" stroke="var(--color-ocean-700, #135a68)" strokeWidth="2" />

      {/* measured points */}
      {sorted.map((p, i) => (
        <circle
          key={i}
          cx={x(p.distance)}
          cy={y(p.depth)}
          r="2.6"
          fill="var(--color-ocean-700, #135a68)"
        />
      ))}

      {/* deepest point label */}
      <text
        x={x(deepest.distance)}
        y={y(deepest.depth) + 14}
        fontSize="8"
        textAnchor="middle"
        fill="var(--color-coral-500, #ff7043)"
      >
        {deepest.depth}
        {depthUnit}
      </text>

      {/* axes labels */}
      <text x={MARGIN.left} y={VIEW_H - 6} fontSize="8" fill="var(--foreground, #0f2a2e)">
        0{distanceUnit}
      </text>
      <text
        x={MARGIN.left + PLOT_W}
        y={VIEW_H - 6}
        fontSize="8"
        textAnchor="end"
        fill="var(--foreground, #0f2a2e)"
      >
        {maxDistance.toFixed(1)}
        {distanceUnit}
      </text>
      <text
        x={2}
        y={MARGIN.top + PLOT_H}
        fontSize="8"
        fill="var(--foreground, #0f2a2e)"
      >
        {maxDepth.toFixed(1)}
        {depthUnit}
      </text>
    </svg>
  );
}
