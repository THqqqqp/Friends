const defaultApiBase = import.meta.env.VITE_API_BASE_URL || ''
const fallbackOrigin =
  defaultApiBase.replace(/\/api(?:\/)?$/, '') ||
  (typeof window !== 'undefined' ? window.location.origin : '')

const uploadBase =
  import.meta.env.VITE_UPLOAD_BASE_URL || `${fallbackOrigin}/uploads`

function ensureBase(value: string) {
  if (!value) return ''
  return value.endsWith('/') ? value : `${value}/`
}

export function resolveUploadUrl(path?: string | null, baseOverride?: string) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  const base = ensureBase(baseOverride || uploadBase || fallbackOrigin)
  try {
    return new URL(path, base).toString()
  } catch {
    return path
  }
}
