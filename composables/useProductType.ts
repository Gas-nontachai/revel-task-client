import { ProductType } from "~~/misc/types"
const prefix = 'product-type'

const generateProductTypeID = (): Promise<string> => secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/generateProductTypeID`, { method: "POST", })

const getProductTypeBy = (data?: any): Promise<{ docs: ProductType[], totalDocs: number, }> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getProductTypeBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

const getProductTypeByID = (data: { product_type_id: string }): Promise<ProductType> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getProductTypeByID`, {
  method: "POST",
  body: JSON.stringify(data),
})

const insertProductType = (data: any): Promise<ProductType> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/insertProductType`, {
  method: "POST",
  body: JSON.stringify(data),
})

const updateProductTypeBy = (data: any): Promise<ProductType> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/updateProductTypeBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

const deleteProductTypeBy = (data: any): Promise<ProductType> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/deleteProductTypeBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

export default function useProductType() {
  return {
    generateProductTypeID,
    getProductTypeBy,
    getProductTypeByID,
    insertProductType,
    updateProductTypeBy,
    deleteProductTypeBy
  };
}