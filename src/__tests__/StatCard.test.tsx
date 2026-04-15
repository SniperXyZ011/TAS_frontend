import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatCard from "../components/StatCard";
import { Server } from "lucide-react";

describe("StatCard", () => {
  it("should render label and value", () => {
    render(
      <StatCard label="Total Nodes" value={42} icon={<Server size={20} />} />
    );

    expect(screen.getByText("Total Nodes")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("should render subtitle when provided", () => {
    render(
      <StatCard
        label="Active"
        value={10}
        icon={<Server size={20} />}
        subtitle="Currently online"
      />
    );

    expect(screen.getByText("Currently online")).toBeInTheDocument();
  });

  it("should not render subtitle when not provided", () => {
    render(
      <StatCard label="Test" value={0} icon={<Server size={20} />} />
    );

    expect(screen.queryByText("Currently online")).not.toBeInTheDocument();
  });

  it("should have an id based on label", () => {
    const { container } = render(
      <StatCard label="Total Nodes" value={5} icon={<Server size={20} />} />
    );

    expect(container.querySelector("#stat-total-nodes")).toBeInTheDocument();
  });
});
