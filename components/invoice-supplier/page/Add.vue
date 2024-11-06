<script lang="ts" setup>
import Swal from "sweetalert2"
import {
  Branch,
  Company,
  InvoiceSupplier,
  InvoiceSupplierList,
  Product,
  Supplier,
  User,
} from "~~/misc/types"

const props = defineProps({
  section: { type: String, },
})

const section_info = (() => {
  if (props.section === 'branch') return {
    title: 'รายการรับสินค้า ตามสาขา',
    path: '/invoice-supplier-branch',
  }

  if (props.section === 'book-bank') return {
    title: 'รายการรับสินค้า ตามบัญชีการโอน',
    path: '/invoice-supplier-book-bank',
  }

  return {
    title: 'รายการรับสินค้า ตามบริษัท',
    path: '/invoice-supplier',
  }
})()

const { $auth } = useNuxtApp()

const { getBranchBy } = useBranch();
const { getCompanyBy } = useCompany();
const { insertInvoiceSupplier, } = useInvoiceSupplier();
const { getProductBy } = useProduct();
const { getSupplierBy } = useSupplier();
const { getUserBy, } = useUser();

const router = useRouter();

const pending = ref(true)
const pending_list = ref(true)
const submitting = ref(false)
const invoice_supplier = ref<InvoiceSupplier>({
  invoice_supplier_id: '',
  invoice_supplier_origin_id: '',
  branch_id: '',
  company_id: '',
  supplier_id: '',
  user_id: $auth.profile?.user_id ?? '',
  invoice_supplier_name: '',
  invoice_supplier_branch_name: '',
  invoice_supplier_company_name: '',
  invoice_supplier_account: '',
  invoice_supplier_license_plate: '',
  invoice_supplier_date: new Date(),
  invoice_supplier_key_by: '',
  invoice_supplier_key_date: '',
  invoice_supplier_contact: '',
  invoice_supplier_weight: 0,
  invoice_supplier_price: 0,
  invoice_supplier_vat_type: 'exc',
  invoice_supplier_vat_rate: 0,
  invoice_supplier_vat_price: 0,
  invoice_supplier_net_price: 0,
  invoice_supplier_remark: '',
  invoice_supplier_paid_date: '',
  invoice_supplier_paid_type: '',
  invoice_supplier_status: '',
});
const invoice_supplier_lists = ref<InvoiceSupplierList[]>([])
const branchs = ref<Branch[]>([])
const companys = ref<Company[]>([])
const products = ref<Product[]>([])
const suppliers = ref<Supplier[]>([])
const users = ref<User[]>([])

const company_branchs = computed(() => branchs.value.filter(val => val.company_id === invoice_supplier.value.company_id))
const branch_suppliers = computed(() => suppliers.value.filter(val => val.branch_id === invoice_supplier.value.branch_id))

const branch_options = computed(() => company_branchs.value.map(item => ({ value: item.branch_id, title: item.branch_name, })))
const company_options = computed(() => companys.value.map(item => ({ value: item.company_id, title: item.company_name, })))
const product_options = computed(() => products.value.map(item => ({ value: item.product_id, title: item.product_name, })))
const supplier_options = computed(() => branch_suppliers.value.map(item => ({ value: item.supplier_id, title: item.supplier_name, })))
const user_options = computed(() => users.value.map(item => ({ value: item.user_id, title: item.user_fullname ?? item.user_firstname, })))

onMounted(async () => {
  try {
    branchs.value = await getBranchBy({
      sorter: { key: 'branch_name', order: "ASC" },
    }).then(res => res.docs)

    companys.value = await getCompanyBy({
      sorter: { key: 'company_name', order: "ASC" },
    }).then(res => res.docs)

    users.value = await getUserBy({
      sorter: { key: 'user_firstname', order: "ASC" },
    }).then(res => res.docs)

    pending.value = false
    pending_list.value = false
  } catch (e) {
    console.log(e)
  }
})

async function onSubmit() {
  if (pending.value
    || pending_list.value
    || submitting.value
    || !validateForm()
  ) return

  try {
    submitting.value = true

    const {
      branch_id,
      company_id,
    } = invoice_supplier.value

    const branch = branchs.value.find(val => val.branch_id === branch_id)
    const company = companys.value.find(val => val.company_id === company_id)

    if (branch) invoice_supplier.value.invoice_supplier_branch_name = branch.branch_name
    if (company) invoice_supplier.value.invoice_supplier_company_name = company.company_name

    await insertInvoiceSupplier({
      invoice_supplier: invoice_supplier.value,
      invoice_supplier_lists: invoice_supplier_lists.value,
    });

    Swal.fire({ title: 'สำเร็จ', text: 'บันทึกข้อมูลแล้ว', icon: "success" })
    await router.push({ path: section_info.path });
  } catch (e) {
    console.log(e)

    submitting.value = false
  }
}

function validateForm(): boolean {
  const {
    branch_id,
    company_id,
    supplier_id,
    user_id,
    invoice_supplier_account,
    invoice_supplier_date,
  } = invoice_supplier.value

  if (!(branch_id
    && company_id
    && supplier_id
    && user_id
    && invoice_supplier_account
    && invoice_supplier_date
  )) {
    Swal.fire({ text: 'กรุณากรอกข้อมูลให้ครบถ้วน', icon: "warning" })
    return false
  }

  return true
}

function onChangeCompany() {
  products.value = []
  suppliers.value = []
  invoice_supplier.value.branch_id = ''
  invoice_supplier.value.supplier_id = ''
  invoice_supplier_lists.value.forEach(item => {
    item.product_id = ''
    item.invoice_supplier_list_name = ''
  })
}

async function onChangeBranch(branch_id: string) {
  try {
    invoice_supplier.value.supplier_id = ''
    pending_list.value = true

    const prev_products = invoice_supplier_lists.value.map(item => products.value.find(val => val.product_id === item.product_id))

    products.value = await getProductBy({ match: { branch_id } }).then(res => res.docs)
    suppliers.value = await getSupplierBy({ match: { branch_id } }).then(res => res.docs)

    prev_products.forEach((prev_product, idx) => {
      const curr_product = products.value.find(val => (
        val.product_id === prev_product?.product_id
        || val.product_id === prev_product?.product_main_id
        || val.product_main_id === prev_product?.product_id
      ))

      if (curr_product) {
        invoice_supplier_lists.value[idx].product_id = curr_product.product_id
        invoice_supplier_lists.value[idx].invoice_supplier_list_name = curr_product.product_name
      } else {
        invoice_supplier_lists.value[idx].product_id = ''
        invoice_supplier_lists.value[idx].invoice_supplier_list_name = ''
      }
    })

    pending_list.value = false
  } catch (e) {
    console.log(e)
  }
}

function onChangeSupplier(supplier_id: string) {
  const supplier = suppliers.value.find(val => val.supplier_id === supplier_id)

  if (!supplier) return

  const {
    supplier_name,
    supplier_contact1,
    supplier_contact2,
    supplier_contact3,
    supplier_remark,
    supplier_vat_type,
    supplier_vat_rate,
  } = supplier

  invoice_supplier.value.invoice_supplier_name = supplier_name
  invoice_supplier.value.invoice_supplier_account = supplier_remark
  invoice_supplier.value.invoice_supplier_vat_type = supplier_vat_type ?? 'exc'
  invoice_supplier.value.invoice_supplier_vat_rate = supplier_vat_rate ?? 0
  invoice_supplier.value.invoice_supplier_contact = [supplier_contact1, supplier_contact2, supplier_contact3].filter(item => item).join(' ')

  calcAll()
}

function addRow() {
  invoice_supplier_lists.value.push({
    invoice_supplier_list_id: '',
    invoice_supplier_id: '',
    product_id: '',
    invoice_supplier_list_name: '',
    invoice_supplier_list_unit_name: '',
    invoice_supplier_list_qty: 0,
    invoice_supplier_list_weight: 0,
    invoice_supplier_list_deweight_quality: 0,
    invoice_supplier_list_deweight_percent: 0,
    invoice_supplier_list_deweight_compensation: 0,
    invoice_supplier_list_net_weight: null,
    invoice_supplier_list_unit_price: null,
    invoice_supplier_list_unit_promotion_price: 0,
    invoice_supplier_list_unit_shipping_price: 0,
    invoice_supplier_list_unit_other_price: 0,
    invoice_supplier_list_price: null,
    invoice_supplier_list_remark: '',
  })
}

function deleteRow(index: number) {
  invoice_supplier_lists.value.splice(index, 1)

  calcAll()
}

function onListChangeProduct(index: number) {
  const invoice_supplier_list = invoice_supplier_lists.value[index]

  const product = products.value.find(e => e.product_id == invoice_supplier_list.product_id)

  if (!product) return

  invoice_supplier_list.invoice_supplier_list_name = product.product_name
  invoice_supplier_lists.value[index] = invoice_supplier_list

  calcList(index)
}

function calcList(index: number) {
  const invoice_supplier_list = invoice_supplier_lists.value[index]

  const list_net_weight = toFloat(invoice_supplier_list.invoice_supplier_list_net_weight)
  const list_unit_price = toFloat(invoice_supplier_list.invoice_supplier_list_unit_price)

  invoice_supplier_lists.value[index].invoice_supplier_list_price = decimalFix(list_net_weight * list_unit_price)

  calcAll()
}

function calcAll() {
  const {
    invoice_supplier_vat_type,
    invoice_supplier_vat_rate,
  } = invoice_supplier.value

  let invoice_supplier_weight = 0
  let invoice_supplier_price = 0
  let invoice_supplier_vat_price = 0
  let invoice_supplier_net_price = 0

  const vat_rate = toFloat(invoice_supplier_vat_rate)

  invoice_supplier_lists.value.forEach(invoice_supplier_list => {
    invoice_supplier_weight += toFloat(invoice_supplier_list.invoice_supplier_list_net_weight)
    invoice_supplier_price += toFloat(invoice_supplier_list.invoice_supplier_list_price)
  })

  invoice_supplier_net_price = invoice_supplier_price

  if (invoice_supplier_vat_type === 'inc') {
    invoice_supplier_vat_price = invoice_supplier_price * vat_rate / (100 + vat_rate)
  } else if (invoice_supplier_vat_type === 'exc') {
    invoice_supplier_vat_price = invoice_supplier_price * vat_rate / 100
    invoice_supplier_net_price = invoice_supplier_price + invoice_supplier_vat_price
  }

  invoice_supplier.value.invoice_supplier_weight = decimalFix(invoice_supplier_weight)
  invoice_supplier.value.invoice_supplier_price = decimalFix(invoice_supplier_price)
  invoice_supplier.value.invoice_supplier_vat_price = decimalFix(invoice_supplier_vat_price)
  invoice_supplier.value.invoice_supplier_net_price = decimalFix(invoice_supplier_net_price)
}
</script>

<template>
  <v-breadcrumbs :items="[
    { title: section_info.title, to: section_info.path, },
    { title: 'เพิ่มรายการใหม่', disabled: true, }
  ]">
    <template v-slot:title="{ item }">{{ item.title.toUpperCase() }}</template>
  </v-breadcrumbs>
  <v-card elevation="10" class="pa-4 withbg">
    <v-card-title>เพิ่มรายการรับสินค้า</v-card-title>
    <template v-if="pending">
      <v-card-text class="text-center py-4">
        <v-label>กำลังโหลดข้อมูล..</v-label>
        <v-progress-circular class="ml-4" indeterminate color="primary"></v-progress-circular>
      </v-card-text>
    </template>
    <template v-else>
      <v-card-text class="py-4">
        <v-row>
          <v-col cols="12" md="12">
            <v-row>
              <v-col cols="12" sm="4" lg="3">
                <v-label class="mb-2">เลขที่ใบรับ</v-label>
                <v-text-field v-model="invoice_supplier.invoice_supplier_origin_id" density="compact"
                  variant="outlined"></v-text-field>
              </v-col>
              <v-col cols="12" sm="4" lg="3">
                <v-label class="mb-2">บริษัท<span class="text-error ml-1">*</span></v-label>
                <v-autocomplete v-model="invoice_supplier.company_id" :items="company_options" :rules="[rules.required]"
                  density="compact" variant="outlined" v-on:update:model-value="onChangeCompany"></v-autocomplete>
              </v-col>
              <v-col cols="12" sm="4" lg="3">
                <v-label class="mb-2">สาขา<span class="text-error ml-1">*</span></v-label>
                <v-autocomplete v-model="invoice_supplier.branch_id" :items="branch_options" :rules="[rules.required]"
                  density="compact" variant="outlined" v-on:update:model-value="onChangeBranch"></v-autocomplete>
              </v-col>
              <v-col cols="12" sm="4" lg="3">
                <v-label class="mb-2">ผู้ขาย<span class="text-error ml-1">*</span></v-label>
                <v-autocomplete v-model="invoice_supplier.supplier_id" :items="supplier_options"
                  :rules="[rules.required]" density="compact" variant="outlined"
                  v-on:update:model-value="onChangeSupplier"></v-autocomplete>
              </v-col>
              <v-col cols="12" sm="4" lg="3">
                <v-label class="mb-2">ช่องทางติดต่อ<span class="text-error ml-1">*</span></v-label>
                <v-text-field v-model="invoice_supplier.invoice_supplier_contact" density="compact"
                  :rules="[rules.required]" variant="outlined"></v-text-field>
              </v-col>
              <v-col cols="12" sm="4" lg="3">
                <v-label class="mb-2">ทะเบียนรถ</v-label>
                <v-text-field v-model="invoice_supplier.invoice_supplier_license_plate" density="compact"
                  variant="outlined"></v-text-field>
              </v-col>
              <v-col cols="12" lg="6">
                <v-label class="mb-2">บัญชีผู้ขาย<span class="text-error ml-1">*</span></v-label>
                <v-text-field v-model="invoice_supplier.invoice_supplier_account" :rules="[rules.required]"
                  density="compact" variant="outlined"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="4" lg="3">
                <v-label class="mb-2">วันที่<span class="text-error ml-1">*</span></v-label>
                <Datepicker v-model="invoice_supplier.invoice_supplier_date"
                  :format="(e: any) => formatDate(e, 'dd / MM / yyyy')" :enable-time-picker="false"
                  @update:modelValue="(e: any) => invoice_supplier.invoice_supplier_date = formatDate(e, 'yyyy-MM-dd')" />
              </v-col>
              <v-col cols="12" sm="4" lg="3">
                <v-label class="mb-2">พนักงาน<span class="text-error ml-1">*</span></v-label>
                <v-autocomplete v-model="invoice_supplier.user_id" :items="user_options" density="compact"
                  variant="outlined"></v-autocomplete>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <table class="table table-bordered table-striped mt-2" aria-describedby="schedule">
          <thead>
            <tr>
              <th scope="#" style="width: 48px">ลำดับ</th>
              <th scope="ProductID">รายการสินค้า</th>
              <th :style="{ width: '140px' }" scope="Qty">น้ำหนัก (กก.)</th>
              <th :style="{ width: '140px' }" scope="UnitPrice">
                ราคา/น้ำหนัก (กก.)
              </th>
              <th :style="{ width: '140px' }" scope="Price">จำนวนเงิน</th>
              <td class="align-middle text-center" style="width: 48px"></td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in invoice_supplier_lists" :key="index">
              <td class="align-middle text-center">{{ index + 1 }}</td>
              <td class="align-middle">
                <v-autocomplete v-model="item.product_id" :items="product_options" density="compact" variant="outlined"
                  v-on:update:model-value="onListChangeProduct(index)"></v-autocomplete>
                <v-text-field v-model="item.invoice_supplier_list_remark" density="compact" variant="outlined"
                  placeholder="หมายเหตุ"></v-text-field>
              </td>
              <td>
                <v-text-field v-model="item.invoice_supplier_list_net_weight" class="text-center" density="compact"
                  variant="outlined" @keypress="onlyNumeric" v-on:update:model-value="calcList(index)"></v-text-field>
              </td>
              <td>
                <v-text-field v-model="item.invoice_supplier_list_unit_price" class="text-right" density="compact"
                  variant="outlined" @keypress="onlyNumeric" v-on:update:model-value="calcList(index)"></v-text-field>
              </td>
              <td>
                <v-text-field v-model="item.invoice_supplier_list_price" class="text-right" density="compact"
                  variant="outlined" readonly></v-text-field>
              </td>
              <td class="text-center">
                <v-icon clickable @click="deleteRow(index)" color="error">mdi-trash-can-outline</v-icon>
              </td>
            </tr>
            <tr>
              <td colspan="6" class="text-center">
                <v-btn color="primary" @click="addRow">เพิ่มรายการ</v-btn>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="2" rowSpan="3">
                <span>หมายเหตุ </span>
                <v-textarea v-model="invoice_supplier.invoice_supplier_remark" rows="3" density="compact"
                  variant="outlined"></v-textarea>
              </td>
              <td class="align-middle text-right" colSpan="2">รวมเป็นเงิน </td>
              <td>
                <v-text-field v-model="invoice_supplier.invoice_supplier_price" class="text-right" density="compact"
                  variant="outlined" hide-details readOnly></v-text-field>
              </td>
              <td rowSpan="3"></td>
            </tr>
            <tr>
              <td colSpan="2">
                <div class="d-flex align-center justify-end gap-2">
                  <span>ภาษีมูลค่าเพิ่ม</span>
                  <v-text-field v-model="invoice_supplier.invoice_supplier_vat_rate" class="text-right"
                    density="compact" variant="outlined" hide-details style="max-width: 100px;" @keypress="onlyNumeric"
                    v-on:update:model-value="calcAll"></v-text-field>
                  <span>%</span>
                </div>
              </td>
              <td>
                <v-text-field v-model="invoice_supplier.invoice_supplier_vat_price" class="text-right" density="compact"
                  variant="outlined" hide-details readOnly></v-text-field>
              </td>
            </tr>
            <tr>
              <td class="align-middle text-right" colSpan="2">ยอดสุทธิ </td>
              <td>
                <v-text-field v-model="invoice_supplier.invoice_supplier_net_price" class="text-right" density="compact"
                  variant="outlined" hide-details readOnly></v-text-field>
              </td>
            </tr>
          </tfoot>
        </table>
      </v-card-text>
    </template>
    <v-card-text class="d-flex flex-wrap justify-center gap-2">
      <v-btn color="save" @click="onSubmit">
        <template v-if="submitting">
          <v-progress-circular class="mr-2" indeterminate color="success" :size="16"></v-progress-circular>
        </template> บันทึก
      </v-btn>
      <v-btn color="muted" :to="section_info.path">ยกเลิก</v-btn>
    </v-card-text>
  </v-card>
</template>