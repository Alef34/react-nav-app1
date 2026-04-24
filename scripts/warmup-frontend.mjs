const DEFAULT_URLS = [
  "http://127.0.0.1:5179/",
  "http://127.0.0.1:5179/projector",
];

const RETRY_DELAY_MS = Number(process.env.FRONTEND_WARMUP_RETRY_MS || 1000);
const MAX_ATTEMPTS = Number(process.env.FRONTEND_WARMUP_MAX_ATTEMPTS || 360);
const REQUEST_TIMEOUT_MS = Number(
  process.env.FRONTEND_WARMUP_REQUEST_TIMEOUT_MS || 5000,
);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "text/html",
      },
      signal: controller.signal,
    });

    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function waitUntilReachable(url) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const ok = await fetchWithTimeout(url, REQUEST_TIMEOUT_MS);

    if (ok) {
      console.log(
        `[warmup] ready: ${url} (attempt ${attempt}/${MAX_ATTEMPTS})`,
      );
      return true;
    }

    if (attempt % 10 === 0) {
      console.log(
        `[warmup] waiting for ${url} (${attempt}/${MAX_ATTEMPTS})...`,
      );
    }

    await sleep(RETRY_DELAY_MS);
  }

  console.warn(`[warmup] timeout while warming ${url}, continuing startup.`);
  return false;
}

async function warmup() {
  console.log("[warmup] frontend warm-up started");

  for (const url of DEFAULT_URLS) {
    await waitUntilReachable(url);
  }

  console.log("[warmup] frontend warm-up finished");
}

await warmup();
