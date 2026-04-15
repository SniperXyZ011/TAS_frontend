import { useEffect, useState, useCallback } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { listNodes } from "../services/api";
import type { Node } from "../types/api";
import NodeTable from "../components/NodeTable";
import RegisterNodeModal from "../components/RegisterNodeModal";

export default function NodesPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listNodes();
      setNodes(data || []);
    } catch (err) {
      console.error("Failed to load nodes:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div id="nodes-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
            Edge Nodes
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            Manage registered ESP32 kiosk nodes in the armory mesh
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="btn-secondary" id="btn-refresh-nodes">
            <RefreshCw size={16} />
            Refresh
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary" id="btn-register-node">
            <Plus size={16} />
            Register Node
          </button>
        </div>
      </div>

      {/* Summary bar */}
      {!isLoading && nodes.length > 0 && (
        <div
          className="flex items-center gap-6 px-5 py-3 rounded-xl mb-6 animate-fade-in"
          style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}
        >
          <div className="flex items-center gap-2 text-sm">
            <span style={{ color: "var(--color-text-muted)" }}>Total:</span>
            <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>{nodes.length}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-success)" }} />
            <span style={{ color: "var(--color-text-muted)" }}>Active:</span>
            <span className="font-semibold" style={{ color: "var(--color-success)" }}>
              {nodes.filter((n) => n.is_active).length}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-danger)" }} />
            <span style={{ color: "var(--color-text-muted)" }}>Inactive:</span>
            <span className="font-semibold" style={{ color: "var(--color-danger)" }}>
              {nodes.filter((n) => !n.is_active).length}
            </span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-card p-6 animate-fade-in-up">
        <NodeTable nodes={nodes} isLoading={isLoading} />
      </div>

      {/* Register modal */}
      <RegisterNodeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRegistered={load}
      />
    </div>
  );
}
