import { InvoiceSupplier, InvoiceSupplierList } from "~~/misc/types"

const prefix = 'invoice-supplier'

const getInvoiceSupplierBy = (data: any = {}): Promise<{ docs: InvoiceSupplier[], totalDocs: number, }> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getInvoiceSupplierBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

const getInvoiceSupplierByID = (data: { invoice_supplier_id: string }): Promise<InvoiceSupplier> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getInvoiceSupplierByID`, {
  method: "POST",
  body: JSON.stringify(data),
})

const getSumInvoiceSupplierBy = (data: any = {}): Promise<{
  weight: any,
  price: any,
  vat_price: any,
  net_price: any,
}> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getSumInvoiceSupplierBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

const mergeInvoiceSupplier = (data: { invoice_suppliers: InvoiceSupplier[], }): Promise<any> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/mergeInvoiceSupplier`, {
  method: "POST",
  body: JSON.stringify(data),
})

const insertInvoiceSupplier = (data: {
  invoice_supplier: InvoiceSupplier,
  invoice_supplier_lists: InvoiceSupplierList[],
}): Promise<InvoiceSupplier> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/insertInvoiceSupplier`, {
  method: "POST",
  body: JSON.stringify(data),
})

const updateInvoiceSupplierBy = (data: {
  invoice_supplier: InvoiceSupplier,
  invoice_supplier_lists: InvoiceSupplierList[],
}): Promise<InvoiceSupplier> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/updateInvoiceSupplierBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

const deleteInvoiceSupplierBy = (data: { invoice_supplier_id: string }): Promise<InvoiceSupplier> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/deleteInvoiceSupplierBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

export default function useInvoiceSupplier() {
  return {
    getInvoiceSupplierBy,
    getInvoiceSupplierByID,
    getSumInvoiceSupplierBy,
    mergeInvoiceSupplier,
    insertInvoiceSupplier,
    updateInvoiceSupplierBy,
    deleteInvoiceSupplierBy
  };
}