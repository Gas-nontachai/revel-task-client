<script lang="ts" setup>
import { VDataTable } from 'vuetify/labs/components'
import Swal from "sweetalert2"
import { Product, } from "~~/misc/types"

const emit = defineEmits<{
  saved: []
}>()

const props = defineProps({
  modelValue: {
    type: Object as PropType<{ show: boolean, }>,
    required: true
  },
})

const { getProductBy, updateSameProductBy } = useProduct()

type Headers = InstanceType<typeof VDataTable>['headers']

const headers: Headers = [
  { key: "no", title: "#", sortable: false, width: 40, align: 'center' },
  { key: "product_id", title: "รหัสสินค้า", width: 140, },
  { key: "product_origin_id", title: "รหัสสินค้า (เดิม)", width: 140, },
  { key: "product_name", title: "สินค้า", },
  { key: "branch_name", title: "ข้อมูลจาก", },
];

const pending = ref(true)
const submitting = ref(false)
const pagination = ref({ page: 1, size: 20, sorter: [] })
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
const product_main_id = ref('')
const product_ids = ref<string[]>([])
const products = ref<{
  docs: Product[],
  totalDocs: number,
}>({
  docs: [],
  totalDocs: 0,
})

watch(props, ({ modelValue }) => {
  if (!modelValue.show) return

  product_main_id.value = ''
  product_ids.value = []
  pagination.value = { page: 1, size: 20, sorter: [] }
  search_field.value.text = ''
}, { flush: 'pre', immediate: true, deep: true })

watch(pagination, () => fetchData(), { flush: 'pre', immediate: true, deep: true })

async function fetchData() {
  try {
    pending.value = true

    products.value = await getProductBy({
      search: search_field.value,
      pagination: pagination.value,
      sorter: pagination.value.sorter.length ? pagination.value.sorter : { key: 'product_name', order: "ASC" },
    })
  } catch (e) {
    console.log(e)
  }

  pending.value = false
}

async function onConfirmSelect() {
  if (submitting.value) return

  try {
    submitting.value = true

    await updateSameProductBy({
      product_main_id: product_main_id.value,
      product_ids: product_ids.value,
    })

    Swal.fire({ title: 'สำเร็จ', text: 'อัพเดตรายการแล้ว', icon: "success" })
    emit('saved')
  } catch (e) {
    console.log(e)
  }

  submitting.value = false
}

function submitSearch(e: FormDataEvent) {
  e.preventDefault()

  fetchData()
}
</script>

<template>
  <v-dialog v-model="modelValue.show" max-width="1200" :persistent="true">
    <v-card>
      <v-toolbar color="success">
        <v-toolbar-title>ระบุสินค้าเดียวกัน</v-toolbar-title>
        <v-btn icon dark @click="modelValue.show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="overflow-auto" style="max-height: 80vh;">
        <v-row>
          <v-col class="d-flex flex-wrap gap-2 align-center" cols="12" md="8">
            <form class="d-flex flex-wrap align-center gap-2" :onsubmit="submitSearch">
              <v-text-field v-model="search_field.text" label="ค้นหา..." density="compact" variant="outlined"
                hide-details style="width: 220px"></v-text-field>
              <v-btn color="primary" type="submit" elevation="3">ค้นหา</v-btn>
            </form>
          </v-col>
          <v-col cols="12" sm="6" lg="4">
            <v-text-field v-model="product_main_id" density="compact" variant="outlined" placeholder="รหัสสินค้าหลัก"
              hide-details></v-text-field>
          </v-col>
        </v-row>
        <v-data-table-server :loading="pending" :headers="headers" :items="products.docs"
          :items-length="products.totalDocs" :items-per-page="pagination.size" item-value="product_id" show-select
          v-model="product_ids" density="compact" @update:options="(e: any) => {
            pagination.page = e.page
            pagination.size = e.itemsPerPage
            pagination.sorter = e.sortBy
          }">
          <template v-slot:item.no="{ index }">{{ pageItemNo(pagination, index) }}</template>
        </v-data-table-server>
      </v-card-text>
      <v-card-text class="d-flex flex-wrap justify-center gap-2 mb-2">
        <v-btn color="primary" @click="onConfirmSelect">
          <template v-if="submitting">
            <v-progress-circular class="mr-2" indeterminate color="success" :size="16"></v-progress-circular>
          </template>
          ตกลง ({{ product_ids.length }})
        </v-btn>
        <v-btn color="muted" @click="modelValue.show = false">ยกเลิก</v-btn>
      </v-card-text>
      <v-divider class="border-opacity-100"></v-divider>
    </v-card>
  </v-dialog>
</template>