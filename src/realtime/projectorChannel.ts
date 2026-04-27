import { Song } from "../types/myTypes";

export type ProjectorRole = "controller" | "projector";

export interface ProjectorPayload {
  song?: Song;
  selectedView?: number;
  showAkordy?: boolean;
  blackout?: boolean;
  searchQuery?: string;
  selectedCategory?: string;
  selectedPlaylistFilter?: string;
  playlists?: Record<string, string[]>;
  ts?: number;
  source?: string;
}

export interface ProjectorPayloadDiagnostic {
  reason: string;
  at: number;
}

const STORAGE_KEY = "projector-song";
const CLIENT_ID_KEY = "projector-client-id";
const DISABLE_WS_PAYLOAD_KEY = "projector-disable-ws-payload";
const PAYLOAD_DIAGNOSTIC_KEY = "projector-payload-diagnostic";
const MAX_STORED_PAYLOAD_CHARS = 500_000;
const MAX_ALLOWED_PAYLOAD_AGE_MS = 1000 * 60 * 60 * 24 * 3;
const MAX_SONG_VERSES = 120;
const MAX_VERSE_TEXT_CHARS = 8_000;
const MAX_SYNC_SEARCH_CHARS = 180;
const MAX_SYNC_CATEGORY_CHARS = 120;
const MAX_SYNC_PLAYLIST_FILTER_CHARS = 120;
const MAX_SYNC_PLAYLIST_KEYS = 8;
const MAX_SYNC_PLAYLIST_ITEMS = 600;
const MAX_SYNC_PLAYLIST_ITEM_CHARS = 120;

let ws: WebSocket | null = null;
let reconnectTimer: number | null = null;
let roleForSocket: ProjectorRole = "controller";

const listeners = new Set<(payload: ProjectorPayload) => void>();
const connectionListeners = new Set<(connected: boolean) => void>();
const diagnosticListeners = new Set<
  (diagnostic: ProjectorPayloadDiagnostic | null) => void
>();
let isConnected = false;

let latestPayloadTs = 0;

function isTruthy(value: string | null | undefined): boolean {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  return (
    normalized === "1" ||
    normalized === "true" ||
    normalized === "yes" ||
    normalized === "on"
  );
}

function isWsPayloadSyncDisabled(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);

    // ?disableWsPayload=1 to disable, ?disableWsPayload=0 to re-enable.
    if (params.has("disableWsPayload")) {
      const value = params.get("disableWsPayload");
      localStorage.setItem(DISABLE_WS_PAYLOAD_KEY, isTruthy(value) ? "1" : "0");
    }

    const persisted = localStorage.getItem(DISABLE_WS_PAYLOAD_KEY);
    if (persisted != null) {
      return persisted === "1";
    }
  } catch {
    // Ignore URL/localStorage errors.
  }

  const envValue = import.meta.env.VITE_DISABLE_WS_PAYLOAD as
    | string
    | undefined;
  return isTruthy(envValue);
}

export function getWsPayloadSyncDisabled(): boolean {
  return isWsPayloadSyncDisabled();
}

function notifyConnection(connected: boolean) {
  isConnected = connected;
  connectionListeners.forEach((cb) => cb(connected));
}

function getClientId(): string {
  const existing = localStorage.getItem(CLIENT_ID_KEY);
  if (existing) return existing;
  const created = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(CLIENT_ID_KEY, created);
  return created;
}

function clearStoredPayload() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}

function readDiagnostic(): ProjectorPayloadDiagnostic | null {
  try {
    const raw = localStorage.getItem(PAYLOAD_DIAGNOSTIC_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ProjectorPayloadDiagnostic>;
    if (typeof parsed.reason !== "string") {
      return null;
    }

    const at = Number(parsed.at);
    return {
      reason: parsed.reason,
      at: Number.isFinite(at) && at > 0 ? at : Date.now(),
    };
  } catch {
    return null;
  }
}

function notifyDiagnostic(diagnostic: ProjectorPayloadDiagnostic | null) {
  diagnosticListeners.forEach((cb) => cb(diagnostic));
}

function recordDroppedPayload(reason: string) {
  const diagnostic: ProjectorPayloadDiagnostic = {
    reason,
    at: Date.now(),
  };

  try {
    localStorage.setItem(PAYLOAD_DIAGNOSTIC_KEY, JSON.stringify(diagnostic));
  } catch {
    // ignore storage errors
  }

  notifyDiagnostic(diagnostic);
}

function sanitizeProjectorPayload(
  input: unknown,
  source: "storage" | "ws" | "local",
): ProjectorPayload | null {
  if (!input || typeof input !== "object") {
    if (source !== "local") {
      recordDroppedPayload(`${source}:payload-not-object`);
    }
    return null;
  }

  const candidate = input as ProjectorPayload;
  const output: ProjectorPayload = {};

  const ts = Number(candidate.ts);
  if (Number.isFinite(ts) && ts > 0) {
    const ageMs = Date.now() - ts;
    if (source !== "local" && ageMs > MAX_ALLOWED_PAYLOAD_AGE_MS) {
      recordDroppedPayload(`${source}:payload-too-old`);
      return null;
    }
    output.ts = ts;
  }

  if (typeof candidate.source === "string") {
    output.source = candidate.source.slice(0, 120);
  }

  if (typeof candidate.selectedView === "number") {
    output.selectedView = Math.max(
      0,
      Math.min(999, Math.floor(candidate.selectedView)),
    );
  }

  if (typeof candidate.showAkordy === "boolean") {
    output.showAkordy = candidate.showAkordy;
  }

  if (typeof candidate.blackout === "boolean") {
    output.blackout = candidate.blackout;
  }

  if (typeof candidate.searchQuery === "string") {
    output.searchQuery = candidate.searchQuery.slice(0, MAX_SYNC_SEARCH_CHARS);
  }

  if (typeof candidate.selectedCategory === "string") {
    output.selectedCategory = candidate.selectedCategory.slice(
      0,
      MAX_SYNC_CATEGORY_CHARS,
    );
  }

  if (typeof candidate.selectedPlaylistFilter === "string") {
    output.selectedPlaylistFilter = candidate.selectedPlaylistFilter.slice(
      0,
      MAX_SYNC_PLAYLIST_FILTER_CHARS,
    );
  }

  if (
    candidate.playlists &&
    typeof candidate.playlists === "object" &&
    !Array.isArray(candidate.playlists)
  ) {
    const entries = Object.entries(candidate.playlists).slice(
      0,
      MAX_SYNC_PLAYLIST_KEYS,
    );

    const safePlaylists: Record<string, string[]> = {};
    for (const [rawKey, rawValue] of entries) {
      const key = String(rawKey ?? "")
        .trim()
        .slice(0, MAX_SYNC_CATEGORY_CHARS);
      if (!key || !Array.isArray(rawValue)) {
        continue;
      }

      safePlaylists[key] = Array.from(
        new Set(
          rawValue
            .slice(0, MAX_SYNC_PLAYLIST_ITEMS)
            .map((item) =>
              String(item ?? "")
                .trim()
                .slice(0, MAX_SYNC_PLAYLIST_ITEM_CHARS),
            )
            .filter((item) => item.length > 0),
        ),
      );
    }

    if (Object.keys(safePlaylists).length > 0) {
      output.playlists = safePlaylists;
    }
  }

  if (candidate.song && typeof candidate.song === "object") {
    const song = candidate.song as Song;
    if (typeof song.cisloP !== "string" || typeof song.nazov !== "string") {
      recordDroppedPayload(`${source}:song-metadata-invalid`);
      return null;
    }

    if (!Array.isArray(song.slohy) || song.slohy.length > MAX_SONG_VERSES) {
      recordDroppedPayload(`${source}:song-verses-invalid`);
      return null;
    }

    const safeVerses = song.slohy
      .filter((verse) => verse && typeof verse === "object")
      .map((verse) => {
        const cisloS = String(verse.cisloS ?? "").slice(0, 80);
        const textik = String(verse.textik ?? "").slice(
          0,
          MAX_VERSE_TEXT_CHARS,
        );
        return { cisloS, textik };
      });

    output.song = {
      ...song,
      cisloP: song.cisloP.slice(0, 80),
      nazov: song.nazov.slice(0, 300),
      slohy: safeVerses,
    };
  }

  return output;
}

export function getProjectorClientId(): string {
  return getClientId();
}

export function readProjectorPayload(): ProjectorPayload {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    if (raw.length > MAX_STORED_PAYLOAD_CHARS) {
      recordDroppedPayload("storage:payload-too-large");
      clearStoredPayload();
      return {};
    }

    const parsed = JSON.parse(raw) as ProjectorPayload;
    const safe = sanitizeProjectorPayload(parsed, "storage");
    if (!safe) {
      clearStoredPayload();
      return {};
    }

    return safe;
  } catch {
    recordDroppedPayload("storage:payload-json-invalid");
    clearStoredPayload();
    return {};
  }
}

function persistAndNotify(payload: ProjectorPayload): ProjectorPayload | null {
  const safePayload = sanitizeProjectorPayload(payload, "local");
  if (!safePayload) {
    return null;
  }

  // Merge every update with the latest stored state so omitted fields
  // (song, filters, playlists, etc.) remain stable across partial payloads.
  const existing = readProjectorPayload();
  const finalPayload: ProjectorPayload = {
    ...existing,
    ...safePayload,
  };

  const payloadTs = Number(finalPayload.ts);
  if (Number.isFinite(payloadTs) && payloadTs > 0) {
    latestPayloadTs = Math.max(latestPayloadTs, payloadTs);
  }

  try {
    const serialized = JSON.stringify(finalPayload);
    if (serialized.length > MAX_STORED_PAYLOAD_CHARS) {
      recordDroppedPayload("local:payload-too-large");
      clearStoredPayload();
      return null;
    }
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // ignore quota/storage errors
  }

  listeners.forEach((cb) => cb(finalPayload));
  return finalPayload;
}

function getWsUrl(): string {
  const custom = import.meta.env.VITE_PROJECTOR_WS_URL as string | undefined;
  if (custom && custom.trim().length > 0) {
    return custom;
  }

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const host = window.location.hostname;
  const port =
    (import.meta.env.VITE_PROJECTOR_WS_PORT as string | undefined) || "8787";

  return `${protocol}://${host}:${port}`;
}

function scheduleReconnect() {
  if (reconnectTimer != null) return;
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    startProjectorChannel(roleForSocket);
  }, 1500);
}

export function startProjectorChannel(role: ProjectorRole) {
  roleForSocket = role;

  if (isWsPayloadSyncDisabled()) {
    notifyConnection(false);
    return;
  }

  if (
    ws &&
    (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  ws = new WebSocket(getWsUrl());

  ws.onopen = () => {
    notifyConnection(true);
    ws?.send(
      JSON.stringify({
        type: "hello",
        role,
        clientId: getClientId(),
      }),
    );
  };

  ws.onmessage = (evt) => {
    try {
      const msg = JSON.parse(evt.data as string) as {
        type?: string;
        payload?: ProjectorPayload;
      };

      if (msg.type === "projector-state" && msg.payload) {
        const payload = sanitizeProjectorPayload(msg.payload, "ws");
        if (!payload) {
          return;
        }

        // Local sender already applied this payload via sendProjectorPayload().
        if (payload.source && payload.source === getClientId()) {
          return;
        }

        const payloadTs = Number(payload.ts);
        if (
          Number.isFinite(payloadTs) &&
          payloadTs > 0 &&
          payloadTs <= latestPayloadTs
        ) {
          return;
        }

        persistAndNotify(payload);
      }
    } catch {
      // ignore invalid packets
    }
  };

  ws.onerror = () => {
    notifyConnection(false);
    // keep app usable with localStorage fallback
  };

  ws.onclose = () => {
    notifyConnection(false);
    ws = null;
    scheduleReconnect();
  };
}

export function stopProjectorChannel() {
  if (reconnectTimer != null) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  ws?.close();
  ws = null;
  notifyConnection(false);
}

export function subscribeProjectorPayload(
  cb: (payload: ProjectorPayload) => void,
) {
  listeners.add(cb);
  cb(readProjectorPayload());

  return () => {
    listeners.delete(cb);
  };
}

export function sendProjectorPayload(
  payload: Omit<ProjectorPayload, "ts" | "source">,
) {
  const fullPayload: ProjectorPayload = {
    ...payload,
    ts: Date.now(),
    source: getClientId(),
  };

  // persistAndNotify returns the merged payload (with song preserved for
  // partial/verse-only updates). Use the merged version for the WS send so
  // the relay server always stores the full state.
  const mergedPayload = persistAndNotify(fullPayload);

  if (isWsPayloadSyncDisabled()) {
    return;
  }

  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: "projector-state",
        payload: mergedPayload ?? fullPayload,
      }),
    );
  }
}

export function getProjectorChannelConnectionState() {
  return isConnected;
}

export function subscribeProjectorConnectionState(
  cb: (connected: boolean) => void,
) {
  connectionListeners.add(cb);
  cb(isConnected);

  return () => {
    connectionListeners.delete(cb);
  };
}

export function readProjectorPayloadDiagnostic() {
  return readDiagnostic();
}

export function subscribeProjectorPayloadDiagnostic(
  cb: (diagnostic: ProjectorPayloadDiagnostic | null) => void,
) {
  diagnosticListeners.add(cb);
  cb(readDiagnostic());

  return () => {
    diagnosticListeners.delete(cb);
  };
}
