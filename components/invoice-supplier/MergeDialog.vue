<script lang="ts" setup>
import Swal from "sweetalert2"
import { InvoiceSupplier, } from "~~/misc/types"

const emit = defineEmits<{
  (e: 'saved'): void,
}>()

const props = defineProps({
  modelValue: { type: Object as PropType<{ show: boolean, }>, required: true },
})

const { getBranchBy } = useBranch();
const { getInvoiceSupplierBy, mergeInvoiceSupplier } = useInvoiceSupplier()

const pending = ref(true)
const submitting = ref(false)
const search = ref<{
  branch_id: string
}>({
  branch_id: '',
})
const invoice_suppliers = ref<InvoiceSupplier[]>([])
const branch_options = ref<{ value: string; title: string; }[]>([])

watch(props.modelValue, async ({ show }) => {
  if (!show) return

  await fetchData()
}, { flush: 'pre', immediate: true, deep: true })

onMounted(async () => {
  try {
    const { docs: branchs } = await getBranchBy({ sorter: { key: 'branch_name', order: "ASC" }, })

    branch_options.value = branchs.map(item => ({ value: item.branch_id, title: item.branch_name, }))

    pending.value = false
  } catch (e) {
    console.log(e)
  }
})

async function fetchData() {
  try {
    pending.value = true

    invoice_suppliers.value = await getInvoiceSupplierBy({
      match: {
        invoice_supplier_origin_id: '',
        ...search.value,
      },
      sorter: { key: 'adddate', order: "DESC" },
    }).then(res => res.docs)

    pending.value = false
  } catch (e) {
    console.log(e)
  }
}

const handleSubmit = async () => {
  if (submitting.value) return

  try {
    submitting.value = true

    await mergeInvoiceSupplier({ invoice_suppliers: invoice_suppliers.value.filter(val => val.invoice_supplier_origin_id), })

    emit('saved')
    Swal.fire({ title: 'สำเร็จ', text: 'อัพเดตเอกสารแล้ว', icon: "success" })
  } catch (e) {
    console.log(e)
  }

  submitting.value = false
}
</script>

<template>
  <v-dialog v-model="modelValue.show" max-width="1600" persistent>
    <v-card elevation="10" class="pa-4 withbg" width="1600">
      <v-card-title>ระบุเอกสารเดียวกัน</v-card-title>
      <v-card-text class="py-4">
        <v-row>
          <v-col cols="12" sm="6" lg="3">
            <v-label class="mb-2">แหล่งข้อมูล บริษัท-สาขา<span class="text-error ml-1">*</span></v-label>
            <v-autocomplete v-model="search.branch_id" :items="branch_options" density="compact" variant="outlined"
              v-on:update:model-value="fetchData"></v-autocomplete>
          </v-col>
        </v-row>
        <div class="overflow-auto" style="max-height: calc(100vh - 400px);">
          <template v-if="pending">
            <v-card-text class="text-center py-4">
              <v-label>กำลังโหลดข้อมูล..</v-label>
              <v-progress-circular class="ml-4" indeterminate color="primary"></v-progress-circular>
            </v-card-text>
          </template>
          <template v-else>
            <table class="table table-bordered table-striped mt-2" aria-describedby="schedule">
              <thead>
                <tr>
                  <th scope="#" :style="{ width: '48px' }">#</th>
                  <th scope="Id" :style="{ width: '160px' }">รหัสบันทึกรับ</th>
                  <th scope="Date" :style="{ width: '120px' }">วันที่ใบรับ</th>
                  <th scope="Name">ชื่อผู้ขาย</th>
                  <th scope="Price" :style="{ width: '120px' }">ยอดสุทธิ</th>
                  <th scope="Weight" :style="{ width: '120px' }">น้ำหนัก</th>
                  <th scope="OriginId" :style="{ width: '240px' }">เลขที่ใบรับ</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="invoice_suppliers.length">
                  <tr v-for="(item, index) in invoice_suppliers" :key="index">
                    <td class="text-center">{{ index + 1 }}</td>
                    <td>{{ item.invoice_supplier_id }}</td>
                    <td class="text-center">{{ formatDate(item.invoice_supplier_date) }}</td>
                    <td>{{ item.invoice_supplier_name }}</td>
                    <td class="text-right">{{ decimalFix(item.invoice_supplier_net_price) }}</td>
                    <td class="text-right">{{ decimalFix(item.invoice_supplier_weight) }}</td>
                    <td class="pa-0">
                      <v-text-field v-model="item.invoice_supplier_origin_id" density="compact" variant="outlined"
                        hide-details></v-text-field>
                    </td>
                  </tr>
                </template>
                <tr v-else>
                  <td class="text-center" colspan="8">ไม่มีรายการ</td>
                </tr>
              </tbody>
            </table>
          </template>
        </div>
      </v-card-text>
      <v-card-text class="d-flex justify-center gap-2 mb-4">
        <v-btn color="success" @click="handleSubmit()">
          <template v-if="submitting">
            <v-progress-circular class="mr-2" indeterminate color="success" :size="16"></v-progress-circular>
          </template>
          ยืนยันรายการ
        </v-btn>
        <v-btn color="secondary" @click="modelValue.show = false">ปิด</v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
