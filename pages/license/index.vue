<script lang="ts" setup>
import { VDataTable } from 'vuetify/labs/components'
import Swal from "sweetalert2";


definePageMeta({ middleware: ["auth"] });

const { $auth } = useNuxtApp()

const { permission_add, permission_delete, permission_edit, } = $auth.getPermission('license')

const { getLicenseBy, deleteLicenseBy, } = useLicense();

type Headers = InstanceType<typeof VDataTable>['headers']

const headers: Headers = [
  { title: "...", key: "operation", sortable: false, width: 50, align: 'center' },
  { key: "no", title: "#", sortable: false, width: 40 },
  { key: "license_name", title: "สิทธิ์การใช้งาน", },
  { key: "license_all_branch", title: "เข้าถึงข้อมูล", width: 150, },
];

const pagination = ref({ page: 1, size: 25, sorter: [], })
const search = ref<{
  text: string,
  columns: string[],
  condition: string,
}>({
  text: '',
  columns: [
    'license_id',
    'license_name',
  ],
  condition: 'LIKE',
});

const {
  data: licenses,
  pending: pendingLicenses,
  refresh: refreshLicenses,
} = await useAsyncData('licenses', () => getLicenseBy({
  pagination: pagination.value,
  search: search.value,
  sorter: pagination.value.sorter.length ? pagination.value.sorter : { key: 'license_name', order: "ASC" },
}), { immediate: false, watch: [pagination.value] })

const onDelete = (id: string) => Swal.fire({
  title: "ยืนยันการลบรายการ",
  text: "คุณแน่ใจหรือว่าต้องการลบ ?",
  icon: "warning",
  showCancelButton: true,
}).then(async ({ value }) => {
  try {
    if (!value) return

    await deleteLicenseBy({ license_id: id })

    await refreshLicenses()

    Swal.fire({ title: 'สำเร็จ', text: 'ลบข้อมูลแล้ว', icon: "success" })
  } catch (e) {
    console.log(e)
  }
})

function submitSearch(e: FormDataEvent) {
  e.preventDefault()

  refreshLicenses()
}

</script>

<template>
  <v-card elevation="10" class="pa-4 withbg" color="grey-lighten-3">
    <v-card-title>สิทธิ์การใช้งาน</v-card-title>
    <v-card-text>
      <v-row class="mb-4">
        <v-col class="d-flex flex-wrap gap-2 align-center py-2" cols="12" md="8">
          <form class="d-flex flex-wrap gap-2" :onsubmit="submitSearch">
            <v-text-field v-model="search.text" label="Search..." append-inner-icon="mdi-magnify" density="compact"
              variant="outlined" hide-details style="width: 500px"
              @click:append-inner="refreshLicenses()"></v-text-field>
          </form>
        </v-col>
        <v-col class="d-flex flex-wrap gap-2 align-center justify-md-end py-2" cols="12" md="4">
          <template v-if="permission_add">
            <v-btn elevation="3" color="success" to="/license/add">เพิ่มรายการใหม่</v-btn>
          </template>
        </v-col>
      </v-row>
      <v-data-table-server :loading="pendingLicenses" :headers="headers" :items="licenses?.docs ?? []"
        :items-length="licenses?.totalDocs ?? 0" :items-per-page="pagination.size" :page="pagination.page"
        density="compact" @update:options="(e: any) => {
          pagination.page = e.page
          pagination.size = e.itemsPerPage
          pagination.sorter = e.sortBy
        }">
        <template v-slot:item.no="{ index }">{{ pageItemNo(pagination, index) }}</template>
        <template v-slot:item.license_all_branch="{ item }">
          {{ item.raw.license_all_branch ? 'ทุกสาขา' : 'ประจำสาขา' }}
        </template>
        <template v-slot:item.operation="{ item }">
          <v-menu offset-y>
            <template v-slot:activator="{ props }">
              <v-label class="cursor-pointer" icon v-bind="props">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-label>
            </template>
            <v-list>
              <v-list-item class="cursor-pointer" density="compact"
                :to="{ path: '/license/detail', query: { id: item.raw.license_id } }">
                <v-list-item-title>
                  <v-icon> mdi-chat-processing-outline</v-icon> ดูรายละเอียด
                </v-list-item-title>
              </v-list-item>
              <template v-if="permission_edit">
                <v-list-item class="cursor-pointer" density="compact"
                  :to="{ path: '/license/update', query: { id: item.raw.license_id } }">
                  <v-list-item-title>
                    <v-icon> mdi-square-edit-outline</v-icon> แก้ไข
                  </v-list-item-title>
                </v-list-item>
              </template>
              <template v-if="permission_delete">
                <v-list-item class="cursor-pointer" density="compact" @click="onDelete(item.raw.license_id)">
                  <v-list-item-title>
                    <v-icon> mdi-trash-can-outline</v-icon> ลบ
                  </v-list-item-title>
                </v-list-item>
              </template>
            </v-list>
          </v-menu>
        </template>
      </v-data-table-server>
    </v-card-text>
  </v-card>
</template>