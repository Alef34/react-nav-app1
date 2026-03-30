export type DataMode = "online" | "offline";

const DATA_MODE_STORAGE_KEY = "app.dataMode";

export function getDataMode(): DataMode {
  if (typeof window === "undefined") {
    return "online";
  }

  const raw = window.localStorage.getItem(DATA_MODE_STORAGE_KEY);
  return raw === "offline" ? "offline" : "online";
}

export function setDataMode(mode: DataMode): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DATA_MODE_STORAGE_KEY, mode);
  window.dispatchEvent(
    new CustomEvent<DataMode>("data-mode-changed", { detail: mode }),
  );
}
