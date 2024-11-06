<script lang="ts" setup>
import Swal from "sweetalert2"
import { VDataTable } from 'vuetify/labs/components'
import {
  BookBank,
  InvoiceSupplier,
  Payment,
  PaymentLog,
  User
} from "~~/misc/types"

interface DialogHide {
  show: false,
}

interface PaymentDialogShow {
  show: true,
  invoice_supplier: InvoiceSupplier,
}

interface PaymentLogExtended extends PaymentLog {
  payment: Payment,
  book_bank?: BookBank,
  user?: User,
}

const emit = defineEmits<{
  (e: 'saved'): void,
}>()

const props = defineProps({
  modelValue: {
    type: Object as PropType<PaymentDialogShow | DialogHide>,
    required: true
  },
})

const { $auth } = useNuxtApp()

const { getPaymentBookBankBy } = useBookBank()
const { getPaymentLogBy } = usePaymentLog()
const { getPaymentBy, confirmPayment } = usePayment()
const { getSupplierByID } = useSupplier()
const { getUserBy } = useUser()

type Headers = InstanceType<typeof VDataTable>['headers']

const headers: Headers = [
  { key: "no", title: "#", sortable: false, width: 40 },
  { key: "adddate", title: "วันที่ทำรายการ", sortable: false, width: 160, },
  { key: "payment", title: "รายละเอียด", sortable: false, }
];

const tab = ref('')
const pending = ref(true)
const submitting = ref(false)
const payment = ref<Payment>({
  payment_id: '',
  branch_id: '',
  book_bank_id: '',
  invoice_supplier_id: '',
  user_id: '',
  payment_date: '',
  payment_type: '',
  payment_price: 0,
  payment_vat_price: 0,
  payment_net_price: 0,
  payment_remark: '',
  payment_slip_url: '',
});
const payment_logs = ref<{
  docs: PaymentLogExtended[],
  totalDocs: number,
}>({
  docs: [],
  totalDocs: 0,
});
const supplier_detail = ref({
  supplier_account_number: '',
  supplier_account_name: '',
  supplier_bank_name: '',
  supplier_contact: '',
  supplier_remark: '',
})
const book_banks = ref<BookBank[]>([])
const users = ref<User[]>([])

const invoice_supplier = computed(() => props.modelValue.show ? props.modelValue.invoice_supplier : undefined)
const book_bank_options = computed(() => book_banks.value.map(item => ({ value: item.book_bank_id, title: item.book_bank_name, })))
const user_options = computed(() => users.value.map(item => ({ value: item.user_id, title: item.user_fullname ?? item.user_firstname, })))

watch(props, async ({ modelValue }) => {
  if (!modelValue.show) return

  tab.value = ''

  await fetchData()
}, { flush: 'pre', immediate: true, deep: true })

onMounted(async () => {
  try {
    users.value = await getUserBy({ sorter: { key: 'user_firstname', order: "ASC" }, }).then(res => res.docs)

    pending.value = false
  } catch (e) {
    console.log(e)
  }
})

async function fetchData() {
  if (!props.modelValue.show || !invoice_supplier.value) return

  try {
    pending.value = true

    supplier_detail.value = {
      supplier_account_number: '',
      supplier_account_name: '',
      supplier_bank_name: '',
      supplier_contact: '',
      supplier_remark: '',
    }

    const {
      invoice_supplier_id,
      branch_id,
      supplier_id,
      invoice_supplier_price: payment_price,
      invoice_supplier_vat_price: payment_vat_price,
      invoice_supplier_net_price: payment_net_price,
    } = invoice_supplier.value

    book_banks.value = await getPaymentBookBankBy({ branch_id })

    const { docs: payments } = await getPaymentBy({ match: { invoice_supplier_id } })

    const supplier = await getSupplierByID({ supplier_id })

    if (supplier) {
      const supplier_remark = supplier.supplier_remark.replaceAll("-", "")

      const details = supplier_remark.split('/').map(detail => detail.trim())

      if (details.length < 3) {
        supplier_detail.value.supplier_remark = supplier_remark
      } else {
        supplier_detail.value = {
          supplier_bank_name: details[0],
          supplier_account_number: details[2],
          supplier_account_name: details[3],
          supplier_contact: details[4],
          supplier_remark,
        }
      }
    }

    if (payments.length) {
      payment.value = payments[0]
      payment.value.payment_date = formatDate(payment.value.payment_date, 'yyyy-MM-dd HH:mm')

      if (!payment.value.user_id) payment.value.user_id = $auth.profile?.user_id ?? ''

      await fetchPaymentLog()
    } else {
      payment.value = {
        payment_id: '',
        branch_id,
        book_bank_id: '',
        invoice_supplier_id,
        user_id: $auth.profile?.user_id ?? '',
        payment_date: formatDate(new Date(), 'yyyy-MM-dd HH:mm'),
        payment_type: '',
        payment_price,
        payment_vat_price,
        payment_net_price,
        payment_remark: '',
        payment_slip_url: '',
      }
    }
  } catch (e) {
    console.log(e)
  }

  pending.value = false
}

async function fetchPaymentLog() {
  const { docs, totalDocs } = await getPaymentLogBy({
    match: { payment_id: payment.value.payment_id, },
    sorter: { key: 'adddate', order: "DESC" },
  })

  payment_logs.value = {
    docs: docs.map(item => {
      const payment = JSON.parse(item.payment_log_text)

      const book_bank = book_banks.value.find(val => payment.book_bank_id === val.book_bank_id)
      const user = users.value.find(val => payment.user_id === val.user_id)

      payment.payment_date = formatDate(payment.payment_date, 'dd/MM/yyyy HH:mm')
      payment.payment_net_price = decimalFix(payment.payment_net_price)

      return {
        ...item,
        payment,
        book_bank,
        user,
        adddate: formatDate(item.adddate, 'dd/MM/yyyy HH:mm'),
      }
    }),
    totalDocs,
  }
}

function validateValue(): boolean {
  const {
    book_bank_id,
    user_id,
    payment_date,
    payment_net_price,
  } = payment.value

  const { invoice_supplier_net_price = 0, } = invoice_supplier.value ?? {}

  if (!(book_bank_id
    && user_id
    && payment_date
    && (payment_net_price || payment_net_price === invoice_supplier_net_price)
  )) {
    Swal.fire({ text: 'กรุณากรอกข้อมูลให้ครบถ้วน', icon: "warning" })
    return false
  }

  return true
}

async function onSubmitPayment() {
  if (!invoice_supplier.value
    || pending.value
    || submitting.value
    || !validateValue()
  ) return

  const {
    invoice_supplier_origin_id,
    invoice_supplier_date,
    invoice_supplier_name,
    invoice_supplier_branch_name,
    invoice_supplier_weight,
    invoice_supplier_net_price,
    invoice_supplier_remark,
  } = invoice_supplier.value

  const { book_bank_id, payment_net_price, } = payment.value

  const book_bank = book_banks.value.find(val => val.book_bank_id === book_bank_id)

  const { value } = await Swal.fire({
    title: "ยืนยันการโอน",
    html: `
      <table class="table-detail text-subtitle-1 w-100">
        <thead>
          <tr>
            <th style="width: 100px"></th>
            <th></th>
            <th style="width: 100px"></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-right">เลขที่ใบรับ :</td>
            <td class="text-muted text-left pl-2">${invoice_supplier_origin_id}</td>
            <td class="text-right">วันที่ใบรับ :</td>
            <td class="text-muted text-left pl-2">${formatDate(invoice_supplier_date)}</td>
          </tr>
          <tr>
            <td class="text-right">ผู้ขาย :</td>
            <td colspan="3" class="text-muted text-left pl-2">${invoice_supplier_name}</td>
          </tr>
          <tr>
            <td class="text-right">บริษัท/สาขา :</td>
            <td colspan="3" class="text-muted text-left pl-2">${invoice_supplier_branch_name}</td>
          </tr>
          <tr>
            <td class="text-right">น้ำหนัก :</td>
            <td class="text-muted text-right pr-2">${decimalFix(invoice_supplier_weight)}</td>
            <td class="text-right">จำนวนเงิน :</td>
            <td class="text-muted text-right pr-2">${decimalFix(invoice_supplier_net_price)}</td>
          </tr>
          <tr>
            <td class="text-right">หมายเหตุ :</td>
            <td colspan="3" class="text-muted text-left pl-2">${invoice_supplier_remark || '-'}</td>
          </tr>
        </tbody>
      </table>
      <hr class="my-2"/>
      <div>รายการโอน</div>
      <table class="table-detail text-subtitle-1 w-100">
        <thead>
          <tr>
            <th style="width: 100px"></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-right">บัญชีโอน :</td>
            <td class="text-muted text-left pr-2">${book_bank?.book_bank_name}</td>
          </tr>
          <tr>
            <td class="text-right">เลขบัญชี :</td>
            <td class="text-muted text-left pr-2">${book_bank?.book_bank_number}</td>
          </tr>
          <tr>
            <td class="text-right">ยอดโอน :</td>
            <td class="text-muted text-right pr-2">${decimalFix(payment_net_price)}</td>
          </tr>
        </tbody>
      </table>
    `,
    icon: "warning",
    showCancelButton: true,
  })

  if (!value) return

  try {
    submitting.value = true

    await confirmPayment(payment.value)

    Swal.fire({ title: 'สำเร็จ', text: 'บันทึกการโอนแล้ว', icon: "success" })

    emit('saved')
  } catch (e) {
    console.log(e)
  }

  submitting.value = false
}

async function copyContent(content: string) {
  try {
    await navigator.clipboard.writeText(content);

    console.log('Content copied to clipboard');
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}
</script>

<template>
  <v-dialog v-model="modelValue.show" max-width="900" :persistent="true">
    <v-card>
      <v-toolbar color="success">
        <v-toolbar-title>ยืนยันการโอน</v-toolbar-title>
        <v-btn icon dark @click="modelValue.show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-tabs v-model="tab" bg-color="grey100" color="textPrimary">
        <v-tab value="">ยืนยันการโอน</v-tab>
        <v-tab value="history">ประวัติการโอน
          <span v-if="payment_logs.totalDocs">({{ payment_logs.totalDocs }})</span>
        </v-tab>
      </v-tabs>
      <v-card-text class="overflow-auto" style="max-height: 80vh;">
        <v-window v-model="tab">
          <v-window-item value="">
            <template v-if="invoice_supplier">
              <table class="table-detail w-100" style="min-width: 800px" aria-describedby="detail">
                <thead>
                  <tr>
                    <th style="width: 100px"></th>
                    <th></th>
                    <th style="width: 100px"></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="text-right">เลขที่ใบรับ :</td>
                    <td class="text-muted">
                      {{ invoice_supplier.invoice_supplier_origin_id }}
                      <v-icon icon="mdi-content-copy" size="16"
                        @click="copyContent(invoice_supplier.invoice_supplier_origin_id)"></v-icon>
                    </td>
                    <td class="text-right">วันที่ใบรับ :</td>
                    <td class="text-muted">{{ formatDate(invoice_supplier.invoice_supplier_date) }}</td>
                  </tr>
                  <tr>
                    <td class="text-right">ผู้ขาย :</td>
                    <td class="text-muted">{{ invoice_supplier.invoice_supplier_name }}</td>
                    <td class="text-right">บริษัท/สาขา :</td>
                    <td class="text-muted">{{ invoice_supplier.invoice_supplier_branch_name }}</td>
                  </tr>
                  <tr>
                    <td class="text-right">ธนาคาร :</td>
                    <td class="text-muted">{{ supplier_detail.supplier_bank_name }}</td>
                    <td class="text-right">ชื่อบัญชี :</td>
                    <td class="text-muted">{{ supplier_detail.supplier_account_name }}</td>
                  </tr>
                  <tr>
                    <td class="text-right">เลขบัญชี :</td>
                    <td class="text-muted">
                      <template v-if="supplier_detail.supplier_account_number">
                        {{ supplier_detail.supplier_account_number }}
                        <v-icon icon="mdi-content-copy" size="16"
                          @click="copyContent(supplier_detail.supplier_account_number)"></v-icon>
                      </template>
                    </td>
                    <td class="text-right">เบอร์โทร :</td>
                    <td class="text-muted">
                      <template v-if="supplier_detail.supplier_contact">
                        {{ supplier_detail.supplier_contact }}
                        <v-icon icon="mdi-content-copy" size="16"
                          @click="copyContent(supplier_detail.supplier_contact)"></v-icon>
                      </template>
                    </td>
                  </tr>
                  <tr>
                    <td class="text-right">น้ำหนัก :</td>
                    <td class="text-muted">{{ decimalFix(invoice_supplier.invoice_supplier_weight) }}</td>
                    <td class="text-right">จำนวนเงิน :</td>
                    <td class="text-muted">{{ decimalFix(invoice_supplier.invoice_supplier_net_price) }}</td>
                  </tr>
                  <tr>
                    <td class="text-right">หมายเหตุ :</td>
                    <td colspan="3" class="text-muted">{{ invoice_supplier.invoice_supplier_remark }}</td>
                  </tr>
                  <tr>
                    <td class="text-right">บันทึกช่วยจำ :</td>
                    <td colspan="3" class="text-muted">{{ supplier_detail.supplier_remark }}</td>
                  </tr>
                </tbody>
              </table>
            </template>

            <hr class="my-3" />

            <v-row>
              <v-col cols="12" md="6">
                <v-label class="mb-2">วันที่<span class="text-error ml-1">*</span></v-label>
                <Datepicker v-model="payment.payment_date" :format="(e: any) => formatDate(e, 'dd / MM / yyyy HH:mm')"
                  @update:modelValue="(e: any) => payment.payment_date = formatDate(e, 'yyyy-MM-dd HH:mm')"
                  :teleport="true" />
              </v-col>
              <v-col cols="12" md="6">
                <div class="d-flex justify-space-between align-end mb-2">
                  <v-label>ยอดโอน<span class="text-error ml-1">*</span></v-label>
                  <v-icon icon="mdi-content-copy" size="16" @click="copyContent(payment.payment_net_price)"></v-icon>
                </div>
                <v-text-field v-model="payment.payment_net_price" class="text-right" density="compact"
                  variant="outlined" @keypress="onlyNumeric"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-label class="mb-2">พนักงาน<span class="text-error ml-1">*</span></v-label>
                <v-autocomplete v-model="payment.user_id" :items="user_options" density="compact" variant="outlined"
                  disabled></v-autocomplete>
              </v-col>
              <v-col cols="12" md="6">
                <v-label class="mb-2">บัญชีโอน<span class="text-error ml-1">*</span></v-label>
                <v-autocomplete v-model="payment.book_bank_id" :items="book_bank_options" :rules="[rules.required]"
                  density="compact" variant="outlined"></v-autocomplete>
              </v-col>
              <v-col cols="12">
                <v-label class="mb-2">หมายเหตุ </v-label>
                <v-text-field v-model="payment.payment_remark" density="compact" variant="outlined"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-label class="mb-2">แนบสลิป </v-label>
                <v-text-field v-model="payment.payment_slip_url" density="compact" variant="outlined"></v-text-field>
              </v-col>
            </v-row>
            <v-card-text class="d-flex justify-center gap-2 py-4">
              <v-btn color="save" @click="onSubmitPayment">
                <template v-if="submitting">
                  <v-progress-circular class="mr-2" indeterminate color="success" :size="16"></v-progress-circular>
                </template> ยืนยันรายการ <span v-if="payment_logs.totalDocs">({{ payment_logs.totalDocs }})</span>
              </v-btn>
              <v-btn color="secondary" @click="modelValue.show = false">ยกเลิก</v-btn>
            </v-card-text>
          </v-window-item>

          <v-window-item value="history">
            <template v-if="payment_logs.totalDocs">
              <v-data-table-server :loading="pending" :headers="headers" :items="payment_logs.docs"
                :items-length="payment_logs.totalDocs" density="compact">
                <template v-slot:item.no="{ index }">{{ index + 1 }}</template>
                <template v-slot:item.payment="{ item }">
                  <v-card class="py-2">
                    <table class="table-detail w-100">
                      <thead>
                        <tr>
                          <th width="80"></th>
                          <th></th>
                          <th width="80"></th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td class="text-right">วันที่</td>
                          <td>{{ item.raw.payment.payment_date }}</td>
                          <td class="text-right">ยอดโอน</td>
                          <td>{{ item.raw.payment.payment_net_price }}</td>
                        </tr>
                        <tr>
                          <td class="text-right">พนักงาน</td>
                          <td colspan="3">
                            <template v-if="item.raw.user">{{ item.raw.user.user_fullname }}</template>
                          </td>
                        </tr>
                        <tr>
                          <td class="text-right">บัญชีโอน</td>
                          <td colspan="3">
                            <template v-if="item.raw.book_bank">
                              {{ item.raw.book_bank.book_bank_number }}
                              {{ item.raw.book_bank.book_bank_name }}
                            </template>
                          </td>
                        </tr>
                        <tr v-if="item.raw.payment.payment_remark">
                          <td class="text-right">หมายเหตุ</td>
                          <td colspan="3">{{ item.raw.payment.payment_remark }}</td>
                        </tr>
                        <tr v-if="item.raw.payment.payment_slip_url">
                          <td class="text-right">แบบสลิป</td>
                          <td colspan="3">{{ item.raw.payment.payment_slip_url }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </v-card>
                </template>
              </v-data-table-server>
            </template>
            <template v-else>
              <h3 class="text-center my-16 text-secondary">ไม่มีประวัติการโอน</h3>
            </template>
          </v-window-item>
        </v-window>
      </v-card-text>
      <v-divider class="border-opacity-100"></v-divider>
    </v-card>
  </v-dialog>
</template>