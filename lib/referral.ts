// lib/referral.ts

export const REF_STORAGE_KEY = "nova_ref_address";
export const LEGACY_REF_STORAGE_KEY = "nova_ref";

export function normalizeAddress(addr?: string | null) {
  if (!addr) return "";
  const a = addr.trim();
  if (!a) return "";
  return a.toLowerCase();
}

export function isHexAddress(addr?: string | null) {
  const a = normalizeAddress(addr);
  return /^0x[a-f0-9]{40}$/.test(a);
}

export function makeReferralCode(address: string) {
  const a = normalizeAddress(address);
  if (!isHexAddress(a)) return "";
  return `NOVA${a.slice(-6).toUpperCase()}`;
}

export function storeRefAddress(address: string) {
  if (typeof window === "undefined") return;

  const a = normalizeAddress(address);
  if (!isHexAddress(a)) return;

  localStorage.setItem(REF_STORAGE_KEY, a);
  localStorage.setItem(LEGACY_REF_STORAGE_KEY, a);
}

export function getStoredRefAddress() {
  if (typeof window === "undefined") return "";

  const primary = normalizeAddress(localStorage.getItem(REF_STORAGE_KEY));
  if (isHexAddress(primary)) return primary;

  const legacy = normalizeAddress(localStorage.getItem(LEGACY_REF_STORAGE_KEY));
  if (isHexAddress(legacy)) return legacy;

  return "";
}

export function captureRefFromUrl(ref?: string | null) {
  if (typeof window === "undefined") return "";

  let incoming = ref;

  if (!incoming) {
    const params = new URLSearchParams(window.location.search);
    incoming = params.get("ref");
  }

  const a = normalizeAddress(incoming);
  if (!isHexAddress(a)) return "";

  storeRefAddress(a);
  return a;
}

export function clearStoredRefAddress() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(REF_STORAGE_KEY);
  localStorage.removeItem(LEGACY_REF_STORAGE_KEY);
}