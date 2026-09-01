import { PHOTO_ANALYZE_BATCH_SIZE, PHOTO_MAX_COUNT, type PhotoAnalysis, type PhotoAnalyzeResponse, type Topic } from '~~/shared/types'

export type PhotoStatus = 'pending' | 'optimizing' | 'analyzing' | 'done' | 'error'

/** PhotoAnalysis에서 order(배열 인덱스로 대체)를 뺀 클라이언트 보관용 분석 결과. */
type ClientPhotoAnalysis = Omit<PhotoAnalysis, 'order'>

export interface ClientPhoto {
  /** 추가 시 1회 생성되는 안정적 키. 드래그로 순서를 바꿔도 절대 바뀌지 않는다(재분석 스킵 판단의 기준). */
  id: string
  file: File
  previewUrl: string
  status: PhotoStatus
  analysis?: ClientPhotoAnalysis
  errorMessage?: string
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_ORIGINAL_FILE_SIZE = 30 * 1024 * 1024

/**
 * 사진 업로드/최적화/분석/순서 상태를 소유하는 composable. useBlogGenerator()가 내부에서 호출해 반환값을
 * 재노출한다. 순서 변경(드래그)은 photos 배열 자체를 splice하는 것으로만 처리되며 이 파일의 어떤 함수도
 * 호출되지 않으므로, "순서만 바뀌면 재분석하지 않는다"는 요구사항이 구조적으로 보장된다.
 */
export function usePhotoUploader(topic: Ref<Topic>) {
  const photos = ref<ClientPhoto[]>([])
  const isDrainingQueue = ref(false)
  const rejectedFileMessage = ref('')
  const batchErrorMessage = ref('')

  const photoBusy = computed(() =>
    photos.value.some(p => p.status === 'pending' || p.status === 'optimizing' || p.status === 'analyzing')
  )
  const hasFailedPhotos = computed(() => photos.value.some(p => p.status === 'error'))

  function addFiles(files: File[]) {
    rejectedFileMessage.value = ''
    const rejected: string[] = []
    const accepted: File[] = []

    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        rejected.push(`${file.name}(지원하지 않는 형식)`)
        continue
      }
      if (file.size > MAX_ORIGINAL_FILE_SIZE) {
        rejected.push(`${file.name}(용량 초과)`)
        continue
      }
      accepted.push(file)
    }

    const remainingSlots = Math.max(0, PHOTO_MAX_COUNT - photos.value.length)
    const toAdd = accepted.slice(0, remainingSlots)
    const overflowCount = accepted.length - toAdd.length

    for (const file of toAdd) {
      photos.value.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'pending'
      })
    }

    if (rejected.length > 0) {
      rejectedFileMessage.value = `추가하지 못한 파일이 있습니다: ${rejected.join(', ')}`
    } else if (overflowCount > 0) {
      rejectedFileMessage.value = `최대 ${PHOTO_MAX_COUNT}장까지 업로드할 수 있습니다. ${overflowCount}장은 추가되지 않았습니다.`
    }

    if (toAdd.length > 0) void drainAnalysisQueue()
  }

  function removePhoto(id: string) {
    const idx = photos.value.findIndex(p => p.id === id)
    if (idx === -1) return
    URL.revokeObjectURL(photos.value[idx]!.previewUrl)
    photos.value.splice(idx, 1)
  }

  function retryPhoto(id: string) {
    const photo = photos.value.find(p => p.id === id)
    if (!photo) return
    photo.status = 'pending'
    photo.errorMessage = undefined
    void drainAnalysisQueue()
  }

  function resetPhotos() {
    for (const photo of photos.value) {
      URL.revokeObjectURL(photo.previewUrl)
    }
    photos.value = []
    rejectedFileMessage.value = ''
    batchErrorMessage.value = ''
  }

  /**
   * pending 상태 사진만 모아 최적화 → 단일 Gemini 호출로 분석한다. 유사 사진 그룹핑은 같은 호출 컨텍스트
   * 안에서만 비교되므로 배치를 쪼개지 않는다. 처리 중 새로 추가된 pending 사진은 다음 반복에서 자동으로
   * 포함된다.
   */
  async function drainAnalysisQueue() {
    if (isDrainingQueue.value) return
    isDrainingQueue.value = true

    try {
      let pending = photos.value.filter(p => p.status === 'pending')

      while (pending.length > 0) {
        batchErrorMessage.value = ''

        for (const photo of pending) {
          photo.status = 'optimizing'
        }

        const optimizedResults = await Promise.all(pending.map(async (photo) => {
          try {
            const optimized = await optimizeImageForAnalysis(photo.file)
            return { photo, optimized, error: null as string | null }
          } catch (e) {
            return { photo, optimized: null, error: e instanceof Error ? e.message : '이미지를 최적화하지 못했습니다.' }
          }
        }))

        const toAnalyze: Array<{ photo: ClientPhoto, mimeType: 'image/jpeg' | 'image/webp', base64: string }> = []
        for (const r of optimizedResults) {
          if (r.error || !r.optimized) {
            r.photo.status = 'error'
            r.photo.errorMessage = r.error ?? '이미지를 최적화하지 못했습니다.'
            continue
          }
          r.photo.status = 'analyzing'
          toAnalyze.push({ photo: r.photo, mimeType: r.optimized.mimeType, base64: r.optimized.base64 })
        }

        // 사진이 많을 때 요청 바디가 서버리스 요청 크기 한도를 넘지 않도록 PHOTO_ANALYZE_BATCH_SIZE 단위로 나눠 호출한다.
        // 유사 사진 그룹핑은 같은 호출(청크) 안에서만 비교되므로 청크마다 별도의 batchId로 네임스페이싱한다.
        for (let i = 0; i < toAnalyze.length; i += PHOTO_ANALYZE_BATCH_SIZE) {
          const chunk = toAnalyze.slice(i, i + PHOTO_ANALYZE_BATCH_SIZE)
          try {
            const response = await $fetch<PhotoAnalyzeResponse>('/api/photo-analyze', {
              method: 'POST',
              body: {
                topic: topic.value,
                images: chunk.map(t => ({ mimeType: t.mimeType, base64: t.base64 }))
              }
            })

            const batchId = crypto.randomUUID()
            response.results.forEach((result, idx) => {
              const target = chunk[idx]!.photo
              const { similarityGroup, ...rest } = result
              target.analysis = { ...rest, similarityGroupId: `${batchId}:${similarityGroup}` }
              target.status = 'done'
            })
          } catch (e) {
            const message = extractErrorMessage(e, '사진 분석 중 오류가 발생했습니다.')
            batchErrorMessage.value = message
            for (const t of chunk) {
              t.photo.status = 'error'
              t.photo.errorMessage = message
            }
          }
        }

        pending = photos.value.filter(p => p.status === 'pending')
      }
    } finally {
      isDrainingQueue.value = false
    }
  }

  function buildPhotoAnalysisPayload(): PhotoAnalysis[] {
    return photos.value
      .filter((p): p is ClientPhoto & { analysis: ClientPhotoAnalysis } => p.status === 'done' && !!p.analysis)
      .map((p, idx) => ({ order: idx, ...p.analysis }))
  }

  if (import.meta.client) {
    onBeforeUnmount(resetPhotos)
  }

  return {
    photos,
    photoBusy,
    hasFailedPhotos,
    batchErrorMessage,
    rejectedFileMessage,
    addFiles,
    removePhoto,
    retryPhoto,
    resetPhotos,
    buildPhotoAnalysisPayload
  }
}
