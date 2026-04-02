import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const mode = process.argv[2] === "fullscreen" ? "fullscreen" : "kiosk";
const explicitUrl = process.argv[3];
let url = explicitUrl ?? "http://127.0.0.1:5179/projector";
const isKiosk = mode === "kiosk";

const AUTO_URL_CANDIDATES = [
  "http://127.0.0.1:5173/projector",
  "http://127.0.0.1:5179/projector",
  "http://localhost:5173/projector",
  "http://localhost:5179/projector",
];

function getBrowserFlags() {
  const flags = [
    "--new-window",
    "--start-fullscreen",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-session-crashed-bubble",
  ];

  if (isKiosk) {
    flags.push("--kiosk");
  }

  return flags;
}

async function isUrlReachable(targetUrl) {
  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept: "text/html",
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}

async function resolveLaunchUrl() {
  if (explicitUrl) {
    return explicitUrl;
  }

  for (const candidate of AUTO_URL_CANDIDATES) {
    if (await isUrlReachable(candidate)) {
      return candidate;
    }
  }

  return AUTO_URL_CANDIDATES[0];
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
    ...options,
  });

  return result.status === 0;
}

function launchDetached(command, args) {
  try {
    const child = spawn(command, args, {
      detached: true,
      stdio: "ignore",
      shell: false,
    });
    child.unref();
    return true;
  } catch {
    return false;
  }
}

function commandExists(command) {
  return (
    spawnSync("where", [command], { stdio: "ignore", shell: false }).status ===
    0
  );
}

function macOpen() {
  const args = ["-na", "Google Chrome", "--args", ...getBrowserFlags()];
  args.push(url);
  return run("open", args);
}

function windowsOpen() {
  const flags = getBrowserFlags();

  const browsersInPath = ["chrome.exe", "chrome", "msedge.exe", "msedge"];
  const browserPaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ];

  for (const browser of browsersInPath) {
    if (!commandExists(browser)) {
      continue;
    }

    if (launchDetached(browser, [...flags, url])) {
      return true;
    }
  }

  for (const browser of browserPaths) {
    if (!existsSync(browser)) {
      continue;
    }

    if (launchDetached(browser, [...flags, url])) {
      return true;
    }
  }

  return false;
}

function linuxOpen() {
  const flags = getBrowserFlags();

  const browsers = ["google-chrome", "chromium-browser", "chromium"];

  for (const browser of browsers) {
    if (run(browser, [...flags, url])) {
      return true;
    }
  }

  return false;
}

let ok = false;

url = await resolveLaunchUrl();

if (process.platform === "darwin") {
  ok = macOpen();
} else if (process.platform === "win32") {
  ok = windowsOpen();
} else {
  ok = linuxOpen();
}

if (!ok) {
  console.error("Nepodarilo sa otvorit browser pre projector.");
  console.error(`Otvor manualne: ${url}`);
  process.exit(1);
}
