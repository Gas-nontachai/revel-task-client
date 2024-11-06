import { Branch, UserBranch } from "~~/misc/types"

const prefix = 'branch'

const generateBranchID = (): Promise<string> => secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/generateBranchID`, { method: "POST", })

const getBranchBy = (data: any = {}): Promise<{ docs: Branch[], totalDocs: number, }> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getBranchBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

const getBranchByID = (data: { branch_id: string }): Promise<Branch> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getBranchByID`, {
  method: "POST",
  body: JSON.stringify(data),
})

const insertBranch = (data: { branch: Branch, user_branchs: UserBranch[] }): Promise<Branch> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/insertBranch`, {
  method: "POST",
  body: JSON.stringify(data),
})

const updateBranchBy = (data: { branch: Branch, user_branchs: UserBranch[] }): Promise<Branch> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/updateBranchBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

const deleteBranchBy = (data: { branch_id: string }): Promise<Branch> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/deleteBranchBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

export default function useBranch() {
  return {
    generateBranchID,
    getBranchBy,
    getBranchByID,
    insertBranch,
    updateBranchBy,
    deleteBranchBy
  };
}