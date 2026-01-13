/**
 * Safe number parsing utility
 * Prevents runtime crashes from undefined / null / string values
 */
export function toNumberSafe(value: unknown): number | null {
  if (value === null || value === undefined) return null;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").trim();
    if (cleaned === "") return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }

  // Prisma Decimal or similar objects
  if (typeof (value as any)?.toNumber === "function") {
    const n = (value as any).toNumber();
    return Number.isFinite(n) ? n : null;
  }

  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Convert different time inputs to a Date (or null)
 */
function toDateSafe(value: unknown): Date | null {
  if (value === null || value === undefined) return null;

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    // support seconds or milliseconds
    const ms = value < 1e12 ? value * 1000 : value;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

/**
 * Format ETH values safely
 */
export function formatETH(value: unknown, decimals: number = 4): string {
  const n = toNumberSafe(value);
  if (n === null) return `0.${"0".repeat(decimals)} ETH`;
  return `${n.toFixed(decimals)} ETH`;
}

/**
 * Format USD values safely
 */
export function formatUSD(value: unknown, decimals: number = 2): string {
  const n = toNumberSafe(value);
  if (n === null) return `$0.${"0".repeat(decimals)}`;
  return `$${n.toFixed(decimals)}`;
}

/**
 * Format percentage values safely
 */
export function formatPercent(value: unknown, decimals: number = 2): string {
  const n = toNumberSafe(value);
  if (n === null) return `0.${"0".repeat(decimals)}%`;
  return `${n.toFixed(decimals)}%`;
}

/**
 * Backwards-compatible alias
 */
export function formatPercentage(value: unknown, decimals: number = 2): string {
  return formatPercent(value, decimals);
}

/**
 * Format plain numbers with commas
 */
export function formatNumber(value: unknown, decimals: number = 0): string {
  const n = toNumberSafe(value);
  if (n === null) return "0";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Shorten wallet address
 */
export function formatAddress(address?: string | null): string {
  if (!address || address.length < 10) return "—";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format date to readable string
 */
export function formatDate(value: number | string | Date | null | undefined): string {
  const date = toDateSafe(value);
  if (!date) return "—";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * ✅ NEW: Relative time formatter used by Activity feeds etc.
 * Examples: "just now", "5m ago", "2h ago", "3d ago"
 */
export function formatRelativeTime(value: unknown): string {
  const date = toDateSafe(value);
  if (!date) return "—";

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 0) return "just now";
  if (diffSec < 10) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 4) return `${diffWeek}w ago`;

  // fallback to date string for older events
  return formatDate(date);
}

/**
 * Format large values with suffix (K, M, B)
 */
export function formatCompact(value: unknown): string {
  const n = toNumberSafe(value);
  if (n === null) return "0";

  const abs = Math.abs(n);
  if (abs >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(2)}K`;

  return n.toFixed(2);
}
