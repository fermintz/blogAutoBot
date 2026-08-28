import type { H3Event } from 'h3'

interface RateLimitEntry {
  count: number
  windowStart: number
}

/**
 * 매우 단순한 IP 기반 고정 윈도우(fixed window) rate limiter. Node 프로세스 메모리에만 저장하므로, Vercel 같은
 * 서버리스 환경에서 요청이 여러 인스턴스로 분산되면 인스턴스별로 따로 카운트되어 완벽한 전역 제한은 아니다.
 * 이 프로젝트에는 아직 인스턴스 간에 공유하는 저장소(Redis 등)가 없어, 새 인프라를 추가하지 않는 선에서
 * "짧은 시간에 반복 요청하는 뻔한 오용"을 줄이는 최소한의 방어선으로만 쓴다(진짜 전역 제한이 필요하면
 * Upstash/Vercel KV 같은 공유 저장소 도입을 별도로 검토해야 한다).
 */
const buckets = new Map<string, RateLimitEntry>()

/** 오래 켜져 있는 인스턴스에서 buckets가 무한정 커지지 않도록, 매 호출마다 낮은 확률로 만료된 항목을 정리한다. */
const CLEANUP_PROBABILITY = 0.02

function cleanupExpired(windowMs: number) {
  const now = Date.now()
  for (const [key, entry] of buckets) {
    if (now - entry.windowStart >= windowMs) {
      buckets.delete(key)
    }
  }
}

/** key가 limit을 초과하지 않았으면 카운트를 올리고 true, 초과했으면 false를 반환한다. */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  if (Math.random() < CLEANUP_PROBABILITY) cleanupExpired(windowMs)

  const now = Date.now()
  const entry = buckets.get(key)

  if (!entry || now - entry.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now })
    return true
  }

  if (entry.count >= limit) return false

  entry.count++
  return true
}

/** 요청을 보낸 클라이언트를 식별하는 키. Vercel 등 프록시 뒤에서는 x-forwarded-for를, 로컬 개발 환경에서는 소켓 주소를 쓴다. */
export function getClientIp(event: H3Event): string {
  return getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
}
