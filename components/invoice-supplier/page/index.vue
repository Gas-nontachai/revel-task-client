<script lang="ts" setup>
import { VDataTable } from 'vuetify/labs/components'
import Swal from "sweetalert2";
import {
  BookBank,
  BookBankBranch,
  Branch,
  Company,
  InvoiceSupplier,
} from "~~/misc/types"

interface SumInvoice {
  weight: any,
  price: any,
  vat_price: any,
  net_price: any,
}

const { $auth } = useNuxtApp()

const { permission_add, permission_delete, permission_edit, } = $auth.getPermission('invoice-supplier')

const props = defineProps({
  section: { type: String, },
})

const section_info = (() => {
  if (props.section === 'branch') return {
    title: 'รายการรับสินค้า ตามสาขา',
    page_key: 'invoice-supplier-branch',
    path: '/invoice-supplier-branch',
  }

  if (props.section === 'book-bank') return {
    title: 'รายการรับสินค้า ตามบัญชีการโอน',
    page_key: 'invoice-supplier-book-bank',
    path: '/invoice-supplier-book-bank',
  }

  return {
    title: 'รายการรับสินค้า ตามบริษัท',
    page_key: 'invoice-supplier',
    path: '/invoice-supplier',
  }
})()

const { getBookBankBy } = useBookBank()
const { getBookBankBranchBy } = useBookBankBranch()
const { getBranchBy } = useBranch()
const { getCompanyBy } = useCompany()
const {
  getInvoiceSupplierBy,
  getSumInvoiceSupplierBy,
  deleteInvoiceSupplierBy,
} = useInvoiceSupplier()

type Headers = InstanceType<typeof VDataTable>['headers']

const now = new Date(), y = now.getFullYear(), m = now.getMonth()
const page_key = section_info.page_key
const storage = {
  selected_columns: JSON.parse(localStorage.getItem(`${page_key}:selected-columns`) || '[]'),
  search_data: JSON.parse(localStorage.getItem(`[${$auth.profile?.user_id}]${page_key}:search-data`) || '[]'),
}

const skip_load_table2 = ref(true)
const skip_load_table3 = ref(true)

const tab = ref('')
const pending = ref(true)
const pagination1 = ref({ page: 1, size: 20, sorter: [], })
const pagination2 = ref({ page: 1, size: 20, sorter: [], })
const pagination3 = ref({ page: 1, size: 20, sorter: [], })
const pagination4 = ref({ page: 1, size: 20, sorter: [], })
const search_data = ref<{
  start_date: Date | string,
  end_date: Date | string,
  branch_ids: string[],
  book_bank_ids: string[],
  company_ids: string[],
  payment_types: string[],
}>(storage.search_data.start_date ? storage.search_data : {
  start_date: formatDate(new Date(y, m, 1), 'yyyy-MM-dd'),
  end_date: formatDate(new Date(y, m + 1, 0), 'yyyy-MM-dd'),
  branch_ids: [],
  book_bank_ids: [],
  company_ids: [],
  payment_types: [],
});

const search_field = ref<{
  text: string,
  columns: string[],
}>({
  text: localStorage.getItem(`[${$auth.profile?.user_id}]${page_key}:search-text`) || '',
  columns: [
    'invoice_supplier_id',
    'invoice_supplier_origin_id',
    'invoice_supplier_name',
    'invoice_supplier_branch_name',
    'invoice_supplier_net_price',
    'invoice_supplier_weight',
    'invoice_supplier_key_by',
  ],
});
const headers = ref<{
  key: string,
  header: string,
  optional?: boolean,
}[]>([
  { key: 'invoice_supplier_date', header: 'วันที่ใบรับ', },
  { key: 'invoice_supplier_origin_id', header: 'เลขที่ใบรับ', },
  { key: 'invoice_supplier_id', header: 'รหัสบันทึกรับ', optional: true },
  { key: 'invoice_supplier_name', header: 'ผู้ขาย', },
  { key: 'invoice_supplier_branch_name', header: 'บริษัท/สาขา', optional: true },
  { key: 'invoice_supplier_net_price', header: 'จำนวนเงิน', optional: true },
  { key: 'invoice_supplier_weight', header: 'น้ำหนัก', optional: true },
  { key: "invoice_supplier_key_by", header: "ผู้บันทึก", optional: true },
  { key: "invoice_supplier_key_date", header: "เวลาที่บันทึก", optional: true },
])
const selected_columns = ref<string[]>(storage.selected_columns || headers.value.filter(val => val.optional).map(item => item.key))
const merge_dialog = ref<{ show: boolean, }>({ show: false, });
const payment_dialog = ref<{ show: true, invoice_supplier: InvoiceSupplier, } | { show: false, }>({
  show: false,
});
const sum_invoice_supplier1 = ref<SumInvoice>({
  weight: '0.00',
  price: '0.00',
  vat_price: '0.00',
  net_price: '0.00',
})
const sum_invoice_supplier2 = ref<SumInvoice>({
  weight: '0.00',
  price: '0.00',
  vat_price: '0.00',
  net_price: '0.00',
})
const sum_invoice_supplier3 = ref<SumInvoice>({
  weight: '0.00',
  price: '0.00',
  vat_price: '0.00',
  net_price: '0.00',
})
const book_banks = ref<BookBank[]>([])
const book_bank_branchs = ref<BookBankBranch[]>([])
const branchs = ref<Branch[]>([])
const companys = ref<Company[]>([])

const {
  data: invoice_supplier1s,
  pending: pendingInvoiceSupplier1s,
  refresh: refreshInvoiceSupplier1s,
} = await useAsyncData('invoice_supplier1s', () => getInvoiceSupplierBy({
  pagination: pagination1.value,
  search: search_field.value,
  match: { invoice_supplier_status: { $nin: ['cancel', 'invalid', 'paid',] }, ...mapSearch1(), },
  sorter: pagination1.value.sorter.length ? pagination1.value.sorter : [
    { key: 'invoice_supplier_date', order: "DESC" },
    { key: 'invoice_supplier_origin_id', order: "ASC" },
  ],
}), { immediate: false, watch: [pagination1.value] })

const {
  data: invoice_supplier2s,
  pending: pendingInvoiceSupplier2s,
  refresh: refreshInvoiceSupplier2s,
} = await useAsyncData('invoice_supplier2s', () => getInvoiceSupplierBy({
  pagination: pagination2.value,
  search: search_field.value,
  match: { invoice_supplier_status: 'invalid', ...mapSearch1(), },
  options: ['payments'],
  sorter: pagination2.value.sorter.length ? pagination2.value.sorter : [
    { key: 'invoice_supplier_date', order: "DESC" },
    { key: 'invoice_supplier_origin_id', order: "ASC" },
  ],
}), { watch: [pagination2.value] })

const {
  data: invoice_supplier3s,
  pending: pendingInvoiceSupplier3s,
  refresh: refreshInvoiceSupplier3s,
} = await useAsyncData('invoice_supplier3s', () => getInvoiceSupplierBy({
  pagination: pagination3.value,
  search: search_field.value,
  match: { invoice_supplier_status: 'paid', ...mapSearch2(), },
  options: ['payments'],
  sorter: pagination3.value.sorter.length ? pagination3.value.sorter : [
    { key: 'invoice_supplier_date', order: "DESC" },
    { key: 'invoice_supplier_origin_id', order: "ASC" },
  ],
}), { watch: [pagination3.value] })

const {
  data: invoice_supplier4s,
  pending: pendingInvoiceSupplier4s,
  refresh: refreshInvoiceSupplier4s,
} = await useAsyncData('invoice_supplier4s', () => getInvoiceSupplierBy({
  pagination: pagination4.value,
  search: search_field.value,
  match: { invoice_supplier_status: 'cancel', ...mapSearch1(), },
  sorter: pagination4.value.sorter.length ? pagination4.value.sorter : [
    { key: 'invoice_supplier_date', order: "DESC" },
    { key: 'invoice_supplier_origin_id', order: "ASC" },
  ],
}), { watch: [pagination4.value] })

const header1s = computed(() => {
  const check_options = header_options.value.map(item => item.value)

  const headers: Headers = [
    { key: "operation", title: "...", sortable: false, width: 50, align: 'center' },
    { key: "no", title: "#", sortable: false, width: 40 },
    { key: "invoice_supplier_paid_type", title: "การโอน", sortable: false, width: 110, },
    { key: "invoice_supplier_date", title: "วันที่ใบรับ", width: 110, align: 'center' },
    { key: "invoice_supplier_origin_id", title: "เลขที่ใบรับ", width: 120, },
    { key: "invoice_supplier_id", title: "รหัสบันทึกรับ", width: 140, },
    { key: "invoice_supplier_name", title: "ผู้ขาย", },
    { key: "invoice_supplier_branch_name", title: "บริษัท/สาขา", },
    { key: "invoice_supplier_net_price", title: "จำนวนเงิน", width: 110, align: 'end' },
    { key: "invoice_supplier_weight", title: "น้ำหนัก", width: 110, align: 'end' },
    { key: "invoice_supplier_key_by", title: "ผู้บันทึก", width: 100, },
    { key: "invoice_supplier_key_date", title: "เวลาที่บันทึก", width: 140, align: 'center' },
  ]

  return headers.filter((val) => !check_options.includes(val.key) || selected_columns.value.includes(val.key))
})
const header2s = computed(() => {
  const check_options = header_options.value.map(item => item.value)

  const headers: Headers = [
    { key: "operation", title: "...", sortable: false, width: 50, align: 'center' },
    { key: "no", title: "#", sortable: false, width: 40 },
    { key: "invoice_supplier_paid_type", title: "การโอน", sortable: false, width: 110, align: 'center' },
    { key: "invoice_supplier_date", title: "วันที่ใบรับ", width: 110, align: 'center' },
    { key: "invoice_supplier_origin_id", title: "เลขที่ใบรับ", width: 120, },
    { key: "invoice_supplier_id", title: "รหัสบันทึกรับ", width: 140, },
    { key: "invoice_supplier_name", title: "ชื่อผู้ขาย", },
    { key: "invoice_supplier_branch_name", title: "บริษัท/สาขา", },
    { key: "invoice_supplier_net_price", title: "จำนวนเงิน", width: 110, align: 'end' },
    { key: "invoice_supplier_weight", title: "น้ำหนัก", width: 110, align: 'end' },
    { key: "invoice_supplier_key_by", title: "ผู้บันทึก", width: 100, },
    { key: "invoice_supplier_key_date", title: "เวลาที่บันทึก", width: 140, align: 'center' },
    { key: "invoice_supplier_paid_date", title: "วันที่ชำระเงิน", width: 140, align: 'center' },
  ]

  return headers.filter((val) => !check_options.includes(val.key) || selected_columns.value.includes(val.key))
})

const book_bank_options = computed(() => book_banks.value.map(item => ({ value: item.book_bank_id, title: item.book_bank_name, })))
const branch_options = computed(() => branchs.value.map(item => ({ value: item.branch_id, title: item.branch_name, })))
const company_options = computed(() => companys.value.map(item => ({ value: item.company_id, title: item.company_name, })))
const header_options = computed(() => headers.value.filter(val => val.optional).map(item => ({ value: item.key, title: item.header, })))

const payment_type_options = ['เงินโอน', 'เงินสด', 'เงินเชื่อ', 'ธนาคาร'].map(item => ({ value: item, title: item, }))

onMounted(async () => {
  try {
    if (props.section === 'book-bank') {
      book_banks.value = await getBookBankBy({ sorter: { key: 'book_bank_name', order: "ASC" }, }).then(res => res.docs)
      book_bank_branchs.value = await getBookBankBranchBy().then(res => res.docs)
    } else if (props.section === 'branch') {
      branchs.value = await getBranchBy({
        match: { $sub: [{ access: true }] },
        sorter: { key: 'branch_name', order: "ASC" },
      }).then(res => res.docs)
    } else {
      companys.value = await getCompanyBy({
        match: { $sub: [{ access: true }] },
        sorter: { key: 'company_name', order: "ASC" },
      }).then(res => res.docs)
    }

    await fetchSum()

    pending.value = false
  } catch (e) {
    console.log(e)
  }
})

const fetchSum = async () => {
  const sum_1 = await getSumInvoiceSupplierBy({
    search: search_field.value,
    match: { invoice_supplier_status: { $nin: ['invalid', 'paid'] }, ...mapSearch1(), },
  })

  const sum_2 = await getSumInvoiceSupplierBy({
    search: search_field.value,
    match: { invoice_supplier_status: 'invalid', ...mapSearch2(), },
  })

  const sum_3 = await getSumInvoiceSupplierBy({
    search: search_field.value,
    match: { invoice_supplier_status: 'paid', ...mapSearch2(), },
  })

  sum_invoice_supplier1.value = {
    price: decimalFix(sum_1.price),
    weight: decimalFix(sum_1.weight),
    vat_price: decimalFix(sum_1.vat_price),
    net_price: decimalFix(sum_1.net_price),
  }
  sum_invoice_supplier2.value = {
    price: decimalFix(sum_2.price),
    weight: decimalFix(sum_2.weight),
    vat_price: decimalFix(sum_2.vat_price),
    net_price: decimalFix(sum_2.net_price),
  }
  sum_invoice_supplier3.value = {
    price: decimalFix(sum_3.price),
    weight: decimalFix(sum_3.weight),
    vat_price: decimalFix(sum_3.vat_price),
    net_price: decimalFix(sum_3.net_price),
  }
}

const onDelete = (id: string) => Swal.fire({
  title: "ยืนยันการลบรายการ",
  text: "คุณแน่ใจหรือว่าต้องการลบ ?",
  icon: "warning",
  showCancelButton: true,
}).then(async ({ value }) => {
  try {
    if (!value) return

    await deleteInvoiceSupplierBy({ invoice_supplier_id: id })

    await refreshInvoiceSupplier()

    Swal.fire({ title: 'สำเร็จ', text: 'ลบข้อมูลแล้ว', icon: "success" })
  } catch (e) {
    console.log(e)
  }
})

const onShowPayment = (e: InvoiceSupplier) => {
  payment_dialog.value = {
    show: true,
    invoice_supplier: e,
  }
}

async function refreshInvoiceSupplier() {
  await refreshInvoiceSupplier3s()
  await refreshInvoiceSupplier2s()
  await refreshInvoiceSupplier1s()
  await fetchSum()
}

async function onPaymentSaved() {
  payment_dialog.value.show = false

  await refreshInvoiceSupplier()
}

async function onMerged() {
  merge_dialog.value.show = false

  await refreshInvoiceSupplier()
}

function submitSearch(e: FormDataEvent) {
  e.preventDefault()

  localStorage.setItem(`[${$auth.profile?.user_id}]${page_key}:search-text`, search_field.value.text)
  localStorage.setItem(`[${$auth.profile?.user_id}]${page_key}:search-data`, JSON.stringify(search_data.value))

  refreshInvoiceSupplier()
}

function mapSearch1() {
  let {
    start_date,
    end_date,
    book_bank_ids = [],
    branch_ids = [],
    company_ids = [],
    payment_types = [],
  } = search_data.value

  const conditons = []

  if (book_bank_ids.length) {
    const branch_id_1s = book_bank_branchs.value.filter(val => book_bank_ids.includes(val.book_bank_id)).map(item => item.branch_id)

    branch_ids = Array.from(new Set([...branch_ids, ...branch_id_1s]))
  }

  if (start_date) conditons.push({ invoice_supplier_date: { $gte: start_date } })
  if (end_date) conditons.push({ invoice_supplier_date: { $lte: end_date } })
  if (branch_ids.length || book_bank_ids.length) conditons.push({ branch_id: { $in: branch_ids } })
  if (company_ids.length) conditons.push({ company_id: { $in: company_ids } })
  if (payment_types.length) conditons.push({ invoice_supplier_paid_type: { $in: payment_types } })

  return {
    $and: conditons,
  }
}

function mapSearch2() {
  const {
    start_date,
    end_date,
    book_bank_ids = [],
    branch_ids = [],
    company_ids = [],
    payment_types = [],
  } = search_data.value

  const conditons = []
  const sub_conditons = []

  if (start_date) conditons.push({ invoice_supplier_date: { $gte: start_date } })
  if (end_date) conditons.push({ invoice_supplier_date: { $lte: end_date } })
  if (branch_ids.length) conditons.push({ branch_id: { $in: branch_ids } })
  if (company_ids.length) conditons.push({ company_id: { $in: company_ids } })
  if (payment_types.length) conditons.push({ invoice_supplier_paid_type: { $in: payment_types } })

  if (book_bank_ids.length) sub_conditons.push({ book_bank_id: { $in: book_bank_ids } })

  return {
    $and: conditons,
    $sub: sub_conditons,
  }
}

const setSelectedColumns = () => {
  localStorage.setItem(`${page_key}:selected-columns`, JSON.stringify(selected_columns.value))
}
</script>

<template>
  <v-card elevation="10" class="pa-4 withbg" color="grey-lighten-3">
    <v-card-title>{{ section_info.title }}</v-card-title>
    <template v-if="pending">
      <v-card-text class="text-center py-4">
        <v-label>กำลังโหลดข้อมูล..</v-label>
        <v-progress-circular class="ml-4" indeterminate color="primary"></v-progress-circular>
      </v-card-text>
    </template>
    <template v-else>
      <v-card-text style="min-height: 500px;">
        <form class="pt-2" :onsubmit="submitSearch">
          <div class="d-flex flex-wrap align-center gap-2 mb-4">
            <Datepicker v-model="search_data.start_date" :format="(e: any) => formatDate(e, 'dd / MM / yyyy')"
              placeholder="จากวันที่" :enable-time-picker="false" style="width: 260px;"
              @update:modelValue="(e: any) => search_data.start_date = formatDate(e, 'yyyy-MM-dd')" />
            <Datepicker v-model="search_data.end_date" :format="(e: any) => formatDate(e, 'dd / MM / yyyy')"
              placeholder="ถึงวันที่" :enable-time-picker="false" style="width: 260px;"
              @update:modelValue="(e: any) => search_data.end_date = formatDate(e, 'yyyy-MM-dd')" />
            <template v-if="section === 'branch'">
              <v-autocomplete v-model="search_data.branch_ids" :items="branch_options" label="สาขา" density="compact"
                variant="outlined" clearable hide-details multiple style="width: 300px;">
                <template v-slot:prepend-inner>
                  <v-icon
                    @click="() => { search_data.branch_ids = branch_options.map(item => item.value) }">mdi-checkbox-multiple-marked</v-icon>
                </template>
              </v-autocomplete>
            </template>
            <template v-else-if="section === 'book-bank'">
              <v-autocomplete v-model="search_data.book_bank_ids" :items="book_bank_options" label="บัญชี"
                density="compact" variant="outlined" clearable hide-details multiple style="width: 300px;">
                <template v-slot:prepend-inner>
                  <v-icon
                    @click="() => { search_data.book_bank_ids = book_bank_options.map(item => item.value) }">mdi-checkbox-multiple-marked</v-icon>
                </template>
              </v-autocomplete>
            </template>
            <template v-else>
              <v-autocomplete v-model="search_data.company_ids" :items="company_options" label="บริษัท"
                density="compact" variant="outlined" clearable hide-details multiple style="width: 300px;">
                <template v-slot:prepend-inner>
                  <v-icon
                    @click="() => { search_data.company_ids = company_options.map(item => item.value) }">mdi-checkbox-multiple-marked</v-icon>
                </template>
              </v-autocomplete>
            </template>
            <v-autocomplete v-model="search_data.payment_types" :items="payment_type_options" label="วิธีชำระเงิน"
              density="compact" variant="outlined" clearable hide-details multiple style="width: 300px;">
              <template v-slot:prepend-inner>
                <v-icon
                  @click="() => { search_data.payment_types = payment_type_options.map(item => item.value) }">mdi-checkbox-multiple-marked</v-icon>
              </template>
            </v-autocomplete>
            <v-text-field v-model="search_field.text" label="ค้นหา..." density="compact" variant="outlined" hide-details
              style="width: 300px"></v-text-field>
            <v-btn color="primary" type="submit" elevation="3">ค้นหา</v-btn>
          </div>
        </form>

        <v-divider class="border-opacity-100 my-2"></v-divider>

        <div class="d-flex flex-wrap align-center justify-end gap-2 my-4">
          <v-autocomplete v-model="selected_columns" :items="header_options" label="แสดงข้อมูล" density="compact"
            variant="outlined" clearable hide-details multiple @update:modelValue="setSelectedColumns">
            <template v-slot:prepend-inner>
              <v-icon @click="() => {
                selected_columns = header_options.map(item => item.value);
                setSelectedColumns();
              }">mdi-checkbox-multiple-marked</v-icon>
            </template>
          </v-autocomplete>
          <v-btn elevation="3" color="warning" @click="merge_dialog.show = true">ระบุเอกสารเดียวกัน</v-btn>
          <template v-if="permission_add">
            <v-btn elevation="3" color="success" :to="`${section_info.path}/add`">เพิ่มรายการใหม่</v-btn>
          </template>
        </div>

        <v-tabs v-model="tab" bg-color="grey100" color="primary">
          <v-tab value="">
            รอชำระ
            <template v-if="invoice_supplier1s?.totalDocs">
              ({{ invoice_supplier1s.totalDocs }})
            </template>
          </v-tab>
          <v-tab value="invalid">
            รอตรวจสอบยอดชำระ
            <template v-if="invoice_supplier2s?.totalDocs">
              ({{ invoice_supplier2s.totalDocs }})
            </template>
          </v-tab>
          <v-tab value="paid">
            ชำระเงินแล้ว
            <template v-if="invoice_supplier3s?.totalDocs">
              ({{ invoice_supplier3s.totalDocs }})
            </template>
          </v-tab>
          <v-tab value="cancel">
            ยกเลิก
            <template v-if="invoice_supplier4s?.totalDocs">
              ({{ invoice_supplier4s.totalDocs }})
            </template>
          </v-tab>
        </v-tabs>
        <v-window v-model="tab">
          <v-window-item value="">
            <v-data-table-server :loading="pendingInvoiceSupplier1s" :headers="header1s"
              :items="invoice_supplier1s?.docs ?? []" :items-length="invoice_supplier1s?.totalDocs ?? 0"
              :items-per-page="pagination1.size" :page="pagination1.page" density="compact" @update:options="(e: any) => {
                pagination1.page = e.page
                pagination1.size = e.itemsPerPage
                pagination1.sorter = e.sortBy
              }">
              <template v-slot:item.no="{ index }">{{ pageItemNo(pagination1, index) }}</template>
              <template v-slot:item.invoice_supplier_paid_type="{ item }">
                <v-btn color="primary" density="compact" @click="onShowPayment(item.raw)">ยืนยันการโอน</v-btn>
              </template>
              <template v-slot:item.invoice_supplier_date="{ item }">
                {{ formatDate(item.raw.invoice_supplier_date) }}
              </template>
              <template v-slot:item.invoice_supplier_net_price="{ item }">
                {{ decimalFix(item.raw.invoice_supplier_net_price) }}
              </template>
              <template v-slot:item.invoice_supplier_weight="{ item }">
                {{ decimalFix(item.raw.invoice_supplier_weight) }}
              </template>
              <template v-slot:item.invoice_supplier_key_date="{ item }">
                {{ formatDate(item.raw.invoice_supplier_key_date, 'dd/MM/yyyy HH:mm') }}
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
                      :to="{ path: `${section_info.path}/detail`, query: { id: item.raw.invoice_supplier_id } }">
                      <v-list-item-title>
                        <v-icon> mdi-chat-processing-outline</v-icon> ดูรายละเอียด
                      </v-list-item-title>
                    </v-list-item>
                    <template v-if="!item.raw.invoice_supplier_origin_id">
                      <template v-if="permission_edit">
                        <v-list-item class="cursor-pointer" density="compact"
                          :to="{ path: `${section_info.path}/update`, query: { id: item.raw.invoice_supplier_id } }">
                          <v-list-item-title>
                            <v-icon> mdi-square-edit-outline</v-icon> แก้ไข
                          </v-list-item-title>
                        </v-list-item>
                      </template>
                      <template v-if="permission_delete">
                        <v-list-item class="cursor-pointer" density="compact"
                          @click="onDelete(item.raw.invoice_supplier_id)">
                          <v-list-item-title>
                            <v-icon> mdi-trash-can-outline</v-icon> ลบ
                          </v-list-item-title>
                        </v-list-item>
                      </template>
                    </template>
                  </v-list>
                </v-menu>
              </template>
              <template v-slot:tfoot>
                <tr class="bg-lightprimary">
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td v-if="selected_columns.includes('invoice_supplier_id')"></td>
                  <td></td>
                  <td v-if="selected_columns.includes('invoice_supplier_branch_name')"></td>
                  <td v-if="selected_columns.includes('invoice_supplier_net_price')" class="text-right pa-2">
                    {{ sum_invoice_supplier1.net_price }}
                  </td>
                  <td v-if="selected_columns.includes('invoice_supplier_weight')" class="text-right pa-2">
                    {{ sum_invoice_supplier1.weight }}
                  </td>
                  <td v-if="selected_columns.includes('invoice_supplier_key_by')"></td>
                  <td v-if="selected_columns.includes('invoice_supplier_key_date')"></td>
                </tr>
              </template>
            </v-data-table-server>
          </v-window-item>
          <v-window-item value="invalid">
            <v-data-table-server :loading="pendingInvoiceSupplier2s" :headers="header2s"
              :items="invoice_supplier2s?.docs ?? []" :items-length="invoice_supplier2s?.totalDocs ?? 0"
              :items-per-page="pagination2.size" :page="pagination2.page" density="compact" @update:options="(e: any) => {
                if (skip_load_table2) return skip_load_table2 = false

                pagination2.page = e.page
                pagination2.size = e.itemsPerPage
                pagination2.sorter = e.sortBy
              }">
              <template v-slot:item.no="{ index }">{{ pageItemNo(pagination2, index) }}</template>
              <template v-slot:item.invoice_supplier_paid_type="{ item }">
                <template v-if="item.raw.invoice_supplier_paid_type === 'เงินโอน'">
                  <v-btn color="primary" density="compact" @click="onShowPayment(item.raw)">แก้ไขข้อมูลการโอน</v-btn>
                </template>
                <template v-else>{{ item.raw.invoice_supplier_paid_type }}</template>
              </template>
              <template v-slot:item.invoice_supplier_date="{ item }">
                {{ formatDate(item.raw.invoice_supplier_date) }}
              </template>
              <template v-slot:item.invoice_supplier_net_price="{ item }">
                {{ decimalFix(item.raw.invoice_supplier_net_price) }}
              </template>
              <template v-slot:item.invoice_supplier_weight="{ item }">
                {{ decimalFix(item.raw.invoice_supplier_weight) }}
              </template>
              <template v-slot:item.invoice_supplier_key_date="{ item }">
                {{ formatDate(item.raw.invoice_supplier_key_date, 'dd/MM/yyyy HH:mm') }}
              </template>
              <template v-slot:item.invoice_supplier_paid_date="{ item }">
                {{ formatDate(item.raw.invoice_supplier_paid_date, 'dd/MM/yyyy HH:mm') }}
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
                      :to="{ path: `${section_info.path}/detail`, query: { id: item.raw.invoice_supplier_id } }">
                      <v-list-item-title>
                        <v-icon> mdi-chat-processing-outline</v-icon> ดูรายละเอียด
                      </v-list-item-title>
                    </v-list-item>
                    <template v-if="!item.raw.invoice_supplier_origin_id">
                      <template v-if="permission_edit">
                        <v-list-item class="cursor-pointer" density="compact"
                          :to="{ path: `${section_info.path}/update`, query: { id: item.raw.invoice_supplier_id } }">
                          <v-list-item-title>
                            <v-icon> mdi-square-edit-outline</v-icon> แก้ไข
                          </v-list-item-title>
                        </v-list-item>
                      </template>
                    </template>
                  </v-list>
                </v-menu>
              </template>
              <template v-slot:tfoot>
                <tr class="bg-lightprimary">
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td v-if="selected_columns.includes('invoice_supplier_id')"></td>
                  <td></td>
                  <td v-if="selected_columns.includes('invoice_supplier_branch_name')"></td>
                  <td v-if="selected_columns.includes('invoice_supplier_net_price')" class="text-right pa-2">
                    {{ sum_invoice_supplier2.net_price }}
                  </td>
                  <td v-if="selected_columns.includes('invoice_supplier_weight')" class="text-right pa-2">
                    {{ sum_invoice_supplier2.weight }}
                  </td>
                  <td v-if="selected_columns.includes('invoice_supplier_key_by')"></td>
                  <td v-if="selected_columns.includes('invoice_supplier_key_date')"></td>
                  <td></td>
                </tr>
              </template>
            </v-data-table-server>
          </v-window-item>
          <v-window-item value="paid">
            <v-data-table-server :loading="pendingInvoiceSupplier3s" :headers="header2s"
              :items="invoice_supplier3s?.docs ?? []" :items-length="invoice_supplier3s?.totalDocs ?? 0"
              :items-per-page="pagination3.size" :page="pagination3.page" density="compact" @update:options="(e: any) => {
                if (skip_load_table3) return skip_load_table3 = false

                pagination3.page = e.page
                pagination3.size = e.itemsPerPage
                pagination3.sorter = e.sortBy
              }">
              <template v-slot:item.no="{ index }">{{ pageItemNo(pagination3, index) }}</template>
              <template v-slot:item.invoice_supplier_paid_type="{ item }">
                <template v-if="item.raw.invoice_supplier_paid_type === 'เงินโอน'">
                  <v-btn color="primary" density="compact" @click="onShowPayment(item.raw)">แก้ไขข้อมูลการโอน</v-btn>
                </template>
                <template v-else>{{ item.raw.invoice_supplier_paid_type }}</template>
              </template>
              <template v-slot:item.invoice_supplier_date="{ item }">
                {{ formatDate(item.raw.invoice_supplier_date) }}
              </template>
              <template v-slot:item.invoice_supplier_net_price="{ item }">
                {{ decimalFix(item.raw.invoice_supplier_net_price) }}
              </template>
              <template v-slot:item.invoice_supplier_weight="{ item }">
                {{ decimalFix(item.raw.invoice_supplier_weight) }}
              </template>
              <template v-slot:item.invoice_supplier_key_date="{ item }">
                {{ formatDate(item.raw.invoice_supplier_key_date, 'dd/MM/yyyy HH:mm') }}
              </template>
              <template v-slot:item.invoice_supplier_paid_date="{ item }">
                {{ formatDate(item.raw.invoice_supplier_paid_date, 'dd/MM/yyyy HH:mm') }}
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
                      :to="{ path: `${section_info.path}/detail`, query: { id: item.raw.invoice_supplier_id } }">
                      <v-list-item-title>
                        <v-icon> mdi-chat-processing-outline</v-icon> ดูรายละเอียด
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
              <template v-slot:tfoot>
                <tr class="bg-lightprimary">
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td v-if="selected_columns.includes('invoice_supplier_id')"></td>
                  <td></td>
                  <td v-if="selected_columns.includes('invoice_supplier_branch_name')"></td>
                  <td v-if="selected_columns.includes('invoice_supplier_net_price')" class="text-right pa-2">
                    {{ sum_invoice_supplier3.net_price }}
                  </td>
                  <td v-if="selected_columns.includes('invoice_supplier_weight')" class="text-right pa-2">
                    {{ sum_invoice_supplier3.weight }}
                  </td>
                  <td v-if="selected_columns.includes('invoice_supplier_key_by')"></td>
                  <td v-if="selected_columns.includes('invoice_supplier_key_date')"></td>
                  <td></td>
                </tr>
              </template>
            </v-data-table-server>
          </v-window-item>
          <v-window-item value="cancel">
            <v-data-table-server :loading="pendingInvoiceSupplier4s" :headers="header2s"
              :items="invoice_supplier4s?.docs ?? []" :items-length="invoice_supplier4s?.totalDocs ?? 0"
              :items-per-page="pagination4.size" :page="pagination4.page" density="compact" @update:options="(e: any) => {
                if (skip_load_table3) return skip_load_table3 = false

                pagination4.page = e.page
                pagination4.size = e.itemsPerPage
                pagination4.sorter = e.sortBy
              }">
              <template v-slot:item.no="{ index }">{{ pageItemNo(pagination4, index) }}</template>
              <template v-slot:item.invoice_supplier_date="{ item }">
                {{ formatDate(item.raw.invoice_supplier_date) }}
              </template>
              <template v-slot:item.invoice_supplier_net_price="{ item }">
                {{ decimalFix(item.raw.invoice_supplier_net_price) }}
              </template>
              <template v-slot:item.invoice_supplier_weight="{ item }">
                {{ decimalFix(item.raw.invoice_supplier_weight) }}
              </template>
              <template v-slot:item.invoice_supplier_key_date="{ item }">
                {{ formatDate(item.raw.invoice_supplier_key_date, 'dd/MM/yyyy HH:mm') }}
              </template>
              <template v-slot:item.invoice_supplier_paid_date="{ item }">
                {{ formatDate(item.raw.invoice_supplier_paid_date, 'dd/MM/yyyy HH:mm') }}
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
                      :to="{ path: `${section_info.path}/detail`, query: { id: item.raw.invoice_supplier_id } }">
                      <v-list-item-title>
                        <v-icon> mdi-chat-processing-outline</v-icon> ดูรายละเอียด
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
            </v-data-table-server>
          </v-window-item>
        </v-window>
      </v-card-text>
    </template>
  </v-card>

  <invoice-supplier-payment-dialog v-model="payment_dialog" @saved="onPaymentSaved" />
  <invoice-supplier-merge-dialog v-model="merge_dialog" @saved="onMerged" />
</template>