import socket from "socket.io-client"

import { useAuthStore } from "@/stores/useAuthStore";
import { useNotifyStore } from "@/stores/useNotifyStore";

export default defineNuxtPlugin(() => {
  const { public: publicCtx } = useRuntimeConfig()

  const authStore = useAuthStore()
  const notifyStore = useNotifyStore()

  if (!authStore.isLoggedIn) return

  const io = socket(publicCtx.socketUrl, {
    path: publicCtx.socketPath,
    query: { token: authStore.accessToken },
    transports: ['websocket']
  })

  io.on("connect", () => console.log('Plugin noti: connected'));
  io.on("connect_error", (err) => {
    console.log(`engbrain-server:connect-error due to ${err}`);
  });
  io.on('has-noti', (data) => notifyStore.refreshNotify(data))
})