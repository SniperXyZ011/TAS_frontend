// ─── Node ────────────────────────────────────────────────────────────────────

export interface Node {
  node_id: string;
  name: string;
  location: string;
  tier: "standard" | "priority" | "admin";
  is_active: boolean;
  created_at: string;
  last_seen_at?: string | null;
  api_key_hash?: string;
}

export interface RegisterNodeRequest {
  name: string;
  location: string;
  tier: "standard" | "priority" | "admin";
}

export interface RegisterNodeResponse {
  node_id: string;
  name: string;
  api_key: string;
  secret: string;
}

// ─── Transaction ─────────────────────────────────────────────────────────────

export type Action =
  | "checkout"
  | "checkin"
  | "audit"
  | "transfer"
  | "lost"
  | "found";

export interface Transaction {
  transaction_id: string;
  node_id: string;
  user_id: string;
  weapon_id: string;
  action: Action;
  quantity: number;
  notes?: string;
  timestamp: number;
  signature: string;
}

export interface TransactionsResponse {
  transactions: Transaction[] | null;
  limit: number;
  offset: number;
}

// ─── Shared ──────────────────────────────────────────────────────────────────

export interface ErrorResponse {
  error: string;
  code: number;
  message: string;
}

export interface HealthResponse {
  status: string;
  reason?: string;
}
