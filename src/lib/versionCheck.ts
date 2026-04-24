/**
 * Version mismatch detection.
 *
 * On every load (and periodically) we fetch /version.json from the network,
 * bypassing any cache, and compare it to the build-time constant baked into
 * this bundle (__APP_VERSION__). If they differ, the user is running a stale
 * cached bundle: we unregister the service worker, wipe Cache Storage, and
 * hard-reload to pick up the freshly published assets.
 */

const STORAGE_KEY = "app:lastKnownVersion";
const RELOAD_GUARD_KEY = "app:versionReloadAt";
const RELOAD_GUARD_MS = 30_000;

const CURRENT_VERSION =
  typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev";

async function nukeAndReload(reason: string) {
  // Avoid reload loops if something on the server is misconfigured.
  const last = Number(sessionStorage.getItem(RELOAD_GUARD_KEY) || 0);
  if (Date.now() - last < RELOAD_GUARD_MS) {
    console.warn("[version] Skipping reload (guard active):", reason);
    return;
  }
  sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()));

  console.info("[version] Forcing fresh content:", reason);

  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
  } catch (err) {
    console.warn("[version] SW unregister failed:", err);
  }

  try {
    if ("caches" in window) {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
    }
  } catch (err) {
    console.warn("[version] Cache wipe failed:", err);
  }

  // Bust HTTP cache by adding a query string on reload.
  const url = new URL(window.location.href);
  url.searchParams.set("v", String(Date.now()));
  window.location.replace(url.toString());
}

async function fetchRemoteVersion(): Promise<string | null> {
  try {
    const res = await fetch(`/version.json?ts=${Date.now()}`, {
      cache: "no-store",
      headers: { "cache-control": "no-cache" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { version?: string };
    return typeof data.version === "string" ? data.version : null;
  } catch {
    return null;
  }
}

async function checkOnce() {
  const remote = await fetchRemoteVersion();
  if (!remote) return;

  // Persist for diagnostics; not used for the comparison itself.
  localStorage.setItem(STORAGE_KEY, remote);

  if (CURRENT_VERSION !== "dev" && remote !== CURRENT_VERSION) {
    await nukeAndReload(
      `mismatch (bundle=${CURRENT_VERSION}, server=${remote})`,
    );
  }
}

export function startVersionCheck() {
  if (typeof window === "undefined") return;

  // Skip in dev / preview iframe — same heuristic as the SW guard.
  const isInIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();
  const host = window.location.hostname;
  const isPreviewHost =
    host.includes("id-preview--") ||
    host.includes("lovableproject.com") ||
    host === "localhost" ||
    host === "127.0.0.1";

  if (isInIframe || isPreviewHost) return;

  void checkOnce();

  window.addEventListener("focus", () => void checkOnce());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void checkOnce();
  });
  setInterval(() => void checkOnce(), 5 * 60 * 1000);
}
