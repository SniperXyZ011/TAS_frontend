import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  accentColor?: string;
  subtitle?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  accentColor = "var(--color-accent)",
  subtitle,
}: StatCardProps) {
  return (
    <div className="glass-card p-5 animate-fade-in-up" id={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex items-start justify-between mb-3">
        <span
          className="flex items-center justify-center w-10 h-10 rounded-lg"
          style={{ background: `${accentColor}18`, color: accentColor }}
        >
          {icon}
        </span>
      </div>
      <p className="text-[0.75rem] font-medium uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </p>
      <p className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
