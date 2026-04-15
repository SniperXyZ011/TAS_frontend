import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "../context/AuthContext";

// Mock the api module
vi.mock("../services/api", () => ({
  validateAdminKey: vi.fn(),
}));

import { validateAdminKey } from "../services/api";
const mockValidate = vi.mocked(validateAdminKey);

function TestConsumer() {
  const { isAuthenticated, isLoading, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <button onClick={() => login("test-key")} data-testid="btn-login">
        Login
      </button>
      <button onClick={logout} data-testid="btn-logout">
        Logout
      </button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockValidate.mockReset();
  });

  it("should start unauthenticated with no stored key", async () => {
    mockValidate.mockResolvedValue(false);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Wait for loading to finish
    await vi.waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    expect(screen.getByTestId("auth").textContent).toBe("false");
  });

  it("should restore session from sessionStorage on mount", async () => {
    sessionStorage.setItem("admin_key", "stored-key");
    mockValidate.mockResolvedValue(true);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await vi.waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    expect(screen.getByTestId("auth").textContent).toBe("true");
    expect(mockValidate).toHaveBeenCalledWith("stored-key");
  });

  it("should login and set authenticated", async () => {
    mockValidate.mockResolvedValue(true);
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await vi.waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    await user.click(screen.getByTestId("btn-login"));

    await vi.waitFor(() => {
      expect(screen.getByTestId("auth").textContent).toBe("true");
    });

    expect(sessionStorage.getItem("admin_key")).toBe("test-key");
  });

  it("should logout and clear session", async () => {
    sessionStorage.setItem("admin_key", "stored-key");
    mockValidate.mockResolvedValue(true);
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await vi.waitFor(() => {
      expect(screen.getByTestId("auth").textContent).toBe("true");
    });

    await user.click(screen.getByTestId("btn-logout"));

    expect(screen.getByTestId("auth").textContent).toBe("false");
    expect(sessionStorage.getItem("admin_key")).toBeNull();
  });
});
