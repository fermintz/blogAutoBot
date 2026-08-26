import type { BusinessLookupResponse, NaverBusinessCandidate } from '~~/shared/types'

/** "이름으로 네이버 지역 검색 → 후보 목록을 모달에 띄운다"는 조회 메커니즘 공통 로직. 후보를 실제 폼 필드에 어떻게 반영할지(예: 업체정보 vs 매장정보)는 호출하는 컴포넌트가 candidates/select 결과를 받아 직접 처리한다. */
export function useNaverLookup() {
  const lookupPending = ref(false)
  const lookupError = ref('')
  const candidates = ref<NaverBusinessCandidate[]>([])
  const isModalOpen = ref(false)

  async function lookup(query: string, fallbackMessage = '업체 정보를 조회하지 못했습니다.') {
    const trimmed = query.trim()
    if (!trimmed || lookupPending.value) return

    lookupPending.value = true
    lookupError.value = ''
    candidates.value = []

    try {
      const res = await $fetch<BusinessLookupResponse>('/api/business-lookup', {
        method: 'POST',
        body: { query: trimmed }
      })
      candidates.value = res.candidates
      isModalOpen.value = true
    } catch (e) {
      lookupError.value = extractErrorMessage(e, fallbackMessage)
    } finally {
      lookupPending.value = false
    }
  }

  return { lookupPending, lookupError, candidates, isModalOpen, lookup }
}
