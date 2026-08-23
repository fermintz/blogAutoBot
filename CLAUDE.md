# CLAUDE.md

이 문서는 이 저장소에서 작업하는 Claude Code 세션을 위한 프로젝트 컨텍스트입니다.

## 프로젝트 개요

네이버 블로그 글 자동생성기. 사용자가 자신의 Google(Gemini) API 키와 메인/연관 키워드, 어조, 분량, 업체·상품 정보 등을 입력하면 SEO/AEO/GEO 및 E-E-A-T를 고려한 네이버 블로그 글 초안(제목/본문/태그)을 자동으로 생성한다. 생성기는 초안만 만들어주고, 사용자가 검토 후 직접 복사해서 네이버 블로그에 등록하는 용도다. 회원가입/로그인/DB는 없다. Google API 키는 사용자가 매번(또는 설정 페이지에 저장해두고) 직접 입력하며, 서버는 요청을 Google API로 전달하는 프록시 역할만 하고 키를 저장하지 않는다.

## 스택 & 커맨드

- Nuxt 4 + `@nuxt/ui`(v4, Tailwind CSS 포함) + TypeScript, 패키지 매니저는 npm.
- `npm run dev` — 개발 서버 (`--host` 옵션 포함)
- `npm run build` — 프로덕션 빌드
- `npm run typecheck` — `nuxt typecheck` (코드 변경 후 항상 이걸로 확인)
- `npm run lint` — ESLint

## 아키텍처

- **`shared/types.ts`** — client/server 공용 타입의 단일 소스. `GenerateRequest`, `GenerateResponse`, `SavedArticle`, `BusinessInfo`, 톤(`TONE_OPTIONS`)/분량(`LENGTH_OPTIONS`) 옵션이 여기 있다. 새 생성 옵션을 추가할 때는 항상 여기부터 시작한다.
- **`server/utils/buildPrompt.ts`** — Gemini에 보낼 프롬프트를 조립한다. 섹션별로 함수가 분리되어 있다: `buildTitleBlock`(제목 고정/자동생성 + 커스텀 제목일 때 스토리텔링 지침), `buildBodyTemplateBlock`(본문 구조 참고용 템플릿), `buildWritingRulesBlock`(사용자 지정 작성 규칙, 다른 지침보다 우선), `buildReferenceBlock`(참조 내용), `buildBusinessInfoBlock`(업체/상품 정보). 새 입력 필드를 프롬프트에 반영할 때는 이 패턴(트림 → 비어있으면 안내 문구, 아니면 지침 문자열 반환)을 그대로 따른다.
- **`server/utils/gemini.ts`** — Gemini REST API 호출 헬퍼. 모델명은 `gemini-3.6-flash`로 상수 고정되어 있다(사용자가 명시적으로 지정한 값). `responseSchema`로 `{ title, body, tags }` JSON 출력을 강제한다. `validateGeminiKey()`는 `/api/validate-key`에서 쓰는 가벼운 키 검증(모델 목록 조회) 함수다. HTTP 상태코드를 한국어 에러 메시지로 매핑한다.
- **`server/api/generate.post.ts`** / **`server/api/validate-key.post.ts`** — 클라이언트는 Google API를 직접 호출하지 않고 이 프록시를 거친다. 커스텀 제목이 입력된 경우 Gemini 응답과 무관하게 `result.title`을 사용자가 입력한 값으로 서버에서 강제 override한다(모델이 제목을 바꿔 쓰는 것을 방지).
- **`app/composables/usePersistedState.ts`** — localStorage와 동기화되는 제네릭 상태 composable. **중요한 함정**: localStorage 값을 반드시 `onMounted` 안에서 읽어야 한다. setup 단계(컴포저블 본문)에서 바로 읽으면 SSR 렌더(기본값)와 클라이언트 초기 렌더(저장된 값)가 달라져 Vue hydration mismatch가 발생한다(실제로 겪고 고친 버그).
- **`app/composables/useBlogGenerator.ts`** — 메인 폼 상태를 모아 `/api/generate`를 호출하고, 성공 시 `useHistory().add()`로 결과를 자동 저장한다. `resetForm()`은 "글 설정" 카드의 입력값(제목/키워드/참조/톤/분량/업체정보/하단문구)을 초기화한다.
- **`app/composables/useHistory.ts`** — 생성된 글을 `autoblog:history` 키로 localStorage에 최대 50개까지 저장·조회·삭제한다.
- **`app/utils/seoScore.ts`** — 생성 결과를 규칙 기반으로 100점 만점 채점한다(제목 키워드 포함/길이, 도입부 키워드 노출, 연관 키워드 반영, 목표 분량 적합도, 소제목 활용, 태그 개수, 업체정보 반영). `stripPhotoMarkers()`로 사진 자리 마커를 글자수 계산에서 제외한다. 이 파일의 함수들은 `app/utils`에 있어 어디서든 자동 임포트된다.
- **페이지**: `app/pages/index.vue`(생성기 — 좌: 입력 폼 / 우: SEO 점수·생성 결과, `lg` 브레이크포인트에서 2단), `app/pages/settings.vue`(API 키, 기본 본문 템플릿, 작성 규칙), `app/pages/history.vue`(저장된 글 목록 + `UModal`로 상세보기, `ResultPanel`을 재사용).

## 컨벤션

- localStorage 키는 전부 `autoblog:` 접두어를 쓴다: `apiKey`, `businessInfo`, `tone`, `length`, `footerText`, `bodyTemplate`, `writingRules`, `history`.
- 입력 폼은 섹션 하나당 컴포넌트 하나 패턴을 따른다: `TitleSection`, `KeywordSection`, `ReferenceSection`, `StyleSection`, `BodyTemplateSection`, `WritingRulesSection`, `BusinessInfoSection`, `FooterTextSection`. 각 컴포넌트는 `defineModel`로 부모와 값을 바인딩한다.
- Nuxt UI v4 시맨틱 컬러/보더 유틸리티(`text-muted`, `border-default`, `text-success`/`warning`/`error` 등)를 직접 지정한 색상 대신 사용한다. 아이콘은 Lucide(`i-lucide-*`).
- `shared/` 디렉토리는 `~~/shared/...` 별칭으로 import한다(서버 코드에서는 상대 경로 `../../shared/types` 사용).
- 사용자에게 보이는 모든 문구(라벨, 설명, 에러 메시지, 플레이스홀더)는 한국어로 작성한다.
- `app.vue`, `settings.vue`, `history.vue`, `BodyTemplateSection.vue` 등 일부 파일은 사용자가 직접 스타일을 수정해왔다(예: 설명 문구를 `UFormField`의 `description` prop 대신 별도 `<div class="text-gray-500">`로 넣는 방식, 커스텀 버튼 클래스 등). 이런 수동 스타일 변경은 되돌리지 말고 그 위에 이어서 작업한다.

## 알아두면 좋은 것

- `[사진: 설명]`은 AI가 본문에 넣는 사진 자리 표시 마커 문법이다(예: `[사진: 매장 외관과 간판]`). `ResultPanel.vue`가 정규식으로 이 마커를 파싱해 점선 박스 UI로 렌더링한다. 본문 텍스트를 다루는 로직을 추가할 때 이 마커 포맷을 깨지 않도록 주의한다.
- API 키 유효성은 입력 후 자동(디바운스) + `ApiKeySettings.vue`에서 `/api/validate-key`로 확인되고, "적용완료"/"확인 필요" 배지로 표시된다.
- 실제 브라우저 검증에는 Playwright를 쓴다. `node_modules/playwright`는 프로젝트 의존성에 없으므로 필요할 때 `npm install --no-save playwright`로 임시 설치하고, `npx playwright install chromium`으로 브라우저를 준비한 뒤 스크립트로 스크린샷/콘솔 에러를 확인하는 방식을 이 세션에서 계속 사용했다. UI를 변경한 뒤에는 이런 방식으로 실제 렌더링을 확인하는 습관을 유지한다.
