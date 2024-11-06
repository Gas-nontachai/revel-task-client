import { Product } from "~~/misc/types"

const prefix = 'product'

const generateProductID = (): Promise<string> => secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/generateProductID`, { method: "POST", })

const getProductBy = (data: any = {}): Promise<{ docs: Product[], totalDocs: number, }> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getProductBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

const getProductByID = (data: { product_id: string }): Promise<Product> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getProductByID`, {
  method: "POST",
  body: JSON.stringify(data),
})

const insertProduct = (data: Product): Promise<Product> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/insertProduct`, {
  method: "POST",
  body: JSON.stringify(data),
})

const updateProductBy = (data: Product): Promise<Product> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/updateProductBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

const updateSameProductBy = (data: { product_main_id: string, product_ids: string[], }): Promise<Product> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/updateSameProductBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

const deleteProductBy = (data: { product_id: string }): Promise<Product> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/deleteProductBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

export default function useProduct() {
  return {
    generateProductID,
    getProductBy,
    getProductByID,
    insertProduct,
    updateProductBy,
    updateSameProductBy,
    deleteProductBy
  };
}