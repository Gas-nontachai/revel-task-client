<script lang="ts" setup>
import { PaymentInvoice, } from "~~/misc/types"

const props = defineProps({
  report_payment: {
    type: Object as PropType<{
      report_payment_name: string,
      report_payment_date: Date | string,
      payment_price: string,
      payment_vat_price: string,
      payment_net_price: string,
    }>,
    required: true,
  },
  payments: { type: Array as PropType<PaymentInvoice[]>, required: true, },
  columns: { type: Array as PropType<string[]>, required: true, },
})

const colspan1 = computed(() => {
  const cols = ['idx', 'report_payment_date', 'invoice_supplier_id']

  return props.columns.filter(column => cols.includes(column)).length + 3
})
</script>

<template>
  <template v-if="payments.length">
    <tr>
      <td v-if="columns.includes('idx')"></td>
      <td></td>
      <td v-if="columns.includes('invoice_supplier_id')"></td>
      <td>{{ report_payment.report_payment_name }} </td>
      <td colspan="5">{{ payments.length }} รายการ</td>
    </tr>
    <template v-for="(payment, payment_idx) in payments">
      <tr>
        <td v-if="columns.includes('idx')" class="align-middle text-center">
          {{ payment_idx + 1 }}
        </td>
        <td class="align-middle text-center">{{ report_payment.report_payment_date }}</td>
        <td v-if="columns.includes('invoice_supplier_id')" class="align-middle">
          {{ payment.invoice_supplier_id }}
        </td>
        <td class="align-middle">{{ payment.invoice_supplier_origin_id }}</td>
        <td class="align-middle">{{ payment.invoice_supplier_name }}</td>
        <td v-if="columns.includes('payment_price')" class="align-middle text-right">
          {{ payment.payment_price }}
        </td>
        <td v-if="columns.includes('payment_vat_price')" class="align-middle text-right">
          {{ payment.payment_vat_price }}
        </td>
        <td class="align-middle text-right">{{ payment.payment_net_price }}</td>
        <td v-if="columns.includes('user_id')" class="align-middle">
          {{ payment.user_id }}
        </td>
      </tr>
    </template>
    <tr class="bg-lightsuccess">
      <td :colspan="colspan1"></td>
      <td v-if="columns.includes('payment_price')" class="align-middle text-right">
        {{ report_payment.payment_price }}
      </td>
      <td v-if="columns.includes('payment_vat_price')" class="align-middle text-right">
        {{ report_payment.payment_vat_price }}
      </td>
      <td class="align-middle text-right">{{ report_payment.payment_net_price }}</td>
      <td v-if="columns.includes('user_id')"></td>
    </tr>
  </template>
</template>