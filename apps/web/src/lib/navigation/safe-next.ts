const DEFAULT_HOME = "/app/home";

export function safeNextPath(
  value: string | null | undefined,
  fallback = DEFAULT_HOME,
): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return fallback;
  }
  return value;
}

export function safeNextQuery(value: string | undefined): string | undefined {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return undefined;
  }
  return value;
}

export function safeNextFromForm(formData: FormData, fallback: string): string {
  return safeNextPath(String(formData.get("next") ?? ""), fallback);
}
