import { spawn } from "node:child_process";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import net from "node:net";

function startProcess(label, scriptName, extraEnv = {}) {
  const isWin = process.platform === "win32";
  const command = isWin ? "cmd.exe" : "npm";
  const args = isWin
    ? ["/d", "/s", "/c", `npm run ${scriptName}`]
    : ["run", scriptName];

  const child = spawn(command, args, {
    shell: false,
    env: {
      ...process.env,
      ...extraEnv,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => {
    process.stdout.write(`[${label}] ${chunk}`);
  });

  child.stdout.on("error", (err) => {
    if (err?.code === "EBADF") {
      return;
    }
    console.error(`[${label}] stdout stream failed: ${err.message}`);
  });

  child.stderr.on("data", (chunk) => {
    process.stderr.write(`[${label}] ${chunk}`);
  });

  child.stderr.on("error", (err) => {
    if (err?.code === "EBADF") {
      return;
    }
    console.error(`[${label}] stderr stream failed: ${err.message}`);
  });

  child.on("error", (err) => {
    console.error(`[${label}] failed: ${err.message}`);
  });

  return child;
}

function runScriptSync(scriptName, label) {
  const isWin = process.platform === "win32";
  const command = isWin ? "cmd.exe" : "npm";
  const args = isWin
    ? ["/d", "/s", "/c", `npm run ${scriptName}`]
    : ["run", scriptName];

  const result = spawnSync(command, args, {
    shell: false,
    stdio: "inherit",
  });

  if (typeof result.status === "number" && result.status !== 0) {
    throw new Error(
      `[${label}] script '${scriptName}' exited with code ${result.status}`,
    );
  }

  if (result.error) {
    throw new Error(`[${label}] failed: ${result.error.message}`);
  }
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

function listPidsOnPort(port) {
  if (process.platform === "win32") {
    return [];
  }

  const result = spawnSync("lsof", ["-t", `-iTCP:${port}`, "-sTCP:LISTEN"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
    shell: false,
  });

  if (result.status !== 0 || !result.stdout) {
    return [];
  }

  return result.stdout
    .split(/\s+/)
    .map((part) => Number(part.trim()))
    .filter((pid) => Number.isInteger(pid) && pid > 0);
}

function killPid(pid, signal) {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }

  try {
    process.kill(pid, signal);
    return true;
  } catch {
    return false;
  }
}

async function ensurePortAvailable(port, label) {
  const inUse = await isPortInUse(port);
  if (!inUse) {
    return;
  }

  const pids = listPidsOnPort(port);
  if (pids.length === 0) {
    console.log(`[${label}] port ${port} busy, but owner PID not resolved.`);
    return;
  }

  console.log(
    `[${label}] freeing port ${port} from PID(s): ${pids.join(", ")}`,
  );
  for (const pid of pids) {
    killPid(pid, "SIGTERM");
  }

  await new Promise((resolve) => setTimeout(resolve, 350));

  const stillInUse = await isPortInUse(port);
  if (!stillInUse) {
    console.log(`[${label}] port ${port} released.`);
    return;
  }

  console.log(`[${label}] force killing PID(s) on port ${port}.`);
  for (const pid of pids) {
    killPid(pid, "SIGKILL");
  }

  await new Promise((resolve) => setTimeout(resolve, 250));
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
const webScript = process.env.PROJECTOR_WEB_SCRIPT || "projector:web";
const backendScript = process.env.PROJECTOR_BACKEND_SCRIPT || "backend";
console.log(`1) Web server: npm run ${webScript}`);
console.log(`2) Backend API: npm run ${backendScript}`);
console.log("3) Projector WS server: npm run projector:ws");
console.log(
  "Open fullscreen projector in another terminal: npm run projektor:fullscreen",
);
console.log("Press Ctrl+C to stop all processes.");

const distIndexPath = path.resolve(process.cwd(), "dist", "index.html");
if (!existsSync(distIndexPath) && webScript === "projector:web") {
  console.log("[web] dist/index.html missing, running npm run build...");
  runScriptSync("build", "web");
}

await ensurePortAvailable(3001, "backend");
await ensurePortAvailable(5179, "web");
await ensurePortAvailable(8787, "projector:ws");

const backend = startProcess("backend", backendScript);
const webServer = startProcess("web", webScript);
const hasExistingWs = await isPortInUse(8787);
const projectorWs = hasExistingWs
  ? null
  : startProcess("projector:ws", "projector:ws", {
      PROJECTOR_WS_PORT: "8787",
    });

if (hasExistingWs) {
  console.log(
    "[projector:ws] existing server detected on 8787, skipping new instance.",
  );
}

children.push(backend);
children.push(webServer);
if (projectorWs) {
  children.push(projectorWs);
}
watchChild("backend", backend);
watchChild("web", webServer);
if (projectorWs) {
  watchChild("projector:ws", projectorWs);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
process.stdin.resume();
