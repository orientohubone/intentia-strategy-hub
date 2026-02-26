export const toText = (value: unknown, fallback = "N/A") => {
  if (value === null || value === undefined) return fallback;
  const toDisplayString = (input: unknown): string => {
    if (input === null || input === undefined) return "";
    if (typeof input === "string" || typeof input === "number" || typeof input === "boolean") {
      return String(input).trim();
    }
    if (Array.isArray(input)) {
      return input.map((item) => toDisplayString(item)).filter(Boolean).join(" | ");
    }
    if (typeof input === "object") {
      const record = input as Record<string, unknown>;
      const preferredKeys = [
        "title",
        "name",
        "label",
        "summary",
        "description",
        "text",
        "action",
        "recommendation",
        "value",
      ];

      for (const key of preferredKeys) {
        const candidate = record[key];
        const parsed = toDisplayString(candidate);
        if (parsed) return parsed;
      }

      try {
        return JSON.stringify(record);
      } catch {
        return "";
      }
    }
    return "";
  };

  const text = toDisplayString(value);
  return text.length > 0 ? text : fallback;
};

export const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => toText(item, "")).filter(Boolean);
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const candidateKeys = ["recommendations", "recomendacoes", "actions", "next_steps", "items", "list", "points"];
    for (const key of candidateKeys) {
      if (record[key] !== undefined) {
        const nested = toStringArray(record[key]);
        if (nested.length > 0) return nested;
      }
    }
    return Object.values(record).map((item) => toText(item, "")).filter(Boolean);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map((item) => toText(item, "")).filter(Boolean);
      } catch {
        // fallback below
      }
    }
    return trimmed
      .split(/\r?\n|;/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

export const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.replace(",", ".").trim();
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

export const sanitizeFilename = (name: string) =>
  name
    .replace(/[<>:"/\\|?*]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120) || "relatorio";

export const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const parseJsonObject = (value: unknown): Record<string, unknown> | null => {
  if (!value) return null;
  if (typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }
  }
  return null;
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
