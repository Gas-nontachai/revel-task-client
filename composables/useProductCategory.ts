import { ProductCategory } from "~~/misc/types"
const prefix = 'product-category'

const generateProductCategoryID = (): Promise<string> => secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/generateProductCategoryID`, { method: "POST", })

const getProductCategoryBy = (data?: any): Promise<{ docs: ProductCategory[], totalDocs: number, }> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getProductCategoryBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

const getProductCategoryByID = (data: { product_category_id: string }): Promise<ProductCategory> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getProductCategoryByID`, {
  method: "POST",
  body: JSON.stringify(data),
})

const insertProductCategory = (data: any): Promise<ProductCategory> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/insertProductCategory`, {
  method: "POST",
  body: JSON.stringify(data),
})

const updateProductCategoryBy = (data: any): Promise<ProductCategory> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/updateProductCategoryBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

const deleteProductCategoryBy = (data: any): Promise<ProductCategory> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/deleteProductCategoryBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

export default function useProductCategory() {
  return {
    generateProductCategoryID,
    getProductCategoryBy,
    getProductCategoryByID,
    insertProductCategory,
    updateProductCategoryBy,
    deleteProductCategoryBy
  };
}