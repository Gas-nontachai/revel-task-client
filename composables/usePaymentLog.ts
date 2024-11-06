import { PaymentLog } from "~~/misc/types"

const prefix = 'payment-log'

const getPaymentLogBy = (data: any = {}): Promise<{ docs: PaymentLog[], totalDocs: number, }> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getPaymentLogBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

export default function usePayment() {
  return {
    getPaymentLogBy,
  };
}