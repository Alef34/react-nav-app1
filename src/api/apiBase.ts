function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getApiBaseUrl(): string {
  const fromEnv = String(import.meta.env.VITE_API_BASE_URL ?? "").trim();
  if (fromEnv.length > 0) {
    return trimTrailingSlash(fromEnv);
  }

  // Production-friendly default for reverse proxy (same origin /api).
  return "/api";
}

export function buildApiUrl(pathname: string): string {
  const base = getApiBaseUrl();
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${normalizedPath}`;
}
