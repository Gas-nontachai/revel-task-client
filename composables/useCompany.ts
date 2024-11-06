import { Company } from "~~/misc/types"

const prefix = 'company'

const generateCompanyID = (): Promise<string> => secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/generateCompanyID`, { method: "POST", })

const getCompanyBy = (data: any = {}): Promise<{ docs: Company[], totalDocs: number, }> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getCompanyBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

const getCompanyByID = (data: { company_id: string }): Promise<Company> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getCompanyByID`, {
  method: "POST",
  body: JSON.stringify(data),
})


const insertCompany = (data: Company): Promise<Company> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/insertCompany`, {
  method: "POST",
  body: JSON.stringify(data),
})


const updateCompanyBy = (data: Company): Promise<Company> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/updateCompanyBy`, {
  method: "POST",
  body: JSON.stringify(data),
})



const deleteCompanyBy = (data: { company_id: string }): Promise<Company> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/deleteCompanyBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

export default function useCompany() {
  return {
    generateCompanyID,
    getCompanyBy,
    getCompanyByID,
    insertCompany,
    updateCompanyBy,
    deleteCompanyBy
  };
}