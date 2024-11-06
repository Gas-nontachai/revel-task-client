
import { PaymentInvoice, } from "~~/misc/types"

const prefix = 'report-payment'

const getReportPaymentBy = (data: any = {}): Promise<{
  report_payment_date: Date | string,
  bank_payments: PaymentInvoice[],
  cash_payments: PaymentInvoice[],
  credit_payments: PaymentInvoice[],
  transfer_payments: PaymentInvoice[],
  payments: PaymentInvoice[],
}[]> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getReportPaymentBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

export default function useReportPayment() {
  return {
    getReportPaymentBy,
  };
}