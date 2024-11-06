<script lang="ts" setup>
import Excel from 'exceljs';
import {
  Branch,
  Company,
  InvoiceSupplierProduct,
  Supplier,
} from "~~/misc/types";

definePageMeta({ middleware: ["auth"] });

const { $auth } = useNuxtApp()

const { public: publicCtx } = useRuntimeConfig()

const { getBranchBy } = useBranch()
const { getCompanyBy } = useCompany()
const { getReportSupplierInvoiceBy } = useReportInvoice()
const { getSupplierBy } = useSupplier()

const now = new Date(), y = now.getFullYear(), m = now.getMonth()
const page_key = 'report-supplier-invoice'
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
  supplier_ids: string[],
}>(storage.search_data.start_date ? storage.search_data : {
  start_date: formatDate(new Date(y, m, 1), 'yyyy-MM-dd'),
  end_date: formatDate(new Date(y, m + 1, 0), 'yyyy-MM-dd'),
  branch_ids: [],
  company_ids: [],
  supplier_ids: [],
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
  { key: 'supplier_origin_id', header: 'รหัสเจ้าหนี้/รหัสสินค้า', },
  { key: 'invoice_supplier_date', header: 'วันที่', },
  { key: 'invoice_supplier_id', header: 'รหัสบันทึกรับ', optional: true },
  { key: 'invoice_supplier_origin_id', header: 'เลขที่ใบรับ', },
  { key: 'invoice_supplier_list_name', header: 'รายละเอียด', },
  { key: 'invoice_supplier_list_unit_name', header: 'หน่วย', optional: true },
  { key: 'invoice_supplier_list_qty', header: 'จำนวน', optional: true },
  { key: 'invoice_supplier_list_weight', header: 'น้ำหนักสินค้า', optional: true },
  { key: 'invoice_supplier_list_deweight_quality', header: 'น้ำหนักหักคุณภาพ', optional: true },
  { key: 'invoice_supplier_list_deweight_percent', header: '% หักคุณภาพ', optional: true },
  { key: 'invoice_supplier_list_deweight_compensation', header: 'น้ำหนักหักชดเชย', optional: true },
  { key: 'invoice_supplier_list_net_weight', header: 'น้ำหนักสุทธิ', optional: true },
  { key: 'invoice_supplier_list_unit_price', header: 'ราคาต่อหน่วยปกติ', optional: true },
  { key: 'invoice_supplier_list_unit_shipping_price', header: 'ราคาต่อหน่วยค่าขนส่ง', optional: true },
  { key: 'invoice_supplier_list_unit_promotion_price', header: 'ราคาต่อหน่วยโปรโมชั่น 1', optional: true },
  { key: 'invoice_supplier_list_unit_other_price', header: 'ราคาต่อหน่วยอื่น ๆ', optional: true },
  { key: 'invoice_supplier_list_price', header: 'จำนวนเงิน', optional: true },
])
const report_supplier_invoices = ref<{
  supplier: Supplier,
  supplier_origin_ids: string[],
  invoice_supplier_products: InvoiceSupplierProduct[],
  total_invoice: string,
  total_product: string,
  total_price: string,
  total_weight: string,
  deweight_quality: string,
  deweight_percent: string,
  deweight_compensation: string,
  net_weight: string,
}[]>([])
const selected_columns = ref<string[]>(storage.selected_columns || report_headers.value.filter(val => val.optional).map(item => item.key))
const branchs = ref<Branch[]>([])
const companys = ref<Company[]>([])
const suppliers = ref<Supplier[]>([])

const company_branchs = computed(() => search_data.value.company_ids.length ? branchs.value.filter(val => search_data.value.company_ids.includes(val.company_id)) : branchs.value)

const branch_options = computed(() => company_branchs.value.map(item => ({ value: item.branch_id, title: item.branch_name, })))
const company_options = computed(() => companys.value.map(item => ({ value: item.company_id, title: item.company_name, })))
const report_options = computed(() => report_headers.value.filter(val => val.optional).map(item => ({ value: item.key, title: item.header, })))
const supplier_options = computed(() => suppliers.value.map(item => ({ value: item.supplier_id, title: `${item.supplier_origin_id} - ${item.supplier_name} (${item.supplier_id})` })))

const route_query = computed((): any => {
  const { branch_ids, company_ids, supplier_ids, } = search_data.value

  return {
    ...search_data.value,
    branch_ids: branch_ids.join(','),
    company_ids: company_ids.join(','),
    supplier_ids: supplier_ids.join(','),
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

    suppliers.value = await getSupplierBy({
      match: {
        $or: [
          { supplier_main_id: '', },
          { supplier_main_id: null, },
        ]
      },
      sorter: { key: 'supplier_name', order: "ASC" },
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

    const reports = await getReportSupplierInvoiceBy({
      search: search_field.value,
      match: { $and: mapSearch(), },
    })

    report_supplier_invoices.value = []
    reports.forEach(item => {
      item.invoice_supplier_products.forEach(ivp => {
        ivp.invoice_supplier_date = formatDate(ivp.invoice_supplier_date)

        ivp.invoice_supplier_list_qty = decimalFix(ivp.invoice_supplier_list_qty, 0)
        ivp.invoice_supplier_list_weight = decimalFix(ivp.invoice_supplier_list_weight)
        ivp.invoice_supplier_list_deweight_quality = decimalFix(ivp.invoice_supplier_list_deweight_quality)
        ivp.invoice_supplier_list_deweight_percent = decimalFix(ivp.invoice_supplier_list_deweight_percent)
        ivp.invoice_supplier_list_deweight_compensation = decimalFix(ivp.invoice_supplier_list_deweight_compensation)
        ivp.invoice_supplier_list_net_weight = decimalFix(ivp.invoice_supplier_list_net_weight)
        ivp.invoice_supplier_list_unit_price = decimalFix(ivp.invoice_supplier_list_unit_price)
        ivp.invoice_supplier_list_unit_shipping_price = decimalFix(ivp.invoice_supplier_list_unit_shipping_price)
        ivp.invoice_supplier_list_unit_promotion_price = decimalFix(ivp.invoice_supplier_list_unit_promotion_price)
        ivp.invoice_supplier_list_unit_other_price = decimalFix(ivp.invoice_supplier_list_unit_other_price)
        ivp.invoice_supplier_list_price = decimalFix(ivp.invoice_supplier_list_price)
      })

      report_supplier_invoices.value.push({
        ...item,
        total_invoice: decimalFix(Array.from(new Set(item.invoice_supplier_products.map(isp => isp.invoice_supplier_id))).length, 0),
        total_product: decimalFix(item.invoice_supplier_products.length, 0),
        total_price: decimalFix(item.invoice_supplier_products.reduce((prev, curr) => prev + toFloat(curr.invoice_supplier_list_price), 0)),
        total_weight: decimalFix(item.invoice_supplier_products.reduce((prev, curr) => prev + toFloat(curr.invoice_supplier_list_weight), 0)),
        net_weight: decimalFix(item.invoice_supplier_products.reduce((prev, curr) => prev + toFloat(curr.invoice_supplier_list_net_weight), 0)),
        deweight_quality: decimalFix(item.invoice_supplier_products.reduce((prev, curr) => prev + toFloat(curr.invoice_supplier_list_deweight_quality), 0)),
        deweight_percent: decimalFix(item.invoice_supplier_products.reduce((prev, curr) => prev + toFloat(curr.invoice_supplier_list_deweight_percent), 0)),
        deweight_compensation: decimalFix(item.invoice_supplier_products.reduce((prev, curr) => prev + toFloat(curr.invoice_supplier_list_deweight_compensation), 0)),
      })
    })

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
    branch_ids,
    company_ids,
    supplier_ids,
  } = search_data.value

  const conditons = []

  if (start_date) conditons.push({ invoice_supplier_date: { $gte: start_date } })
  if (end_date) conditons.push({ invoice_supplier_date: { $lte: end_date } })
  if (branch_ids.length) conditons.push({ 'tb_invoice_supplier.branch_id': { $in: branch_ids } })
  if (company_ids.length) conditons.push({ company_id: { $in: company_ids } })
  if (supplier_ids.length) conditons.push({ supplier_id: { $in: supplier_ids } })

  return conditons
}

const exportHeader = () => {
  const {
    branch_ids,
    company_ids,
    supplier_ids,
    start_date,
    end_date,
  } = search_data.value

  const branch_names: string[] = []
  const company_names: string[] = []
  const supplier_names: string[] = []

  branch_ids.forEach(branch_id => {
    const branch = branchs.value.find(val => val.branch_id === branch_id)

    if (branch) branch_names.push(branch.branch_name)
  })

  company_ids.forEach(company_id => {
    const company = companys.value.find(val => val.company_id === company_id)

    if (company) company_names.push(company.company_name)
  })

  supplier_ids.forEach(supplier_id => {
    const supplier = suppliers.value.find(val => val.supplier_id === supplier_id)

    if (supplier) supplier_names.push(supplier.supplier_name)
  })

  const header_texts = []
  if (company_names.length) header_texts.push(`บริษัท ${company_names.join(',')}`)
  if (branch_names.length) header_texts.push(`สาขา ${branch_names.join(',')}`)
  if (supplier_names.length) header_texts.push(`ผู้ขาย ${supplier_names.join(',')}`)
  if (start_date || end_date) header_texts.push(`ตั้งแต่วันที่ ${formatDate(start_date) || '-'} ถึง ${formatDate(end_date) || '-'}`)

  return header_texts.join(' ')
}

const exportExcel = async () => {
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('Report Supplier Invoice');

  const column_style: any = {
    idx: { style: { alignment: { horizontal: 'center' }, }, },
    supplier_origin_id: { style: { alignment: { horizontal: 'center' }, }, width: 20 },
    invoice_supplier_date: { style: { alignment: { horizontal: 'center' }, }, width: 15, },
    invoice_supplier_id: { width: 20, },
    invoice_supplier_origin_id: { width: 20, },
    invoice_supplier_list_name: { width: 60, },
    invoice_supplier_list_unit_name: { width: 15, },
    invoice_supplier_list_qty: { style: { alignment: { horizontal: 'right' }, }, width: 18, },
    invoice_supplier_list_weight: { style: { alignment: { horizontal: 'right' }, }, width: 18, },
    invoice_supplier_list_deweight_quality: { style: { alignment: { horizontal: 'right' }, }, width: 18, },
    invoice_supplier_list_deweight_percent: { style: { alignment: { horizontal: 'right' }, }, width: 18, },
    invoice_supplier_list_deweight_compensation: { style: { alignment: { horizontal: 'right' }, }, width: 18, },
    invoice_supplier_list_net_weight: { style: { alignment: { horizontal: 'right' }, }, width: 18, },
    invoice_supplier_list_unit_price: { style: { alignment: { horizontal: 'right' }, }, width: 18, },
    invoice_supplier_list_unit_shipping_price: { style: { alignment: { horizontal: 'right' }, }, width: 18, },
    invoice_supplier_list_unit_promotion_price: { style: { alignment: { horizontal: 'right' }, }, width: 18, },
    invoice_supplier_list_unit_other_price: { style: { alignment: { horizontal: 'right' }, }, width: 18, },
    invoice_supplier_list_price: { style: { alignment: { horizontal: 'right' }, }, width: 18, },
  }

  worksheet.getColumn(7).alignment = { horizontal: 'center' }

  const check_options = report_options.value.map(item => item.value)

  const headers = report_headers.value.filter((val) => {
    if (!check_options.includes(val.key)) return true

    return selected_columns.value.includes(val.key)
  })

  worksheet.columns = headers.map((header: any) => ({ key: header.key, ...column_style[header.key], }))

  worksheet.addRow([`รายงานรับสินค้าตาม Supplier (ละเอียด)`])
  worksheet.mergeCells(1, 1, 1, headers.length)
  worksheet.addRow([exportHeader()])
  worksheet.mergeCells(2, 1, 2, headers.length)
  worksheet.getRow(3).values = headers.map(item => item.header)

  let row_curr_idx = 3

  const addRow = (data: any) => {
    worksheet.addRow(data)

    row_curr_idx++
  }

  report_supplier_invoices.value.forEach((report_supplier_invoice) => {
    const {
      supplier,
      supplier_origin_ids,
      invoice_supplier_products,
      total_invoice,
      total_product,
      total_price,
      total_weight,
      deweight_quality,
      deweight_percent,
      deweight_compensation,
      net_weight,
    } = report_supplier_invoice

    addRow([
      ...Array.from({ length: selected_columns.value.filter(column => ['idx'].includes(column)).length }, () => ''),
      supplier_origin_ids.join(', '),
      ...Array.from({
        length: selected_columns.value.filter(column => [
          'invoice_supplier_id'
        ].includes(column)).length + 2,
      }, () => ''),
      supplier.supplier_name,
    ])

    invoice_supplier_products.forEach((ivp, idx) => {
      const {
        product,
        invoice_supplier_id,
        invoice_supplier_date,
        invoice_supplier_origin_id,
        invoice_supplier_list_name,
        invoice_supplier_list_unit_name,
        invoice_supplier_list_qty,
        invoice_supplier_list_weight,
        invoice_supplier_list_deweight_quality,
        invoice_supplier_list_deweight_percent,
        invoice_supplier_list_deweight_compensation,
        invoice_supplier_list_net_weight,
        invoice_supplier_list_unit_price,
        invoice_supplier_list_unit_shipping_price,
        invoice_supplier_list_unit_promotion_price,
        invoice_supplier_list_unit_other_price,
        invoice_supplier_list_price,
      } = ivp

      const row: any = {
        idx: idx + 1,
        supplier_origin_id: product?.product_origin_id,
        invoice_supplier_date,
        invoice_supplier_id,
        invoice_supplier_origin_id,
        invoice_supplier_list_name,
        invoice_supplier_list_unit_name,
        invoice_supplier_list_qty,
        invoice_supplier_list_weight,
        invoice_supplier_list_deweight_quality,
        invoice_supplier_list_deweight_percent,
        invoice_supplier_list_deweight_compensation,
        invoice_supplier_list_net_weight,
        invoice_supplier_list_unit_price,
        invoice_supplier_list_unit_shipping_price,
        invoice_supplier_list_unit_promotion_price,
        invoice_supplier_list_unit_other_price,
        invoice_supplier_list_price,
      }

      check_options.forEach(item => {
        if (!selected_columns.value.includes(item)) delete row[item]
      })

      addRow(row)
    });

    const row_summarys = [
      ...Array.from({
        length: selected_columns.value.filter(column => [
          'idx',
          'invoice_supplier_id',
        ].includes(column)).length + 3
      }, () => ''),
      `${total_invoice} ใบรับ ${total_product} รายการ`,
    ]

    selected_columns.value.includes('invoice_supplier_list_unit_name') && row_summarys.push('')
    selected_columns.value.includes('invoice_supplier_list_qty') && row_summarys.push('')
    selected_columns.value.includes('invoice_supplier_list_weight') && row_summarys.push(total_weight)
    selected_columns.value.includes('invoice_supplier_list_deweight_quality') && row_summarys.push(deweight_quality)
    selected_columns.value.includes('invoice_supplier_list_deweight_percent') && row_summarys.push(deweight_percent)
    selected_columns.value.includes('invoice_supplier_list_deweight_compensation') && row_summarys.push(deweight_compensation)
    selected_columns.value.includes('invoice_supplier_list_net_weight') && row_summarys.push(net_weight)
    selected_columns.value.includes('invoice_supplier_list_unit_price') && row_summarys.push('')
    selected_columns.value.includes('invoice_supplier_list_unit_shipping_price') && row_summarys.push('')
    selected_columns.value.includes('invoice_supplier_list_unit_promotion_price') && row_summarys.push('')
    selected_columns.value.includes('invoice_supplier_list_unit_other_price') && row_summarys.push('')
    selected_columns.value.includes('invoice_supplier_list_price') && row_summarys.push(total_price)

    addRow(row_summarys)
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
    idx: { width: 40, },
    supplier_origin_id: { width: 90 },
    invoice_supplier_date: { width: 80, },
    invoice_supplier_id: { width: 90, },
    invoice_supplier_origin_id: { width: 80, },
    invoice_supplier_list_name: { width: 120, },
    invoice_supplier_list_unit_name: { width: 40, },
    invoice_supplier_list_qty: { width: 60, },
    invoice_supplier_list_weight: { width: 60, },
    invoice_supplier_list_deweight_quality: { width: 60, },
    invoice_supplier_list_deweight_percent: { width: 60, },
    invoice_supplier_list_deweight_compensation: { width: 60, },
    invoice_supplier_list_net_weight: { width: 60, },
    invoice_supplier_list_unit_price: { width: 60, },
    invoice_supplier_list_unit_shipping_price: { width: 60, },
    invoice_supplier_list_unit_promotion_price: { width: 60, },
    invoice_supplier_list_unit_other_price: { width: 60, },
    invoice_supplier_list_price: { width: 60, },
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
    format: 'full',
    header: exportHeader(),
  }

  const product_pre_space = selected_columns.value.filter(column => ['idx'].includes(column)).length

  report_supplier_invoices.value.forEach((report_supplier_invoice) => {
    const {
      supplier,
      supplier_origin_ids,
      total_invoice,
      total_product,
      total_price,
      total_weight,
      deweight_quality,
      deweight_percent,
      deweight_compensation,
      net_weight,
      invoice_supplier_products
    } = report_supplier_invoice

    exportData.data.push([
      ...Array.from({ length: product_pre_space }, () => `<td></td>`),
      `<td>${supplier_origin_ids.join(', ')}</td>`,
      `<td colSpan="${selected_columns.value.filter(column => ['invoice_supplier_id'].includes(column)).length + 2}"></td>`,
      `<td>${supplier.supplier_name}</td>`,
      ...Array.from({
        length: selected_columns.value.filter(column => [
          'invoice_supplier_list_unit_name',
          'invoice_supplier_list_qty',
          'invoice_supplier_list_weight',
          'invoice_supplier_list_deweight_quality',
          'invoice_supplier_list_deweight_percent',
          'invoice_supplier_list_deweight_compensation',
          'invoice_supplier_list_net_weight',
          'invoice_supplier_list_unit_price',
          'invoice_supplier_list_unit_shipping_price',
          'invoice_supplier_list_unit_promotion_price',
          'invoice_supplier_list_unit_other_price',
          'invoice_supplier_list_price',
        ].includes(column)).length
      }, () => `<td></td>`),
    ])

    invoice_supplier_products.forEach((ivp, idx) => {
      const {
        product,
        invoice_supplier_id,
        invoice_supplier_date,
        invoice_supplier_origin_id,
        invoice_supplier_list_name,
        invoice_supplier_list_unit_name,
        invoice_supplier_list_qty,
        invoice_supplier_list_weight,
        invoice_supplier_list_deweight_quality,
        invoice_supplier_list_deweight_percent,
        invoice_supplier_list_deweight_compensation,
        invoice_supplier_list_net_weight,
        invoice_supplier_list_unit_price,
        invoice_supplier_list_unit_shipping_price,
        invoice_supplier_list_unit_promotion_price,
        invoice_supplier_list_unit_other_price,
        invoice_supplier_list_price,
      } = ivp

      const row: any = {
        idx: `<td align="center">${idx + 1}</td>`,
        supplier_origin_id: `<td>${product?.product_origin_id}</td>`,
        invoice_supplier_date: `<td align="center">${invoice_supplier_date}</td>`,
        invoice_supplier_id: `<td>${invoice_supplier_id}</td>`,
        invoice_supplier_origin_id: `<td>${invoice_supplier_origin_id}</td>`,
        invoice_supplier_list_name: `<td>${invoice_supplier_list_name}</td>`,
        invoice_supplier_list_unit_name: `<td align="center">${invoice_supplier_list_unit_name}</td>`,
        invoice_supplier_list_qty: `<td align="right">${invoice_supplier_list_qty}</td>`,
        invoice_supplier_list_weight: `<td align="right">${invoice_supplier_list_weight}</td>`,
        invoice_supplier_list_deweight_quality: `<td align="right">${invoice_supplier_list_deweight_quality}</td>`,
        invoice_supplier_list_deweight_percent: `<td align="right">${invoice_supplier_list_deweight_percent}</td>`,
        invoice_supplier_list_deweight_compensation: `<td align="right">${invoice_supplier_list_deweight_compensation}</td>`,
        invoice_supplier_list_net_weight: `<td align="right">${invoice_supplier_list_net_weight}</td>`,
        invoice_supplier_list_unit_price: `<td align="right">${invoice_supplier_list_unit_price}</td>`,
        invoice_supplier_list_unit_shipping_price: `<td align="right">${invoice_supplier_list_unit_shipping_price}</td>`,
        invoice_supplier_list_unit_promotion_price: `<td align="right">${invoice_supplier_list_unit_promotion_price}</td>`,
        invoice_supplier_list_unit_other_price: `<td align="right">${invoice_supplier_list_unit_other_price}</td>`,
        invoice_supplier_list_price: `<td align="right">${invoice_supplier_list_price}</td>`,
      }

      check_options.forEach(item => {
        if (!selected_columns.value.includes(item)) delete row[item]
      })

      exportData.data.push(row)
    })

    const row_summarys = [
      `<td colSpan="${selected_columns.value.filter(column => ['idx', 'invoice_supplier_id'].includes(column)).length + 3}"></td>`,
      `<td>${total_invoice} ใบรับ ${total_product} รายการ</td>`,
    ]

    selected_columns.value.includes('invoice_supplier_list_unit_name') && row_summarys.push('<td></td>')
    selected_columns.value.includes('invoice_supplier_list_qty') && row_summarys.push('<td></td>')
    selected_columns.value.includes('invoice_supplier_list_weight') && row_summarys.push(`<td>${total_weight}</td>`)
    selected_columns.value.includes('invoice_supplier_list_deweight_quality') && row_summarys.push(`<td>${deweight_quality}</td>`)
    selected_columns.value.includes('invoice_supplier_list_deweight_percent') && row_summarys.push(`<td>${deweight_percent}</td>`)
    selected_columns.value.includes('invoice_supplier_list_deweight_compensation') && row_summarys.push(`<td>${deweight_compensation}</td>`)
    selected_columns.value.includes('invoice_supplier_list_net_weight') && row_summarys.push(`<td>${net_weight}</td>`)
    selected_columns.value.includes('invoice_supplier_list_unit_price') && row_summarys.push('<td></td>')
    selected_columns.value.includes('invoice_supplier_list_unit_shipping_price') && row_summarys.push('<td></td>')
    selected_columns.value.includes('invoice_supplier_list_unit_promotion_price') && row_summarys.push('<td></td>')
    selected_columns.value.includes('invoice_supplier_list_unit_other_price') && row_summarys.push('<td></td>')
    selected_columns.value.includes('invoice_supplier_list_price') && row_summarys.push(`<td>${total_price}</td>`)

    exportData.data.push(row_summarys)
  })

  exportFrom.export_data.value = JSON.stringify(exportData)
  exportFrom.action = `${publicCtx.apiExportUrl}?export=${page_key}`
  exportFrom.submit()
};
</script>

<template>
  <v-card elevation="10" class="pa-4 withbg" color="grey-lighten-3">
    <v-card-title class="d-flex justify-space-between align-center gap-2">
      <div>รายงานรับสินค้าตาม Supplier <span class="text-error ml-1">(ละเอียด)</span></div>
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
          <v-autocomplete v-model="search_data.supplier_ids" :items="supplier_options" label="ผู้ขาย" density="compact"
            variant="outlined" clearable hide-details multiple style="width: 240px;">
            <template v-slot:prepend-inner>
              <v-icon
                @click="() => { search_data.supplier_ids = supplier_options.map(item => item.value) }">mdi-checkbox-multiple-marked</v-icon>
            </template>
          </v-autocomplete>
          <v-text-field v-model="search_field.text" label="ค้นหา..." density="compact" variant="outlined" hide-details
            style="width: 300px"></v-text-field>
          <v-btn color="primary" type="submit" elevation="3">ค้นหา</v-btn>
        </div>
      </form>

      <v-tabs color="primary">
        <v-tab active :to="{ path: `/report-supplier-invoice`, query: route_query, }">ละเอียด</v-tab>
        <v-tab :to="{ path: `/report-supplier-invoice/summary`, query: route_query, }">สรุป</v-tab>
      </v-tabs>

      <div class="overflow-auto" style="max-height: calc(100vh - 370px); min-height: 50vh;">
        <table class="table table-bordered table-hover" aria-describedby="report"
          :style="{ minWidth: `${(145 * selected_columns.length) + 720}px`, }">
          <thead>
            <tr>
              <th v-if="selected_columns.includes('idx')" style="width: 60px;">ลำดับ</th>
              <th style="width: 160px;">รหัสเจ้าหนี้/รหัสสินค้า</th>
              <th style="width: 120px;">วันที่</th>
              <th v-if="selected_columns.includes('invoice_supplier_id')" style="width: 160px;">รหัสบันทึกรับ</th>
              <th style="width: 160px;">เลขที่ใบรับ</th>
              <th>รายละเอียด</th>
              <th v-if="selected_columns.includes('invoice_supplier_list_unit_name')" style="width: 80px;">หน่วย</th>
              <th v-if="selected_columns.includes('invoice_supplier_list_qty')" style="width: 120px;">จำนวน</th>
              <th v-if="selected_columns.includes('invoice_supplier_list_weight')" style="width: 120px;">
                น้ำหนักสินค้า
              </th>
              <th v-if="selected_columns.includes('invoice_supplier_list_deweight_quality')" style="width: 120px;">
                น้ำหนักหักคุณภาพ
              </th>
              <th v-if="selected_columns.includes('invoice_supplier_list_deweight_percent')" style="width: 120px;">
                % หักคุณภาพ
              </th>
              <th v-if="selected_columns.includes('invoice_supplier_list_deweight_compensation')" style="width: 120px;">
                น้ำหนักหักชดเชย
              </th>
              <th v-if="selected_columns.includes('invoice_supplier_list_net_weight')" style="width: 120px;">
                น้ำหนักสุทธิ
              </th>
              <th v-if="selected_columns.includes('invoice_supplier_list_unit_price')" style="width: 120px;">
                ราคาต่อหน่วยปกติ
              </th>
              <th v-if="selected_columns.includes('invoice_supplier_list_unit_shipping_price')" style="width: 120px;">
                ราคาต่อหน่วยค่าขนส่ง
              </th>
              <th v-if="selected_columns.includes('invoice_supplier_list_unit_promotion_price')" style="width: 120px;">
                ราคาต่อหน่วยโปรโมชั่น 1
              </th>
              <th v-if="selected_columns.includes('invoice_supplier_list_unit_other_price')" style="width: 120px;">
                ราคาต่อหน่วยอื่น ๆ
              </th>
              <th v-if="selected_columns.includes('invoice_supplier_list_price')" style="width: 120px;">จำนวนเงิน</th>
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
              <template v-for="(report_supplier_invoice, report_supplier_invoice_idx) in report_supplier_invoices">
                <tr>
                  <td v-if="selected_columns.includes('idx')"></td>
                  <td class="text-center">
                    {{ report_supplier_invoice.supplier_origin_ids.join(', ') }}
                  </td>
                  <td :colspan="selected_columns.filter(column => [
                    'invoice_supplier_id'
                  ].includes(column)).length + 2"></td>
                  <td>{{ report_supplier_invoice.supplier.supplier_name }}</td>
                  <td v-if="selected_columns.find(column => [
                    'invoice_supplier_list_unit_name',
                    'invoice_supplier_list_qty',
                    'invoice_supplier_list_weight',
                    'invoice_supplier_list_deweight_quality',
                    'invoice_supplier_list_deweight_percent',
                    'invoice_supplier_list_deweight_compensation',
                    'invoice_supplier_list_net_weight',
                    'invoice_supplier_list_unit_price',
                    'invoice_supplier_list_unit_shipping_price',
                    'invoice_supplier_list_unit_promotion_price',
                    'invoice_supplier_list_unit_other_price',
                    'invoice_supplier_list_price',
                  ].includes(column))" :colspan="selected_columns.filter(column => [
                    'invoice_supplier_list_unit_name',
                    'invoice_supplier_list_qty',
                    'invoice_supplier_list_weight',
                    'invoice_supplier_list_deweight_quality',
                    'invoice_supplier_list_deweight_percent',
                    'invoice_supplier_list_deweight_compensation',
                    'invoice_supplier_list_net_weight',
                    'invoice_supplier_list_unit_price',
                    'invoice_supplier_list_unit_shipping_price',
                    'invoice_supplier_list_unit_promotion_price',
                    'invoice_supplier_list_unit_other_price',
                    'invoice_supplier_list_price',
                  ].includes(column)).length"></td>
                </tr>
                <template v-for="(invoice_supplier_product, idx) in report_supplier_invoice.invoice_supplier_products">
                  <tr>
                    <td v-if="selected_columns.includes('idx')" class="text-center">{{ idx + 1 }}</td>
                    <td class="text-center">
                      {{ invoice_supplier_product.product?.product_origin_id }}
                    </td>
                    <td class="text-center">{{ invoice_supplier_product.invoice_supplier_date }}</td>
                    <td v-if="selected_columns.includes('invoice_supplier_id')">
                      {{ invoice_supplier_product.invoice_supplier_id }}
                    </td>
                    <td>{{ invoice_supplier_product.invoice_supplier_origin_id }}</td>
                    <td>{{ invoice_supplier_product.invoice_supplier_list_name }}</td>
                    <td v-if="selected_columns.includes('invoice_supplier_list_unit_name')">
                      {{ invoice_supplier_product.invoice_supplier_list_unit_name }}
                    </td>
                    <td v-if="selected_columns.includes('invoice_supplier_list_qty')" class="text-right">
                      {{ invoice_supplier_product.invoice_supplier_list_qty }}
                    </td>
                    <td v-if="selected_columns.includes('invoice_supplier_list_weight')" class="text-right">
                      {{ invoice_supplier_product.invoice_supplier_list_weight }}
                    </td>
                    <td v-if="selected_columns.includes('invoice_supplier_list_deweight_quality')" class="text-right">
                      {{ invoice_supplier_product.invoice_supplier_list_deweight_quality }}
                    </td>
                    <td v-if="selected_columns.includes('invoice_supplier_list_deweight_percent')" class="text-right">
                      {{ invoice_supplier_product.invoice_supplier_list_deweight_percent }}
                    </td>
                    <td v-if="selected_columns.includes('invoice_supplier_list_deweight_compensation')"
                      class="text-right">
                      {{ invoice_supplier_product.invoice_supplier_list_deweight_compensation }}
                    </td>
                    <td v-if="selected_columns.includes('invoice_supplier_list_net_weight')" class="text-right">
                      {{ invoice_supplier_product.invoice_supplier_list_net_weight }}
                    </td>
                    <td v-if="selected_columns.includes('invoice_supplier_list_unit_price')" class="text-right">
                      {{ invoice_supplier_product.invoice_supplier_list_unit_price }}
                    </td>
                    <td v-if="selected_columns.includes('invoice_supplier_list_unit_shipping_price')"
                      class="text-right">
                      {{ invoice_supplier_product.invoice_supplier_list_unit_shipping_price }}
                    </td>
                    <td v-if="selected_columns.includes('invoice_supplier_list_unit_promotion_price')"
                      class="text-right">
                      {{ invoice_supplier_product.invoice_supplier_list_unit_promotion_price }}
                    </td>
                    <td v-if="selected_columns.includes('invoice_supplier_list_unit_other_price')" class="text-right">
                      {{ invoice_supplier_product.invoice_supplier_list_unit_other_price }}
                    </td>
                    <td v-if="selected_columns.includes('invoice_supplier_list_price')" class="text-right">
                      {{ invoice_supplier_product.invoice_supplier_list_price }}
                    </td>
                  </tr>
                </template>
                <tr class="bg-lightsuccess">
                  <td :colspan="selected_columns.filter(column => [
                    'idx',
                    'invoice_supplier_id'
                  ].includes(column)).length + 3">
                  </td>
                  <td>
                    {{ report_supplier_invoice.total_invoice }} ใบรับ
                    {{ report_supplier_invoice.total_product }} รายการ
                  </td>
                  <td v-if="selected_columns.includes('invoice_supplier_list_unit_name')"></td>
                  <td v-if="selected_columns.includes('invoice_supplier_list_qty')"></td>
                  <td v-if="selected_columns.includes('invoice_supplier_list_weight')" class="text-right">
                    {{ report_supplier_invoice.total_weight }}
                  </td>
                  <td v-if="selected_columns.includes('invoice_supplier_list_deweight_quality')" class="text-right">
                    {{ report_supplier_invoice.deweight_quality }}
                  </td>
                  <td v-if="selected_columns.includes('invoice_supplier_list_deweight_percent')" class="text-right">
                    {{ report_supplier_invoice.deweight_percent }}
                  </td>
                  <td v-if="selected_columns.includes('invoice_supplier_list_deweight_compensation')"
                    class="text-right">
                    {{ report_supplier_invoice.deweight_compensation }}
                  </td>
                  <td v-if="selected_columns.includes('invoice_supplier_list_net_weight')" class="text-right">
                    {{ report_supplier_invoice.net_weight }}
                  </td>
                  <td v-if="selected_columns.find(column => [
                    'invoice_supplier_list_unit_price',
                    'invoice_supplier_list_unit_shipping_price',
                    'invoice_supplier_list_unit_promotion_price',
                    'invoice_supplier_list_unit_other_price',
                  ].includes(column))" :colspan="selected_columns.filter(column => [
                    'invoice_supplier_list_unit_price',
                    'invoice_supplier_list_unit_shipping_price',
                    'invoice_supplier_list_unit_promotion_price',
                    'invoice_supplier_list_unit_other_price',
                  ].includes(column)).length">
                  </td>
                  <td v-if="selected_columns.includes('invoice_supplier_list_price')" class="text-right">
                    {{ report_supplier_invoice.total_price }}
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