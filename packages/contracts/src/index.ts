import createClient, { type Middleware } from "openapi-fetch";
import type { components, paths } from "./schema";

export type PixelAidApiPaths = paths;
export type PixelAidApiComponents = components;

export type ApiClientOptions = {
  baseUrl?: string;
  accessToken?: string;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 12_000;

async function fetchWithTimeout(input: Request, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const abortFromInput = () => controller.abort();

  if (input.signal.aborted) {
    controller.abort();
  } else {
    input.signal.addEventListener("abort", abortFromInput, { once: true });
  }

  try {
    return await fetch(new Request(input, { signal: controller.signal }));
  } finally {
    clearTimeout(timeout);
    input.signal.removeEventListener("abort", abortFromInput);
  }
}

export function createPixelAidApiClient(options: ApiClientOptions = {}) {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const client = createClient<paths>({
    baseUrl: options.baseUrl ?? "http://localhost:8000",
    fetch: (input) => fetchWithTimeout(input, timeoutMs),
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
