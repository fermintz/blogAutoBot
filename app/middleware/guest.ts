/**
 * 로그인 상태에서 /login·/signup처럼 "비로그인 전용" 페이지에 접근하면 메인으로 돌려보낸다.
 * @nuxtjs/supabase가 자동 등록하는 전역 미들웨어(global-auth, node_modules/@nuxtjs/supabase/dist/runtime/plugins/auth-redirect.js)는
 * redirectOptions.exclude에 해당하는 페이지(login/confirm)를 세션 유무와 무관하게 그냥 통과시키기만 해서,
 * "이미 로그인된 사용자가 /login에 접근"하는 반대 방향은 다루지 않는다. global-auth가 인증 여부를 판단할 때
 * 쓰는 것과 동일한 useSupabaseSession()을 그대로 써서 이 빈 자리를 채운다(별도 인증 상태 소스를 새로 만들지 않음).
 * useSupabaseSession()은 서버 플러그인이 SSR 요청 시 쿠키로부터 미리 채워두므로, 여기서 별도로 "로딩 중" 상태를
 * 기다릴 필요 없이 곧바로 판단해도 안전하다(같은 값을 쓰는 global-auth 미들웨어도 동일하게 동작한다).
 */
export default defineNuxtRouteMiddleware(() => {
  const session = useSupabaseSession()
  if (session.value) {
    return navigateTo('/')
  }
})
