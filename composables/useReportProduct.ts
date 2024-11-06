import { InvoiceSupplierProduct, Product, } from "~~/misc/types"

const prefix = 'report-product'

const getReportProductInvoiceBy = (data: any = {}): Promise<{
  product: Product,
  product_origin_ids: string[],
  invoice_supplier_products: InvoiceSupplierProduct[],
}[]> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getReportProductInvoiceBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

export default function useReportProduct() {
  return {
    getReportProductInvoiceBy,
  };
}