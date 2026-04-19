import { circleDashArray } from "@/lib/calculations";

export function CircleProgress({
  percent,
  size = 200,
  stroke = 8,
}: {
  percent: number;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const { circumference, offset } = circleDashArray(percent, radius);
  const display = Math.round(percent);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--brand)"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 600ms ease-out" }}
        />
      </svg>
      <div className="absolute flex items-baseline gap-0.5">
        <span className="font-display text-[56px] leading-none tabular-nums text-fg">
          {display}
        </span>
        <span className="text-body-sm text-fg-muted">%</span>
      </div>
    </div>
  );
}
