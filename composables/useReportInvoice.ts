
import { InvoiceSupplierProduct, Supplier, } from "~~/misc/types"

const prefix = 'report-invoice'

const getReportSupplierInvoiceBy = (data: any = {}): Promise<{
  supplier: Supplier,
  supplier_origin_ids: string[],
  invoice_supplier_products: InvoiceSupplierProduct[],
}[]> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getReportSupplierInvoiceBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

export default function useReportInvoice() {
  return {
    getReportSupplierInvoiceBy,
  };
}