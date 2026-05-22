import createClient, { type Middleware } from "openapi-fetch";
import type { components, paths } from "./schema";

export type PixelAidApiPaths = paths;
export type PixelAidApiComponents = components;

export type ApiClientOptions = {
  baseUrl?: string;
  accessToken?: string;
  guestSession?: string;
};

export function createPixelAidApiClient(options: ApiClientOptions = {}) {
  const client = createClient<paths>({
    baseUrl: options.baseUrl ?? "http://localhost:8000",
  });

  if (options.accessToken || options.guestSession) {
    const authMiddleware: Middleware = {
      async onRequest({ request }) {
        if (options.accessToken) {
          request.headers.set("Authorization", `Bearer ${options.accessToken}`);
        }
        if (options.guestSession) {
          request.headers.set("X-Guest-Session", options.guestSession);
        }
        return request;
      },
    };

    client.use(authMiddleware);
  }

  return client;
}
