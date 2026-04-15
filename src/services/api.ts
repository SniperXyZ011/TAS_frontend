import type {
  Node,
  RegisterNodeRequest,
  RegisterNodeResponse,
  TransactionsResponse,
  Transaction,
  HealthResponse,
} from "../types/api";

const BASE_URL = (import.meta.env.VITE_API_URL ||
  "https://tas.sniperxyz.space").replace(/\/$/, "");

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

  if (res.status === 204) {
    return {} as T;
  }

  if (typeof res.text === "function") {
    const text = await res.text();
    if (!text) {
      return {} as T;
    }
    return JSON.parse(text) as T;
  }

  if (typeof res.json === "function") {
    return (await res.json()) as T;
  }

  return {} as T;
}

function isNode(value: unknown): value is Node {
  if (!value || typeof value !== "object") return false;
  const maybeNode = value as Partial<Node>;
  return typeof maybeNode.node_id === "string" && typeof maybeNode.name === "string";
}

function normalizeNode(value: unknown): Node | null {
  if (!value || typeof value !== "object") return null;

  const raw = value as Record<string, unknown>;

  const nodeId =
    (typeof raw.node_id === "string" && raw.node_id) ||
    (typeof raw.NodeID === "string" && raw.NodeID) ||
    "";
  const name =
    (typeof raw.name === "string" && raw.name) ||
    (typeof raw.Name === "string" && raw.Name) ||
    "";
  const location =
    (typeof raw.location === "string" && raw.location) ||
    (typeof raw.Location === "string" && raw.Location) ||
    "Unknown";

  if (!nodeId || !name) {
    return null;
  }

  const tierRaw =
    (typeof raw.tier === "string" && raw.tier) ||
    (typeof raw.Tier === "string" && raw.Tier) ||
    "standard";
  const tier =
    tierRaw === "priority" || tierRaw === "admin" ? tierRaw : "standard";

  const isActive =
    typeof raw.is_active === "boolean"
      ? raw.is_active
      : typeof raw.IsActive === "boolean"
      ? raw.IsActive
      : false;

  const createdAt =
    (typeof raw.created_at === "string" && raw.created_at) ||
    (typeof raw.CreatedAt === "string" && raw.CreatedAt) ||
    new Date(0).toISOString();

  const lastSeenAt =
    (typeof raw.last_seen_at === "string" && raw.last_seen_at) ||
    (typeof raw.LastSeenAt === "string" && raw.LastSeenAt) ||
    null;

  const apiKeyHash =
    (typeof raw.api_key_hash === "string" && raw.api_key_hash) ||
    (typeof raw.APIKeyHash === "string" && raw.APIKeyHash) ||
    undefined;

  return {
    node_id: nodeId,
    name,
    location,
    tier,
    is_active: isActive,
    created_at: createdAt,
    last_seen_at: lastSeenAt,
    api_key_hash: apiKeyHash,
  };
}

function normalizeNodeArray(items: unknown[]): Node[] {
  return items
    .map((item) => {
      if (isNode(item)) {
        const raw = item as Partial<Node>;
        return {
          node_id: raw.node_id,
          name: raw.name,
          location: typeof raw.location === "string" ? raw.location : "Unknown",
          tier:
            raw.tier === "priority" || raw.tier === "admin"
              ? raw.tier
              : "standard",
          is_active: typeof raw.is_active === "boolean" ? raw.is_active : false,
          created_at:
            typeof raw.created_at === "string"
              ? raw.created_at
              : new Date(0).toISOString(),
          last_seen_at:
            typeof raw.last_seen_at === "string" ? raw.last_seen_at : null,
          api_key_hash:
            typeof raw.api_key_hash === "string" ? raw.api_key_hash : undefined,
        };
      }
      return normalizeNode(item);
    })
    .filter((item): item is Node => item !== null);
}

function normalizeNodes(payload: unknown): Node[] {
  if (Array.isArray(payload)) {
    return normalizeNodeArray(payload);
  }

  if (payload && typeof payload === "object") {
    const maybe = payload as { nodes?: unknown };
    if (Array.isArray(maybe.nodes)) {
      return normalizeNodeArray(maybe.nodes);
    }
  }

  return [];
}

function normalizeTransactions(payload: unknown): TransactionsResponse {
  const emptyResponse: TransactionsResponse = {
    transactions: [],
    limit: 50,
    offset: 0,
  };

  if (Array.isArray(payload)) {
    return {
      ...emptyResponse,
      transactions: payload as Transaction[],
      limit: payload.length,
    };
  }

  if (!payload || typeof payload !== "object") {
    return emptyResponse;
  }

  const maybe = payload as Partial<TransactionsResponse>;
  const txs = Array.isArray(maybe.transactions) ? maybe.transactions : [];
  return {
    transactions: txs as Transaction[],
    limit: typeof maybe.limit === "number" ? maybe.limit : emptyResponse.limit,
    offset:
      typeof maybe.offset === "number" ? maybe.offset : emptyResponse.offset,
  };
}

// ─── Health ──────────────────────────────────────────────────────────────────

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE_URL}/health`);
  const body = (await res.json().catch(() => null)) as HealthResponse | null;
  return body ?? { status: "unavailable" };
}

export async function getReadiness(): Promise<HealthResponse> {
  const res = await fetch(`${BASE_URL}/ready`);
  const body = (await res.json().catch(() => null)) as HealthResponse | null;
  return body ?? { status: "unavailable" };
}

// ─── Nodes ───────────────────────────────────────────────────────────────────

export async function listNodes(): Promise<Node[]> {
  const payload = await authFetch<unknown>("/api/v1/nodes/list");
  return normalizeNodes(payload);
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

  const payload = await authFetch<unknown>(
    `/api/v1/transactions?${params.toString()}`
  );
  return normalizeTransactions(payload);
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
