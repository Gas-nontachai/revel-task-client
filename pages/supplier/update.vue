<script lang="ts" setup>
import Swal from "sweetalert2"
import { Branch, Supplier } from "~~/misc/types"

definePageMeta({ middleware: ["auth"] });

const { getCompanyBy } = useCompany();
const { getBranchBy } = useBranch();
const {
  getSupplierBy,
  getSupplierByID,
  updateSupplierBy,
} = useSupplier();

const router = useRouter()

const pending = ref(true)
const submitting = ref(false)
const supplier = ref<Supplier>({
  supplier_id: '',
  company_id: '',
  branch_id: '',
  supplier_main_id: '',
  supplier_origin_id: '',
  supplier_name: '',
  supplier_contact_name: '',
  supplier_contact1: '',
  supplier_contact2: '',
  supplier_contact3: '',
  supplier_address: '',
  supplier_tax: '',
  supplier_vat_type: 'exc',
  supplier_vat_rate: 0,
  supplier_remark: '',
});
const branchs = ref<Branch[]>([])
const company_options = ref<{ value: string; title: string; }[]>([])
const suppliers = ref<Supplier[]>([])

const vat_type_options = [
  { value: 'exc', title: 'แยกภาษี' },
  { value: 'inc', title: 'รวมภาษี' },
]

const company_branchs = computed(() => branchs.value.filter(val => val.company_id === supplier.value.company_id))
const branch_options = computed(() => company_branchs.value.map(item => ({ value: item.branch_id, title: item.branch_name, })))
const supplier_options = computed(() => suppliers.value.map(item => ({ value: item.supplier_id, title: `${item.supplier_origin_id} - ${item.supplier_name} (${item.supplier_id})` })))

watch(supplier, async ({ branch_id, company_id, }) => {
  if (!company_id) supplier.value.branch_id = ''
  if (!branch_id) {
    suppliers.value = []
    supplier.value.supplier_main_id = ''

    return
  }

  await fetchSameSupplier()
}, { flush: 'pre', immediate: true, deep: true })

onMounted(async () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const query: { [key: number | string]: string } = {};

    for (const [key, value] of params) {
      query[key] = value;
    }

    supplier.value = await getSupplierByID({ supplier_id: query.id })

    const { docs: companys } = await getCompanyBy({ sorter: { key: 'company_name', order: "ASC" }, })

    branchs.value = await getBranchBy({ sorter: { key: 'branch_name', order: "ASC" }, }).then(res => res.docs)

    company_options.value = [{ value: '', title: '- ระบุบริษัท -', }, ...companys.map(item => ({ value: item.company_id, title: item.company_name, }))]

    pending.value = false
  } catch (e) {
    console.log(e)

    await router.push({ path: '/supplier' });
  }
})

async function fetchSameSupplier() {
  try {
    const { supplier_id, branch_id, } = supplier.value

    suppliers.value = await getSupplierBy({
      match: {
        supplier_id: { $ne: supplier_id },
        supplier_main_id: { $ne: supplier_id },
        branch_id: { $ne: branch_id },
      }
    }).then(res => res.docs)
  } catch (e) {
    console.log(e)
  }
}

async function onSubmit() {
  if (pending.value || submitting.value || !validateForm()) return

  try {
    submitting.value = true

    await updateSupplierBy(supplier.value)

    Swal.fire({ title: 'สำเร็จ', text: 'บันทึกข้อมูลแล้ว', icon: "success" })
    await router.push({ path: '/supplier' });
  } catch (e) {
    console.log(e)

    submitting.value = false
  }
}

function validateForm(): boolean {
  const {
    supplier_id,
    branch_id,
    company_id,
    supplier_name,
  } = supplier.value

  if (!(supplier_id
    && branch_id
    && company_id
    && supplier_name
  )) {
    Swal.fire({ text: 'กรุณากรอกข้อมูลให้ครบถ้วน', icon: "warning" })
    return false
  }

  return true
}
</script>

<template>
  <v-breadcrumbs :items="[
    { title: 'ผู้ขาย', to: '/supplier', },
    { title: 'แก้ไขรายการ', disabled: true, }
  ]">
    <template v-slot:title="{ item }">{{ item.title.toUpperCase() }}</template>
  </v-breadcrumbs>
  <v-card elevation="10" class="pa-4 withbg">
    <v-card-title>แก้ไขรายการ</v-card-title>
    <template v-if="pending">
      <v-card-text class="text-center py-4">
        <v-label>กำลังโหลดข้อมูล..</v-label>
        <v-progress-circular class="ml-4" indeterminate color="primary"></v-progress-circular>
      </v-card-text>
    </template>
    <template v-else>
      <v-card-text class="py-4">
        <v-row>
          <v-col cols="12" sm="6" lg="3">
            <v-label class="mb-2">รหัสผู้ขาย<span class="text-error ml-1">*</span></v-label>
            <v-text-field v-model="supplier.supplier_id" density="compact" variant="outlined" disabled></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" lg="3">
            <v-label class="mb-2">รหัสผู้ขาย (เดิม)</v-label>
            <v-text-field v-model="supplier.supplier_origin_id" density="compact" variant="outlined"></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6" lg="5">
            <v-label class="mb-2">ชื่อบริษัท/ผู้ขาย<span class="text-error ml-1">*</span></v-label>
            <v-text-field v-model="supplier.supplier_name" :rules="[rules.required]" density="compact"
              variant="outlined"></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" lg="4">
            <v-label class="mb-2">ชื่อผู้ติดต่อ<span class="text-error ml-1">*</span></v-label>
            <v-text-field v-model="supplier.supplier_contact_name" :rules="[rules.required]" density="compact"
              variant="outlined"></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6" lg="3">
            <v-label class="mb-2">บริษัท<span class="text-error ml-1">*</span></v-label>
            <v-autocomplete v-model="supplier.company_id" :items="company_options" :rules="[rules.required]"
              density="compact" variant="outlined" :disabled="!!supplier.supplier_origin_id"></v-autocomplete>
          </v-col>
          <v-col cols="12" sm="6" lg="3">
            <v-label class="mb-2">สาขา<span class="text-error ml-1">*</span></v-label>
            <v-autocomplete v-model="supplier.branch_id" :items="branch_options" :rules="[rules.required]"
              density="compact" variant="outlined" :disabled="!!supplier.supplier_origin_id"></v-autocomplete>
          </v-col>
          <v-col cols="12" sm="6" lg="6">
            <v-label class="mb-2">ผู้ขายเดียวกัน</v-label>
            <v-autocomplete v-model="supplier.supplier_main_id" :items="supplier_options" density="compact"
              variant="outlined"></v-autocomplete>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6" lg="3">
            <v-label class="mb-2">เลขประจำตัวผู้เสียภาษี</v-label>
            <v-text-field v-model="supplier.supplier_tax" :rules="[rules.required]" density="compact"
              variant="outlined"></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3" lg="3">
            <v-label class="mb-2">ภาษีเงินได้</v-label>
            <v-autocomplete v-model="supplier.supplier_vat_type" :items="vat_type_options" density="compact"
              variant="outlined"></v-autocomplete>
          </v-col>
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-label class="mb-2">% ภาษี</v-label>
            <v-text-field v-model="supplier.supplier_vat_rate" class="text-right" density="compact" variant="outlined"
              @keypress="onlyNumeric"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-label class="mb-2">ช่องทางติดต่อ</v-label>
            <v-row>
              <v-col cols="12" sm="3">
                <v-text-field v-model="supplier.supplier_contact1" density="compact" variant="outlined"
                  placeholder="ช่องทางติดต่อ 1"></v-text-field>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field v-model="supplier.supplier_contact3" density="compact" variant="outlined"
                  placeholder="ช่องทางติดต่อ 2"></v-text-field>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field v-model="supplier.supplier_contact3" density="compact" variant="outlined"
                  placeholder="ช่องทางติดต่อ 3"></v-text-field>
              </v-col>
            </v-row>
            <v-label class="mb-2">ที่อยู่</v-label>
            <v-textarea v-model="supplier.supplier_address" density="compact" variant="outlined" rows="3"></v-textarea>
            <v-label class="mb-2">บันทึกช่วยจำ</v-label>
            <v-textarea v-model="supplier.supplier_remark" density="compact" variant="outlined" rows="3"></v-textarea>
          </v-col>
        </v-row>
      </v-card-text>
    </template>
    <v-card-text class="d-flex flex-wrap justify-center gap-2">
      <v-btn color="save" @click="onSubmit">
        <template v-if="submitting">
          <v-progress-circular class="mr-2" indeterminate color="success" :size="16"></v-progress-circular>
        </template> บันทึก
      </v-btn>
      <v-btn color="muted" :to="'/supplier'">ยกเลิก</v-btn>
    </v-card-text>
  </v-card>
</template>