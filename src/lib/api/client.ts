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
    return { ok: false, error: "Invalid JSON response", details: text };
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // If endpoint is absolute, don't prefix
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    // In Next.js, this avoids caching for API routes
    cache: "no-store",
  });

  const parsed = (await safeParseJson(response)) as ApiEnvelope<T> | T | null;

  // If backend uses { ok, data } envelope, unwrap it.
  const isEnvelope =
    parsed &&
    typeof parsed === "object" &&
    "ok" in (parsed as any) &&
    typeof (parsed as any).ok === "boolean";

  if (!response.ok) {
    // Try to read error message from envelope first, else fallback
    const msg = isEnvelope
      ? (parsed as any)?.error || response.statusText
      : response.statusText;

    const details = isEnvelope ? (parsed as any)?.details : parsed;

    throw new ApiError(response.status, `API error: ${msg}`, details);
  }

  // If response.ok but envelope says ok:false (some APIs do this)
  if (isEnvelope && (parsed as any).ok === false) {
    const msg = (parsed as any)?.error || "Request failed";
    const details = (parsed as any)?.details;
    throw new ApiError(response.status, `API error: ${msg}`, details);
  }

  // Successful: return unwrapped data if envelope, else raw parsed
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
