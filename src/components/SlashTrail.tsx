import { SlashPoint } from "../types";

interface SlashTrailProps {
  slashPath: SlashPoint[];
}

export default function SlashTrail({ slashPath }: SlashTrailProps) {
  return (
    <>
      {" "}
      {slashPath.length > 1 && (
        <svg
          className="absolute inset-0 pointer-events-none z-40"
          width="100%"
          height="100%"
        >
          <path
            d={`M ${slashPath
              .map((p: SlashPoint) => `${p.x},${p.y}`)
              .join(" L ")}`}
            stroke="url(#slashGradient)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
            style={{
              filter: "drop-shadow(0 0 8px rgba(255, 215, 0, 0.9))",
            }}
          />
          <defs>
            <linearGradient
              id="slashGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="50%" stopColor="#FFA500" />
              <stop offset="100%" stopColor="#FF6347" />
            </linearGradient>
          </defs>
        </svg>
      )}
    </>
  );
}
