export type DataMode = "online" | "offline" | "local";

const DATA_MODE_STORAGE_KEY = "app.dataMode";
const DEFAULT_MODE: DataMode = "offline";

function normalizeDataMode(raw: unknown): DataMode {
  return raw === "online" || raw === "offline" || raw === "local"
    ? raw
    : DEFAULT_MODE;
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
