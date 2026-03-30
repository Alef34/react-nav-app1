import { Song } from "../types/myTypes";

export type ProjectorRole = "controller" | "projector";

export interface ProjectorPayload {
  song?: Song;
  selectedView?: number;
  showAkordy?: boolean;
  blackout?: boolean;
  ts?: number;
  source?: string;
}

const STORAGE_KEY = "projector-song";
const CLIENT_ID_KEY = "projector-client-id";

let ws: WebSocket | null = null;
let reconnectTimer: number | null = null;
let roleForSocket: ProjectorRole = "controller";

const listeners = new Set<(payload: ProjectorPayload) => void>();
const connectionListeners = new Set<(connected: boolean) => void>();
let isConnected = false;

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

export function readProjectorPayload(): ProjectorPayload {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ProjectorPayload;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function persistAndNotify(payload: ProjectorPayload) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota/storage errors
  }

  listeners.forEach((cb) => cb(payload));
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
        persistAndNotify(msg.payload);
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

  persistAndNotify(fullPayload);

  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: "projector-state",
        payload: fullPayload,
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
