import { defineStore } from "pinia"
import { Notify } from "~/misc/types"

export const useNotifyStore = defineStore("notify", () => {
  const notifys = ref<Notify[]>([])
  const menu_noti = ref<{ [key: string]: string }>({})

  const myNotifys = computed(() => notifys.value)
  const menuNoti = computed(() => menu_noti.value)

  async function initNotify(player_id: string) {
    const my_notify = await useNotify().getInitNotify({ player_id })

    return my_notify
  }

  async function refreshNotify(ids?: string[]) {
    const { $auth } = useNuxtApp()

    if (!$auth.profile) return
    if (ids && !ids.includes($auth.profile.user_id)) return

    menu_noti.value = {}

    const my_notify = await useNotify().getMyNoti()

    notifys.value = my_notify.notifys
    menu_noti.value = my_notify.menu_noti
  }

  async function seenNotify(data?: { notify_id: string }) {
    await useNotify().seenNotifyBy(data)

    if (data) {
      const notify = notifys.value.find(val => val.notify_id === data.notify_id)

      if (!notify) return

      notify.is_seen = true
    } else {
      notifys.value.forEach(notify => {
        notify.is_seen = true
      })
    }
  }

  async function deleteNotify() {
    notifys.value = []

    await useNotify().deleteNotifyBy()
  }

  return {
    myNotifys,
    menuNoti,
    initNotify,
    refreshNotify,
    seenNotify,
    deleteNotify,
  };
})