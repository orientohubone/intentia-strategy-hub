import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TiaGuidedSection } from "../components/floating-chat/TiaGuidedSection";
import { TooltipProvider } from "../components/ui/tooltip";

describe("TiaGuidedSection - Accessibility", () => {
  it("should have ARIA labels on navigation buttons", () => {
    const mockStep = {
      key: "step1",
      title: "Step 1",
      summary: "Summary",
      tips: ["Tip 1"],
      resources: [{ label: "Resource 1", href: "#" }],
    };

    render(
      <TooltipProvider>
        <TiaGuidedSection
          currentStep={mockStep}
          predictedStep={null}
          hasPrev={true}
          hasNext={true}
          onPrev={vi.fn()}
          onNext={vi.fn()}
          onReset={vi.fn()}
          onNavigate={vi.fn()}
          openHelpFocused={vi.fn()}
          stepHelp={{ articles: [], faqs: [] }}
        />
      </TooltipProvider>
    );

    const prevButton = screen.getByLabelText("Passo anterior");
    const nextButton = screen.getByLabelText("Próximo passo");

    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });
});
