import type {
  Node,
  RegisterNodeRequest,
  RegisterNodeResponse,
  TransactionsResponse,
  HealthResponse,
} from "../types/api";

const BASE_URL = import.meta.env.VITE_API_URL || "tas.sniperxyz.space";

/**
 * Wrapper around fetch that injects the X-Admin-Key header from sessionStorage.
 * Throws on non-2xx responses with the parsed error body.
 */
async function authFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const adminKey = sessionStorage.getItem("admin_key") || "";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Admin-Key": adminKey,
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({
      error: "Unknown",
      code: res.status,
      message: res.statusText,
    }));
    throw body;
  }

  return res.json() as Promise<T>;
}

// ─── Health ──────────────────────────────────────────────────────────────────

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE_URL}/health`);
  return res.json();
}

export async function getReadiness(): Promise<HealthResponse> {
  const res = await fetch(`${BASE_URL}/ready`);
  return res.json();
}

// ─── Nodes ───────────────────────────────────────────────────────────────────

export async function listNodes(): Promise<Node[]> {
  return authFetch<Node[]>("/api/v1/nodes/list");
}

export async function registerNode(
  req: RegisterNodeRequest
): Promise<RegisterNodeResponse> {
  return authFetch<RegisterNodeResponse>("/api/v1/nodes", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

// ─── Transactions ────────────────────────────────────────────────────────────

export async function listTransactions(
  limit = 50,
  offset = 0,
  nodeId?: string
): Promise<TransactionsResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  if (nodeId) params.set("node_id", nodeId);

  return authFetch<TransactionsResponse>(
    `/api/v1/transactions?${params.toString()}`
  );
}

// ─── Auth validation ─────────────────────────────────────────────────────────

/**
 * Validates the admin key by attempting to call a protected endpoint.
 * Returns true if the key is valid (2xx), false otherwise.
 */
export async function validateAdminKey(key: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/nodes/list`, {
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Key": key,
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}
