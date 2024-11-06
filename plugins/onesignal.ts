import OneSignalVuePlugin, { useOneSignal } from '@onesignal/onesignal-vue3'

import { useNotifyStore } from "@/stores/useNotifyStore";

export default defineNuxtPlugin((nuxtApp) => {
  const { $auth } = useNuxtApp()

  if (!$auth.isLoggedIn) return

  nuxtApp.vueApp.use(OneSignalVuePlugin, {
    appId: "5d130911-7e5f-4252-9725-76774d5269f7",
    safari_web_id: "web.onesignal.auto.040fbea3-5bf4-4f81-a6ad-042d48246d00",
    notifyButton: {
      enable: true,
    },
  })

  const oneSignal = useOneSignal()
  const notifyStore = useNotifyStore()

  async function initNotify() {
    try {
      if (!$auth.profile) return oneSignal.logout()

      await notifyStore.refreshNotify()

      await oneSignal.Notifications.requestPermission()

      if (!oneSignal.Notifications.permission) return

      await oneSignal.login($auth.profile.user_id)

      if (!oneSignal.User.PushSubscription.id) return

      const { subscription } = await notifyStore.initNotify(oneSignal.User.PushSubscription.id)

      if (subscription) await oneSignal.User.PushSubscription.optIn()

      console.log('oneSignal Subscription', oneSignal.User.PushSubscription.optedIn)
    } catch (err) {
      console.log(err)
    }
  }

  oneSignal.User.PushSubscription.addEventListener('change', (e) => {
    useOnesignalPlayer().updateOnesignalPlayerBy({
      player_id: oneSignal.User.PushSubscription.id,
      subscription: e.current.optedIn,
    })
  });

  oneSignal.Notifications.addEventListener('permissionChange', () => {
    (async () => await initNotify())();
  });

  initNotify()
})