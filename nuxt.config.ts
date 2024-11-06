

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  ssr: false,
  build: {
    // extractCSS: false,
    transpile: ["vuetify"],
  },
  css: ["@/assets/scss/style.scss"],
  vite: {
    define: {
      "process.env.DEBUG": false,
    },
  },
  modules: [
    "@pinia/nuxt",
  ],
  runtimeConfig: {
    public: {
      apiBaseUrl: 'http://localhost:5990',
      // socketUrl: 'http://localhost:5990',
      // socketPath: '/socket.io',

      // apiBaseUrl: 'https://rvscs-develop.com/ttcenter-service',
      socketUrl: 'https://rvscs-develop.com',
      socketPath: '/ttcenter-socket/socket.io',
      apiExportUrl: 'https://ttcenter-export.rvscs-support.com',

      // apiBaseUrl: 'https://ttcenter.rvscs-support.com/ttcenter-service',
      // socketUrl: 'https://ttcenter.rvscs-support.com',
      // socketPath: '/ttcenter-socket/socket.io',
      // apiExportUrl: 'https://ttcenter-export.rvscs-support.com',
    }
  }
});
