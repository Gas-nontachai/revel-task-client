<script lang="ts" setup>
import { VDataTable } from 'vuetify/labs/components'
import Swal from "sweetalert2";
import {
  Branch,
  Company,
} from "~~/misc/types"

definePageMeta({ middleware: ["auth"] });

const { $auth } = useNuxtApp()

const { permission_add, permission_delete, permission_edit, } = $auth.getPermission('supplier')

const { getBranchBy } = useBranch()
const { getCompanyBy } = useCompany()
const { getSupplierBy, deleteSupplierBy } = useSupplier();

type Headers = InstanceType<typeof VDataTable>['headers']

const headers: Headers = [
  { key: "operation", title: "...", sortable: false, width: 50, align: 'center' },
  { key: "no", title: "#", sortable: false, width: 40 },
  { key: "supplier_id", title: "รหัสผู้ขาย", width: 140, },
  { key: "supplier_origin_id", title: "รหัสผู้ขาย (เดิม)", width: 140, },
  { key: "supplier_name", title: "ชื่อบริษัท/ผู้ขาย", },
  { key: "supplier_contact_name", title: "ชื่อผู้ติดต่อ", },
  { key: "supplier_contact1", title: "ช่องทางติดต่อ 1", },
  { key: "supplier_vat_rate", title: "% ภาษี", width: 120, align: 'center' },
  { key: "branch_name", title: "สาขา", },
  { key: "supplier_main_id", title: "ผู้ขายเดียวกับ", width: 140, },
];

const pagination = ref({ page: 1, size: 20, sorter: [], })
const pending = ref(true)
const search_data = ref<{
  branch_id: string,
  company_id: string,
  supplier_id: string,
}>({
  branch_id: '',
  company_id: '',
  supplier_id: '',
});
const search_field = ref<{
  text: string,
  columns: string[],
}>({
  text: '',
  columns: [
    "supplier_id",
    "supplier_origin_id",
    "supplier_name",
  ],
});
const same_dialog = ref<{ show: boolean, }>({ show: false, });
const branchs = ref<Branch[]>([])
const companys = ref<Company[]>([])

const {
  data: suppliers,
  pending: pendingSuppliers,
  refresh: refreshSuppliers,
} = await useAsyncData('suppliers', () => getSupplierBy({
  pagination: pagination.value,
  search: search_field.value,
  match: { $and: mapSearch(), },
  sorter: pagination.value.sorter.length ? pagination.value.sorter : { key: 'supplier_name', order: "ASC" },
}), { immediate: false, watch: [pagination.value] })

const company_branchs = computed(() => search_data.value.company_id ? branchs.value.filter(val => val.company_id === search_data.value.company_id) : branchs.value)
const branch_options = computed(() => company_branchs.value.map(item => ({ value: item.branch_id, title: item.branch_name, })))
const company_options = computed(() => companys.value.map(item => ({ value: item.company_id, title: item.company_name, })))

onMounted(async () => {
  try {
    branchs.value = await getBranchBy({ sorter: { key: 'branch_name', order: "ASC" }, }).then(res => res.docs)
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

    await deleteSupplierBy({ supplier_id: id })

    await refreshSuppliers()

    Swal.fire({ title: 'สำเร็จ', text: 'ลบข้อมูลแล้ว', icon: "success" })
  } catch (e) {
    console.log(e)
  }
})

function submitSearch(e: FormDataEvent) {
  e.preventDefault()

  refreshSuppliers()
}

async function onSaved() {
  same_dialog.value.show = false

  await refreshSuppliers()
}

function mapSearch() {
  const {
    branch_id,
    company_id,
  } = search_data.value

  const conditons = []

  if (branch_id) conditons.push({ branch_id })
  if (company_id) conditons.push({ company_id })

  return conditons
}
</script>

<template>
  <v-card elevation="10" class="pa-4 withbg" color="grey-lighten-3">
    <v-card-title>ข้อมูล Supplier</v-card-title>
    <v-card-text>
      <v-row class="mb-4">
        <v-col class="d-flex flex-wrap gap-2 align-center  py-2" cols="12" md="8">
          <form class="d-flex flex-wrap align-center gap-2" :onsubmit="submitSearch">
            <v-autocomplete v-model="search_data.company_id" label="บริษัท" :items="company_options" density="compact"
              variant="outlined" hide-details style="width: 220px;"></v-autocomplete>
            <v-autocomplete v-model="search_data.branch_id" label="สาขา" :items="branch_options" density="compact"
              variant="outlined" hide-details style="width: 220px;"></v-autocomplete>
            <v-text-field v-model="search_field.text" label="ค้นหา..." density="compact" variant="outlined" hide-details
              style="width: 220px"></v-text-field>
            <v-btn color="primary" type="submit" elevation="3">ค้นหา</v-btn>
          </form>
        </v-col>
        <v-col class="d-flex flex-wrap gap-2 align-center justify-md-end py-2" cols="12" md="4">
          <v-btn elevation="3" color="warning" @click="same_dialog.show = true">ระบุผู้ขายเดียวกัน</v-btn>
          <template v-if="permission_add">
            <v-btn elevation="3" color="success" to="/supplier/add">เพิ่มรายการใหม่</v-btn>
          </template>
        </v-col>
      </v-row>
      <v-data-table-server :loading="pendingSuppliers" :headers="headers" :items="suppliers?.docs ?? []"
        :items-length="suppliers?.totalDocs ?? 0" :items-per-page="pagination.size" :page="pagination.page"
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
                :to="{ path: '/supplier/detail', query: { id: item.raw.supplier_id } }">
                <v-list-item-title>
                  <v-icon> mdi-chat-processing-outline</v-icon> ดูรายละเอียด
                </v-list-item-title>
              </v-list-item>
              <template v-if="permission_edit">
                <v-list-item class="cursor-pointer" density="compact"
                  :to="{ path: '/supplier/update', query: { id: item.raw.supplier_id } }">
                  <v-list-item-title>
                    <v-icon> mdi-square-edit-outline</v-icon> แก้ไข
                  </v-list-item-title>
                </v-list-item>
              </template>
              <template v-if="permission_delete">
                <v-list-item class="cursor-pointer" density="compact" @click="onDelete(item.raw.supplier_id)">
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

  <supplier-same-dialog v-model="same_dialog" @saved="onSaved" />
</template>