<script lang="ts" setup>
import Excel from 'exceljs';
import {
  Branch,
  Company,
  InvoiceSupplierProduct,
  Product,
} from "~~/misc/types";

definePageMeta({ middleware: ["auth"] });

const { $auth } = useNuxtApp()

const { public: publicCtx } = useRuntimeConfig()

const { getBranchBy } = useBranch()
const { getCompanyBy } = useCompany()
const { getProductBy } = useProduct()
const { getReportProductInvoiceBy } = useReportProduct()

const now = new Date(), y = now.getFullYear(), m = now.getMonth()
const page_key = 'report-product-invoice-summary'
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
  branch_ids: string[],
  company_ids: string[],
  product_ids: string[],
}>(storage.search_data.start_date ? storage.search_data : {
  start_date: formatDate(new Date(y, m, 1), 'yyyy-MM-dd'),
  end_date: formatDate(new Date(y, m + 1, 0), 'yyyy-MM-dd'),
  branch_ids: [],
  company_ids: [],
  product_ids: [],
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
    'invoice_supplier_list_name',
    'product_origin_id',
  ],
});
const report_headers = ref<{
  key: string,
  header: string,
  optional?: boolean,
}[]>([
  { key: 'idx', header: 'ลำดับ', optional: true },
  { key: 'product_origin_id', header: 'รหัสสินค้า', },
  { key: 'product_name', header: 'ชื่อสินค้า', },
  { key: 'report_detail', header: 'รายละเอียด', },
  { key: 'total_weight', header: 'น้ำหนักสินค้า', optional: true },
  { key: 'deweight_quality', header: 'น้ำหนักหักคุณภาพ', optional: true },
  { key: 'deweight_percent', header: '% หักคุณภาพ', optional: true },
  { key: 'deweight_compensation', header: 'น้ำหนักหักชดเชย', optional: true },
  { key: 'net_weight', header: 'น้ำหนักสุทธิ', optional: true },
  { key: 'avg_unit_price', header: 'ต้นทุนเฉลี่ยต่อ กก.', optional: true },
  { key: 'total_price', header: 'จำนวนเงิน', optional: true },
])
const report_summary = ref<{
  avg_unit_price: string,
  deweight_quality: string,
  deweight_percent: string,
  deweight_compensation: string,
  net_weight: string,
  total_invoice: string,
  total_product: string,
  total_price: string,
  total_weight: string,
}>({
  avg_unit_price: '0',
  deweight_quality: '0',
  deweight_percent: '0',
  deweight_compensation: '0',
  net_weight: '0',
  total_invoice: '0',
  total_product: '0',
  total_price: '0',
  total_weight: '0',
})
const report_product_invoices = ref<{
  product: Product,
  product_origin_ids: string[],
  avg_unit_price: string,
  deweight_quality: string,
  deweight_percent: string,
  deweight_compensation: string,
  net_weight: string,
  total_invoice: string,
  total_product: string,
  total_price: string,
  total_weight: string,
  invoice_supplier_products: InvoiceSupplierProduct[],
}[]>([])
const selected_columns = ref<string[]>(storage.selected_columns || report_headers.value.filter(val => val.optional).map(item => item.key))
const branchs = ref<Branch[]>([])
const companys = ref<Company[]>([])
const products = ref<Product[]>([])

const company_branchs = computed(() => search_data.value.company_ids.length ? branchs.value.filter(val => search_data.value.company_ids.includes(val.company_id)) : branchs.value)

const branch_options = computed(() => company_branchs.value.map(item => ({ value: item.branch_id, title: item.branch_name, })))
const company_options = computed(() => companys.value.map(item => ({ value: item.company_id, title: item.company_name, })))
const product_options = computed(() => products.value.map(item => ({ value: item.product_id, title: `${item.product_origin_id} - ${item.product_name} (${item.product_id})` })))
const report_options = computed(() => report_headers.value.filter(val => val.optional).map(item => ({ value: item.key, title: item.header, })))

const route_query = computed((): any => {
  const {
    branch_ids,
    company_ids,
    product_ids,
  } = search_data.value

  return {
    ...search_data.value,
    branch_ids: branch_ids.join(','),
    company_ids: company_ids.join(','),
    product_ids: product_ids.join(','),
  }
})

onMounted(async () => {
  try {
    branchs.value = await getBranchBy({
      match: { $sub: [{ access: true }] },
      sorter: { key: 'branch_name', order: "ASC" },
    }).then(res => res.docs)

    companys.value = await getCompanyBy({
      match: { $sub: [{ access: true }] },
      sorter: { key: 'company_name', order: "ASC" },
    }).then(res => res.docs)

    products.value = await getProductBy({
      match: {
        $or: [
          { product_main_id: '', },
          { product_main_id: null, },
        ]
      },
      sorter: { key: 'product_name', order: "ASC" },
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

    const reports = await getReportProductInvoiceBy({
      search: search_field.value,
      match: (() => {
        const {
          start_date,
          end_date,
          branch_ids,
          company_ids,
          product_ids,
        } = search_data.value

        const conditons = []
        const sub_conditons = []

        if (start_date) conditons.push({ invoice_supplier_date: { $gte: start_date } })
        if (end_date) conditons.push({ invoice_supplier_date: { $lte: end_date } })
        if (branch_ids.length) conditons.push({ 'tb_invoice_supplier.branch_id': { $in: branch_ids } })
        if (company_ids.length) conditons.push({ company_id: { $in: company_ids } })

        if (product_ids.length) sub_conditons.push({ product_id: { $in: product_ids } })

        return {
          $and: conditons,
          $sub: sub_conditons,
        }
      })(),
    })

    report_product_invoices.value = []
    reports.forEach(item => {
      item.invoice_supplier_products.forEach(ivp => {
        const {
          invoice_supplier_list_unit_shipping_price,
          invoice_supplier_list_unit_promotion_price,
          invoice_supplier_list_unit_other_price,
        } = ivp

        ivp.invoice_supplier_date = formatDate(ivp.invoice_supplier_date)
        ivp.invoice_supplier_list_unit_price += (invoice_supplier_list_unit_shipping_price + invoice_supplier_list_unit_promotion_price + invoice_supplier_list_unit_other_price)
      })

      const total_price = item.invoice_supplier_products.reduce((prev, curr) => prev + toFloat(curr.invoice_supplier_list_price), 0)
      const net_weight = item.invoice_supplier_products.reduce((prev, curr) => prev + toFloat(curr.invoice_supplier_list_net_weight), 0)

      report_product_invoices.value.push({
        ...item,
        avg_unit_price: decimalFix(net_weight ? total_price / net_weight : total_price),
        total_invoice: decimalFix(Array.from(new Set(item.invoice_supplier_products.map(isp => isp.invoice_supplier_id))).length, 0),
        total_product: decimalFix(item.invoice_supplier_products.length, 0),
        total_price: decimalFix(total_price),
        total_weight: decimalFix(item.invoice_supplier_products.reduce((prev, curr) => prev + toFloat(curr.invoice_supplier_list_weight), 0)),
        net_weight: decimalFix(net_weight),
        deweight_quality: decimalFix(item.invoice_supplier_products.reduce((prev, curr) => prev + toFloat(curr.invoice_supplier_list_deweight_quality), 0)),
        deweight_percent: decimalFix(item.invoice_supplier_products.reduce((prev, curr) => prev + toFloat(curr.invoice_supplier_list_deweight_percent), 0)),
        deweight_compensation: decimalFix(item.invoice_supplier_products.reduce((prev, curr) => prev + toFloat(curr.invoice_supplier_list_deweight_compensation), 0)),
      })
    })

    const total_price = report_product_invoices.value.reduce((prev, curr) => prev + toFloat(curr.total_price), 0)
    const net_weight = report_product_invoices.value.reduce((prev, curr) => prev + toFloat(curr.net_weight), 0)

    report_summary.value = {
      avg_unit_price: decimalFix(net_weight ? total_price / net_weight : total_price),
      total_invoice: decimalFix(report_product_invoices.value.reduce((prev, curr) => prev + toFloat(curr.total_invoice), 0), 0),
      total_product: decimalFix(report_product_invoices.value.reduce((prev, curr) => prev + toFloat(curr.total_product), 0), 0),
      total_price: decimalFix(total_price),
      total_weight: decimalFix(report_product_invoices.value.reduce((prev, curr) => prev + toFloat(curr.total_weight), 0)),
      net_weight: decimalFix(net_weight),
      deweight_quality: decimalFix(report_product_invoices.value.reduce((prev, curr) => prev + toFloat(curr.deweight_quality), 0)),
      deweight_percent: decimalFix(report_product_invoices.value.reduce((prev, curr) => prev + toFloat(curr.deweight_percent), 0)),
      deweight_compensation: decimalFix(report_product_invoices.value.reduce((prev, curr) => prev + toFloat(curr.deweight_compensation), 0)),
    }

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

const exportHeader = () => {
  const {
    branch_ids,
    company_ids,
    product_ids,
    start_date,
    end_date,
  } = search_data.value

  const branch_names: string[] = []
  const company_names: string[] = []
  const product_names: string[] = []

  branch_ids.forEach(branch_id => {
    const branch = branchs.value.find(val => val.branch_id === branch_id)

    if (branch) branch_names.push(branch.branch_name)
  })

  company_ids.forEach(company_id => {
    const company = companys.value.find(val => val.company_id === company_id)

    if (company) company_names.push(company.company_name)
  })

  product_ids.forEach(product_id => {
    const product = products.value.find(val => val.product_id === product_id)

    if (product) product_names.push(product.product_name)
  })

  const header_texts = []
  if (company_names.length) header_texts.push(`บริษัท ${company_names.join(',')}`)
  if (branch_names.length) header_texts.push(`สาขา ${branch_names.join(',')}`)
  if (product_names.length) header_texts.push(`สินค้า ${product_names.join(',')}`)
  if (start_date || end_date) header_texts.push(`ตั้งแต่วันที่ ${formatDate(start_date) || '-'} ถึง ${formatDate(end_date) || '-'}`)

  return header_texts.join(' ')
}

const exportExcel = async () => {
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('Report Supplier Invoice');

  const column_style: any = {
    idx: { style: { alignment: { horizontal: 'center' }, }, },
    product_origin_id: { width: 18, },
    product_name: { width: 50, },
    report_detail: { width: 25, },
    total_weight: { style: { alignment: { horizontal: 'right' } }, width: 15, },
    deweight_quality: { style: { alignment: { horizontal: 'right' } }, width: 18, },
    deweight_percent: { style: { alignment: { horizontal: 'right' } }, width: 15, },
    deweight_compensation: { style: { alignment: { horizontal: 'right' } }, width: 18, },
    net_weight: { style: { alignment: { horizontal: 'right' } }, width: 18, },
    avg_unit_price: { style: { alignment: { horizontal: 'right' } }, width: 18, },
    total_price: { style: { alignment: { horizontal: 'right' } }, width: 20, },
  }

  const check_options = report_options.value.map(item => item.value)

  const headers = report_headers.value.filter((val) => {
    if (!check_options.includes(val.key)) return true

    return selected_columns.value.includes(val.key)
  })

  worksheet.columns = headers.map((header: any) => ({ key: header.key, ...column_style[header.key], }))

  worksheet.addRow([`รายงานรับสินค้าตามสินค้า (สรุป)`])
  worksheet.mergeCells(1, 1, 1, headers.length)
  worksheet.addRow([exportHeader()])
  worksheet.mergeCells(2, 1, 2, headers.length)
  worksheet.getRow(3).values = headers.map(item => item.header)

  let row_curr_idx = 3

  const addRow = (data: any) => {
    worksheet.addRow(data)

    row_curr_idx++
  }

  report_product_invoices.value.forEach((report_product_invoice, idx) => {
    const {
      product,
      product_origin_ids,
      avg_unit_price,
      deweight_quality,
      deweight_percent,
      deweight_compensation,
      net_weight,
      total_invoice,
      total_product,
      total_price,
      total_weight,
    } = report_product_invoice

    const row: any = {
      idx: idx + 1,
      product_origin_id: product_origin_ids.join(', '),
      product_name: product.product_name,
      report_detail: `${total_invoice} ใบรับ ${total_product} รายการ`,
      total_weight,
      deweight_quality,
      deweight_percent,
      deweight_compensation,
      net_weight,
      avg_unit_price,
      total_price,
    }

    check_options.forEach(item => {
      if (!selected_columns.value.includes(item)) delete row[item]
    })

    addRow(row)
  });

  worksheet.getRow(1).alignment = { horizontal: 'center' }

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

  const downloadLink = document.createElement('a')
  downloadLink.href = URL.createObjectURL(blob)
  downloadLink.download = `${page_key} ${formatDate(new Date(), 'yyyyMMdd-HHmmss')}.xlsx`
  downloadLink.click();
};

const setSelectedColumns = () => {
  localStorage.setItem(`${page_key}:selected-columns`, JSON.stringify(selected_columns.value))
}

const exportPDF = async () => {
  const exportFrom: any = document.getElementById("form_export")

  const column_style: any = {
    idx: { width: 80 },
    product_origin_id: { width: 180, },
    product_name: { width: 300, },
    report_detail: { width: 240, },
    total_weight: { width: 120, },
    deweight_quality: { width: 120, },
    deweight_percent: { width: 120, },
    deweight_compensation: { width: 140, },
    net_weight: { width: 120, },
    avg_unit_price: { width: 120, },
    total_price: { width: 140, },
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

  report_product_invoices.value.forEach((report_product_invoice, idx) => {
    const {
      product,
      product_origin_ids,
      total_invoice,
      total_product,
      total_weight,
      deweight_quality,
      deweight_percent,
      deweight_compensation,
      net_weight,
      avg_unit_price,
      total_price,
    } = report_product_invoice

    const row: any = {
      idx: `<td align="center">${idx + 1}</td>`,
      product_origin_id: `<td>${product_origin_ids.join(', ')}</td>`,
      product_name: `<td>${product.product_name}</td>`,
      report_detail: `<td>${total_invoice} ใบรับ ${total_product} รายการ</td>`,
      total_weight: `<td align="right">${total_weight}</td>`,
      deweight_quality: `<td align="right">${deweight_quality}</td>`,
      deweight_percent: `<td align="right">${deweight_percent}</td>`,
      deweight_compensation: `<td align="right">${deweight_compensation}</td>`,
      net_weight: `<td align="right">${net_weight}</td>`,
      avg_unit_price: `<td align="right">${avg_unit_price}</td>`,
      total_price: `<td align="right">${total_price}</td>`,
    }

    check_options.forEach(item => {
      if (!selected_columns.value.includes(item)) delete row[item]
    })

    exportData.data.push(row)
  })

  exportFrom.export_data.value = JSON.stringify(exportData)
  exportFrom.action = `${publicCtx.apiExportUrl}?export=report-product-invoice`
  exportFrom.submit()
};
</script>

<template>
  <v-card elevation="10" class="pa-4 withbg" color="grey-lighten-3">
    <v-card-title class="d-flex justify-space-between align-center gap-2">
      <div>รายงานรับสินค้าตามสินค้า <span class="text-error ml-1">(สรุป)</span></div>
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
            @update:modelValue="(e: any) => search_data.start_date = formatDate(e, 'yyyy-MM-dd')"
            placeholder="จากวันที่" :enable-time-picker="false" style="width: 260px;" />
          <Datepicker v-model="search_data.end_date" :format="(e: any) => formatDate(e, 'dd / MM / yyyy')"
            @update:modelValue="(e: any) => search_data.end_date = formatDate(e, 'yyyy-MM-dd')" placeholder="ถึงวันที่"
            :enable-time-picker="false" style="width: 260px;" />
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
          <v-autocomplete v-model="search_data.product_ids" :items="product_options" label="สินค้า" density="compact"
            variant="outlined" clearable hide-details multiple style="width: 240px;">
            <template v-slot:prepend-inner>
              <v-icon
                @click="() => { search_data.product_ids = product_options.map(item => item.value) }">mdi-checkbox-multiple-marked</v-icon>
            </template>
          </v-autocomplete>
          <v-text-field v-model="search_field.text" label="ค้นหา..." density="compact" variant="outlined" hide-details
            style="width: 300px"></v-text-field>
          <v-btn color="primary" type="submit" elevation="3">ค้นหา</v-btn>
        </div>
      </form>

      <v-tabs color="primary">
        <v-tab :to="{ path: `/report-product-invoice`, query: route_query, }">ละเอียด</v-tab>
        <v-tab active :to="{ path: `/report-product-invoice/summary`, query: route_query, }">สรุป</v-tab>
      </v-tabs>

      <div class="overflow-auto" style="max-height: calc(100vh - 370px); min-height: 50vh;">
        <table class="table table-bordered table-hover" aria-describedby="report"
          :style="{ minWidth: `${(160 * selected_columns.length) + 560}px`, }">
          <thead>
            <tr>
              <th v-if="selected_columns.includes('idx')" style="width: 60px;">ลำดับ</th>
              <th style="width: 160px;">รหัสสินค้า</th>
              <th>ชื่อสินค้า</th>
              <th style="width: 200px;">รายละเอียด</th>
              <th v-if="selected_columns.includes('total_weight')" style="width: 120px;">น้ำหนักสินค้า</th>
              <th v-if="selected_columns.includes('deweight_quality')" style="width: 130px;">น้ำหนักหักคุณภาพ</th>
              <th v-if="selected_columns.includes('deweight_percent')" style="width: 120px;">% หักคุณภาพ</th>
              <th v-if="selected_columns.includes('deweight_compensation')" style="width: 120px;">น้ำหนักหักชดเชย</th>
              <th v-if="selected_columns.includes('net_weight')" style="width: 120px;">น้ำหนักสุทธิ</th>
              <th v-if="selected_columns.includes('avg_unit_price')" style="width: 140px;">ต้นทุนเฉลี่ยต่อ กก.</th>
              <th v-if="selected_columns.includes('total_price')" style="width: 120px;">จำนวนเงิน</th>
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
              <template v-for="(report_product_invoice, report_product_invoice_idx) in report_product_invoices">
                <tr>
                  <td v-if="selected_columns.includes('idx')" class="text-center">
                    {{ report_product_invoice_idx + 1 }}
                  </td>
                  <td>{{ report_product_invoice.product_origin_ids.join(', ') }}</td>
                  <td>{{ report_product_invoice.product.product_name }}</td>
                  <td>
                    {{ report_product_invoice.total_invoice }} ใบรับ
                    {{ report_product_invoice.total_product }} รายการ
                  </td>
                  <td v-if="selected_columns.includes('total_weight')" class="text-right">
                    {{ report_product_invoice.total_weight }}
                  </td>
                  <td v-if="selected_columns.includes('deweight_quality')" class="text-right">
                    {{ report_product_invoice.deweight_quality }}
                  </td>
                  <td v-if="selected_columns.includes('deweight_percent')" class="text-right">
                    {{ report_product_invoice.deweight_percent }}
                  </td>
                  <td v-if="selected_columns.includes('deweight_compensation')" class="text-right">
                    {{ report_product_invoice.deweight_compensation }}
                  </td>
                  <td v-if="selected_columns.includes('net_weight')" class="text-right">
                    {{ report_product_invoice.net_weight }}
                  </td>
                  <td v-if="selected_columns.includes('avg_unit_price')" class="text-right">
                    {{ report_product_invoice.avg_unit_price }}
                  </td>
                  <td v-if="selected_columns.includes('total_price')" class="text-right">
                    {{ report_product_invoice.total_price }}
                  </td>
                </tr>
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