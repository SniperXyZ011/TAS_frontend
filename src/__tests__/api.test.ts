import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We need to set up the mock BEFORE importing the module
const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

// Dynamic import so the mock is in place
const api = await import("../services/api");

describe("API Service", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getHealth", () => {
    it("should call /health and return status", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: "ok" }),
      });

      const result = await api.getHealth();
      expect(result).toEqual({ status: "ok" });
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/health")
      );
    });
  });

  describe("getReadiness", () => {
    it("should call /ready and return status", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: "ready" }),
      });

      const result = await api.getReadiness();
      expect(result).toEqual({ status: "ready" });
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/ready")
      );
    });
  });

  describe("validateAdminKey", () => {
    it("should return true for valid key", async () => {
      fetchMock.mockResolvedValueOnce({ ok: true });
      const result = await api.validateAdminKey("test-key-123");
      expect(result).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/nodes/list"),
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Admin-Key": "test-key-123",
          }),
        })
      );
    });

    it("should return false for invalid key", async () => {
      fetchMock.mockResolvedValueOnce({ ok: false, status: 401 });
      const result = await api.validateAdminKey("bad-key");
      expect(result).toBe(false);
    });

    it("should return false on network error", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Network error"));
      const result = await api.validateAdminKey("any-key");
      expect(result).toBe(false);
    });
  });

  describe("listNodes", () => {
    it("should call /api/v1/nodes/list with X-Admin-Key header", async () => {
      sessionStorage.setItem("admin_key", "my-admin-key");

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            { node_id: "abc", name: "Node-1", is_active: true },
          ]),
      });

      const result = await api.listNodes();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Node-1");
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/nodes/list"),
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Admin-Key": "my-admin-key",
          }),
        })
      );
    });

    it("should throw on non-2xx response", async () => {
      sessionStorage.setItem("admin_key", "my-admin-key");

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: () =>
          Promise.resolve({
            error: "Unauthorized",
            code: 401,
            message: "invalid admin key",
          }),
      });

      await expect(api.listNodes()).rejects.toEqual(
        expect.objectContaining({ code: 401 })
      );
    });
  });

  describe("listTransactions", () => {
    it("should include pagination params and optional node_id", async () => {
      sessionStorage.setItem("admin_key", "key");

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            transactions: [],
            limit: 25,
            offset: 0,
          }),
      });

      await api.listTransactions(25, 0, "node-abc");
      const calledUrl = fetchMock.mock.calls[0][0] as string;
      expect(calledUrl).toContain("limit=25");
      expect(calledUrl).toContain("offset=0");
      expect(calledUrl).toContain("node_id=node-abc");
    });

    it("should not include node_id when not provided", async () => {
      sessionStorage.setItem("admin_key", "key");

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ transactions: [], limit: 50, offset: 0 }),
      });

      await api.listTransactions(50, 0);
      const calledUrl = fetchMock.mock.calls[0][0] as string;
      expect(calledUrl).not.toContain("node_id");
    });
  });

  describe("registerNode", () => {
    it("should POST to /api/v1/nodes with body", async () => {
      sessionStorage.setItem("admin_key", "key");

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            node_id: "new-id",
            name: "Test",
            api_key: "key-123",
            secret: "secret-456",
          }),
      });

      const result = await api.registerNode({
        name: "Test",
        location: "Loc",
        tier: "standard",
      });

      expect(result.node_id).toBe("new-id");
      expect(result.api_key).toBe("key-123");
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/nodes"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            name: "Test",
            location: "Loc",
            tier: "standard",
          }),
        })
      );
    });
  });
});
