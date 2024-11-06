<script lang="ts" setup>
import { VDataTable } from 'vuetify/labs/components'
import Swal from "sweetalert2";

definePageMeta({ middleware: ["auth"] });

const { getProductTypeBy, deleteProductTypeBy } = useProductType();

const { $auth } = useNuxtApp()

const { permission_add, permission_delete, permission_edit } = $auth.getPermission('product-type')

type Headers = InstanceType<typeof VDataTable>['headers']

const headers: Headers = [
  { key: "operation", title: "...", sortable: false, width: 50, align: 'center' },
  { key: "no", title: "#", sortable: false, width: 40 },
  { key: "product_type_id", title: "รหัสประเภทสินค้า", width: 200, },
  { key: "product_type_name", title: "ชื่อประเภทสินค้า", },
  { key: "product_type_detail", title: "รายละเอียด", sortable: false },
];

const pagination = ref({ page: 1, size: 20, sorter: [], })
const search = ref<{
  text: string,
  columns: string[],
  condition: string,
}>({
  text: '',
  columns: [
    'product_type_id',
    'product_category_id',
  ],
  condition: 'LIKE',
});

const {
  data: product_types,
  pending: pendingProductTypes,
  refresh: refreshProductTypes,
} = await useAsyncData('product_types', () => getProductTypeBy({
  pagination: pagination.value,
  search: search.value,
  sorter: pagination.value.sorter.length ? pagination.value.sorter : { key: 'product_type_name', order: "ASC" },
}), { immediate: false, watch: [pagination.value] })

const onDelete = (id: string) => Swal.fire({
  title: "ยืนยันการลบรายการ",
  text: "คุณแน่ใจหรือว่าต้องการลบ ?",
  icon: "warning",
  showCancelButton: true,
}).then(async ({ value }) => {
  try {
    if (!value) return

    await deleteProductTypeBy({ product_type_id: id })

    await refreshProductTypes()

    Swal.fire({ title: 'สำเร็จ', text: 'ลบข้อมูลแล้ว', icon: "success" })
  } catch (e) {
    console.log(e)
  }
})

function submitSearch(e: FormDataEvent) {
  e.preventDefault()
  refreshProductTypes()
}

</script>

<template>
  <v-card elevation="10" class="pa-4 withbg" color="grey-lighten-3">
    <v-card-title>ประเภทสินค้า</v-card-title>
    <v-card-text>
      <v-row class="mb-4">

        <v-col class="d-flex flex-wrap gap-2 align-center py-2" cols="12" md="8">
          <form class="d-flex flex-wrap gap-2" :onsubmit="submitSearch">
            <v-text-field v-model="search.text" label="Search..." append-inner-icon="mdi-magnify" density="compact"
              variant="outlined" hide-details style="width: 500px"
              @click:append-inner="refreshProductTypes()"></v-text-field>
          </form>
        </v-col>
        <v-col class="d-flex flex-wrap gap-2 align-center justify-md-end  py-2" cols="12" md="4">
          <template v-if="permission_add">
            <v-btn elevation="3" color="success" to="/product-type/add">เพิ่มรายการใหม่</v-btn>
          </template>
        </v-col>
      </v-row>
      <v-data-table-server :loading="pendingProductTypes" :headers="headers" :items="product_types?.docs ?? []"
        :items-length="product_types?.totalDocs ?? 0" :items-per-page="pagination.size" :page="pagination.page"
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
                :to="{ path: '/product-type/detail', query: { id: item.raw.product_type_id } }">
                <v-list-item-title>
                  <v-icon> mdi-chat-processing-outline</v-icon> ดูรายละเอียด
                </v-list-item-title>
              </v-list-item>
              <template v-if="permission_edit">
                <v-list-item class="cursor-pointer" density="compact"
                  :to="{ path: '/product-type/update', query: { id: item.raw.product_type_id } }">
                  <v-list-item-title>
                    <v-icon> mdi-square-edit-outline</v-icon> แก้ไข
                  </v-list-item-title>
                </v-list-item>
              </template>
              <template v-if="permission_delete">
                <v-list-item class="cursor-pointer" density="compact" @click="onDelete(item.raw.product_type_id)">
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