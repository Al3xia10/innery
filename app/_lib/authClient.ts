const TOKEN_KEY = "innery_access_token";
const LEGACY_TOKEN_KEY = "innery_accessToken";

export function setAccessToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(LEGACY_TOKEN_KEY, token);
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) return token;
  return localStorage.getItem(LEGACY_TOKEN_KEY);
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

function normalizeBaseUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  const envBase = process.env.NEXT_PUBLIC_API_BASE;
  const base = normalizeBaseUrl(envUrl || envBase || "http://localhost:4000");
  const token = getAccessToken();

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const isAbsoluteUrl = path.startsWith("http");
  const url = isAbsoluteUrl ? path : `${base}${path}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 204) {
    return null;
  }

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}