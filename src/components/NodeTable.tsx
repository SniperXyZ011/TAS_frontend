import type { Node } from "../types/api";
import StatusBadge from "./StatusBadge";

interface NodeTableProps {
  nodes: Node[];
  isLoading: boolean;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(dateStr?: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NodeTable({ nodes, isLoading }: NodeTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="text-center py-20" style={{ color: "var(--color-text-muted)" }}>
        <p className="text-lg font-medium">No nodes registered</p>
        <p className="text-sm mt-1">Register your first edge node to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--color-border)" }}>
      <table className="data-table" id="nodes-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Node ID</th>
            <th>Location</th>
            <th>Tier</th>
            <th>Status</th>
            <th>Last Seen</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {nodes.map((node) => (
            <tr key={node.node_id}>
              <td className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                {node.name}
              </td>
              <td>
                <code className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--color-bg-input)", fontFamily: "var(--font-mono)" }}>
                  {node.node_id.slice(0, 8)}…
                </code>
              </td>
              <td>{node.location}</td>
              <td>
                <StatusBadge status={node.tier} />
              </td>
              <td>
                <StatusBadge status={node.is_active ? "active" : "inactive"} />
              </td>
              <td>
                <span title={formatDate(node.last_seen_at)}>
                  {timeAgo(node.last_seen_at)}
                </span>
              </td>
              <td>{formatDate(node.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
