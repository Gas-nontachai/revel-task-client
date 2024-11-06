<script lang="ts" setup>
import { VDataTable } from 'vuetify/labs/components'
import {
  Branch,
  SyncData,
  SyncDataLog,
  UserBranch,
} from "~~/misc/types"

definePageMeta({ middleware: ["auth"] });

const { getBranchByID, } = useBranch();
const { getSyncDataBy } = useSyncData();
const { getSyncDataLogBy } = useSyncDataLog();
const { getUserBranchBy } = useUserBranch();

const router = useRouter();

type Headers = InstanceType<typeof VDataTable>['headers']

const pending = ref(true)
const pending_sync_data_log = ref(false)
const detail_tab = ref('')
const pagination = ref({ page: 1, size: 20, sorter: [], })
const headers: Headers = [
  { key: "no", title: "#", sortable: false, width: 30, },
  { key: "sync_data_start_date", title: "จากวันที่", width: 160, align: 'center' },
  { key: "sync_data_end_date", title: "จนถึง", width: 160, align: 'center' },
  { key: "sync_data_result", title: "ผลลัพธ์", width: 120, },
  { key: "sync_data_error", title: "ข้อผิดพลาด", },
];
const branch = ref<Branch>({
  branch_id: '',
  company_id: '',
  branch_name: '',
  branch_tel: '',
  branch_address: '',
  company_name: '',
});
const sync_data = ref<SyncData>({
  sync_data_id: '',
  branch_id: '',
  company_id: '',
  sync_data_status: '',
  last_sync_time: '',
});
const user_branchs = ref<UserBranch[]>([])
const sync_data_logs = ref<{
  docs: SyncDataLog[],
  totalDocs: number,
}>({
  docs: [],
  totalDocs: 0,
});

watch([pagination, sync_data], () => fetchSyncDataLog(), { flush: 'pre', immediate: true, deep: true })

onMounted(async () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const query: { [key: number | string]: string } = {};

    for (const [key, value] of params) {
      query[key] = value;
    }

    branch.value = await getBranchByID({ branch_id: query.id })
    sync_data.value = await getSyncDataBy({ match: { branch_id: query.id } }).then(res => res.docs[0])
    user_branchs.value = await getUserBranchBy({
      match: { branch_id: query.id },
      options: ['user'],
    }).then(res => res.docs)

    pending.value = false
  } catch (e) {
    console.log(e)

    await router.push({ path: '/branch' });
  }
})

async function fetchSyncDataLog() {
  const { sync_data_id } = sync_data.value

  if (!sync_data_id) return

  try {
    pending_sync_data_log.value = true

    sync_data_logs.value = await getSyncDataLogBy({
      match: { sync_data_id, },
      pagination: pagination.value,
      sorter: pagination.value.sorter.length ? pagination.value.sorter : { key: 'sync_data_start_date', order: "DESC" },
    })

    sync_data_logs.value.docs.forEach(item => {
      item.sync_data_start_date = formatDate(item.sync_data_start_date, 'dd/MM/yyyy HH:mm')
      item.sync_data_end_date = formatDate(item.sync_data_end_date, 'dd/MM/yyyy HH:mm')
    });
  } catch (e) {
    console.log(e)
  }

  pending_sync_data_log.value = false
}
</script>
<template>
  <v-breadcrumbs :items="[
    { title: 'สาขา', to: '/branch', },
    { title: 'รายละเอียด', disabled: true, }
  ]">
    <template v-slot:title="{ item }">{{ item.title.toUpperCase() }}</template>
  </v-breadcrumbs>
  <v-card elevation="10" class="pa-4 withbg">
    <v-card-title>รายละเอียด</v-card-title>
    <template v-if="pending">
      <v-card-text class="text-center py-4">
        <v-label>กำลังโหลดข้อมูล..</v-label>
        <v-progress-circular class="ml-4" indeterminate color="primary"></v-progress-circular>
      </v-card-text>
    </template>
    <template v-else>
      <v-card-text>
        <div style="overflow-x: auto">
          <table class="table-detail" style="min-width: 300px" aria-describedby="detail">
            <thead>
              <tr>
                <th style="width: 120px"></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-right">รหัสสาขา :</td>
                <td class="text-muted">{{ branch.branch_id }}</td>
              </tr>
              <tr>
                <td class="text-right">บริษัท :</td>
                <td class="text-muted">{{ branch.company_name }}</td>
              </tr>
              <tr>
                <td class="text-right">ชื่อสาขา :</td>
                <td class="text-muted">{{ branch.branch_name }}</td>
              </tr>
              <tr>
                <td class="text-right">โทรศัพท์ :</td>
                <td class="text-muted">{{ branch.branch_tel }}</td>
              </tr>
              <tr>
                <td class="text-right" style="vertical-align: top;">ที่อยู่ :</td>
                <td class="text-muted">{{ branch.branch_address }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <v-divider class="border-opacity-100 my-2"></v-divider>

        <v-tabs v-model="detail_tab" bg-color="grey100" color="primary" class="mt-4">
          <v-tab value="">ผู้ดูแล</v-tab>
          <v-tab value="sync-data">การซิงค์ข้อมูล</v-tab>
        </v-tabs>
        <v-window v-model="detail_tab">
          <v-window-item value="">
            <table class="table table-bordered table-striped mt-2" aria-describedby="schedule"
              style="max-width: 1000px;">
              <thead>
                <tr>
                  <th :style="{ width: '48px' }" scope="#">#</th>
                  <th :style="{ width: '240px' }" scope="Username">Username</th>
                  <th scope="Name">ชื่อ สกุล</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in user_branchs" :key="index">
                  <td class="align-middle text-center">{{ index + 1 }}</td>
                  <td class="align-middle">{{ item.user?.user_username }}</td>
                  <td>{{ item.user?.user_fullname }}</td>
                </tr>
              </tbody>
            </table>
          </v-window-item>
          <v-window-item value="sync-data">
            <v-row class="pa-4">
              <v-col cols="12" md="8">
                <v-row>
                  <v-col cols="12" md="3">
                    <v-label>สถานะการทำงานล่าสุด</v-label>
                    <div class="mb-2">{{ sync_data.sync_data_status }}</div>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-data-table-server :loading="pending_sync_data_log" :headers="headers" :items="sync_data_logs.docs"
              :items-length="sync_data_logs.totalDocs" :items-per-page="pagination.size" :page="pagination.page"
              density="compact" @update:options="(e: any) => {
                pagination.page = e.page
                pagination.size = e.itemsPerPage
                pagination.sorter = e.sortBy
              }">
              <template v-slot:item.no="{ index }">{{ index + 1 }}</template>
            </v-data-table-server>
          </v-window-item>
        </v-window>
      </v-card-text>
    </template>
    <v-card-text class="d-flex flex-wrap justify-center gap-2">
      <v-btn type="submit" color="muted" :to="'/branch'">กลับ</v-btn>
    </v-card-text>
  </v-card>
</template>