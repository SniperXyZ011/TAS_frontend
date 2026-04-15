import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusBadge from "../components/StatusBadge";

describe("StatusBadge", () => {
  it("should render the status text", () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("should render custom label when provided", () => {
    render(<StatusBadge status="active" label="Online" />);
    expect(screen.getByText("Online")).toBeInTheDocument();
    expect(screen.queryByText("active")).not.toBeInTheDocument();
  });

  it("should apply green colors for active status", () => {
    const { container } = render(<StatusBadge status="active" />);
    const badge = container.firstChild as HTMLElement;
    // jsdom normalizes hex to rgb
    expect(badge.style.color).toBe("rgb(34, 197, 94)");
  });

  it("should apply red colors for inactive status", () => {
    const { container } = render(<StatusBadge status="inactive" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.style.color).toBe("rgb(239, 68, 68)");
  });

  it("should apply amber colors for checkout action", () => {
    const { container } = render(<StatusBadge status="checkout" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.style.color).toBe("rgb(245, 158, 11)");
  });

  it("should fallback to gray for unknown status", () => {
    const { container } = render(<StatusBadge status="unknown-status" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.style.color).toBe("rgb(100, 116, 139)");
  });

  it("should render a dot indicator", () => {
    const { container } = render(<StatusBadge status="active" />);
    const dot = container.querySelector("span > span");
    expect(dot).toBeInTheDocument();
  });
});
