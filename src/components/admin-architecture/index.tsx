import { useState } from "react";
import { Section } from "./types";
import { SECTIONS } from "./constants";
import { OverviewSection } from "./OverviewSection";
import { FrontendSection } from "./FrontendSection";
import { AuthSection } from "./AuthSection";
import { DataFlowSection } from "./DataFlowSection";
import { FeatureFlagsSection } from "./FeatureFlagsSection";
import { EdgeFunctionsSection } from "./EdgeFunctionsSection";
import { DatabaseSection } from "./DatabaseSection";
import { SecuritySection } from "./SecuritySection";
import { OperationsSection } from "./OperationsSection";
import { IntegrationsSection } from "./IntegrationsSection";

export default function AdminArchitectureTab() {
  const [activeSection, setActiveSection] = useState<Section>("overview");

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.key;
          return (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
                isActive
                  ? `${section.bg} border border-current/20 ${section.color}`
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? section.color : ""}`} />
              <span className="text-[11px] font-medium truncate">{section.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section Content */}
      {activeSection === "overview" && <OverviewSection />}
      {activeSection === "frontend" && <FrontendSection />}
      {activeSection === "auth" && <AuthSection />}
      {activeSection === "data" && <DataFlowSection />}
      {activeSection === "features" && <FeatureFlagsSection />}
      {activeSection === "edge" && <EdgeFunctionsSection />}
      {activeSection === "database" && <DatabaseSection />}
      {activeSection === "security" && <SecuritySection />}
      {activeSection === "operations" && <OperationsSection />}
      {activeSection === "integrations" && <IntegrationsSection />}
    </div>
  );
}
