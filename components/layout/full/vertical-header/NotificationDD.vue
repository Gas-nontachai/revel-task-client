<script setup lang="ts">
import { BellRingingIcon } from 'vue-tabler-icons';
import { Notify } from "~/misc/types"

import { useNotifyStore } from "@/stores/useNotifyStore";

const notifyStore = useNotifyStore()

const adddates = ref<{ [key: number | string]: string }>({})
const timerCalcMinAgo = ref<any>(null)

const myNotifys = computed(() => {
  calcMinAgo()

  return notifyStore.myNotifys
})

const notSeen = computed(() => notifyStore.myNotifys?.filter(val => !val.is_seen).length)

onMounted(() => {
  timerCalcMinAgo.value = setInterval(() => calcMinAgo(), 30000);
})

onBeforeUnmount(() => {
  clearInterval(timerCalcMinAgo.value)
})

function delteAllNotify() {
  try {
    notifyStore.deleteNotify()
  } catch (err) {
    console.log(err)
  }
}

async function refreshNotify() {
  try {
    await notifyStore.refreshNotify()
  } catch (err) {
    console.log(err)
  }
}

async function seenAllNotify() {
  try {
    await notifyStore.seenNotify()
  } catch (err) {
    console.log(err)
  }
}

async function clickNotify(notify: Notify) {
  try {
    await notifyStore.seenNotify({ notify_id: notify.notify_id })

    window.location.href = notify.notify_url
  } catch (err) {
    console.log(err)
  }
}

function calcMinAgo() {
  if (notifyStore.myNotifys) {
    notifyStore.myNotifys.forEach(item => {
      adddates.value[item.notify_id] = genTimeAgo(item.adddate)
    });
  }
}

function itemColor(notify: Notify): string {
  if (!!notify.is_seen) return 'secondary'

  return notify.notify_lv ?? 'primary'
}
</script>
<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn icon variant="text" class="custom-hover-primary ml-0 ml-md-5 text-muted" v-bind="props">
        <v-badge v-if="notSeen > 0" dot color="primary" offset-x="-5" offset-y="-3">
          <BellRingingIcon size="22" />
        </v-badge>
        <BellRingingIcon v-else size="22" />
      </v-btn>
    </template>

    <v-card class="mx-auto" width="380" max-height="500">
      <v-toolbar color="purple">
        <v-toolbar-title>การแจ้งเตือน</v-toolbar-title>
        <v-btn icon="mdi-refresh" @click="refreshNotify"></v-btn>
        <v-btn icon="mdi-trash-can-outline" @click="delteAllNotify"></v-btn>
        <v-btn icon="mdi-bookmark-check" @click="seenAllNotify"></v-btn>
      </v-toolbar>
      <v-divider></v-divider>
      <v-list>
        <template v-if="myNotifys.length">
          <v-list-item v-for="(notify, notify_idx) in myNotifys" :key="notify_idx" @click="clickNotify(notify)"
            :base-color="itemColor(notify)">
            <v-list-item-title>{{ notify.notify_title }}</v-list-item-title>
            <v-list-item-subtitle>{{ notify.notify_detail }}</v-list-item-subtitle>
            <v-list-item-subtitle>{{ adddates[notify.notify_id] }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item class="text-center" :to="'/notification'">
            <v-list-item-title>See more</v-list-item-title>
          </v-list-item>
        </template>
        <template v-else>
          <v-list-item class="text-center">
            <v-list-item-title>ไม่มีการแจ้งเตือน</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </v-menu>
</template>
