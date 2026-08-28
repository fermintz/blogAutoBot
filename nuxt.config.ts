// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/supabase'
  ],

  components: [
    { path: '~/components', pathPrefix: false }
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    apiKeyEncryptionSecret: '',
    naverClientId: '',
    naverClientSecret: '',
    public: {
      bridgeUrlTemplate: ''
    }
  },

  compatibilityDate: '2026-06-30',

  // papaparse(CSV 파서, 자막 번역기 전용)는 브라우저에서만 쓰이는데도, SSR 페이지 setup()이 서버에서도 실행되는 탓에
  // Nitro 서버 번들 그래프에 딸려 들어가려 하고, @rollup/plugin-commonjs가 papaparse UMD 안의 워커 부트스트랩용
  // Blob 문자열 코드를 정적 분석하다 파싱에 실패해 빌드가 깨진다. Rollup 코어 레벨에서 external로 지정해
  // 아예 파싱하지 않고 Node의 런타임 require로 넘기도록 한다(동적 import로 감싸둔 클라이언트 코드 자체는 그대로 유지).
  nitro: {
    rollupConfig: {
      external: ['papaparse']
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm'
    }
  }
})
