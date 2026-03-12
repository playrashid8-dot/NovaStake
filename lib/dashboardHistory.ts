export type DashboardHistoryEntry = {
  id?: string;
  type: string;
  title: string;
  subtitle?: string;
  amount?: string;
  amountClass?: string;
  badge?: string;
  badgeClass?: string;
  ts?: number;
};

function getKey(address?: string | null) {
  const safe = address?.toLowerCase?.() ?? "guest";
  return `nova-history:${safe}`;
}

export function readDashboardHistory(
  address?: string | null
): DashboardHistoryEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(getKey(address));
    if (!raw || raw.trim() === "") return [];

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch {
    return [];
  }
}

export function pushDashboardHistory(
  address: string | undefined | null,
  entry: DashboardHistoryEntry
) {
  if (typeof window === "undefined") return;

  try {
    const current = readDashboardHistory(address);

    const normalizedEntry = {
      ...entry,
      id: entry.id || `${entry.type}-${Date.now()}`,
      ts: entry.ts || Math.floor(Date.now() / 1000),
    };

    const next = [normalizedEntry, ...current]
      .filter(
        (item, index, arr) =>
          arr.findIndex((x) => x.id === item.id) === index
      )
      .slice(0, 50);

    localStorage.setItem(getKey(address), JSON.stringify(next));
  } catch {}
}

export function removeHistoryType(
  address: string | undefined | null,
  type: string
) {
  if (typeof window === "undefined") return;

  try {
    const current = readDashboardHistory(address);
    const next = current.filter((item) => item.type !== type);
    localStorage.setItem(getKey(address), JSON.stringify(next));
  } catch {}
}

export function clearDashboardHistory(address?: string | null) {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(getKey(address));
  } catch {}
}