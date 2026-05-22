import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, RuntimeCaching } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

/** Always fetch the latest home BGM; avoid stale placeholder from static-audio-assets cache. */
const homeBgmRuntimeCaching: RuntimeCaching = {
  matcher: ({ url }) => url.pathname === "/assets/audio/home-bgm.mp3",
  handler: new NetworkOnly(),
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
  runtimeCaching: [homeBgmRuntimeCaching, ...defaultCache],
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
