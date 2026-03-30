import { spawn } from "node:child_process";
import net from "node:net";

function startProcess(label, scriptName) {
  const isWin = process.platform === "win32";
  const command = isWin ? "cmd.exe" : "npm";
  const args = isWin
    ? ["/d", "/s", "/c", `npm run ${scriptName}`]
    : ["run", scriptName];

  const child = spawn(command, args, {
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => {
    process.stdout.write(`[${label}] ${chunk}`);
  });

  child.stderr.on("data", (chunk) => {
    process.stderr.write(`[${label}] ${chunk}`);
  });

  child.on("error", (err) => {
    console.error(`[${label}] failed: ${err.message}`);
  });

  return child;
}

function isPortInUse(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(700);

    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });

    socket.once("error", () => {
      resolve(false);
    });

    socket.connect(port, host);
  });
}

const children = [];
let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  setTimeout(() => process.exit(code), 200);
}

function watchChild(label, child) {
  child.on("exit", (code, signal) => {
    const suffix = signal ? `signal=${signal}` : `code=${code ?? 0}`;
    console.log(`[${label}] exited (${suffix})`);

    if (!shuttingDown) {
      console.log("One process exited, stopping the stack...");
      shutdown(typeof code === "number" ? code : 1);
    }
  });
}

console.log("Starting projector stack...");
console.log("1) Vite LAN server: npm run dev:lan");
console.log("2) Projector WS server: npm run projector:ws");
console.log("Open fullscreen projector in another terminal: npm run projektor:fullscreen");
console.log("Press Ctrl+C to stop all processes.");

const devLan = startProcess("dev:lan", "dev:lan");
const hasExistingWs = await isPortInUse(8787);
const projectorWs = hasExistingWs
  ? null
  : startProcess("projector:ws", "projector:ws");

if (hasExistingWs) {
  console.log("[projector:ws] existing server detected on 8787, skipping new instance.");
}

children.push(devLan);
if (projectorWs) {
  children.push(projectorWs);
}
watchChild("dev:lan", devLan);
if (projectorWs) {
  watchChild("projector:ws", projectorWs);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
process.stdin.resume();
