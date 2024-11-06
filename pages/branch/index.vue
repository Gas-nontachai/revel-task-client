<script lang="ts" setup>
import { VDataTable } from 'vuetify/labs/components'
import Swal from "sweetalert2"
import {
  Company,
} from "~~/misc/types"

definePageMeta({ middleware: ["auth"] });

const { getBranchBy, deleteBranchBy } = useBranch();
const { getCompanyBy } = useCompany()

const { $auth } = useNuxtApp()

const { permission_add, permission_delete, permission_edit, } = $auth.getPermission('branch')

type Headers = InstanceType<typeof VDataTable>['headers']

const headers: Headers = [
  { key: "operation", title: "...", sortable: false, width: 50, align: 'center' },
  { key: "no", title: "#", sortable: false, width: 40 },
  { key: "branch_id", title: "รหัสสาขา", width: 160, },
  { key: "branch_name", title: "ชื่อสาขา", },
  { key: "company_name", title: "บริษัท", },
  { key: "branch_tel", title: "โทรศัพท์", width: 200 },
];

const pagination = ref({ page: 1, size: 20, sorter: [], })
const pending = ref(true)
const search_data = ref<{
  company_id: string,
}>({
  company_id: '',
});
const search_field = ref<{
  text: string,
  columns: string[],
}>({
  text: '',
  columns: [
    'branch_id',
    'branch_name',
    'branch_tel',
  ],
});
const companys = ref<Company[]>([])

const {
  data: branchs,
  pending: pendingBranchs,
  refresh: refreshBranchs,
} = await useAsyncData('branchs', () => getBranchBy({
  pagination: pagination.value,
  search: search_field.value,
  match: { $and: mapSearch(), },
  sorter: pagination.value.sorter.length ? pagination.value.sorter : { key: 'branch_name', order: "ASC" },
}), { immediate: false, watch: [pagination.value] })

const company_options = computed(() => companys.value.map(item => ({ value: item.company_id, title: item.company_name, })))

onMounted(async () => {
  try {
    companys.value = await getCompanyBy({ sorter: { key: 'company_name', order: "ASC" }, }).then(res => res.docs)

    pending.value = false
  } catch (e) {
    console.log(e)
  }
})

const onDelete = (id: string) => Swal.fire({
  title: "ยืนยันการลบรายการ",
  text: "คุณแน่ใจหรือว่าต้องการลบ ?",
  icon: "warning",
  showCancelButton: true,
}).then(async ({ value }) => {
  try {
    if (!value) return

    await deleteBranchBy({ branch_id: id })

    await refreshBranchs()

    Swal.fire({ title: 'สำเร็จ', text: 'ลบข้อมูลแล้ว', icon: "success" })
  } catch (e) {
    console.log(e)
  }
})

function submitSearch(e: FormDataEvent) {
  e.preventDefault()

  refreshBranchs()
}

function mapSearch() {
  const {
    company_id,
  } = search_data.value

  const conditons = []

  if (company_id) conditons.push({ company_id })

  return conditons
}
</script>

<template>
  <v-card elevation="10" class="pa-4 withbg" color="grey-lighten-3">
    <v-card-title>ข้อมูลสาขา</v-card-title>
    <v-card-text>
      <v-row class="mb-4">
        <v-col class="d-flex flex-wrap gap-2 align-center  py-2" cols="12" md="8">
          <form class="d-flex flex-wrap align-center gap-2" :onsubmit="submitSearch">
            <v-autocomplete v-model="search_data.company_id" label="บริษัท" :items="company_options" density="compact"
              variant="outlined" hide-details style="width: 220px;"></v-autocomplete>
            <v-text-field v-model="search_field.text" label="ค้นหา..." density="compact" variant="outlined" hide-details
              style="width: 220px"></v-text-field>
            <v-btn color="primary" type="submit" elevation="3">ค้นหา</v-btn>
          </form>
        </v-col>
        <v-col class="d-flex flex-wrap gap-2 align-center justify-md-end py-2" cols="12" md="4">
          <template v-if="permission_add">
            <v-btn elevation="3" color="success" to="/branch/add">เพิ่มรายการใหม่</v-btn>
          </template>
        </v-col>
      </v-row>
      <v-data-table-server :loading="pendingBranchs" :headers="headers" :items="branchs?.docs ?? []"
        :items-length="branchs?.totalDocs ?? 0" :items-per-page="pagination.size" :page="pagination.page"
        density="compact" @update:options="(e: any) => {
          pagination.page = e.page
          pagination.size = e.itemsPerPage
          pagination.sorter = e.sortBy
        }">
        <template v-slot:item.no="{ index }">{{ pageItemNo(pagination, index) }}</template>
        <template v-slot:item.operation="{ item }">
          <v-menu offset-y>
            <template v-slot:activator="{ props }">
              <v-label class="cursor-pointer" icon v-bind="props">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-label>
            </template>
            <v-list>
              <v-list-item class="cursor-pointer" density="compact"
                :to="{ path: '/branch/detail', query: { id: item.raw.branch_id } }">
                <v-list-item-title>
                  <v-icon> mdi-chat-processing-outline</v-icon> ดูรายละเอียด
                </v-list-item-title>
              </v-list-item>
              <template v-if="permission_edit">
                <v-list-item class="cursor-pointer" density="compact"
                  :to="{ path: '/branch/update', query: { id: item.raw.branch_id } }">
                  <v-list-item-title>
                    <v-icon> mdi-square-edit-outline</v-icon> แก้ไข
                  </v-list-item-title>
                </v-list-item>
              </template>
              <template v-if="permission_delete">
                <v-list-item class="cursor-pointer" density="compact" @click="onDelete(item.raw.branch_id)">
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