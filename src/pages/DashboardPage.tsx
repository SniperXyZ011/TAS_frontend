import { useEffect, useState } from "react";
import {
  Server,
  ArrowLeftRight,
  Activity,
  ShieldCheck,
  ArrowDownUp,
  Search,
  Eye,
  Truck,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { listNodes, listTransactions, getReadiness } from "../services/api";
import type { Node, Transaction, Action } from "../types/api";

const ACTION_ICONS: Record<Action, typeof ArrowDownUp> = {
  checkout: ArrowDownUp,
  checkin: CheckCircle,
  audit: Search,
  transfer: Truck,
  lost: AlertCircle,
  found: Eye,
};

function formatTimestamp(unix: number): string {
  const d = new Date(unix * 1000);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dbStatus, setDbStatus] = useState<"ready" | "unavailable" | "loading">("loading");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [nodeData, txData, health] = await Promise.all([
          listNodes(),
          listTransactions(10, 0),
          getReadiness(),
        ]);
        setNodes(nodeData || []);
        setTransactions(txData.transactions || []);
        setDbStatus(health.status === "ready" ? "ready" : "unavailable");
      } catch {
        setDbStatus("unavailable");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const activeNodes = nodes.filter((n) => n.is_active).length;
  const inactiveNodes = nodes.length - activeNodes;

  // Action breakdown
  const actionCounts: Record<string, number> = {};
  transactions.forEach((tx) => {
    actionCounts[tx.action] = (actionCounts[tx.action] || 0) + 1;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div
          className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div id="dashboard-page">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
          Command Center
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
          Tactical Armory System — Real-time overview
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
        <StatCard
          label="Total Nodes"
          value={nodes.length}
          icon={<Server size={20} />}
          accentColor="#3b82f6"
          subtitle={`${activeNodes} active · ${inactiveNodes} inactive`}
        />
        <StatCard
          label="Active Nodes"
          value={activeNodes}
          icon={<Activity size={20} />}
          accentColor="#22c55e"
          subtitle="Currently online"
        />
        <StatCard
          label="Recent Transactions"
          value={transactions.length}
          icon={<ArrowLeftRight size={20} />}
          accentColor="#f59e0b"
          subtitle="Last 10 synced"
        />
        <StatCard
          label="System Status"
          value={dbStatus === "ready" ? "Operational" : "Degraded"}
          icon={<ShieldCheck size={20} />}
          accentColor={dbStatus === "ready" ? "#22c55e" : "#ef4444"}
          subtitle={dbStatus === "ready" ? "All services healthy" : "Check database connection"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent transactions */}
        <div className="lg:col-span-2 glass-card p-6 animate-fade-in-up">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "var(--color-text-muted)" }}>
            Recent Activity
          </h2>
          {transactions.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: "var(--color-text-muted)" }}>
              No transactions yet
            </p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => {
                const Icon = ACTION_ICONS[tx.action] || ArrowLeftRight;
                return (
                  <div
                    key={tx.transaction_id}
                    className="flex items-center gap-4 px-4 py-3 rounded-lg transition-colors"
                    style={{ background: "var(--color-bg-input)" }}
                  >
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                      style={{ background: "var(--color-accent-muted)", color: "var(--color-accent)" }}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                          {tx.weapon_id}
                        </p>
                        <StatusBadge status={tx.action} />
                      </div>
                      <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
                        User: {tx.user_id} · Node: {tx.node_id.slice(0, 8)}…
                      </p>
                    </div>
                    <span className="text-xs shrink-0" style={{ color: "var(--color-text-muted)" }}>
                      {formatTimestamp(tx.timestamp)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Node status panel */}
        <div className="glass-card p-6 animate-fade-in-up">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "var(--color-text-muted)" }}>
            Node Status
          </h2>
          {nodes.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: "var(--color-text-muted)" }}>
              No nodes registered
            </p>
          ) : (
            <div className="space-y-3">
              {nodes.slice(0, 8).map((node) => (
                <div
                  key={node.node_id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                  style={{ background: "var(--color-bg-input)" }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: node.is_active ? "var(--color-success)" : "var(--color-danger)" }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                        {node.name}
                      </p>
                      <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
                        {node.location}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={node.tier} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
