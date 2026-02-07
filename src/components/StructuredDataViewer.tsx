import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Code2,
  Globe,
  Twitter,
  Database,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  FileCode,
  Eye,
  EyeOff,
  Building2,
  Swords,
} from "lucide-react";
import type { StructuredDataResult } from "@/lib/urlAnalyzer";

export interface CompetitorStructuredData {
  name: string;
  url: string;
  structuredData?: StructuredDataResult | null;
  htmlSnapshot?: string | null;
  htmlSnapshotAt?: string | null;
}

interface StructuredDataViewerProps {
  structuredData?: StructuredDataResult | null;
  htmlSnapshot?: string | null;
  htmlSnapshotAt?: string | null;
  competitors?: CompetitorStructuredData[];
  projectName?: string;
}

function hasAnyData(sd?: StructuredDataResult | null, hs?: string | null): boolean {
  if (hs) return true;
  if (!sd) return false;
  return (
    (sd.jsonLd?.length || 0) > 0 ||
    (sd.microdata?.length || 0) > 0 ||
    Object.keys(sd.openGraph || {}).length > 0 ||
    Object.keys(sd.twitterCard || {}).length > 0
  );
}

export function StructuredDataViewer({
  structuredData,
  htmlSnapshot,
  htmlSnapshotAt,
  competitors = [],
  projectName,
}: StructuredDataViewerProps) {
  const [activeTab, setActiveTab] = useState<string>("principal");

  const principalHasData = hasAnyData(structuredData, htmlSnapshot);
  const competitorsWithData = competitors.filter((c) =>
    hasAnyData(c.structuredData, c.htmlSnapshot)
  );

  // Nothing to show at all
  if (!principalHasData && competitorsWithData.length === 0) return null;

  const showTabs = principalHasData && competitorsWithData.length > 0;
  const tabs = [
    ...(principalHasData
      ? [{ id: "principal", label: projectName || "Meu Site", icon: Building2 }]
      : []),
    ...competitorsWithData.map((c, i) => ({
      id: `comp-${i}`,
      label: c.name,
      icon: Swords,
    })),
  ];

  // If only competitors have data and no principal, default to first competitor
  const effectiveTab =
    !principalHasData && competitorsWithData.length > 0 ? "comp-0" : activeTab;

  return (
    <div className="border border-border rounded-xl p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Database className="h-5 w-5 text-primary" />
        <h3 className="text-base font-semibold text-foreground">
          Dados Estruturados & Snapshot
        </h3>
        {competitorsWithData.length > 0 && (
          <Badge variant="outline" className="text-[10px]">
            {1 + competitorsWithData.length} sites
          </Badge>
        )}
      </div>

      {/* Tabs */}
      {showTabs && (
        <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = effectiveTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="max-w-[120px] truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Content for active tab */}
      {effectiveTab === "principal" && principalHasData && (
        <SiteDataPanel
          structuredData={structuredData}
          htmlSnapshot={htmlSnapshot}
          htmlSnapshotAt={htmlSnapshotAt}
          prefix="p"
        />
      )}
      {effectiveTab.startsWith("comp-") && (() => {
        const idx = parseInt(effectiveTab.replace("comp-", ""), 10);
        const comp = competitorsWithData[idx];
        if (!comp) return null;
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-3.5 w-3.5" />
              <a
                href={comp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary underline underline-offset-2 truncate"
              >
                {comp.url}
              </a>
            </div>
            <SiteDataPanel
              structuredData={comp.structuredData}
              htmlSnapshot={comp.htmlSnapshot}
              htmlSnapshotAt={comp.htmlSnapshotAt}
              prefix={`c${idx}`}
            />
          </div>
        );
      })()}
    </div>
  );
}

// =====================================================
// Internal panel that renders data for a single site
// =====================================================

function SiteDataPanel({
  structuredData,
  htmlSnapshot,
  htmlSnapshotAt,
  prefix,
}: {
  structuredData?: StructuredDataResult | null;
  htmlSnapshot?: string | null;
  htmlSnapshotAt?: string | null;
  prefix: string;
}) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showHtml, setShowHtml] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setExpandedSection((prev) => (prev === id ? null : id));
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const jsonLdCount = structuredData?.jsonLd?.length || 0;
  const microdataCount = structuredData?.microdata?.length || 0;
  const ogCount = Object.keys(structuredData?.openGraph || {}).length;
  const tcCount = Object.keys(structuredData?.twitterCard || {}).length;

  return (
    <div className="space-y-3">
      {/* Summary badges */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {jsonLdCount > 0 && (
          <Badge variant="outline" className="text-[10px]">
            {jsonLdCount} JSON-LD
          </Badge>
        )}
        {ogCount > 0 && (
          <Badge variant="outline" className="text-[10px]">
            {ogCount} OG tags
          </Badge>
        )}
        {tcCount > 0 && (
          <Badge variant="outline" className="text-[10px]">
            {tcCount} Twitter
          </Badge>
        )}
        {microdataCount > 0 && (
          <Badge variant="outline" className="text-[10px]">
            {microdataCount} Microdata
          </Badge>
        )}
        {htmlSnapshot && (
          <Badge variant="outline" className="text-[10px]">
            HTML {Math.round(htmlSnapshot.length / 1024)}KB
          </Badge>
        )}
      </div>

      {/* JSON-LD Section */}
      {jsonLdCount > 0 && (
        <div className="border border-border/50 rounded-lg overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
            onClick={() => toggleSection(`${prefix}-jsonld`)}
          >
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-foreground">JSON-LD</span>
              <Badge className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">
                {jsonLdCount} {jsonLdCount === 1 ? "objeto" : "objetos"}
              </Badge>
            </div>
            {expandedSection === `${prefix}-jsonld` ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {expandedSection === `${prefix}-jsonld` && (
            <div className="border-t border-border/50 p-3 space-y-3">
              {structuredData!.jsonLd.map((item, i) => {
                const type = item["@type"] || "Unknown";
                const jsonStr = JSON.stringify(item, null, 2);
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {Array.isArray(type) ? type.join(", ") : type}
                        </Badge>
                        {item.name && (
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {item.name}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={() => handleCopy(jsonStr, `${prefix}-jsonld-${i}`)}
                      >
                        {copied === `${prefix}-jsonld-${i}` ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <div className="bg-muted/50 rounded-md p-2.5 space-y-1">
                      {renderJsonLdPreview(item)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Open Graph Section */}
      {ogCount > 0 && (
        <div className="border border-border/50 rounded-lg overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
            onClick={() => toggleSection(`${prefix}-og`)}
          >
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-foreground">Open Graph</span>
              <Badge className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/20">
                {ogCount} tags
              </Badge>
            </div>
            {expandedSection === `${prefix}-og` ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {expandedSection === `${prefix}-og` && (
            <div className="border-t border-border/50 p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(structuredData!.openGraph).map(([key, value]) => (
                  <div key={key} className="bg-muted/50 rounded-md p-2">
                    <p className="text-[10px] font-mono text-muted-foreground">{key}</p>
                    {key.includes("image") && value.startsWith("http") ? (
                      <div className="mt-1">
                        <img
                          src={value}
                          alt={key}
                          className="max-h-20 rounded border border-border object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                        <p className="text-[10px] text-muted-foreground mt-1 truncate">{value}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-foreground mt-0.5 break-words">{value}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Twitter Card Section */}
      {tcCount > 0 && (
        <div className="border border-border/50 rounded-lg overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
            onClick={() => toggleSection(`${prefix}-twitter`)}
          >
            <div className="flex items-center gap-2">
              <Twitter className="h-4 w-4 text-sky-500" />
              <span className="text-sm font-medium text-foreground">Twitter Card</span>
              <Badge className="text-[10px] bg-sky-500/10 text-sky-600 border-sky-500/20">
                {tcCount} tags
              </Badge>
            </div>
            {expandedSection === `${prefix}-twitter` ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {expandedSection === `${prefix}-twitter` && (
            <div className="border-t border-border/50 p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(structuredData!.twitterCard).map(([key, value]) => (
                  <div key={key} className="bg-muted/50 rounded-md p-2">
                    <p className="text-[10px] font-mono text-muted-foreground">{key}</p>
                    <p className="text-xs text-foreground mt-0.5 break-words">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Microdata Section */}
      {microdataCount > 0 && (
        <div className="border border-border/50 rounded-lg overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
            onClick={() => toggleSection(`${prefix}-microdata`)}
          >
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-foreground">Microdata</span>
              <Badge className="text-[10px] bg-purple-500/10 text-purple-600 border-purple-500/20">
                {microdataCount} {microdataCount === 1 ? "item" : "itens"}
              </Badge>
            </div>
            {expandedSection === `${prefix}-microdata` ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {expandedSection === `${prefix}-microdata` && (
            <div className="border-t border-border/50 p-3 space-y-2">
              {structuredData!.microdata.map((item, i) => (
                <div key={i} className="bg-muted/50 rounded-md p-2.5 space-y-1">
                  <Badge variant="secondary" className="text-[10px]">
                    {item.type.replace("https://schema.org/", "")}
                  </Badge>
                  {Object.entries(item.properties).map(([key, value]) => (
                    <p key={key} className="text-[11px]">
                      <span className="font-mono text-muted-foreground">{key}:</span>{" "}
                      <span className="text-foreground">{value}</span>
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* HTML Snapshot Section */}
      {htmlSnapshot && (
        <div className="border border-border/50 rounded-lg overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
            onClick={() => setShowHtml(!showHtml)}
          >
            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium text-foreground">HTML Snapshot</span>
              <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                {Math.round(htmlSnapshot.length / 1024)}KB
              </Badge>
              {htmlSnapshotAt && (
                <span className="text-[10px] text-muted-foreground hidden sm:inline">
                  {new Date(htmlSnapshotAt).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(htmlSnapshot, `${prefix}-html`);
                }}
              >
                {copied === `${prefix}-html` ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
              {showHtml ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </button>
          {showHtml && (
            <div className="border-t border-border/50">
              <pre className="p-3 text-[11px] font-mono text-muted-foreground bg-muted/30 overflow-x-auto max-h-[400px] overflow-y-auto whitespace-pre-wrap break-words leading-relaxed">
                {htmlSnapshot.substring(0, 50000)}
                {htmlSnapshot.length > 50000 && (
                  <span className="text-primary font-sans">
                    {"\n\n"}... truncado na visualização ({Math.round(htmlSnapshot.length / 1024)}KB total)
                  </span>
                )}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function renderJsonLdPreview(item: any): JSX.Element[] {
  const elements: JSX.Element[] = [];
  const importantKeys = [
    "name", "url", "description", "logo", "image",
    "telephone", "email", "address", "sameAs",
    "price", "priceCurrency", "availability",
    "ratingValue", "reviewCount", "bestRating",
    "datePublished", "author", "publisher",
  ];

  for (const key of importantKeys) {
    if (item[key] !== undefined && item[key] !== null) {
      const value = item[key];
      if (typeof value === "string" && value.length > 0) {
        elements.push(
          <p key={key} className="text-[11px]">
            <span className="font-mono text-muted-foreground">{key}:</span>{" "}
            <span className="text-foreground break-words">
              {value.length > 120 ? value.substring(0, 120) + "..." : value}
            </span>
          </p>
        );
      } else if (Array.isArray(value)) {
        elements.push(
          <p key={key} className="text-[11px]">
            <span className="font-mono text-muted-foreground">{key}:</span>{" "}
            <span className="text-foreground break-words">
              {value.slice(0, 3).map((v) => (typeof v === "string" ? v : JSON.stringify(v))).join(", ")}
              {value.length > 3 ? ` (+${value.length - 3})` : ""}
            </span>
          </p>
        );
      } else if (typeof value === "object") {
        const nested = Object.entries(value)
          .filter(([, v]) => typeof v === "string" || typeof v === "number")
          .slice(0, 3)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
        if (nested) {
          elements.push(
            <p key={key} className="text-[11px]">
              <span className="font-mono text-muted-foreground">{key}:</span>{" "}
              <span className="text-foreground break-words">{nested}</span>
            </p>
          );
        }
      } else if (typeof value === "number") {
        elements.push(
          <p key={key} className="text-[11px]">
            <span className="font-mono text-muted-foreground">{key}:</span>{" "}
            <span className="text-foreground">{value}</span>
          </p>
        );
      }
    }
  }

  if (elements.length === 0) {
    const keys = Object.keys(item).filter((k) => !k.startsWith("@")).slice(0, 5);
    for (const key of keys) {
      const val = typeof item[key] === "string" ? item[key] : JSON.stringify(item[key]);
      elements.push(
        <p key={key} className="text-[11px]">
          <span className="font-mono text-muted-foreground">{key}:</span>{" "}
          <span className="text-foreground break-words">
            {val && val.length > 100 ? val.substring(0, 100) + "..." : val}
          </span>
        </p>
      );
    }
  }

  return elements;
}
