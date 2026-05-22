type ReadAttempt<T> = {
  data?: T;
  error?: unknown;
  response?: Response;
};

type RetryReadResult<T> =
  | { status: "ok"; data: T }
  | { status: "not_found" }
  | { status: "transient" };

type RetryReadOptions<T> = {
  delaysMs?: number[];
  isDefinitiveNotFound?: (attempt: ReadAttempt<T>) => boolean;
};

const DEFAULT_DELAYS_MS = [0, 400, 800];

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function withReadRetries<T>(
  read: () => Promise<ReadAttempt<T>>,
  options: RetryReadOptions<T> = {},
): Promise<RetryReadResult<T>> {
  const delaysMs = options.delaysMs ?? DEFAULT_DELAYS_MS;

  for (const delayMs of delaysMs) {
    if (delayMs > 0) {
      await sleep(delayMs);
    }

    const attempt = await read().catch(() => ({
      data: undefined,
      error: true,
    }));

    if (attempt.data) {
      return { status: "ok", data: attempt.data };
    }

    if (options.isDefinitiveNotFound?.(attempt)) {
      return { status: "not_found" };
    }
  }

  return { status: "transient" };
}
