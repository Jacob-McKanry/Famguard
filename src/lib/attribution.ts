// Remembers where a visitor came from (spec section 6.4).
//
// Jacob shares links like  /?src=fb-parenting-aging-parents
// A visitor can land on "/" and only reach "/join" later, so we save the values
// in sessionStorage AND a first-party cookie when they first arrive, and read
// them back when the sign-up form is submitted.
//
// This file runs in the browser only. Every storage call is wrapped in try/catch
// because browsers can block storage (private windows, strict settings).

export type Attribution = {
  src: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
};

const KEYS = ["src", "utm_source", "utm_medium", "utm_campaign"] as const;
const STORAGE_KEY = "fg_attribution";
const COOKIE_NAME = "fg_attr";
const COOKIE_DAYS = 30;
const MAX_LEN = 200; // never store absurdly long values

function clean(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim().slice(0, MAX_LEN);
  return trimmed || null;
}

function fromUrl(search: string): Attribution {
  const params = new URLSearchParams(search);
  return {
    src: clean(params.get("src")),
    utm_source: clean(params.get("utm_source")),
    utm_medium: clean(params.get("utm_medium")),
    utm_campaign: clean(params.get("utm_campaign")),
  };
}

function hasAny(a: Attribution): boolean {
  return KEYS.some((k) => a[k]);
}

function readCookie(): Attribution | null {
  try {
    const match = document.cookie.split("; ").find((c) => c.startsWith(COOKIE_NAME + "="));
    if (!match) return null;
    return JSON.parse(decodeURIComponent(match.slice(COOKIE_NAME.length + 1))) as Attribution;
  } catch {
    return null;
  }
}

function save(a: Attribution) {
  const json = JSON.stringify(a);
  try {
    sessionStorage.setItem(STORAGE_KEY, json);
  } catch {
    /* storage blocked: the cookie below is the backup */
  }
  try {
    const maxAge = COOKIE_DAYS * 24 * 60 * 60;
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(json)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch {
    /* cookies blocked: nothing more we can do */
  }
}

// Call on every page load. If the URL carries tracking values, remember them.
export function captureAttribution() {
  const fresh = fromUrl(window.location.search);
  if (hasAny(fresh)) save(fresh);
}

// Call at submit time. URL values win, then sessionStorage, then the cookie.
export function readAttribution(): Attribution {
  const empty: Attribution = { src: null, utm_source: null, utm_medium: null, utm_campaign: null };
  const fromQuery = fromUrl(window.location.search);
  if (hasAny(fromQuery)) return fromQuery;
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) return { ...empty, ...(JSON.parse(stored) as Attribution) };
  } catch {
    /* fall through to the cookie */
  }
  return { ...empty, ...(readCookie() ?? {}) };
}
