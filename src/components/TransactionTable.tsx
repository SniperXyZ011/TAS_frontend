import type { Transaction } from "../types/api";
import StatusBadge from "./StatusBadge";

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading: boolean;
}

function formatTimestamp(unix: number): string {
  const d = new Date(unix * 1000);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function TransactionTable({
  transactions,
  isLoading,
}: TransactionTableProps) {
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

  if (transactions.length === 0) {
    return (
      <div className="text-center py-20" style={{ color: "var(--color-text-muted)" }}>
        <p className="text-lg font-medium">No transactions found</p>
        <p className="text-sm mt-1">Transactions will appear here once nodes start syncing.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--color-border)" }}>
      <table className="data-table" id="transactions-table">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Node ID</th>
            <th>User</th>
            <th>Weapon</th>
            <th>Action</th>
            <th>Qty</th>
            <th>Timestamp</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.transaction_id}>
              <td>
                <code className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--color-bg-input)", fontFamily: "var(--font-mono)" }}>
                  {tx.transaction_id.length > 12
                    ? `${tx.transaction_id.slice(0, 12)}…`
                    : tx.transaction_id}
                </code>
              </td>
              <td>
                <code className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--color-bg-input)", fontFamily: "var(--font-mono)" }}>
                  {tx.node_id.slice(0, 8)}…
                </code>
              </td>
              <td style={{ color: "var(--color-text-primary)" }}>{tx.user_id}</td>
              <td style={{ color: "var(--color-text-primary)" }}>{tx.weapon_id}</td>
              <td>
                <StatusBadge status={tx.action} />
              </td>
              <td className="text-center">{tx.quantity}</td>
              <td>{formatTimestamp(tx.timestamp)}</td>
              <td className="max-w-[200px] truncate">{tx.notes || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
