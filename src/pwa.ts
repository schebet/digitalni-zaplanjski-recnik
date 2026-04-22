import { registerSW } from "virtual:pwa-register";
import { toast } from "sonner";

/**
 * Register the service worker, but only when it is safe to do so.
 *
 * The Lovable editor renders the app inside an iframe on a preview host.
 * Service workers in that context cause stale content and navigation
 * interference, so we skip registration (and proactively unregister any
 * leftover SW) whenever we detect a preview / iframe environment.
 */
export function setupPWA() {
  if (typeof window === "undefined") return;

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

  if (isInIframe || isPreviewHost) {
    // Cleanup any service worker that may have been registered in the past.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
    }
    return;
  }

  if (!("serviceWorker" in navigator)) return;

  const updateSW = registerSW({
    immediate: true,
    onOfflineReady() {
      // App shell + bundled recnik are now cached for offline use.
      window.dispatchEvent(new CustomEvent("pwa:offline-ready"));
      toast.success("Спремно за рад без интернета", {
        description:
          "Речник и апликација су сачувани локално. Можеш их користити и без везе.",
        duration: 6000,
      });
    },
    onNeedRefresh() {
      toast("Доступна је нова верзија речника", {
        description: "Освежи да би учитао најновије одреднице.",
        duration: 10000,
        action: {
          label: "Освежи",
          onClick: () => updateSW(true),
        },
      });
    },
    onRegisteredSW(swUrl, reg) {
      // Periodic update check (every 60 min) so long-lived tabs pick up new builds.
      if (reg) {
        setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
      }
    },
    onRegisterError(err) {
      console.warn("[PWA] SW registration failed:", err);
    },
  });
}
