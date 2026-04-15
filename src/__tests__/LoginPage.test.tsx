import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import LoginPage from "../pages/LoginPage";

// Mock the api module
vi.mock("../services/api", () => ({
  validateAdminKey: vi.fn(),
}));

import { validateAdminKey } from "../services/api";
const mockValidate = vi.mocked(validateAdminKey);

function renderLoginPage() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockValidate.mockReset();
    mockValidate.mockResolvedValue(false);
  });

  it("should render the login form", async () => {
    renderLoginPage();

    await vi.waitFor(() => {
      expect(screen.getByText("Tactical Armory System")).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText("Enter your admin key…")).toBeInTheDocument();
    expect(screen.getByText("Access Dashboard")).toBeInTheDocument();
  });

  it("should show error for empty key submission", async () => {
    renderLoginPage();
    const user = userEvent.setup();

    await vi.waitFor(() => {
      expect(screen.getByText("Access Dashboard")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Access Dashboard"));

    expect(screen.getByText("Admin key is required")).toBeInTheDocument();
  });

  it("should show error for invalid key", async () => {
    mockValidate.mockResolvedValue(false);
    renderLoginPage();
    const user = userEvent.setup();

    await vi.waitFor(() => {
      expect(screen.getByPlaceholderText("Enter your admin key…")).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText("Enter your admin key…"), "bad-key");
    await user.click(screen.getByText("Access Dashboard"));

    await vi.waitFor(() => {
      expect(screen.getByText("Invalid admin key. Access denied.")).toBeInTheDocument();
    });
  });

  it("should have proper page id", async () => {
    renderLoginPage();

    await vi.waitFor(() => {
      expect(document.getElementById("login-page")).toBeInTheDocument();
    });
  });
});
