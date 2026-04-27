export type DataMode = "online" | "offline";

const DATA_MODE_STORAGE_KEY = "app.dataMode";
const OFFLINE_ONLY_MODE: DataMode = "offline";

export function getDataMode(): DataMode {
  return OFFLINE_ONLY_MODE;
}

export function setDataMode(_mode: DataMode): void {
  if (typeof window === "undefined") {
    return;
  }

  // Offline-only build: persist and broadcast only "offline" regardless of input.
  const nextMode: DataMode = OFFLINE_ONLY_MODE;
  window.localStorage.setItem(DATA_MODE_STORAGE_KEY, nextMode);
  window.dispatchEvent(
    new CustomEvent<DataMode>("data-mode-changed", { detail: nextMode }),
  );
}
