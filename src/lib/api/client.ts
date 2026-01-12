// src/lib/api/client.ts
import { USE_MOCK_API, API_BASE_URL } from "@/lib/utils/constants";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; details?: unknown };

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeParseJson(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    // If backend ever returns non-JSON (proxy, HTML error page, etc.)
    return { ok: false, error: "Invalid JSON response", details: text };
  }
}

function joinUrl(base: string, endpoint: string) {
  // If endpoint is absolute, don't prefix
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) return endpoint;

  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const e = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${b}${e}`;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = joinUrl(API_BASE_URL, endpoint);

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    // Avoid caching for API routes in Next.js
    cache: "no-store",
  });

  const parsed = (await safeParseJson(response)) as ApiEnvelope<T> | T | null;

  const isEnvelope =
    parsed &&
    typeof parsed === "object" &&
    "ok" in (parsed as any) &&
    typeof (parsed as any).ok === "boolean";

  // Non-2xx
  if (!response.ok) {
    const msg = isEnvelope
      ? (parsed as any)?.error || response.statusText
      : response.statusText;

    const details = isEnvelope ? (parsed as any)?.details : parsed;

    throw new ApiError(response.status, `API error: ${msg}`, details);
  }

  // 2xx but ok:false envelope (some APIs do this)
  if (isEnvelope && (parsed as any).ok === false) {
    const msg = (parsed as any)?.error || "Request failed";
    const details = (parsed as any)?.details;
    throw new ApiError(response.status, `API error: ${msg}`, details);
  }

  // Success: unwrap envelope if present
  return (isEnvelope ? (parsed as any).data : parsed) as T;
}

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
  mockData?: () => T
): Promise<T> {
  // Mock mode: always return mock if enabled and provided
  if (USE_MOCK_API && mockData) {
    await sleep(300 + Math.random() * 200);
    return mockData();
  }

  try {
    return await fetchApi<T>(endpoint, options);
  } catch (error) {
    // Fallback to mock if API fails and mock is available
    if (mockData) {
      console.warn(`API request failed, using mock data: ${endpoint}`, error);
      await sleep(150);
      return mockData();
    }
    throw error;
  }
}