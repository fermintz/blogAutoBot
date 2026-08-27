import type { SubtitleCsvEntry, SubtitleCsvRow } from '~~/shared/types'

/**
 * papaparse는 브라우저에서만 쓰이는 CSV 파서라 정적으로 import하면 SSR 시 페이지 setup()이 서버에서도 실행되면서
 * Nitro의 서버 번들에 papaparse(UMD)가 함께 포함되려다 빌드가 깨진다. 실제로 호출되는 시점에만 동적으로 불러온다.
 */
let papaparseModule: Promise<typeof import('papaparse')> | null = null
function loadPapaparse() {
  papaparseModule ??= import('papaparse')
  return papaparseModule
}

const BOM_CHAR_CODE = 0xFEFF

export interface CsvParseResult {
  headers: string[]
  entries: SubtitleCsvEntry[]
  errors: string[]
  warnings: string[]
}

/** 자막 텍스트가 들어 있을 가능성이 높은 헤더 이름 후보(소문자 비교). 우선순위 순서대로 정확히 일치하는 헤더부터 찾는다. */
const SOURCE_COLUMN_CANDIDATES = ['자막', '대사', '내용', '텍스트', 'text', 'subtitle', 'caption', 'dialogue', 'script']

/** 자막 시작/종료 시간이 들어 있을 가능성이 높은 헤더 이름 후보. detectSourceColumn과 같은 정확 일치 → 부분 일치 순서로 탐색한다. */
const START_TIME_COLUMN_CANDIDATES = ['시작시간', '시작 시간', '시작', 'start time', 'starttime', 'start', 'in']
const END_TIME_COLUMN_CANDIDATES = ['종료시간', '종료 시간', '종료', '끝시간', '끝', 'end time', 'endtime', 'end', 'out']

/** 헤더 목록에서 후보 이름 배열과 가장 먼저 일치하는 헤더를 찾는다. 정확히 일치하는 헤더를 우선하고, 없으면 부분 일치로 찾는다. */
function findColumnByCandidates(headers: { original: string, key: string }[], candidates: string[]): string | null {
  for (const candidate of candidates) {
    const exact = headers.find(h => h.key === candidate.toLowerCase())
    if (exact) return exact.original
  }
  for (const candidate of candidates) {
    const partial = headers.find(h => h.key.includes(candidate.toLowerCase()))
    if (partial) return partial.original
  }
  return null
}

/** 헤더 목록에서 번역 대상(자막 텍스트) 컬럼을 추정한다. 확신할 수 없으면 null을 반환해 사용자가 직접 고르게 한다. */
export function detectSourceColumn(headers: string[]): string | null {
  const normalized = headers.map(h => ({ original: h, key: h.trim().toLowerCase() }))
  return findColumnByCandidates(normalized, SOURCE_COLUMN_CANDIDATES)
}

/** 헤더 목록에서 자막 시작/종료 시간 컬럼을 추정한다. SRT 내보내기에 필요하며, 확신할 수 없으면 null을 반환해 사용자가 직접 고르게 한다. */
export function detectTimeColumns(headers: string[]): { startColumn: string | null, endColumn: string | null } {
  const normalized = headers.map(h => ({ original: h, key: h.trim().toLowerCase() }))
  return {
    startColumn: findColumnByCandidates(normalized, START_TIME_COLUMN_CANDIDATES),
    endColumn: findColumnByCandidates(normalized, END_TIME_COLUMN_CANDIDATES)
  }
}

function normalize(content: string): string {
  return content.charCodeAt(0) === BOM_CHAR_CODE ? content.slice(1) : content
}

function isRowEmpty(row: SubtitleCsvRow): boolean {
  return Object.values(row).every(v => (v ?? '').trim() === '')
}

/** CSV 텍스트를 헤더 + 행 배열로 파싱한다. sourceColumn이 주어지면 각 행의 sourceText까지 채워서 반환한다. */
export async function parseCsvText(raw: string, sourceColumn?: string | null): Promise<CsvParseResult> {
  const content = normalize(raw).trim()
  const errors: string[] = []
  const warnings: string[] = []

  if (!content) {
    errors.push('파일 내용이 비어 있습니다.')
    return { headers: [], entries: [], errors, warnings }
  }

  const Papa = await loadPapaparse()
  const result = Papa.parse<SubtitleCsvRow>(content, {
    header: true,
    skipEmptyLines: true
  })

  const headers = result.meta.fields ?? []
  for (const err of result.errors) {
    errors.push(err.row !== undefined ? `${err.row + 1}행: ${err.message}` : err.message)
  }

  if (headers.length === 0) {
    errors.push('CSV 헤더를 인식할 수 없습니다.')
    return { headers, entries: [], errors, warnings }
  }

  const rows = result.data.filter(row => !isRowEmpty(row))

  const entries: SubtitleCsvEntry[] = rows.map((row, rowIndex) => {
    const sourceText = sourceColumn ? (row[sourceColumn] ?? '').trim() : ''
    if (sourceColumn && !sourceText) {
      warnings.push(`${rowIndex + 1}번째 행의 "${sourceColumn}" 컬럼이 비어 있습니다.`)
    }
    return { rowIndex, row, sourceText }
  })

  if (entries.length === 0 && errors.length === 0) {
    errors.push('CSV에서 데이터 행을 찾을 수 없습니다.')
  }

  return { headers, entries, errors, warnings }
}

/**
 * ArrayBuffer를 CSV 텍스트로 디코딩한다. UTF-8(BOM 포함)을 우선 시도하고,
 * Excel에서 저장된 CP949/EUC-KR 인코딩처럼 한글이 깨지는 신호(치환 문자 U+FFFD)가 보이면 EUC-KR로 재시도한다.
 */
export function decodeCsvBuffer(buffer: ArrayBuffer): string {
  const utf8Text = new TextDecoder('utf-8').decode(buffer)
  if (!utf8Text.includes('�')) return utf8Text

  try {
    return new TextDecoder('euc-kr').decode(buffer)
  } catch {
    return utf8Text
  }
}

/** File 객체를 읽어 CSV 텍스트로 디코딩한다. */
export function readCsvFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(decodeCsvBuffer(reader.result as ArrayBuffer))
    reader.onerror = () => reject(reader.error ?? new Error('파일을 읽을 수 없습니다.'))
    reader.readAsArrayBuffer(file)
  })
}
