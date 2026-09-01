export interface OptimizedImage {
  mimeType: 'image/jpeg' | 'image/webp'
  base64: string
  byteLength: number
}

const MAX_DIMENSION = 1920
const QUALITY_STEPS = [0.85, 0.7, 0.55]
/** 디코딩 시 약 300KB 목표(base64 문자열 기준 약 400,000자, shared/types.ts의 PHOTO_MAX_BASE64_LENGTH와 동일). */
const TARGET_BASE64_LENGTH = 400_000

/**
 * 업로드된 사진을 AI 분석용으로 최적화한다. createImageBitmap의 imageOrientation: 'from-image' 옵션이 EXIF
 * 회전 정보를 자동으로 반영해 디코딩하므로 별도 EXIF 라이브러리가 필요 없다. 메뉴판/간판처럼 텍스트가 많은
 * 사진과 일반 사진을 사전에 구분할 수 없어(유형 분류 자체가 분석 결과물이라 선후관계 문제), 텍스트 판독에도
 * 충분한 해상도(긴 변 1920px)와 품질(0.85)을 단일 기본값으로 사용한다.
 */
export async function optimizeImageForAnalysis(file: File): Promise<OptimizedImage> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error('사진을 열 수 없습니다. 다른 파일을 사용해주세요.')
  }

  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('이미지를 처리할 수 없습니다.')
    ctx.drawImage(bitmap, 0, 0, width, height)

    let result = await encodeWithFallback(canvas, QUALITY_STEPS[0]!)
    for (let i = 1; i < QUALITY_STEPS.length && result.base64.length > TARGET_BASE64_LENGTH; i++) {
      result = await encodeWithFallback(canvas, QUALITY_STEPS[i]!)
    }

    if (result.base64.length > TARGET_BASE64_LENGTH) {
      const smallerCanvas = document.createElement('canvas')
      smallerCanvas.width = Math.round(width * 0.8)
      smallerCanvas.height = Math.round(height * 0.8)
      const smallerCtx = smallerCanvas.getContext('2d')
      if (smallerCtx) {
        smallerCtx.drawImage(bitmap, 0, 0, smallerCanvas.width, smallerCanvas.height)
        result = await encodeWithFallback(smallerCanvas, QUALITY_STEPS[QUALITY_STEPS.length - 1]!)
      }
    }

    if (result.base64.length > TARGET_BASE64_LENGTH) {
      throw new Error('이미지를 최적화하지 못했습니다.')
    }

    return result
  } finally {
    bitmap.close()
  }
}

async function encodeWithFallback(canvas: HTMLCanvasElement, quality: number): Promise<OptimizedImage> {
  const webpBlob = await canvasToBlob(canvas, 'image/webp', quality)
  const blob = webpBlob.type === 'image/webp' ? webpBlob : await canvasToBlob(canvas, 'image/jpeg', quality)
  const base64 = await blobToBase64(blob)
  return {
    mimeType: blob.type === 'image/webp' ? 'image/webp' : 'image/jpeg',
    base64,
    byteLength: blob.size
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('이미지 인코딩에 실패했습니다.'))
    }, type, quality)
  })
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.slice(result.indexOf(',') + 1))
    }
    reader.onerror = () => reject(new Error('이미지 인코딩에 실패했습니다.'))
    reader.readAsDataURL(blob)
  })
}
