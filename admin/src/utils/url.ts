const uploadBase =
  import.meta.env.VITE_UPLOAD_BASE_URL ||
  (import.meta.env.VITE_API_BASE_URL || "").replace(/\/api(?:\/)?$/, "/uploads");

function ensureTrailingSlash(value: string) {
  if (!value) return "";
  return value.endsWith("/") ? value : `${value}/`;
}

export function resolveUploadUrl(path?: string | null) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const base = uploadBase || (typeof window !== "undefined" ? window.location.origin : "");
  try {
    const resolved = new URL(path, ensureTrailingSlash(base));
    return resolved.toString();
  } catch {
    return path;
  }
}
