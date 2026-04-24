import { WebSocketServer } from "ws";

const port = Number(process.env.PROJECTOR_WS_PORT || 8787);
const wss = new WebSocketServer({ port, host: "0.0.0.0" });

/** @type {Map<import('ws').WebSocket, { role: string; clientId: string }>} */
const clientMeta = new Map();
let latestPayload = null;

function safeSend(ws, data) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function broadcastState(payload, sender) {
  latestPayload = payload;

  for (const client of wss.clients) {
    if (client === sender || client.readyState !== client.OPEN) continue;
    safeSend(client, { type: "projector-state", payload });
  }
}

wss.on("connection", (ws) => {
  clientMeta.set(ws, { role: "unknown", clientId: "" });

  ws.on("message", (raw) => {
    try {
      const text = typeof raw === "string" ? raw : raw.toString("utf8");
      const data = JSON.parse(text);

      if (data?.type === "hello") {
        clientMeta.set(ws, {
          role: data.role === "projector" ? "projector" : "controller",
          clientId: typeof data.clientId === "string" ? data.clientId : "",
        });
        safeSend(ws, { type: "hello-ack", ok: true });

        if (latestPayload) {
          safeSend(ws, { type: "projector-state", payload: latestPayload });
        }

        return;
      }

      if (data?.type === "projector-state") {
        broadcastState(data.payload, ws);
      }
    } catch (err) {
      safeSend(ws, {
        type: "error",
        message: err instanceof Error ? err.message : "Invalid message",
      });
    }
  });

  ws.on("close", () => {
    clientMeta.delete(ws);
  });
});

console.log(`[projector-ws] listening on 0.0.0.0:${port}`);
