import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, RuntimeCaching } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

/** Always fetch the latest home BGM; avoid stale placeholder from static-audio-assets cache. */
const homeBgmRuntimeCaching: RuntimeCaching = {
  matcher: ({ url }) => url.pathname === "/assets/audio/home-bgm.mp3",
  handler: new NetworkOnly(),
};

/** Never cache App Router RSC payloads; stale entries caused intermittent 404 on client nav. */
const appRouterRuntimeCaching: RuntimeCaching = {
  matcher: ({ request, url: { pathname }, sameOrigin }) =>
    sameOrigin &&
    !pathname.startsWith("/api/") &&
    (request.headers.get("RSC") === "1" ||
      request.headers.get("Next-Router-Prefetch") === "1" ||
      request.headers.get("Next-Router-State-Tree") != null),
  handler: new NetworkOnly(),
};

const documentRuntimeCaching: RuntimeCaching = {
  matcher: ({ request }) => request.mode === "navigate" || request.destination === "document",
  handler: async ({ request }) => {
    try {
      return await fetch(request);
    } catch {
      return (
        (await caches.match("/offline")) ??
        new Response("PixelAid sedang offline. Coba muat ulang saat koneksi stabil.", {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
          status: 503,
        })
      );
    }
  },
};

declare global {
  interface WorkerGlobalScope {
    __SW_MANIFEST: (PrecacheEntry | string)[];
  }
}

declare const self: WorkerGlobalScope &
  typeof globalThis & {
    skipWaiting: () => Promise<void>;
    clients: {
      claim: () => Promise<void>;
    };
  };

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    documentRuntimeCaching,
    appRouterRuntimeCaching,
    homeBgmRuntimeCaching,
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
