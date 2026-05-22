import createClient, { type Middleware } from "openapi-fetch";
import type { components, paths } from "./schema";

export type PixelAidApiPaths = paths;
export type PixelAidApiComponents = components;

export type ApiClientOptions = {
  baseUrl?: string;
  accessToken?: string;
};

export function createPixelAidApiClient(options: ApiClientOptions = {}) {
  const client = createClient<paths>({
    baseUrl: options.baseUrl ?? "http://localhost:8000",
  });

  if (options.accessToken) {
    const authMiddleware: Middleware = {
      async onRequest({ request }) {
        request.headers.set("Authorization", `Bearer ${options.accessToken}`);
        return request;
      },
    };

    client.use(authMiddleware);
  }

  return client;
}
