import { parseJsonObject } from "./formatters";

export const normalizeAiAnalysis = (metadata: Record<string, unknown>) => {
  const directCandidates = [
    metadata.ai_analysis,
    metadata.aiAnalysis,
    metadata.ai_enrichment,
    metadata.aiEnrichment,
    metadata.ia_analysis,
    metadata.iaAnalysis,
    metadata.ia_enriquecimento,
    metadata.ai,
  ];

  for (const candidate of directCandidates) {
    const parsed = parseJsonObject(candidate);
    if (parsed) return parsed;
  }

  const nestedCandidates = [
    parseJsonObject(metadata.analysis)?.ai,
    parseJsonObject(metadata.enrichment)?.ai,
    parseJsonObject(metadata.metadata)?.ai_analysis,
  ];

  for (const candidate of nestedCandidates) {
    const parsed = parseJsonObject(candidate);
    if (parsed) return parsed;
  }

  return {} as Record<string, unknown>;
};
