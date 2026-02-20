import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CampaignMetricsForm } from "./CampaignMetricsForm";

const defaultProps = {
  campaignId: "campaign-1",
  campaignName: "Campanha piloto",
  channel: "google" as const,
  onSubmit: vi.fn(() => Promise.resolve()),
  onCancel: vi.fn(),
  initialData: {
    cac_ltv_benchmark: "3",
  },
  isEditing: false,
};

describe("CampaignMetricsForm benchmark dialog", () => {
  it("opens the dialog when the helper action is clicked and closes after selecting a card", async () => {
    const user = userEvent.setup();

    render(<CampaignMetricsForm {...defaultProps} />);

    const verListaButton = screen.getByRole("button", { name: /ver lista/i });
    await user.click(verListaButton);

    expect(screen.getByRole("heading", { name: /benchmarks cac:ltv por nicho/i })).toBeInTheDocument();

    const saasErpCard = screen.getByRole("button", { name: /saas erp/i });
    await user.click(saasErpCard);

    expect(screen.queryByRole("heading", { name: /benchmarks cac:ltv por nicho/i })).not.toBeInTheDocument();

    const benchmarkInput = screen.getByLabelText(/benchmark cac:ltv/i) as HTMLInputElement;
    expect(benchmarkInput.value).toBe("3.00");
  });

  it("displays the selected benchmark label next to the action", () => {
    render(<CampaignMetricsForm {...defaultProps} />);

    expect(screen.getByText(/1:3/i)).toBeInTheDocument();
  });
});
