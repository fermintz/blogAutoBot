/**
 * items를 최대 concurrency개씩 동시에 worker로 처리한다. Promise.all과 달리 한 번에 모두 쏘지 않고,
 * 하나가 끝나는 즉시 다음 항목을 채워 넣어 항상 concurrency개 이하로만 동시에 실행되게 한다(API 요청 한도 보호).
 * worker가 던진 에러는 개별 항목 처리 실패로 흡수하고, 다른 항목 처리는 계속 진행한다.
 */
export async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>
): Promise<void> {
  let cursor = 0

  async function runNext(): Promise<void> {
    while (cursor < items.length) {
      const index = cursor++
      await worker(items[index]!, index)
    }
  }

  const workerCount = Math.min(concurrency, items.length)
  await Promise.all(Array.from({ length: workerCount }, () => runNext()))
}
