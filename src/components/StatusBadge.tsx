interface StatusBadgeProps {
  status: "active" | "inactive" | "online" | "offline" | string;
  label?: string;
}

const colorMap: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: "#22c55e18", text: "#22c55e", dot: "#22c55e" },
  online: { bg: "#22c55e18", text: "#22c55e", dot: "#22c55e" },
  inactive: { bg: "#ef444418", text: "#ef4444", dot: "#ef4444" },
  offline: { bg: "#ef444418", text: "#ef4444", dot: "#ef4444" },
  standard: { bg: "#3b82f618", text: "#3b82f6", dot: "#3b82f6" },
  priority: { bg: "#f59e0b18", text: "#f59e0b", dot: "#f59e0b" },
  admin: { bg: "#a855f718", text: "#a855f7", dot: "#a855f7" },
  checkout: { bg: "#f59e0b18", text: "#f59e0b", dot: "#f59e0b" },
  checkin: { bg: "#22c55e18", text: "#22c55e", dot: "#22c55e" },
  audit: { bg: "#3b82f618", text: "#3b82f6", dot: "#3b82f6" },
  transfer: { bg: "#8b5cf618", text: "#8b5cf6", dot: "#8b5cf6" },
  lost: { bg: "#ef444418", text: "#ef4444", dot: "#ef4444" },
  found: { bg: "#06b6d418", text: "#06b6d4", dot: "#06b6d4" },
};

const fallback = { bg: "#64748b18", text: "#64748b", dot: "#64748b" };

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const colors = colorMap[status.toLowerCase()] || fallback;
  const text = label || status;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
      style={{ background: colors.bg, color: colors.text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: colors.dot }}
      />
      {text}
    </span>
  );
}
