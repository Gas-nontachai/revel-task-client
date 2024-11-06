import { useAuthStore } from "@/stores/useAuthStore";

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()

  await authStore.initAuthorization();

  return {
    provide: {
      auth: authStore,
    }
  }
})