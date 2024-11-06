<script setup lang="ts">
import { VDataTable } from 'vuetify/labs/components'
import { Notify } from "~/misc/types"
import { useNotifyStore } from "@/stores/useNotifyStore";

definePageMeta({ middleware: ["auth"] });

const notifyStore = useNotifyStore()

const { getNotifyBy, } = useNotify();

type Headers = InstanceType<typeof VDataTable>['headers']

const headers: Headers = [
  { key: "notify", title: "รายการแจ้งเตือน", sortable: false, },
];

const pagination = ref({ page: 1, size: 20, sorter: [], })
const search = ref<{
  text: string,
  columns: string[],
  condition: string,
}>({
  text: '',
  columns: [
    "notify_title",
  ],
  condition: 'LIKE',
});

const {
  data: notifys,
  pending: pendingNotify,
  refresh: refreshNotify,
} = await useAsyncData('notifys', () => getNotifyBy({
  pagination: pagination.value,
  search: search.value,
}), { immediate: false, watch: [pagination.value] })

async function delteAllNotify() {
  try {
    await notifyStore.deleteNotify()

    await refreshNotify()
  } catch (err) {
    console.log(err)
  }
}

async function seenAllNotify() {
  try {
    await notifyStore.seenNotify()

    await refreshNotify()
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

function itemColor(notify: Notify): string {
  if (!!notify.is_seen) return 'secondary'

  return notify.notify_lv ?? 'primary'
}

function submitSearch(e: FormDataEvent) {
  e.preventDefault()

  refreshNotify()
}
</script>

<template>
  <v-card class="mx-auto">
    <v-card-text style="min-height: 500px;">
      <v-toolbar color="purple">
        <v-toolbar-title>การแจ้งเตือน</v-toolbar-title>
        <form class="d-flex flex-wrap gap-2" :onsubmit="submitSearch">
          <v-text-field v-model="search.text" label="Search..." append-inner-icon="mdi-magnify" density="compact"
            variant="outlined" hide-details style="width: 500px" @click:append-inner="refreshNotify()"></v-text-field>
        </form>
        <v-btn icon="mdi-refresh" @click="refreshNotify"></v-btn>
        <v-btn icon="mdi-trash-can-outline" @click="delteAllNotify"></v-btn>
        <v-btn icon="mdi-bookmark-check" @click="seenAllNotify"></v-btn>
      </v-toolbar>
      <v-data-table-server :loading="pendingNotify" :headers="headers" :items="notifys?.docs ?? []"
        :items-length="notifys?.totalDocs ?? 0" :items-per-page="pagination.size" :page="pagination.page"
        density="compact" @update:options="(e: any) => {
          pagination.page = e.page
          pagination.size = e.itemsPerPage
          pagination.sorter = e.sortBy
        }">
        <template v-slot:item.notify="{ item }">
          <v-list-item @click="clickNotify(item.raw)" :base-color="itemColor(item.raw)">
            <v-list-item-title>{{ item.raw.notify_title }}</v-list-item-title>
            <v-list-item-subtitle>{{ item.raw.notify_detail }}</v-list-item-subtitle>
            <v-list-item-subtitle>{{ genTimeAgo(item.raw.adddate) }}</v-list-item-subtitle>
          </v-list-item>
        </template>
      </v-data-table-server>
    </v-card-text>
  </v-card>
</template>