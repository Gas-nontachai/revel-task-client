<script lang="ts" setup>
import Excel from 'exceljs';
import {
  BookBank,
  Branch,
  Company,
  PaymentInvoice,
  Supplier,
} from "~~/misc/types"

definePageMeta({ middleware: ["auth"] });

const { $auth } = useNuxtApp()

const { public: publicCtx } = useRuntimeConfig()

const { getBookBankBy } = useBookBank()
const { getBranchBy } = useBranch()
const { getCompanyBy } = useCompany()
const { getReportPaymentBy } = useReportPayment()

const now = new Date(), y = now.getFullYear(), m = now.getMonth()
const page_key = 'report-payment'
const storage = {
  selected_columns: JSON.parse(localStorage.getItem(`${page_key}:selected-columns`) || '[]'),
  search_data: JSON.parse(localStorage.getItem(`[${$auth.profile?.user_id}]${page_key}:search-data`) || '[]'),
}

const data_pending = ref(false)
const page_pending = ref(true)
const setting_dialog = ref(false)
const search_data = ref<{
  start_date: Date | string,
  end_date: Date | string,
  book_bank_ids: string[],
  branch_ids: string[],
  company_ids: string[],
}>(storage.search_data.start_date ? storage.search_data : {
  start_date: formatDate(new Date(y, m, 1), 'yyyy-MM-dd'),
  end_date: formatDate(new Date(y, m + 1, 0), 'yyyy-MM-dd'),
  book_bank_ids: [],
  branch_ids: [],
  company_ids: [],
});

const search_field = ref<{
  text: string,
  columns: string[],
}>({
  text: localStorage.getItem(`[${$auth.profile?.user_id}]${page_key}:search-text`) || '',
  columns: [
    'tb.invoice_supplier_id',
    'invoice_supplier_origin_id',
    'invoice_supplier_name',
  ],
});
const report_headers = ref<{
  key: string,
  header: string,
  optional?: boolean,
}[]>([
  { key: 'idx', header: 'ลำดับ', optional: true },
  { key: 'report_payment_date', header: 'วันที่', },
  { key: 'invoice_supplier_id', header: 'รหัสบันทึกรับ', optional: true },
  { key: 'invoice_supplier_origin_id', header: 'เงื่อนไข/ใบสำคัญจ่าย', },
  { key: 'invoice_supplier_name', header: 'ผู้ขาย', },
  { key: 'payment_price', header: 'จำนวนเงิน', optional: true },
  { key: 'payment_vat_price', header: 'ภาษี', optional: true },
  { key: 'payment_net_price', header: 'เงินสุทธิ', },
  { key: 'user_id', header: 'ผู้บันทึก', optional: true },
])
const report_payments = ref<{
  report_payment_date: Date | string,
  bank_payments: PaymentInvoice[],
  cash_payments: PaymentInvoice[],
  credit_payments: PaymentInvoice[],
  transfer_payments: PaymentInvoice[],
  payments: PaymentInvoice[],
}[]>([])
const summary_payments = ref<{
  bank_payment_price: string,
  bank_payment_vat_price: string,
  bank_payment_net_price: string,
  cash_payment_price: string,
  cash_payment_vat_price: string,
  cash_payment_net_price: string,
  credit_payment_price: string,
  credit_payment_vat_price: string,
  credit_payment_net_price: string,
  transfer_payment_price: string,
  transfer_payment_vat_price: string,
  transfer_payment_net_price: string,
  payment_price: string,
  payment_vat_price: string,
  payment_net_price: string,
}[]>([])
const selected_columns = ref<string[]>(storage.selected_columns || report_headers.value.filter(val => val.optional).map(item => item.key))
const book_banks = ref<BookBank[]>([])
const branchs = ref<Branch[]>([])
const companys = ref<Company[]>([])

const company_branchs = computed(() => search_data.value.company_ids.length ? branchs.value.filter(val => search_data.value.company_ids.includes(val.company_id)) : branchs.value)

const book_bank_options = computed(() => book_banks.value.map(item => ({ value: item.book_bank_id, title: item.book_bank_name, })))
const branch_options = computed(() => company_branchs.value.map(item => ({ value: item.branch_id, title: item.branch_name, })))
const company_options = computed(() => companys.value.map(item => ({ value: item.company_id, title: item.company_name, })))
const report_options = computed(() => report_headers.value.filter(val => val.optional).map(item => ({ value: item.key, title: item.header, })))

onMounted(async () => {
  try {
    book_banks.value = await getBookBankBy({ sorter: { key: 'book_bank_name', order: "ASC" }, }).then(res => res.docs)

    branchs.value = await getBranchBy({
      match: { $sub: [{ access: true }] },
      sorter: { key: 'branch_name', order: "ASC" },
    }).then(res => res.docs)

    companys.value = await getCompanyBy({
      match: { $sub: [{ access: true }] },
      sorter: { key: 'company_name', order: "ASC" },
    }).then(res => res.docs)

    page_pending.value = false
  } catch (e) {
    console.log(e)
  }
})

const fetchData = async () => {
  try {
    if (data_pending.value) return

    data_pending.value = true
    summary_payments.value = []

    const reports = await getReportPaymentBy({
      search: search_field.value,
      match: { $and: mapSearch(), },
    })

    reports.forEach(item => {
      item.report_payment_date = formatDate(item.report_payment_date)

      summary_payments.value.push({
        bank_payment_price: decimalFix(item.bank_payments.reduce((prev, curr) => prev + toFloat(curr.payment_price), 0)),
        bank_payment_vat_price: decimalFix(item.bank_payments.reduce((prev, curr) => prev + toFloat(curr.payment_vat_price), 0)),
        bank_payment_net_price: decimalFix(item.bank_payments.reduce((prev, curr) => prev + toFloat(curr.payment_net_price), 0)),
        cash_payment_price: decimalFix(item.cash_payments.reduce((prev, curr) => prev + toFloat(curr.payment_price), 0)),
        cash_payment_vat_price: decimalFix(item.cash_payments.reduce((prev, curr) => prev + toFloat(curr.payment_vat_price), 0)),
        cash_payment_net_price: decimalFix(item.cash_payments.reduce((prev, curr) => prev + toFloat(curr.payment_net_price), 0)),
        credit_payment_price: decimalFix(item.credit_payments.reduce((prev, curr) => prev + toFloat(curr.payment_price), 0)),
        credit_payment_vat_price: decimalFix(item.credit_payments.reduce((prev, curr) => prev + toFloat(curr.payment_vat_price), 0)),
        credit_payment_net_price: decimalFix(item.credit_payments.reduce((prev, curr) => prev + toFloat(curr.payment_net_price), 0)),
        transfer_payment_price: decimalFix(item.transfer_payments.reduce((prev, curr) => prev + toFloat(curr.payment_price), 0)),
        transfer_payment_vat_price: decimalFix(item.transfer_payments.reduce((prev, curr) => prev + toFloat(curr.payment_vat_price), 0)),
        transfer_payment_net_price: decimalFix(item.transfer_payments.reduce((prev, curr) => prev + toFloat(curr.payment_net_price), 0)),
        payment_price: decimalFix(item.payments.reduce((prev, curr) => prev + toFloat(curr.payment_price), 0)),
        payment_vat_price: decimalFix(item.payments.reduce((prev, curr) => prev + toFloat(curr.payment_vat_price), 0)),
        payment_net_price: decimalFix(item.payments.reduce((prev, curr) => prev + toFloat(curr.payment_net_price), 0)),
      })

      item.bank_payments.forEach(payment => {
        console.log(decimalFix(payment.payment_net_price))

        payment.payment_price = decimalFix(payment.payment_price)
        payment.payment_vat_price = decimalFix(payment.payment_vat_price)
        payment.payment_net_price = decimalFix(payment.payment_net_price)
      })

      item.cash_payments.forEach(payment => {
        payment.payment_price = decimalFix(payment.payment_price)
        payment.payment_vat_price = decimalFix(payment.payment_vat_price)
        payment.payment_net_price = decimalFix(payment.payment_net_price)
      })

      item.credit_payments.forEach(payment => {
        payment.payment_price = decimalFix(payment.payment_price)
        payment.payment_vat_price = decimalFix(payment.payment_vat_price)
        payment.payment_net_price = decimalFix(payment.payment_net_price)
      })

      item.transfer_payments.forEach(payment => {
        payment.payment_price = decimalFix(payment.payment_price, 2)
        payment.payment_vat_price = decimalFix(payment.payment_vat_price, 2)
        payment.payment_net_price = decimalFix(payment.payment_net_price, 2)
      })

      item.payments.forEach(payment => {
        payment.payment_price = decimalFix(payment.payment_price)
        payment.payment_vat_price = decimalFix(payment.payment_vat_price)
        payment.payment_net_price = decimalFix(payment.payment_net_price)
      })
    })

    report_payments.value = reports
    data_pending.value = false
  } catch (e) {
    console.log(e)
  }
}

async function submitSearch(e: FormDataEvent) {
  e.preventDefault()

  localStorage.setItem(`[${$auth.profile?.user_id}]${page_key}:search-text`, search_field.value.text)
  localStorage.setItem(`[${$auth.profile?.user_id}]${page_key}:search-data`, JSON.stringify(search_data.value))

  await fetchData()
}

function mapSearch() {
  const {
    start_date,
    end_date,
    book_bank_ids,
    branch_ids,
    company_ids,
  } = search_data.value

  const conditons = []

  if (start_date) conditons.push({ invoice_supplier_date: { $gte: start_date } })
  if (end_date) conditons.push({ invoice_supplier_date: { $lte: end_date } })
  if (book_bank_ids.length) conditons.push({ book_bank_id: { $in: book_bank_ids } })
  if (branch_ids.length) conditons.push({ 'tb.branch_id': { $in: branch_ids } })
  if (company_ids.length) conditons.push({ company_id: { $in: company_ids } })

  return conditons
}

const exportHeader = () => {
  const {
    book_bank_ids,
    branch_ids,
    company_ids,
    start_date,
    end_date,
  } = search_data.value

  const book_bank_names: string[] = []
  const branch_names: string[] = []
  const company_names: string[] = []

  book_bank_ids.forEach(book_bank_id => {
    const book_bank = book_banks.value.find(val => val.book_bank_id === book_bank_id)

    if (book_bank) book_bank_names.push(book_bank.book_bank_name)
  })

  branch_ids.forEach(branch_id => {
    const branch = branchs.value.find(val => val.branch_id === branch_id)

    if (branch) branch_names.push(branch.branch_name)
  })

  company_ids.forEach(company_id => {
    const company = companys.value.find(val => val.company_id === company_id)

    if (company) company_names.push(company.company_name)
  })

  const header_texts = []
  if (company_names.length) header_texts.push(`บริษัท ${company_names.join(',')}`)
  if (branch_names.length) header_texts.push(`สาขา ${branch_names.join(',')}`)
  if (book_bank_names.length) header_texts.push(`บัญชี ${book_bank_names.join(',')}`)
  if (start_date || end_date) header_texts.push(`ตั้งแต่วันที่ ${formatDate(start_date) || '-'} ถึง ${formatDate(end_date) || '-'}`)

  return header_texts.join(' ')
}

const exportExcel = async () => {
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('Report Payment');

  const column_style: any = {
    idx: { style: { alignment: { horizontal: 'center' }, }, },
    report_payment_date: { style: { alignment: { horizontal: 'center' }, }, width: 15, },
    invoice_supplier_id: { width: 20, },
    invoice_supplier_origin_id: { width: 20, },
    invoice_supplier_name: { width: 40, },
    payment_price: { style: { alignment: { horizontal: 'right' }, }, width: 15, },
    payment_vat_price: { style: { alignment: { horizontal: 'right' }, }, width: 15, },
    payment_net_price: { style: { alignment: { horizontal: 'right' }, }, width: 15, },
  }

  const check_options = report_options.value.map(item => item.value)

  const headers = report_headers.value.filter((val) => {
    if (!check_options.includes(val.key)) return true

    return selected_columns.value.includes(val.key)
  })

  worksheet.columns = headers.map((header: any) => ({ key: header.key, ...column_style[header.key], }))

  worksheet.addRow([`รายงานการโอนเงิน`])
  worksheet.mergeCells(1, 1, 1, headers.length)
  worksheet.addRow([exportHeader()])
  worksheet.mergeCells(2, 1, 2, headers.length)
  worksheet.getRow(3).values = headers.map(item => item.header)

  const addPaymentRow = (data: any) => {
    const {
      report_payment_name,
      report_payment_date,
      payment_price,
      payment_vat_price,
      payment_net_price,
      payments,
    } = data

    if (!payments.length) return

    const pre_colspan = selected_columns.value.filter(column => ['idx', 'invoice_supplier_id'].includes(column)).length

    worksheet.addRow([
      ...Array.from({ length: pre_colspan }, () => ''),
      ``,
      report_payment_name,
      `${payments.length} รายการ`,
    ]);

    payments.forEach((payment: PaymentInvoice, idx: number) => {
      const row: any = {
        idx: idx + 1,
        report_payment_date,
        invoice_supplier_id: payment.invoice_supplier_id,
        invoice_supplier_origin_id: payment.invoice_supplier_origin_id,
        invoice_supplier_name: payment.invoice_supplier_name,
        payment_price: decimalFix(payment.payment_price),
        payment_vat_price: decimalFix(payment.payment_vat_price),
        payment_net_price: decimalFix(payment.payment_net_price),
        user_id: payment.user_id,
      }

      check_options.forEach(item => {
        if (!selected_columns.value.includes(item)) delete row[item]
      })

      worksheet.addRow(row);
    })

    const row_summarys = Array.from({ length: pre_colspan + 3 }, () => '')

    selected_columns.value.includes('payment_price') && row_summarys.push(payment_price)
    selected_columns.value.includes('payment_vat_price') && row_summarys.push(payment_vat_price)
    row_summarys.push(payment_net_price)

    worksheet.addRow(row_summarys);
  }

  report_payments.value.forEach((report, idx) => {
    const {
      report_payment_date,
      bank_payments,
      cash_payments,
      credit_payments,
      transfer_payments,
    } = report

    const {
      bank_payment_price,
      bank_payment_vat_price,
      bank_payment_net_price,
      cash_payment_price,
      cash_payment_vat_price,
      cash_payment_net_price,
      credit_payment_price,
      credit_payment_vat_price,
      credit_payment_net_price,
      transfer_payment_price,
      transfer_payment_vat_price,
      transfer_payment_net_price,
    } = summary_payments.value[idx]

    addPaymentRow({
      report_payment_name: `เงินสด`,
      report_payment_date,
      payment_price: cash_payment_price,
      payment_vat_price: cash_payment_vat_price,
      payment_net_price: cash_payment_net_price,
      payments: cash_payments,
    })

    addPaymentRow({
      report_payment_name: `เงินโอน`,
      report_payment_date,
      payment_price: transfer_payment_price,
      payment_vat_price: transfer_payment_vat_price,
      payment_net_price: transfer_payment_net_price,
      payments: transfer_payments,
    })

    addPaymentRow({
      report_payment_name: `เงินเชื่อ`,
      report_payment_date,
      payment_price: credit_payment_price,
      payment_vat_price: credit_payment_vat_price,
      payment_net_price: credit_payment_net_price,
      payments: credit_payments,
    })

    addPaymentRow({
      report_payment_name: `ธนาคาร`,
      report_payment_date,
      payment_price: bank_payment_price,
      payment_vat_price: bank_payment_vat_price,
      payment_net_price: bank_payment_net_price,
      payments: bank_payments,
    })
  });

  worksheet.getRow(1).alignment = { horizontal: 'center' }

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

  const downloadLink = document.createElement('a')
  downloadLink.href = URL.createObjectURL(blob)
  downloadLink.download = `${page_key} ${formatDate(new Date(), 'yyyyMMdd-HHmmss')}.xlsx`
  downloadLink.click();
};

const exportPDF = async () => {
  const exportFrom: any = document.getElementById("form_export")

  const column_style: any = {
    idx: { width: 40, },
    report_payment_date: { width: 120, },
    invoice_supplier_id: { width: 120, },
    invoice_supplier_origin_id: { width: 120, },
    invoice_supplier_name: { width: 240, },
    payment_price: { width: 80, },
    payment_vat_price: { width: 80, },
    payment_net_price: { width: 80, },
    user_id: { width: 120, },
  }

  const check_options = report_options.value.map(item => item.value)

  const columns = report_headers.value.filter((val) => {
    if (!check_options.includes(val.key)) return true

    return selected_columns.value.includes(val.key)
  }).map((item: any) => {
    if (!column_style[item.key]) return `<th>${item.header}</th>`

    const { width } = column_style[item.key]

    return `<th width="${width}">${item.header}</th>`
  })

  const exportData = {
    colsName: columns,
    data: [['']],
    format: 'summary',
    header: exportHeader(),
  }

  const addPaymentRow = (data: any) => {
    const {
      report_payment_name,
      report_payment_date,
      payment_price,
      payment_vat_price,
      payment_net_price,
      payments,
    } = data

    if (!payments.length) return

    const pre_colspan = selected_columns.value.filter(column => ['idx', 'invoice_supplier_id'].includes(column)).length

    exportData.data.push([
      ...Array.from({ length: pre_colspan }, () => `<td></td>`),
      `<td></td>`,
      `<td>${report_payment_name}</td>`,
      `${payments.length} รายการ`,
      ...Array.from({ length: 5 }, () => `<td></td>`),
    ]);

    payments.forEach((payment: PaymentInvoice, idx: number) => {
      const row: any = {
        idx: `<td>${idx + 1}</td>`,
        report_payment_date: `<td>${report_payment_date}</td>`,
        invoice_supplier_id: `<td>${payment.invoice_supplier_id}</td>`,
        invoice_supplier_origin_id: `<td>${payment.invoice_supplier_origin_id}</td>`,
        invoice_supplier_name: `<td>${payment.invoice_supplier_name}</td>`,
        payment_price: `<td align="right">${payment.payment_price}</td>`,
        payment_vat_price: `<td align="right">${payment.payment_vat_price}</td>`,
        payment_net_price: `<td align="right">${payment.payment_net_price}</td>`,
        user_id: `<td>${payment.user_id}</td>`,
      }

      check_options.forEach(item => {
        if (!selected_columns.value.includes(item)) delete row[item]
      })

      exportData.data.push(row);
    })

    const row_summarys = Array.from({ length: pre_colspan + 3 }, () => `<td></td>`)

    selected_columns.value.includes('payment_price') && row_summarys.push(`<td align="right">${payment_price}</td>`)
    selected_columns.value.includes('payment_vat_price') && row_summarys.push(`<td align="right">${payment_vat_price}</td>`)

    row_summarys.push(`<td align="right">${payment_net_price}</td>`)

    selected_columns.value.includes('user_id') && row_summarys.push(`<td></td>`)

    exportData.data.push(row_summarys)
  }

  report_payments.value.forEach((report, idx) => {
    const {
      report_payment_date,
      cash_payments,
      credit_payments,
      transfer_payments,
    } = report

    const {
      cash_payment_price,
      cash_payment_vat_price,
      cash_payment_net_price,
      credit_payment_price,
      credit_payment_vat_price,
      credit_payment_net_price,
      transfer_payment_price,
      transfer_payment_vat_price,
      transfer_payment_net_price,
    } = summary_payments.value[idx]

    addPaymentRow({
      report_payment_name: `เงินสด`,
      report_payment_date,
      payment_price: cash_payment_price,
      payment_vat_price: cash_payment_vat_price,
      payment_net_price: cash_payment_net_price,
      payments: cash_payments,
    })

    addPaymentRow({
      report_payment_name: `เงินโอน`,
      report_payment_date,
      payment_price: transfer_payment_price,
      payment_vat_price: transfer_payment_vat_price,
      payment_net_price: transfer_payment_net_price,
      payments: transfer_payments,
    })

    addPaymentRow({
      report_payment_name: `เงินเชื่อ`,
      report_payment_date,
      payment_price: credit_payment_price,
      payment_vat_price: credit_payment_vat_price,
      payment_net_price: credit_payment_net_price,
      payments: credit_payments,
    })
  });

  exportFrom.export_data.value = JSON.stringify(exportData)
  exportFrom.action = `${publicCtx.apiExportUrl}?export=${page_key}`
  exportFrom.submit()
};

const setSelectedColumns = () => {
  localStorage.setItem(`${page_key}:selected-columns`, JSON.stringify(selected_columns.value))
}
</script>

<template>
  <v-card elevation="10" class="pa-4 withbg" color="grey-lighten-3">
    <v-card-title class="d-flex justify-space-between align-center gap-2">
      <div>รายงานการโอนเงิน </div>
      <div class="d-flex align-center gap-2">
        <v-btn elevation="3" color="warning"
          @click="setting_dialog = true"><v-icon>mdi-checkbox-multiple-marked-outline</v-icon>Setting</v-btn>
        <v-btn elevation="3" color="export" @click="exportExcel()">Export Excel</v-btn>
        <v-btn elevation="3" color="export" @click="exportPDF()">Export PDF</v-btn>
      </div>
    </v-card-title>

    <v-card-text style="min-height: 500px;">
      <form class="pt-2" :onsubmit="submitSearch">
        <div class="d-flex flex-wrap align-center gap-2 mb-4">
          <Datepicker v-model="search_data.start_date" :format="(e: any) => formatDate(e, 'dd / MM / yyyy')"
            placeholder="จากวันที่" :enable-time-picker="false" style="width: 260px;"
            @update:modelValue="(e: any) => search_data.start_date = formatDate(e, 'yyyy-MM-dd')" />
          <Datepicker v-model="search_data.end_date" :format="(e: any) => formatDate(e, 'dd / MM / yyyy')"
            placeholder="ถึงวันที่" :enable-time-picker="false" style="width: 260px;"
            @update:modelValue="(e: any) => search_data.end_date = formatDate(e, 'yyyy-MM-dd')" />
          <v-autocomplete v-model="search_data.company_ids" :items="company_options" label="บริษัท" density="compact"
            variant="outlined" clearable hide-details multiple style="width: 240px;">
            <template v-slot:prepend-inner>
              <v-icon
                @click="() => { search_data.company_ids = company_options.map(item => item.value) }">mdi-checkbox-multiple-marked</v-icon>
            </template>
          </v-autocomplete>
          <v-autocomplete v-model="search_data.branch_ids" :items="branch_options" label="สาขา" density="compact"
            variant="outlined" clearable hide-details multiple style="width: 240px;">
            <template v-slot:prepend-inner>
              <v-icon
                @click="() => { search_data.branch_ids = branch_options.map(item => item.value) }">mdi-checkbox-multiple-marked</v-icon>
            </template>
          </v-autocomplete>
          <v-autocomplete v-model="search_data.book_bank_ids" :items="book_bank_options" label="บัญชี" density="compact"
            variant="outlined" clearable hide-details multiple style="width: 300px;">
            <template v-slot:prepend-inner>
              <v-icon
                @click="() => { search_data.book_bank_ids = book_bank_options.map(item => item.value) }">mdi-checkbox-multiple-marked</v-icon>
            </template>
          </v-autocomplete>
          <v-text-field v-model="search_field.text" label="ค้นหา..." density="compact" variant="outlined" hide-details
            style="width: 300px"></v-text-field>
          <v-btn color="primary" type="submit" elevation="3">ค้นหา</v-btn>
        </div>
      </form>

      <div class="overflow-auto" style="max-height: calc(100vh - 320px); min-height: 50vh;">
        <table class="table table-bordered table-hover" aria-describedby="report" style="min-width: 1360px;">
          <thead>
            <tr>
              <th v-if="selected_columns.includes('idx')" style="width: 60px;">ลำดับ</th>
              <th style="width: 120px;">วันที่</th>
              <th v-if="selected_columns.includes('invoice_supplier_id')" style="width: 150px;">รหัสบันทึกรับ</th>
              <th style="width: 150px;">เงื่อนไข/ใบสำคัญจ่าย</th>
              <th>ผู้ขาย</th>
              <th v-if="selected_columns.includes('payment_price')" style="width: 120px;">จำนวนเงิน</th>
              <th v-if="selected_columns.includes('payment_vat_price')" style="width: 120px;">ภาษี</th>
              <th style="width: 120px;">เงินสุทธิ</th>
              <th v-if="selected_columns.includes('user_id')">ผู้บันทึก</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="data_pending">
              <tr>
                <td :colspan="report_headers.filter((val: any) => !val.optional).length + selected_columns.length">
                  <v-card-text class="py-4">
                    <v-label>กำลังโหลดข้อมูล..</v-label>
                    <v-progress-circular class="ml-4" indeterminate color="primary"></v-progress-circular>
                  </v-card-text>
                </td>
              </tr>
            </template>
            <template v-else>
              <template v-for="(report_payment, report_payment_idx) in report_payments">
                <template v-if="summary_payments[report_payment_idx]">
                  <ReportPaymentRow :report_payment="{
                    report_payment_name: 'เงินสด',
                    report_payment_date: report_payment.report_payment_date,
                    payment_price: summary_payments[report_payment_idx].cash_payment_price,
                    payment_vat_price: summary_payments[report_payment_idx].cash_payment_vat_price,
                    payment_net_price: summary_payments[report_payment_idx].cash_payment_net_price,
                  }" :columns="selected_columns" :payments="report_payment.cash_payments" />

                  <ReportPaymentRow :report_payment="{
                    report_payment_name: 'เงินโอน',
                    report_payment_date: report_payment.report_payment_date,
                    payment_price: summary_payments[report_payment_idx].transfer_payment_price,
                    payment_vat_price: summary_payments[report_payment_idx].transfer_payment_vat_price,
                    payment_net_price: summary_payments[report_payment_idx].transfer_payment_net_price,
                  }" :columns="selected_columns" :payments="report_payment.transfer_payments" />

                  <ReportPaymentRow :report_payment="{
                    report_payment_name: 'เงินเชื่อ',
                    report_payment_date: report_payment.report_payment_date,
                    payment_price: summary_payments[report_payment_idx].credit_payment_price,
                    payment_vat_price: summary_payments[report_payment_idx].credit_payment_vat_price,
                    payment_net_price: summary_payments[report_payment_idx].credit_payment_net_price,
                  }" :columns="selected_columns" :payments="report_payment.credit_payments" />

                  <ReportPaymentRow :report_payment="{
                    report_payment_name: 'ธนาคาร',
                    report_payment_date: report_payment.report_payment_date,
                    payment_price: summary_payments[report_payment_idx].bank_payment_price,
                    payment_vat_price: summary_payments[report_payment_idx].bank_payment_vat_price,
                    payment_net_price: summary_payments[report_payment_idx].bank_payment_net_price,
                  }" :columns="selected_columns" :payments="report_payment.bank_payments" />

                  <ReportPaymentRow :report_payment="{
                    report_payment_name: 'อื่นๆ',
                    report_payment_date: report_payment.report_payment_date,
                    payment_price: summary_payments[report_payment_idx].payment_price,
                    payment_vat_price: summary_payments[report_payment_idx].payment_vat_price,
                    payment_net_price: summary_payments[report_payment_idx].payment_net_price,
                  }" :columns="selected_columns" :payments="report_payment.payments" />
                </template>
              </template>
            </template>
          </tbody>
        </table>
      </div>
    </v-card-text>
  </v-card>

  <v-dialog v-model="setting_dialog" max-width="500">
    <v-card>
      <v-toolbar color="muted">
        <v-toolbar-title>ตั้งค่าข้อมูล</v-toolbar-title>
        <v-btn icon dark @click="setting_dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-autocomplete v-model="selected_columns" :items="report_options" label="แสดงข้อมูล" density="compact"
          variant="outlined" clearable hide-details multiple @update:modelValue="setSelectedColumns">
          <template v-slot:prepend-inner>
            <v-icon @click="() => {
              selected_columns = report_options.map(item => item.value);
              setSelectedColumns();
            }">mdi-checkbox-multiple-marked</v-icon>
          </template>
        </v-autocomplete>
      </v-card-text>
      <v-divider class="border-opacity-100"></v-divider>
    </v-card>
  </v-dialog>

  <form id="form_export" method="post" target="_blank" class="d-none">
    <input type="text" name="export_data">
  </form>
</template>