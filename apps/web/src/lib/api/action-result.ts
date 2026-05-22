export type ActionResult<T> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: string;
    };

const DEFAULT_API_ERROR =
  "Koneksi ke server tidak stabil. Coba lagi sebentar.";

export function ok<T>(data: T): ActionResult<T> {
  return { data, error: null };
}

export function fail<T = never>(error: string): ActionResult<T> {
  return { data: null, error };
}

function detailMessage(detail: unknown): string | null {
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail)) {
    const firstMessage = detail
      .map((item) =>
        item && typeof item === "object" && "msg" in item
          ? (item as { msg?: unknown }).msg
          : null,
      )
      .find((message): message is string => typeof message === "string" && Boolean(message.trim()));

    return firstMessage?.trim() ?? null;
  }

  return null;
}

export function apiErrorMessage(error: unknown, fallback = DEFAULT_API_ERROR) {
  if (error && typeof error === "object") {
    if ("name" in error && (error as { name?: unknown }).name === "AbortError") {
      return "Server membutuhkan waktu lebih lama dari biasanya. Coba lagi sebentar.";
    }

    if ("detail" in error) {
      const message = detailMessage((error as { detail?: unknown }).detail);
      if (message) {
        return message;
      }
    }

    if ("message" in error) {
      const message = (error as { message?: unknown }).message;
      if (typeof message === "string" && message.trim()) {
        return message;
      }
    }
  }

  return fallback;
}

export function apiCatchMessage(error: unknown, fallback = DEFAULT_API_ERROR) {
  if (error instanceof TypeError) {
    return fallback;
  }

  return apiErrorMessage(error, fallback);
}
