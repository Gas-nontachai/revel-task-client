import { Supplier } from "~~/misc/types"

const prefix = 'supplier'

const generateSupplierID = (): Promise<string> => secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/generateSupplierID`, { method: "POST", })

const getSupplierBy = (data: any = {}): Promise<{ docs: Supplier[], totalDocs: number, }> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getSupplierBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

const getSupplierByID = (data: { supplier_id: string }): Promise<Supplier> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getSupplierByID`, {
  method: "POST",
  body: JSON.stringify(data),
})

const insertSupplier = (data: Supplier): Promise<Supplier> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/insertSupplier`, {
  method: "POST",
  body: JSON.stringify(data),
})

const updateSupplierBy = (data: Supplier): Promise<Supplier> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/updateSupplierBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

const updateSameSupplierBy = (data: { supplier_main_id: string, supplier_ids: string[], }): Promise<Supplier> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/updateSameSupplierBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

const deleteSupplierBy = (data: { supplier_id: string }): Promise<Supplier> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/deleteSupplierBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

export default function useSupplier() {
  return {
    generateSupplierID,
    getSupplierBy,
    getSupplierByID,
    insertSupplier,
    updateSupplierBy,
    updateSameSupplierBy,
    deleteSupplierBy
  };
}