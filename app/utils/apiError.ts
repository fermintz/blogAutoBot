export function extractErrorMessage(e: unknown, fallback = '오류가 발생했습니다.'): string {
  if (e && typeof e === 'object') {
    const err = e as { data?: { statusMessage?: string }, statusMessage?: string, message?: string }
    return err.data?.statusMessage || err.statusMessage || err.message || fallback
  }
  return fallback
}
