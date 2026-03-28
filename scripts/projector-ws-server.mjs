import { WebSocketServer } from "ws";

const port = Number(process.env.PROJECTOR_WS_PORT || 8787);
const wss = new WebSocketServer({ port, host: "0.0.0.0" });

/** @type {Map<import('ws').WebSocket, { role: string; clientId: string }>} */
const clientMeta = new Map();

function safeSend(ws, data) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function broadcastToProjectors(payload, sender) {
  for (const client of wss.clients) {
    if (client === sender || client.readyState !== client.OPEN) continue;
    const meta = clientMeta.get(client);
    if (!meta || meta.role === "projector") {
      safeSend(client, { type: "projector-state", payload });
    }
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
        return;
      }

      if (data?.type === "projector-state") {
        broadcastToProjectors(data.payload, ws);
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
