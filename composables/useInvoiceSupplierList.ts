import { InvoiceSupplierList } from "~~/misc/types"

const prefix = 'invoice-supplier-list'

const getInvoiceSupplierListBy = (data: any = {}): Promise<{ docs: InvoiceSupplierList[], totalDocs: number, }> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getInvoiceSupplierListBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

export default function useInvoiceSupplierList() {
  return {
    getInvoiceSupplierListBy,
  };
}