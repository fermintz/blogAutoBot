# CLAUDE.md

이 문서는 이 저장소에서 작업하는 Claude Code 세션을 위한 프로젝트 컨텍스트입니다.

## 프로젝트 개요

네이버 블로그 글 자동생성기. 사용자가 주제(맛집/여행/투어/티켓/숙소)를 고르고 메인/연관 키워드, 어조, 분량, 업체·상품 정보 등을 입력하면 SEO/AEO/GEO 및 E-E-A-T를 고려한 네이버 블로그 글 초안(제목/본문/태그)을 자동으로 생성한다. 생성기는 초안만 만들어주고, 사용자가 검토 후 직접 복사해서 네이버 블로그에 등록하는 용도다.

이메일+비밀번호 계정 시스템(Supabase Auth)이 있다. 로그인한 사용자별로 생성 히스토리, 설정값(주제별 업체정보·본문 템플릿, 작성규칙, 어조/분량/하단문구 기본값), Google API 키가 Supabase Postgres에 저장되어 기기를 바꿔도 동일하게 이용할 수 있다. API 키는 `pgcrypto`로 암호화되어 저장되고, 저장 이후에는 클라이언트에 평문으로 다시 노출되지 않는다(설정 페이지에는 "등록됨" 상태만 표시).

## 스택 & 커맨드

- Nuxt 4 + `@nuxt/ui`(v4, Tailwind CSS 포함) + `@nuxtjs/supabase` + TypeScript, 패키지 매니저는 npm.
- `npm run dev` — 개발 서버 (`--host` 옵션 포함)
- `npm run build` — 프로덕션 빌드
- `npm run typecheck` — `nuxt typecheck` (코드 변경 후 항상 이걸로 확인)
- `npm run lint` — ESLint

### 환경 변수 (`.env`, 배포 호스트 env 설정)

- `SUPABASE_URL`, `SUPABASE_KEY`(anon/public 키) — `@nuxtjs/supabase` 모듈이 자동으로 읽는다.
- `NUXT_API_KEY_ENCRYPTION_SECRET` — API 키 암호화용 서버 전용 비밀키. `nuxt.config.ts`의 `runtimeConfig.apiKeyEncryptionSecret`로 매핑되며 클라이언트에는 절대 노출되지 않는다.
- `.env.example`에 형식이 문서화되어 있다. 실제 값은 커밋하지 않는다.

### Supabase 스키마 (`supabase/migrations/`)

Supabase CLI 표준 마이그레이션 폴더. SQL 에디터나 `supabase db push`로 프로젝트에 적용해야 한다(이 저장소 자체는 실제 DB에 연결되어 있지 않다).

- `user_settings` — 사용자별 설정 1행(주제, 주제별 업체정보 jsonb, 주제별 본문 템플릿 jsonb, 작성규칙, 어조, 분량, 하단문구, 암호화된 API 키). RLS로 `auth.uid() = user_id`만 접근 가능.
- `set_encrypted_api_key(p_api_key, p_secret)` / `get_decrypted_api_key(p_secret)` / `clear_api_key()` — API 키는 반드시 이 세 SQL 함수(`security invoker`, `pgcrypto`)를 통해서만 쓰고 읽는다. 평문 컬럼을 직접 select/update하지 않는다.
- `articles` — 히스토리(생성된 글) 저장 테이블. `user_id`는 `default auth.uid()`라 클라이언트가 직접 넣지 않아도 된다. RLS로 본인 행만 select/insert/delete 가능.
- 서비스 롤 키는 쓰지 않는다. 모든 서버 라우트는 `serverSupabaseClient(event)`로 로그인 사용자의 세션을 그대로 사용하고, RLS가 데이터 접근을 제한한다.

## 아키텍처

- **`shared/types.ts`** — client/server 공용 타입의 단일 소스. `GenerateRequest`, `GenerateResponse`, `SavedArticle`, `BusinessInfo`(주제마다 필드가 달라 `Record<string, string|boolean|undefined>`), `UserSettings`, 주제(`Topic`/`TOPIC_OPTIONS`/`TOPIC_BUSINESS_FIELDS`), 톤(`TONE_OPTIONS`)/분량(`LENGTH_OPTIONS`) 옵션이 여기 있다. `TOPIC_BUSINESS_FIELDS`는 주제별 업체/상품 정보 입력 필드 정의(키/라벨/placeholder/타입)를 담고 있어 `BusinessInfoSection.vue`가 이를 기반으로 폼을 동적으로 그린다. 새 생성 옵션을 추가할 때는 항상 여기부터 시작한다.
- **`server/utils/buildPrompt.ts`** — Gemini에 보낼 프롬프트를 조립한다. 섹션별로 함수가 분리되어 있다: `buildTitleBlock`(제목 고정/자동생성 + 커스텀 제목일 때 스토리텔링 지침), `buildBodyTemplateBlock`(본문 구조 참고용 템플릿), `buildWritingRulesBlock`(사용자 지정 작성 규칙, 다른 지침보다 우선), `buildReferenceBlock`(참조 내용), `buildBusinessInfoBlock`(선택된 주제의 `TOPIC_BUSINESS_FIELDS` 라벨을 사용해 업체/상품 정보 블록 생성). 새 입력 필드를 프롬프트에 반영할 때는 이 패턴(트림 → 비어있으면 안내 문구, 아니면 지침 문자열 반환)을 그대로 따른다.
- **`server/utils/gemini.ts`** — Gemini REST API 호출 헬퍼. 모델명은 `gemini-3.6-flash`로 상수 고정되어 있다(사용자가 명시적으로 지정한 값). `responseSchema`로 `{ title, body, tags }` JSON 출력을 강제한다. `validateGeminiKey()`는 후보 키 하나가 유효한지 가볍게 확인(모델 목록 조회)하는 함수다. HTTP 상태코드를 한국어 에러 메시지로 매핑한다.
- **`server/api/generate.post.ts`** — 인증된 사용자만 호출 가능(`serverSupabaseUser`). 클라이언트는 더 이상 API 키를 body에 담아 보내지 않는다 — 서버가 `get_decrypted_api_key` RPC로 저장된 키를 복호화해 사용한다. 커스텀 제목이 입력된 경우 Gemini 응답과 무관하게 `result.title`을 사용자가 입력한 값으로 서버에서 강제 override한다(모델이 제목을 바꿔 쓰는 것을 방지).
- **`server/api/validate-key.post.ts`** — 저장 전 "후보" API 키 하나를 검증하는 용도. `{ apiKey }`를 그대로 받아 `validateGeminiKey()`로 확인만 하고 저장은 하지 않는다(인증 불필요).
- **`server/api/settings/api-key.post.ts` / `api-key.delete.ts`** — 인증된 사용자의 API 키를 저장/삭제한다. 저장 시 `validateGeminiKey()`로 다시 한번 검증한 뒤 `set_encrypted_api_key` RPC를 호출한다.
- **`app/composables/usePersistedState.ts`** — localStorage와 동기화되는 제네릭 상태 composable(로그인 없이도 되는 값이 생기면 이 패턴을 계속 쓸 수 있다). **중요한 함정**: localStorage 값을 반드시 `onMounted` 안에서 읽어야 한다. setup 단계(컴포저블 본문)에서 바로 읽으면 SSR 렌더(기본값)와 클라이언트 초기 렌더(저장된 값)가 달라져 Vue hydration mismatch가 발생한다(실제로 겪고 고친 버그).
- **`app/composables/useUserSettings.ts`** — 계정별 설정(주제, 주제별 업체정보/본문 템플릿, 작성규칙, 어조, 분량, 하단문구, `hasApiKey`)을 Supabase `user_settings` 테이블과 동기화한다. `usePersistedState`와 같은 SSR-hydration-safe 패턴을 따르되(기본값으로 시작 → `onMounted`에서만 실제 값 반영), 동기 localStorage 읽기 대신 비동기 Supabase 조회를 쓴다. `useState()`로 선언되어 있어 `index.vue`/`settings.vue`/`useBlogGenerator`가 같은 데이터를 공유한다(중복 fetch 없음). `loaded` 플래그로 fetch 완료 전에는 auto-save(디바운스된 `watch`)가 기본값으로 DB를 덮어쓰지 않도록 가드한다.
- **`app/composables/useAuth.ts`** — `useSupabaseUser()`/`useSupabaseClient()`를 감싼 `{ user, signOut }`.
- **`app/composables/useBlogGenerator.ts`** — 메인 폼 상태를 모아 `/api/generate`를 호출하고, 성공 시 `useHistory().add()`로 결과를 자동 저장한다. 설정 관련 상태(topic/businessInfo/tone/length/footerText/writingRules/bodyTemplates/hasApiKey)는 `useUserSettings()`에서 가져오고, 이번 생성에만 쓰는 값(mainKeyword/relatedKeywordsInput/referenceContent/customTitle)만 자체 `ref`로 갖는다. `resetForm()`은 "글 설정" 카드의 입력값을 초기화한다.
- **`app/composables/useHistory.ts`** — 생성된 글을 Supabase `articles` 테이블에 저장·조회(최근 50개)·삭제한다. 외부 시그니처(`{ items, loaded, add, remove, clear }`)는 이전 localStorage 버전과 동일하게 유지된다.
- **`app/utils/seoScore.ts`** — 생성 결과를 규칙 기반으로 100점 만점 채점한다(제목 키워드 포함/길이, 도입부 키워드 노출, 연관 키워드 반영, 목표 분량 적합도, 소제목 활용, 태그 개수, 업체정보 반영). `stripPhotoMarkers()`로 사진 자리 마커를 글자수 계산에서 제외한다.
- **`app/utils/clipboard.ts`** — `copyToClipboard()`. `navigator.clipboard.writeText`가 권한 거부나 비보안 컨텍스트에서 조용히 실패하는 문제가 있어, 실패 시 `document.execCommand('copy')` 방식으로 자동 폴백한다. `ResultPanel.vue`의 복사 버튼이 이걸 쓴다.
- **`app/utils/defaultBodyTemplate.ts`** — 주제별 기본 본문 템플릿(`DEFAULT_BODY_TEMPLATES: Record<Topic, string>`).
- 이 세 파일(`seoScore.ts`, `clipboard.ts`, `defaultBodyTemplate.ts`)은 `app/utils`에 있어 어디서든 자동 임포트된다.
- **페이지**: `app/pages/index.vue`(생성기 — 좌: 입력 폼(주제 탭 포함) / 우: SEO 점수·생성 결과, `lg` 브레이크포인트에서 2단), `app/pages/settings.vue`(API 키, 주제별 본문 템플릿, 작성 규칙), `app/pages/history.vue`(저장된 글 목록 + `UModal`로 상세보기, `ResultPanel`을 재사용), `app/pages/login.vue`/`signup.vue`(이메일+비밀번호), `app/pages/confirm.vue`(이메일 인증 콜백 랜딩). `/login`과 `/confirm` 외 모든 페이지는 `@nuxtjs/supabase`의 `redirectOptions`로 로그인이 필요하다(`/signup`만 예외로 열려 있음). 별도 인증 미들웨어 파일은 없다.

## 컨벤션

- 입력 폼은 섹션 하나당 컴포넌트 하나 패턴을 따른다: `TopicSection`, `TitleSection`, `KeywordSection`, `ReferenceSection`, `StyleSection`, `BodyTemplateSection`, `WritingRulesSection`, `BusinessInfoSection`, `FooterTextSection`. 각 컴포넌트는 `defineModel`로 부모와 값을 바인딩한다. `BusinessInfoSection`은 `:topic` prop을 추가로 받아 `TOPIC_BUSINESS_FIELDS[topic]`에 맞춰 필드를 동적으로 그린다.
- Nuxt UI v4 시맨틱 컬러/보더 유틸리티(`text-muted`, `border-default`, `text-success`/`warning`/`error` 등)를 직접 지정한 색상 대신 사용한다. 아이콘은 Lucide(`i-lucide-*`).
- `shared/` 디렉토리는 `~~/shared/...` 별칭으로 import한다(서버 코드에서는 상대 경로 `../../shared/types` 사용).
- 사용자에게 보이는 모든 문구(라벨, 설명, 에러 메시지, 플레이스홀더)는 한국어로 작성한다.
- `app.vue`, `settings.vue`, `history.vue`, `BodyTemplateSection.vue` 등 일부 파일은 사용자가 직접 스타일을 수정해왔다(예: 설명 문구를 `UFormField`의 `description` prop 대신 별도 `<div class="text-gray-500">`로 넣는 방식, 커스텀 버튼 클래스 등). 이런 수동 스타일 변경은 되돌리지 말고 그 위에 이어서 작업한다.

## 알아두면 좋은 것

- `[사진: 설명]`은 AI가 본문에 넣는 사진 자리 표시 마커 문법이다(예: `[사진: 매장 외관과 간판]`). `ResultPanel.vue`가 정규식으로 이 마커를 파싱해 점선 박스 UI로 렌더링한다. 본문 텍스트를 다루는 로직을 추가할 때 이 마커 포맷을 깨지 않도록 주의한다.
- API 키는 `ApiKeySettings.vue`에서 입력 후 자동(디바운스)으로 `/api/validate-key` 검증 → 성공 시 `/api/settings/api-key`로 저장되며, "등록됨"/"확인 중"/"확인 필요" 배지로 상태를 표시한다. 저장된 키 값 자체는 다시 보여주지 않는다(boolean `hasApiKey`만 클라이언트가 안다).
- 실제 브라우저 검증에는 Playwright를 쓴다. `node_modules/playwright`는 프로젝트 의존성에 없으므로 필요할 때 `npm install --no-save playwright`로 임시 설치하고, `npx playwright install chromium`으로 브라우저를 준비한 뒤 스크립트로 스크린샷/콘솔 에러를 확인하는 방식을 이 세션에서 계속 사용했다. UI를 변경한 뒤에는 이런 방식으로 실제 렌더링을 확인하는 습관을 유지한다.
- 로컬에서 Supabase 없이 UI 레이아웃만 확인하려면 placeholder `SUPABASE_URL`/`SUPABASE_KEY`로 `npm run dev`를 띄우면 된다(페이지 셸은 뜨지만 실제 인증/DB 호출은 실패한다). 로그인/RLS/API 키 저장 등 실제 동작 검증은 사용자가 만든 Supabase 프로젝트에 마이그레이션을 적용한 뒤에만 가능하다.
