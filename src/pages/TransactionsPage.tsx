import { useEffect, useState, useCallback } from "react";
import { RefreshCw, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { listNodes, listTransactions } from "../services/api";
import type { Node, Transaction } from "../types/api";
import TransactionTable from "../components/TransactionTable";

const PAGE_SIZES = [25, 50, 100];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageSize, setPageSize] = useState(50);
  const [offset, setOffset] = useState(0);
  const [filterNodeId, setFilterNodeId] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listTransactions(
        pageSize,
        offset,
        filterNodeId || undefined
      );
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, offset, filterNodeId]);

  // Load nodes for filter dropdown
  useEffect(() => {
    listNodes()
      .then((data) => setNodes(data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handlePrev = () => {
    setOffset((prev) => Math.max(0, prev - pageSize));
  };

  const handleNext = () => {
    if (transactions.length === pageSize) {
      setOffset((prev) => prev + pageSize);
    }
  };

  const handleFilterChange = (nodeId: string) => {
    setFilterNodeId(nodeId);
    setOffset(0);
  };

  const currentPage = Math.floor(offset / pageSize) + 1;

  return (
    <div id="transactions-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
            Transactions
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            Weapon movement events synced from edge nodes
          </p>
        </div>
        <button onClick={load} className="btn-secondary" id="btn-refresh-transactions">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Filters bar */}
      <div
        className="flex flex-wrap items-center gap-4 px-5 py-3 rounded-xl mb-6 animate-fade-in"
        style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: "var(--color-text-muted)" }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            Filter by Node
          </span>
        </div>
        <select
          className="input-field max-w-[260px]"
          value={filterNodeId}
          onChange={(e) => handleFilterChange(e.target.value)}
          id="filter-node-id"
        >
          <option value="">All Nodes</option>
          {nodes.map((node) => (
            <option key={node.node_id} value={node.node_id}>
              {node.name} ({node.node_id.slice(0, 8)}…)
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Page size:
          </span>
          <select
            className="input-field w-[80px]"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setOffset(0);
            }}
            id="select-page-size"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card p-6 animate-fade-in-up">
        <TransactionTable transactions={transactions} isLoading={isLoading} />
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 px-1">
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          Showing {transactions.length} result{transactions.length !== 1 ? "s" : ""} · Page {currentPage}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={offset === 0}
            className="btn-secondary py-2 px-3"
            id="btn-prev-page"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNext}
            disabled={transactions.length < pageSize}
            className="btn-secondary py-2 px-3"
            id="btn-next-page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
