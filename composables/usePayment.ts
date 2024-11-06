import { Payment } from "~~/misc/types"

const prefix = 'payment'

const getPaymentBy = (data: any = {}): Promise<{ docs: Payment[], totalDocs: number, }> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getPaymentBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

const getPaymentByID = (data: { invoice_supplier_id: string }): Promise<Payment> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getPaymentByID`, {
  method: "POST",
  body: JSON.stringify(data),
})

const confirmPayment = (data: Payment): Promise<Payment> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/confirmPayment`, {
  method: "POST",
  body: JSON.stringify(data),
})

export default function usePayment() {
  return {
    getPaymentBy,
    getPaymentByID,
    confirmPayment,
  };
}