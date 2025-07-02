import React from "react";

export function CircularProgress({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  className = "",
  label,
}: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
}) {
  const percent = Math.min(100, Math.round((value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke="#6366f1"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ transition: "stroke-dashoffset 0.5s" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-white">
        {label ?? `${percent}%`}
      </span>
    </div>
  );
}