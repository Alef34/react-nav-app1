import { spawn } from "node:child_process";

const DEFAULT_APP_URL =
  process.env.PROJECTOR_APP_URL || "http://127.0.0.1:5179";
const WAIT_TIMEOUT_MS = 30000;
const RETRY_DELAY_MS = 500;
const VITE_LOCAL_URL_PATTERN = /Local:\s+(https?:\/\/\S+)/i;

function normalizeBaseUrl(url) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function extractViteLocalUrl(text) {
  const match = text.match(VITE_LOCAL_URL_PATTERN);

  if (!match?.[1]) {
    return null;
  }

  return normalizeBaseUrl(match[1]);
}

function runNpmScript(scriptName, label, onOutput) {
  const child = spawn("npm", ["run", scriptName], {
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => {
    const text = chunk.toString();
    process.stdout.write(`[${label}] ${text}`);
    onOutput?.(text);
  });

  child.stderr.on("data", (chunk) => {
    const text = chunk.toString();
    process.stderr.write(`[${label}] ${text}`);
    onOutput?.(text);
  });

  child.on("error", (error) => {
    console.error(`[${label}] failed: ${error.message}`);
  });

  return child;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForUrl(getUrl, timeoutMs) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const url = normalizeBaseUrl(getUrl());

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "text/html",
        },
      });

      if (response.ok) {
        return true;
      }
    } catch {
      // Keep retrying until timeout.
    }

    await sleep(RETRY_DELAY_MS);
  }

  return false;
}

function openChromeWindow(url, extraArgs = []) {
  return new Promise((resolve, reject) => {
    const args = ["-na", "Google Chrome", "--args", ...extraArgs, url];
    const child = spawn("open", args, {
      shell: false,
      stdio: "ignore",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`open exited with code ${code ?? 1}`));
    });
  });
}

const children = [];
let shuttingDown = false;
let resolvedAppUrl = normalizeBaseUrl(DEFAULT_APP_URL);

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

  setTimeout(() => process.exit(code), 250);
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

if (process.platform !== "darwin") {
  console.error("projector:mac je urceny pre macOS.");
  process.exit(1);
}

console.log("Starting projector stack for macOS...");
console.log("1) App + WS server");
console.log("2) Controller window");
console.log("3) Fullscreen projector window");
console.log(
  "Ak sa projector otvori na zlom monitore, presun ho na DTP a zapni fullscreen tam.",
);
console.log("Press Ctrl+C to stop all processes.");

const stack = runNpmScript("projector:start", "projector:start", (text) => {
  const detectedUrl = extractViteLocalUrl(text);

  if (detectedUrl) {
    resolvedAppUrl = detectedUrl;
  }
});
children.push(stack);
watchChild("projector:start", stack);

const isReady = await waitForUrl(() => resolvedAppUrl, WAIT_TIMEOUT_MS);
const projectorUrl = `${resolvedAppUrl}/projector`;

if (!isReady) {
  console.error(
    `App neodpoveda na ${resolvedAppUrl} do ${WAIT_TIMEOUT_MS} ms.`,
  );
  shutdown(1);
} else {
  try {
    await openChromeWindow(resolvedAppUrl, ["--new-window"]);
    await sleep(700);
    await openChromeWindow(projectorUrl, [
      "--new-window",
      "--start-fullscreen",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-session-crashed-bubble",
    ]);
  } catch (error) {
    console.error(
      `Nepodarilo sa otvorit Chrome okna: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    console.error(`Controller otvor manualne: ${resolvedAppUrl}`);
    console.error(`Projector otvor manualne: ${projectorUrl}`);
  }
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
process.stdin.resume();
