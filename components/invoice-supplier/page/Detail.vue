<script lang="ts" setup>
import {
  InvoiceSupplier,
  InvoiceSupplierList,
  Payment,
  Supplier,
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

const { getInvoiceSupplierByID } = useInvoiceSupplier();
const { getInvoiceSupplierListBy } = useInvoiceSupplierList();
const { getSupplierBy } = useSupplier();
const { getPaymentBy } = usePayment();

const paid_status: any = {
  'invalid': 'ยอดชำระไม่ถูกต้อง',
  'paid': 'ชำระแล้ว',
}

const pending = ref(true)
const invoice_supplier = ref<InvoiceSupplier>({
  invoice_supplier_id: '',
  invoice_supplier_origin_id: '',
  branch_id: '',
  company_id: '',
  supplier_id: '',
  user_id: '',
  invoice_supplier_name: '',
  invoice_supplier_branch_name: '',
  invoice_supplier_company_name: '',
  invoice_supplier_account: '',
  invoice_supplier_license_plate: '',
  invoice_supplier_date: '',
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
const invoice_supplier_lists = ref<InvoiceSupplierList[]>([]);
const supplier = ref<Supplier>();
const payment = ref<Payment>();

onMounted(async () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const query: { [key: number | string]: string } = {};

    for (const [key, value] of params) {
      query[key] = value;
    }

    invoice_supplier.value = await getInvoiceSupplierByID({ invoice_supplier_id: query.id })
    invoice_supplier_lists.value = await getInvoiceSupplierListBy({ match: { invoice_supplier_id: query.id } }).then(res => res.docs)

    payment.value = await getPaymentBy({ match: { invoice_supplier_id: query.id }, options: ['book_bank'], }).then(res => res.docs[0])
    supplier.value = await getSupplierBy({ match: { supplier_id: invoice_supplier.value.supplier_id }, }).then(res => res.docs[0])

    pending.value = false
  } catch (e) {
    console.log(e)
  }
})

</script>
<template>
  <v-breadcrumbs :items="[
    { title: section_info.title, to: section_info.path, },
    { title: 'รายละเอียด', disabled: true, }
  ]">
    <template v-slot:title="{ item }">{{ item.title.toUpperCase() }}</template>
  </v-breadcrumbs>
  <v-card elevation="10" class="pa-4 withbg">
    <v-card-title>รายละเอียด</v-card-title>
    <template v-if="pending">
      <v-card-text class="text-center py-4">
        <v-label>กำลังโหลดข้อมูล..</v-label>
        <v-progress-circular class="ml-4" indeterminate color="primary"></v-progress-circular>
      </v-card-text>
    </template>
    <template v-else>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <div style="overflow-x: auto">
              <table class="table-detail" style="min-width: 300px" aria-describedby="detail">
                <thead>
                  <tr>
                    <th style="width: 120px"></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="text-right">รหัสผู้ขาย :</td>
                    <td class="text-muted">{{ supplier?.supplier_origin_id }}</td>
                  </tr>
                  <tr>
                    <td class="text-right">ชื่อบริษัท/ผู้ขาย :</td>
                    <td class="text-muted">{{ invoice_supplier.invoice_supplier_name }}</td>
                  </tr>
                  <tr>
                    <td class="text-right">ทะเบียนรถ :</td>
                    <td class="text-muted">{{ invoice_supplier.invoice_supplier_license_plate }}</td>
                  </tr>
                  <tr>
                    <td class="text-right">ช่องทางติดต่อ :</td>
                    <td class="text-muted">{{ invoice_supplier.invoice_supplier_contact }}</td>
                  </tr>
                  <tr>
                    <td class="text-right" style="vertical-align: top;">บันทึกช่วยจำ :</td>
                    <td class="text-muted">{{ supplier?.supplier_remark }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </v-col>
          <v-col cols="12" md="8">
            <div style="overflow-x: auto">
              <table class="table-detail" style="min-width: 300px" aria-describedby="detail">
                <thead>
                  <tr>
                    <th style="width: 120px"></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="text-right">รหัสบันทึกรับ :</td>
                    <td class="text-muted">{{ invoice_supplier.invoice_supplier_id }}</td>
                  </tr>
                  <tr>
                    <td class="text-right">เลขที่ใบรับ :</td>
                    <td class="text-muted">{{ invoice_supplier.invoice_supplier_origin_id }}</td>
                  </tr>
                  <tr>
                    <td class="text-right">วันที่ :</td>
                    <td class="text-muted">{{ formatDate(invoice_supplier.invoice_supplier_date) }}</td>
                  </tr>
                  <tr>
                    <td class="text-right">ผู้บันทึก :</td>
                    <td class="text-muted">{{ invoice_supplier.invoice_supplier_key_by }}</td>
                  </tr>
                  <tr>
                    <td class="text-right">วันที่บันทึก :</td>
                    <td class="text-muted">{{ formatDate(invoice_supplier.invoice_supplier_key_date, 'dd/MM/yyyy HH:mm')
                      }}</td>
                  </tr>
                  <tr>
                    <td class="text-right">บริษัท-สาขา:</td>
                    <td class="text-muted">{{ invoice_supplier.invoice_supplier_branch_name }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </v-col>
        </v-row>
        <div style="overflow-x: auto">
          <table class="table table-bordered table-striped mt-2" aria-describedby="schedule">
            <thead>
              <tr>
                <th class="align-middle text-center" scope="#" :style="{ width: '48px' }">
                  ลำดับ
                </th>
                <th class="align-middle text-center" scope="Description">
                  รายละเอียดสินค้า
                </th>
                <th class="align-middle text-center" :style="{ width: '140px' }" scope="Qty">
                  น้ำหนัก
                </th>
                <th class="align-middle text-center" :style="{ width: '140px' }" scope="Price">
                  ราคาต่อหน่วย/กก.
                </th>
                <th class="align-middle text-center" :style="{ width: '140px' }" scope="PriceTotal">
                  จำนวนเงิน
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in invoice_supplier_lists" :key="index">
                <td class="align-middle text-center">{{ index + 1 }}</td>
                <td class="align-middle">
                  <div>{{ item.invoice_supplier_list_name }}</div>
                  <div>{{ item.invoice_supplier_list_remark }}</div>
                </td>
                <td class="align-middle text-right">
                  {{ decimalFix(item.invoice_supplier_list_net_weight) }}
                </td>
                <td class="align-middle text-right">
                  {{ decimalFix(item.invoice_supplier_list_unit_price) }}
                </td>
                <td class="align-middle text-right">
                  {{ decimalFix(item.invoice_supplier_list_price) }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" rowSpan="3">
                  หมายเหตุ : {{ invoice_supplier.invoice_supplier_remark }}
                </td>
                <td class="align-middle text-right">รวมเป็นเงิน </td>
                <td class="align-middle text-right">
                  {{ decimalFix(invoice_supplier.invoice_supplier_price) }}
                </td>
              </tr>
              <tr>
                <td class="align-middle text-right">
                  ภาษีมูลค่าเพิ่ม {{ invoice_supplier.invoice_supplier_vat_rate }} %
                </td>
                <td class="align-middle text-right">
                  {{ decimalFix(invoice_supplier.invoice_supplier_vat_price) }}
                </td>
              </tr>
              <tr>
                <td class="align-middle text-right">ยอดสุทธิ</td>
                <td class="align-middle text-right">
                  {{ decimalFix(invoice_supplier.invoice_supplier_net_price) }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </v-card-text>
      <template v-if="payment">
        <v-card-title>การชำระเงิน</v-card-title>
        <v-card-text>
          <div class="border" style="overflow-x: auto">
            <table class="table-detail" style="min-width: 600px" aria-describedby="detail">
              <thead>
                <tr>
                  <th style="width: 100px"></th>
                  <th></th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="text-right">ชำระโดย :</td>
                  <td class="text-muted">{{ payment.payment_type }}</td>
                </tr>
                <template v-if="payment.book_bank">
                  <tr>
                    <td class="text-right">พนักงาน :</td>
                    <td class="text-muted">{{ payment.user_fullname }}</td>
                    <td class="text-right">บัญชีโอน :</td>
                    <td class="text-muted">
                      {{ payment.book_bank.book_bank_number }}
                      {{ payment.book_bank.book_bank_name }}
                    </td>
                  </tr>
                </template>
                <tr>
                  <td class="text-right">วันที่ :</td>
                  <td class="text-muted">{{ formatDate(payment.payment_date, 'dd/MM/yyyy HH:mm') }}</td>
                  <td class="text-right">ยอดชำระ :</td>
                  <td class="text-muted">{{ decimalFix(payment.payment_net_price) }}</td>
                </tr>
                <tr>
                  <td class="text-right">แนบสลิป :</td>
                  <td class="text-muted">{{ payment.payment_slip_url }}</td>
                </tr>
                <tr>
                  <td class="text-right">หมายเหตุ :</td>
                  <td class="text-muted">{{ payment.payment_remark }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </v-card-text>
      </template>
    </template>
    <v-card-text class="d-flex flex-wrap justify-center gap-2">
      <v-btn type="submit" color="muted" :to="section_info.path">กลับ</v-btn>
    </v-card-text>
  </v-card>
</template>