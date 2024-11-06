<script lang="ts" setup>
import { VDataTable } from 'vuetify/labs/components'
import Swal from "sweetalert2";
import {
  Branch,
} from "~~/misc/types"

definePageMeta({ middleware: ["auth"] });

const { $auth } = useNuxtApp()

const { permission_add, permission_delete, permission_edit, } = $auth.getPermission('product')

const { getBranchBy } = useBranch()
const { getProductBy, deleteProductBy } = useProduct();

type Headers = InstanceType<typeof VDataTable>['headers']

const headers: Headers = [
  { key: "operation", title: "...", sortable: false, width: 50, align: 'center' },
  { key: "no", title: "#", sortable: false, width: 40 },
  { key: "product_id", title: "รหัสสินค้า", width: 140, },
  { key: "product_origin_id", title: "รหัสสินค้า (เดิม)", width: 140, },
  { key: "product_name", title: "สินค้า", },
  { key: "product_type_name", title: "ประเภทสินค้า", sortable: false, width: 150, align: 'center' },
  { key: "product_category_name", title: "หมวดหมู่สินค้า", sortable: false, width: 150, align: 'center' },
  { key: "branch_name", title: "ข้อมูลจาก", },
  { key: "product_main_id", title: "สินค้าเดียวกับ", width: 140, },
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
    "product_id",
    "product_origin_id",
    "product_name",
  ],
});
const same_dialog = ref<{ show: boolean, }>({ show: false, });
const branchs = ref<Branch[]>([])

const {
  data: products,
  pending: pendingProducts,
  refresh: refreshProducts,
} = await useAsyncData('products', () => getProductBy({
  pagination: pagination.value,
  search: search_field.value,
  match: { $and: mapSearch(), },
  sorter: pagination.value.sorter.length ? pagination.value.sorter : { key: 'product_name', order: "ASC" },
}), { immediate: false, watch: [pagination.value] })

const branch_options = computed(() => branchs.value.map(item => ({ value: item.branch_id, title: item.branch_name, })))

onMounted(async () => {
  try {
    branchs.value = await getBranchBy({ sorter: { key: 'branch_name', order: "ASC" }, }).then(res => res.docs)

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

    await deleteProductBy({ product_id: id })

    await refreshProducts()

    Swal.fire({ title: 'สำเร็จ', text: 'ลบข้อมูลแล้ว', icon: "success" })
  } catch (e) {
    console.log(e)
  }
})

function submitSearch(e: FormDataEvent) {
  e.preventDefault()

  refreshProducts()
}

async function onSaved() {
  same_dialog.value.show = false

  await refreshProducts()
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
    <v-card-title>ข้อมูลสินค้า</v-card-title>
    <v-card-text>
      <v-row class="mb-4">
        <v-col class="d-flex flex-wrap gap-2 align-center  py-2" cols="12" md="8">
          <form class="d-flex flex-wrap align-center gap-2" :onsubmit="submitSearch">
            <v-autocomplete v-model="search_data.branch_id" label="สาขา" :items="branch_options" density="compact"
              variant="outlined" hide-details style="width: 400px;"></v-autocomplete>
            <v-text-field v-model="search_field.text" label="ค้นหา..." density="compact" variant="outlined" hide-details
              style="width: 220px"></v-text-field>
            <v-btn color="primary" type="submit" elevation="3">ค้นหา</v-btn>
          </form>
        </v-col>
        <v-col class="d-flex flex-wrap gap-2 align-center justify-md-end py-2" cols="12" md="4">
          <v-btn elevation="3" color="warning" @click="same_dialog.show = true">ระบุสินค้าเดียวกัน</v-btn>
          <template v-if="permission_add">
            <v-btn elevation="3" color="success" to="/product/add">เพิ่มรายการใหม่</v-btn>
          </template>
        </v-col>
      </v-row>
      <v-data-table-server :loading="pendingProducts" :headers="headers" :items="products?.docs ?? []"
        :items-length="products?.totalDocs ?? 0" :items-per-page="pagination.size" :page="pagination.page"
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
                :to="{ path: '/product/detail', query: { id: item.raw.product_id } }">
                <v-list-item-title>
                  <v-icon> mdi-chat-processing-outline</v-icon> ดูรายละเอียด
                </v-list-item-title>
              </v-list-item>
              <template v-if="permission_edit">
                <v-list-item class="cursor-pointer" density="compact"
                  :to="{ path: '/product/update', query: { id: item.raw.product_id } }">
                  <v-list-item-title>
                    <v-icon> mdi-square-edit-outline</v-icon> แก้ไข
                  </v-list-item-title>
                </v-list-item>
              </template>
              <template v-if="permission_delete">
                <v-list-item class="cursor-pointer" density="compact" @click="onDelete(item.raw.product_id)">
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

  <product-same-dialog v-model="same_dialog" @saved="onSaved" />
</template>