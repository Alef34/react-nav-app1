export type DataMode = "online" | "local";

const DATA_MODE_STORAGE_KEY = "app.dataMode";
const DEFAULT_MODE: DataMode = "local";

function normalizeDataMode(raw: unknown): DataMode {
  if (raw === "online" || raw === "local") {
    return raw;
  }

  // Keep backward compatibility with existing storage values.
  if (raw === "offline") {
    return "local";
  }

  return DEFAULT_MODE;
}

export function getDataMode(): DataMode {
  if (typeof window === "undefined") {
    return DEFAULT_MODE;
  }

  const raw = window.localStorage.getItem(DATA_MODE_STORAGE_KEY);
  return normalizeDataMode(raw);
}

export function setDataMode(mode: DataMode): void {
  if (typeof window === "undefined") {
    return;
  }

  const nextMode = normalizeDataMode(mode);
  window.localStorage.setItem(DATA_MODE_STORAGE_KEY, nextMode);
  window.dispatchEvent(
    new CustomEvent<DataMode>("data-mode-changed", { detail: nextMode }),
  );
}
